import { db } from "@/lib/db";
import { compare } from "bcryptjs";

/**
 * Checks if the password has been used by the user in the past.
 * Policy: Block reuse of the last 3 passwords.
 */
export async function isPasswordReused(userId: string, newPasswordPlain: string): Promise<boolean> {
  const history = await (db as any).passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  for (const record of history) {
    const matched = await compare(newPasswordPlain, record.passwordHash);
    if (matched) return true;
  }

  return false;
}

/**
 * Updates the user's password history.
 */
export async function updatePasswordHistory(userId: string, hashed: string) {
  await (db as any).passwordHistory.create({
    data: {
      userId,
      passwordHash: hashed,
    },
  });
}
