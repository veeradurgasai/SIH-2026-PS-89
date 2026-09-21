import crypto from "crypto";

export interface VerificationSession {
  verificationId: string;
  mobileNumber: string; // 10-digit normalized Indian mobile
  formattedMobile: string; // e.g. "+91 98765 43210"
  maskedMobile: string; // e.g. "+91 98765 •••••"
  createdAt: number;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
  maxAttempts: number;
  verified: boolean;
  verificationToken?: string;
  verifiedAt?: number;
}

export interface SendOtpResult {
  success: boolean;
  verificationId?: string;
  formattedMobile?: string;
  expiresInSeconds?: number;
  resendCooldownSeconds?: number;
  waitSeconds?: number;
  error?: string;
}

export interface VerifyOtpResult {
  success: boolean;
  verified: boolean;
  verificationToken?: string;
  message?: string;
  remainingAttempts?: number;
  error?: string;
}

// In-memory verification sessions store
const verificationStore = new Map<string, VerificationSession>();
// Index by mobile number for rapid cooldown & rate-limit lookup
const mobileToSessionId = new Map<string, string>();
// Rate limit history: mobileNumber -> array of timestamps in the last hour
const requestHistory = new Map<string, number[]>();
// In-flight send mutex to prevent rapid duplicate double-clicks
const inFlightRequests = new Set<string>();

// Cached Message Central bearer token
let cachedTokenData: { token: string; expiresAt: number } | null = null;

// Periodic cleanup of expired verification records (runs every 60s)
setInterval(() => {
  const now = Date.now();
  for (const [vId, session] of verificationStore.entries()) {
    // Retain verified sessions for up to 30 mins to allow completing registration forms
    const ttl = session.verified ? 30 * 60 * 1000 : 10 * 60 * 1000;
    if (now - session.createdAt > ttl) {
      verificationStore.delete(vId);
      if (mobileToSessionId.get(session.mobileNumber) === vId) {
        mobileToSessionId.delete(session.mobileNumber);
      }
    }
  }

  // Cleanup request history
  for (const [mobile, timestamps] of requestHistory.entries()) {
    const valid = timestamps.filter(t => now - t < 3600000);
    if (valid.length === 0) {
      requestHistory.delete(mobile);
    } else {
      requestHistory.set(mobile, valid);
    }
  }
}, 60000);

/**
 * Validates and normalizes an Indian mobile phone number into a 10-digit string.
 */
export function normalizeIndianMobile(input: string): {
  valid: boolean;
  normalized: string;
  formatted: string;
  masked: string;
  error?: string;
} {
  if (!input || typeof input !== "string") {
    return {
      valid: false,
      normalized: "",
      formatted: "",
      masked: "",
      error: "Mobile number is required."
    };
  }

  // Remove any spaces, dashes, parentheses, plus sign
  let digits = input.replace(/\D/g, "");

  // Handle +91 or 91 country code prefix
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // Handle leading 0 trunk prefix
  else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return {
      valid: false,
      normalized: "",
      formatted: "",
      masked: "",
      error: "Please enter a valid 10-digit Indian mobile number."
    };
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return {
      valid: false,
      normalized: "",
      formatted: "",
      masked: "",
      error: "Indian mobile numbers must start with 6, 7, 8, or 9."
    };
  }

  const formatted = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  const masked = `+91 ${digits.slice(0, 5)} •••••`;

  return {
    valid: true,
    normalized: digits,
    formatted,
    masked
  };
}

/**
 * Retrieve or refresh the Message Central VerifyNow bearer token.
 * Token is cached in-memory and refreshed when approaching expiration.
 */
async function getMessageCentralAuthToken(customerId: string, rawKey: string): Promise<string> {
  const now = Date.now();
  if (cachedTokenData && now < cachedTokenData.expiresAt) {
    return cachedTokenData.token;
  }

  // Determine base64 encoding
  const cleanCustomerId = customerId.trim();
  const cleanKey = rawKey.trim();

  // Try multiple variations if needed:
  // 1) Base64 encoded key
  // 2) Raw key (if already base64)
  const isBase64 = /^[A-Za-z0-9+/]+={0,2}$/.test(cleanKey) && cleanKey.length % 4 === 0;
  const encodedCandidate = isBase64 ? cleanKey : Buffer.from(cleanKey).toString("base64");

  const candidateKeys = Array.from(new Set([
    encodedCandidate,
    Buffer.from(cleanKey).toString("base64"),
    cleanKey
  ]));

  let lastError = "Unknown error";

  for (const candidateKey of candidateKeys) {
    for (const withScope of [true, false]) {
      const queryParams = new URLSearchParams({
        customerId: cleanCustomerId,
        key: candidateKey
      });
      if (withScope) {
        queryParams.set("scope", "NEW");
      }

      const authUrl = `https://cpaas.messagecentral.com/auth/v1/authentication/token?${queryParams.toString()}`;

      try {
        const res = await fetch(authUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "*/*"
          }
        });

        const text = await res.text();
        let data: any = null;
        try {
          data = JSON.parse(text);
        } catch {
          // not json
        }

        if (res.ok && data) {
          const token = data.token || data.authToken || data.data?.token || data.data?.authToken;
          if (token) {
            cachedTokenData = {
              token,
              expiresAt: now + 20 * 60 * 60 * 1000
            };
            return token;
          }
        }

        lastError = data?.message || text || `HTTP ${res.status}`;
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }
  }

  throw new Error(`Message Central authentication failed: ${lastError}`);
}

/**
 * Service Abstraction: sendOtp(mobileNumber)
 * Validates the Indian mobile number and invokes Message Central VerifyNow.
 */
export async function sendOtp(mobileNumber: string): Promise<SendOtpResult> {
  const norm = normalizeIndianMobile(mobileNumber);
  if (!norm.valid) {
    return {
      success: false,
      error: norm.error || "Please enter a valid 10-digit Indian mobile number."
    };
  }

  const normalized = norm.normalized;

  // 1. In-flight double-click / rapid duplicate lock
  if (inFlightRequests.has(normalized)) {
    return {
      success: false,
      error: "An OTP request is currently in progress for this mobile number. Please wait a moment."
    };
  }

  const now = Date.now();

  // 2. Resend Cooldown Check (45 seconds)
  const existingSessionId = mobileToSessionId.get(normalized);
  if (existingSessionId) {
    const existing = verificationStore.get(existingSessionId);
    if (existing && !existing.verified && now < existing.resendAvailableAt) {
      const waitSeconds = Math.ceil((existing.resendAvailableAt - now) / 1000);
      return {
        success: false,
        error: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
        waitSeconds,
        verificationId: existing.verificationId,
        formattedMobile: existing.maskedMobile
      };
    }
  }

  // 3. Hourly Request Rate Limiting (max 5 requests per hour)
  const history = (requestHistory.get(normalized) || []).filter(t => now - t < 3600000);
  if (history.length >= 5) {
    return {
      success: false,
      error: "Maximum OTP request limit exceeded for this mobile number (5 requests/hour). Please try again later."
    };
  }

  // 4. Verify Credentials
  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID?.trim();
  const key = process.env.MESSAGE_CENTRAL_KEY?.trim();

  if (!customerId || !key) {
    return {
      success: false,
      error:
        "Message Central VerifyNow credentials (MESSAGE_CENTRAL_CUSTOMER_ID and MESSAGE_CENTRAL_KEY) are not configured in environment secrets."
    };
  }

  inFlightRequests.add(normalized);

  try {
    // Acquire Message Central token
    const authToken = await getMessageCentralAuthToken(customerId, key);

    // Call Message Central VerifyNow Send endpoint
    const sendUrl = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&mobileNumber=${encodeURIComponent(
      normalized
    )}&flowType=SMS&otpLength=6`;

    const sendRes = await fetch(sendUrl, {
      method: "POST",
      headers: {
        authToken: authToken,
        Accept: "application/json"
      }
    });

    let sendData: any = null;
    try {
      sendData = await sendRes.json();
    } catch (e) {}

    // Check if token expired on the provider side; if so, clear cache and retry once
    if (sendRes.status === 401) {
      cachedTokenData = null;
      const freshToken = await getMessageCentralAuthToken(customerId, key);
      const retryRes = await fetch(sendUrl, {
        method: "POST",
        headers: {
          authToken: freshToken,
          Accept: "application/json"
        }
      });
      try {
        sendData = await retryRes.json();
      } catch (e) {}
    }

    const isSuccess =
      sendData &&
      (sendData.responseCode === 200 || sendData.status === 200 || sendData.message === "SUCCESS") &&
      (sendData.data?.verificationId || sendData.verificationId);

    if (!isSuccess) {
      const providerError =
        sendData?.message || sendData?.error || "SMS OTP service temporarily unavailable. Please try again.";
      return {
        success: false,
        error: `Unable to dispatch SMS: ${providerError}`
      };
    }

    const verificationId = String(sendData.data?.verificationId || sendData.verificationId);

    // Save session in verification store
    const session: VerificationSession = {
      verificationId,
      mobileNumber: normalized,
      formattedMobile: norm.formatted,
      maskedMobile: norm.masked,
      createdAt: now,
      expiresAt: now + 10 * 60 * 1000, // 10 minutes OTP validity
      resendAvailableAt: now + 45 * 1000, // 45 seconds resend cooldown
      attempts: 0,
      maxAttempts: 5,
      verified: false
    };

    verificationStore.set(verificationId, session);
    mobileToSessionId.set(normalized, verificationId);

    // Update hourly rate history
    history.push(now);
    requestHistory.set(normalized, history);

    return {
      success: true,
      verificationId,
      formattedMobile: norm.masked,
      expiresInSeconds: 600,
      resendCooldownSeconds: 45
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to contact Message Central SMS service. Please try again."
    };
  } finally {
    inFlightRequests.delete(normalized);
  }
}

/**
 * Service Abstraction: verifyOtp(verificationId, otp)
 * Validates the candidate code with Message Central VerifyNow validateOtp endpoint.
 */
export async function verifyOtp(verificationId: string, candidateOtp: string): Promise<VerifyOtpResult> {
  if (!verificationId || typeof verificationId !== "string") {
    return {
      success: false,
      verified: false,
      error: "Verification ID is required."
    };
  }

  const cleanOtp = (candidateOtp || "").trim().replace(/\D/g, "");
  if (cleanOtp.length !== 6) {
    return {
      success: false,
      verified: false,
      error: "Please enter the complete 6-digit verification code."
    };
  }

  const record = verificationStore.get(verificationId);
  const now = Date.now();

  if (!record) {
    return {
      success: false,
      verified: false,
      error: "Verification session not found or has expired. Please request a new OTP."
    };
  }

  if (now > record.expiresAt) {
    verificationStore.delete(verificationId);
    return {
      success: false,
      verified: false,
      error: "The OTP verification code has expired. Please request a new code."
    };
  }

  if (record.verified) {
    return {
      success: true,
      verified: true,
      verificationToken: record.verificationToken,
      message: "Mobile number is already verified."
    };
  }

  if (record.attempts >= record.maxAttempts) {
    verificationStore.delete(verificationId);
    return {
      success: false,
      verified: false,
      error: "Too many incorrect verification attempts. For your security, this code is invalidated. Please request a new code."
    };
  }

  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID?.trim();
  const key = process.env.MESSAGE_CENTRAL_KEY?.trim();

  if (!customerId || !key) {
    return {
      success: false,
      verified: false,
      error: "Message Central credentials are not configured in environment secrets."
    };
  }

  try {
    const authToken = await getMessageCentralAuthToken(customerId, key);

    // Call Message Central validateOtp
    const validateUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${encodeURIComponent(
      record.mobileNumber
    )}&verificationId=${encodeURIComponent(verificationId)}&code=${encodeURIComponent(cleanOtp)}`;

    let valRes = await fetch(validateUrl, {
      method: "GET",
      headers: {
        authToken,
        Accept: "application/json"
      }
    });

    let valData: any = null;
    try {
      valData = await valRes.json();
    } catch (e) {}

    // Handle token refresh if 401
    if (valRes.status === 401) {
      cachedTokenData = null;
      const freshToken = await getMessageCentralAuthToken(customerId, key);
      valRes = await fetch(validateUrl, {
        method: "GET",
        headers: {
          authToken: freshToken,
          Accept: "application/json"
        }
      });
      try {
        valData = await valRes.json();
      } catch (e) {}
    }

    const isVerified =
      valRes.ok &&
      (valData?.responseCode === 200 || valData?.status === 200) &&
      (valData?.data?.verificationStatus === "VERIFICATION_COMPLETED" ||
        valData?.message === "SUCCESS" ||
        valData?.data?.responseCode === 200);

    if (isVerified) {
      record.verified = true;
      record.verifiedAt = now;
      const verificationToken = `vtok_${crypto.randomBytes(24).toString("hex")}`;
      record.verificationToken = verificationToken;

      return {
        success: true,
        verified: true,
        verificationToken,
        message: "Mobile number verified successfully."
      };
    } else {
      record.attempts += 1;
      const remaining = Math.max(0, record.maxAttempts - record.attempts);

      if (remaining === 0) {
        verificationStore.delete(verificationId);
      }

      return {
        success: false,
        verified: false,
        remainingAttempts: remaining,
        error:
          remaining > 0
            ? `Incorrect OTP code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many incorrect attempts. Please request a new verification code."
      };
    }
  } catch (error: any) {
    return {
      success: false,
      verified: false,
      error: error.message || "Failed to validate OTP with verification provider. Please try again."
    };
  }
}

/**
 * Checks if a normalized mobile number has been successfully verified via SMS OTP
 * and matches the issued verification token.
 */
export function isMobileVerified(rawMobileNumber: string, verificationToken?: string): boolean {
  const norm = normalizeIndianMobile(rawMobileNumber);
  if (!norm.valid) return false;

  const now = Date.now();

  for (const session of verificationStore.values()) {
    if (
      session.mobileNumber === norm.normalized &&
      session.verified &&
      (!verificationToken || session.verificationToken === verificationToken)
    ) {
      // Allow 30 minutes for user to finish filling the registration form
      if (now - (session.verifiedAt || session.createdAt) < 30 * 60 * 1000) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Consumes and deletes a verified OTP session once the customer or worker account is registered.
 */
export function consumeVerifiedSession(rawMobileNumber: string, verificationToken?: string): boolean {
  const norm = normalizeIndianMobile(rawMobileNumber);
  if (!norm.valid) return false;

  let consumed = false;
  for (const [vId, session] of verificationStore.entries()) {
    if (
      session.mobileNumber === norm.normalized &&
      (!verificationToken || session.verificationToken === verificationToken)
    ) {
      verificationStore.delete(vId);
      if (mobileToSessionId.get(session.mobileNumber) === vId) {
        mobileToSessionId.delete(session.mobileNumber);
      }
      consumed = true;
    }
  }

  return consumed;
}
