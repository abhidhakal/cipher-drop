import { hash, compare } from "bcryptjs";
import { z } from "zod";

// Password policy regex: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
// Mismatches often happen due to special chars. Let's make sure the client validation matches.
// Actually, the user's password 'SecurePass123!' should pass:
// 8+ chars: Yes (14)
// Uppercase: Yes (S, P)
// Lowercase: Yes (e, c, u, r, e, a, s, s)
// Number: Yes (1, 2, 3)
// Special: Yes (!) - Wait, is ! inside [@$!%*?&]? Yes.

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().regex(passwordRegex, "Password must be at least 8 characters and include uppercase, lowercase, numbers, and symbols"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().regex(passwordRegex, "New password must meet complexity requirements"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords do not match",
  path: ["confirmNewPassword"],
});

export async function hashPassword(plainText: string): Promise<string> {
  return await hash(plainText, 12); // High salt rounds for "security" demo
}

export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return await compare(plainText, hashed);
}
