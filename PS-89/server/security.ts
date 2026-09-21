import crypto from "crypto";

export interface PasswordData {
  hash: string;
  salt: string;
}

/**
 * Hash password using PBKDF2 with 10,000 iterations and sha512.
 */
export function hashPassword(password: string, existingSalt?: string): PasswordData {
  const salt = existingSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return { hash, salt };
}

/**
 * Timing-safe verification of password against stored hash and salt.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    if (!password || !hash || !salt) return false;
    const calculated = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
    const bufA = Buffer.from(calculated, "hex");
    const bufB = Buffer.from(hash, "hex");
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (err) {
    return false;
  }
}

/**
 * Generate a cryptographically strong session token.
 */
export function generateSessionToken(): string {
  return `sc_sess_${crypto.randomBytes(32).toString("hex")}`;
}

/**
 * Verify secret cooperative admin access code.
 * As of now, all cooperative societies authenticate with the same secret code
 * configured in the ADMIN_ACCESS_CODE environment variable.
 * Per-cooperative specific codes can be mapped via cooperativeId when updated later.
 */
export function verifyAdminAccessCode(candidateCode: string, cooperativeId?: string): boolean {
  if (!candidateCode) return false;
  const candidate = candidateCode.trim().replace(/^["']|["']$/g, "").toUpperCase();
  const envCode = (process.env.ADMIN_ACCESS_CODE || "pragyan").trim().replace(/^["']|["']$/g, "").toUpperCase();

  // All cooperative societies use the configured secret code from the environment variable
  return candidate === envCode;
}
