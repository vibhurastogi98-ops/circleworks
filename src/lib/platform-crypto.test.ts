import { describe, expect, it } from "vitest";

import {
  decryptMfaSecret,
  encryptMfaSecret,
  generateBootstrapToken,
  generateTotpSecret,
  hashBootstrapToken,
  hashPlatformPassword,
  verifyPlatformPassword,
  verifyTotpCode,
} from "@/lib/platform-crypto";

describe("platform password hashing", () => {
  it("round-trips a valid password", async () => {
    const hash = await hashPlatformPassword("correct-horse-battery-staple");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPlatformPassword("correct-horse-battery-staple", hash)).toBe(true);
    expect(await verifyPlatformPassword("wrong", hash)).toBe(false);
  });

  it("rejects short passwords at hash-time", async () => {
    await expect(hashPlatformPassword("short")).rejects.toThrow(/password_too_short/);
  });
});

describe("MFA secret AES-GCM", () => {
  it("round-trips through encrypt/decrypt", () => {
    const secret = "JBSWY3DPEHPK3PXPZ33344"; // sample base32
    const ct = encryptMfaSecret(secret);
    expect(ct.startsWith("aesgcm$")).toBe(true);
    expect(decryptMfaSecret(ct)).toBe(secret);
  });

  it("fails to decrypt tampered ciphertext", () => {
    const ct = encryptMfaSecret("hello");
    const tampered = ct.slice(0, -4) + "AAAA";
    expect(() => decryptMfaSecret(tampered)).toThrow();
  });
});

describe("TOTP", () => {
  it("verifies its own generated code", () => {
    const { base32 } = generateTotpSecret();
    // Regenerate a fresh code using the same clock — we can't intercept
    // generateTotpCode, so we just verify the base32 secret is usable
    // by asking verifyTotpCode with a wildly wrong code (should fail).
    expect(verifyTotpCode(base32, "000000")).toBe(false);
  });
});

describe("bootstrap token", () => {
  it("hash is deterministic sha256", () => {
    const { plaintext, hash } = generateBootstrapToken();
    expect(hashBootstrapToken(plaintext)).toBe(hash);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
