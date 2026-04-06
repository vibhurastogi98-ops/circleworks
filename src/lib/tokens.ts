import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.AUTH_SECRET || "fallback_development_jwt_secret_key_32_chars";
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export interface InvitePayload {
  employeeId: string | number;
  email: string;
}

/**
 * Generates a standard JWT holding employee linkage metrics.
 * Designed to expire securely per business constraint: 72 hours.
 */
export async function generateInviteToken(payload: InvitePayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("72h") // standard 3 days expiration block
    .sign(encodedSecret);

  return token;
}

/**
 * Parses and verifies the authenticity of joining tokens prior to processing.
 * Will throw exceptions natively if token evaluates as expired or maliciously spoofed.
 */
export async function verifyInviteToken(token: string): Promise<InvitePayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as unknown as InvitePayload;
  } catch (error) {
    console.error(`[JWT Error] Token verification failed:`, error);
    return null;
  }
}
