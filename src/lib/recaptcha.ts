/**
 * Server-side reCAPTCHA verification helper
 * Verifies tokens with Google's reCAPTCHA API
 */

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  errorCodes?: string[];
}

/**
 * Verify a reCAPTCHA token with Google's API
 * @param token - The reCAPTCHA token from the client
 * @param expectedAction - Optional action to verify (e.g., 'login', 'register')
 * @returns Object with success status and score
 */
export async function verifyRecaptcha(
  token: string,
  expectedAction?: string
): Promise<RecaptchaResult> {
  // If no secret key configured, skip verification (for local dev without keys)
  if (!RECAPTCHA_SECRET_KEY) {
    console.warn("RECAPTCHA_SECRET_KEY not configured - skipping verification");
    return { success: true, score: 1.0 };
  }

  // If no token provided (client couldn't generate one), skip verification with warning
  if (!token) {
    console.warn("No reCAPTCHA token provided - skipping verification (client may not have loaded script)");
    return { success: true, score: 0.9 };
  }

  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json();

    // reCAPTCHA v3 returns a score between 0.0 and 1.0
    // 1.0 is very likely a human, 0.0 is very likely a bot
    if (!data.success) {
      return {
        success: false,
        errorCodes: data["error-codes"] || ["unknown-error"],
      };
    }

    // Check action matches if provided
    if (expectedAction && data.action !== expectedAction) {
      return {
        success: false,
        score: data.score,
        action: data.action,
        errorCodes: ["action-mismatch"],
      };
    }

    // Threshold: reject scores below 0.5 (likely bots)
    const SCORE_THRESHOLD = 0.5;
    if (data.score < SCORE_THRESHOLD) {
      return {
        success: false,
        score: data.score,
        action: data.action,
        errorCodes: ["low-score"],
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
    };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, errorCodes: ["verification-failed"] };
  }
}
