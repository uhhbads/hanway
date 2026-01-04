import * as Crypto from "expo-crypto";

/**
 * Generate a collision-resistant UUID using expo-crypto
 * Uses cryptographically secure random bytes for sync-safe IDs
 */
export function generateId(): string {
  const bytes = Crypto.getRandomBytes(16);
  
  // Set version (4) and variant (RFC4122)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
