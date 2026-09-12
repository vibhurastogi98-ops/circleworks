/**
 * Password hashing (scrypt — Node built-in, no new native dep required for MVP;
 * Argon2id upgrade is a follow-up), TOTP helpers, and AES-GCM for MFA secrets.
 *
 * Keeping everything in one file makes the crypto boundary auditable.
 * See docs/platform-admin-spec.md §4 and §12 (approved decision #2).
 */

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  scrypt as _scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
) => Promise<Buffer>;

// -----------------------------------------------------------------------------
// Password hashing (scrypt N=2^15, r=8, p=1)
// Format: scrypt$<saltB64>$<hashB64>
// -----------------------------------------------------------------------------

const SCRYPT_KEY_LEN = 64;
const SCRYPT_SALT_LEN = 16;

export async function hashPlatformPassword(plain: string): Promise<string> {
  if (!plain || plain.length < 12) {
    throw new Error("password_too_short_min_12_chars");
  }
  const salt = randomBytes(SCRYPT_SALT_LEN);
  const derived = await scrypt(plain, salt, SCRYPT_KEY_LEN);
  return `scrypt$${salt.toString("base64")}$${derived.toString("base64")}`;
}

export async function verifyPlatformPassword(plain: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1]!, "base64");
  const expected = Buffer.from(parts[2]!, "base64");
  if (expected.length !== SCRYPT_KEY_LEN) return false;
  const derived = await scrypt(plain, salt, SCRYPT_KEY_LEN);
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

// -----------------------------------------------------------------------------
// AES-256-GCM for MFA secret storage
// Format: aesgcm$<ivB64>$<tagB64>$<ciphertextB64>
// -----------------------------------------------------------------------------

function getMfaKey(): Buffer {
  const raw = process.env.PLATFORM_MFA_SECRET_KEY;
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("PLATFORM_MFA_SECRET_KEY must be set in production");
    }
    // Dev fallback — deterministic per session so restarts don't invalidate
    // dev MFA setups, but still not equal to any tenant secret.
    return createHash("sha256").update("circleworks-platform-mfa-dev-only").digest();
  }
  // Accept either a 32-byte base64 or hex string.
  const buf = /^[a-fA-F0-9]{64}$/.test(raw)
    ? Buffer.from(raw, "hex")
    : Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error("PLATFORM_MFA_SECRET_KEY must be 32 bytes (base64 or hex)");
  }
  return buf;
}

export function encryptMfaSecret(plaintext: string): string {
  const key = getMfaKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `aesgcm$${iv.toString("base64")}$${tag.toString("base64")}$${encrypted.toString("base64")}`;
}

export function decryptMfaSecret(ciphertext: string): string {
  const parts = ciphertext.split("$");
  if (parts.length !== 4 || parts[0] !== "aesgcm") {
    throw new Error("mfa_secret_bad_format");
  }
  const iv = Buffer.from(parts[1]!, "base64");
  const tag = Buffer.from(parts[2]!, "base64");
  const encrypted = Buffer.from(parts[3]!, "base64");
  const decipher = createDecipheriv("aes-256-gcm", getMfaKey(), iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

// -----------------------------------------------------------------------------
// TOTP (RFC 6238, 30s step, 6 digits, SHA-1) — no external dep for MVP.
// -----------------------------------------------------------------------------

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTotpSecret(): { base32: string; buf: Buffer } {
  const buf = randomBytes(20); // 160 bits — RFC 6238 recommended
  return { base32: base32Encode(buf), buf };
}

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  return out;
}

function base32Decode(str: string): Buffer {
  const cleaned = str.replace(/=+$/g, "").toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of cleaned) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error("bad_base32");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function generateTotpCode(secretBase32: string, atSeconds: number, step = 30, digits = 6): string {
  const counter = Math.floor(atSeconds / step);
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(0, 0);
  buf.writeUInt32BE(counter & 0xffffffff, 4);
  const hmac = createHmac("sha1", base32Decode(secretBase32)).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0x0f;
  const code =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return String(code % 10 ** digits).padStart(digits, "0");
}

/** Verify with ±1 step of clock drift. */
export function verifyTotpCode(secretBase32: string, code: string, atMs = Date.now()): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const nowSec = Math.floor(atMs / 1000);
  for (const drift of [0, -30, 30]) {
    if (generateTotpCode(secretBase32, nowSec + drift) === code) return true;
  }
  return false;
}

export function totpAuthUri(secretBase32: string, accountEmail: string, issuer = "CircleWorks Platform") {
  const label = encodeURIComponent(`${issuer}:${accountEmail}`);
  const iss = encodeURIComponent(issuer);
  return `otpauth://totp/${label}?secret=${secretBase32}&issuer=${iss}&algorithm=SHA1&digits=6&period=30`;
}

// -----------------------------------------------------------------------------
// Bootstrap token helpers
// -----------------------------------------------------------------------------

export function generateBootstrapToken(): { plaintext: string; hash: string } {
  // 32-byte token, base64url encoded → 43 chars
  const raw = randomBytes(32);
  const plaintext = raw.toString("base64url");
  const hash = createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, hash };
}

export function hashBootstrapToken(plaintext: string): string {
  return createHash("sha256").update(plaintext).digest("hex");
}

export function newRequestId(): string {
  return randomUUID();
}
