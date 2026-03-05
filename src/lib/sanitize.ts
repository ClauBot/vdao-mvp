/**
 * Input sanitization helpers.
 */

/** Strip HTML tags and dangerous characters from text */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets (prevents HTML/script injection)
    .replace(/&(?=#|[a-z])/gi, '&amp;') // Encode ampersands that start HTML entities
    .trim();
}

/** Validate Ethereum wallet address format */
export function isValidWallet(wallet: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(wallet);
}

/** Validate and sanitize a rubro name */
export function sanitizeRubroName(name: string): string | null {
  const clean = sanitizeText(name);
  if (clean.length < 3 || clean.length > 200) return null;
  return clean;
}

/** Validate and sanitize a description */
export function sanitizeDescription(desc: string): string | null {
  const clean = sanitizeText(desc);
  if (clean.length > 1000) return null;
  return clean;
}
