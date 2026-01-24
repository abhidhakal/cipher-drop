import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";

// Security: Load encryption key from environment variables
// AES-256 requires exactly 32 bytes (256 bits)
const encryptionKeyRaw = process.env.ENCRYPTION_KEY;

if (!encryptionKeyRaw) {
  throw new Error("SECURITY ERROR: ENCRYPTION_KEY environment variable is not set.");
}

if (encryptionKeyRaw.length !== 32) {
  throw new Error(`SECURITY ERROR: ENCRYPTION_KEY must be exactly 32 characters for AES-256. Current length: ${encryptionKeyRaw.length}`);
}

const SECRET_KEY = Buffer.from(encryptionKeyRaw, "utf-8");

export function encryptData(text: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag
  };
}

export function decryptData(encrypted: string, ivHex: string, authTagHex: string) {
  const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
