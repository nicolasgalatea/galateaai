/**
 * Generates a unique project code in format GAL-YYYY-XXXX
 * where YYYY is the current year and XXXX is a random 4-digit number.
 *
 * For production, this should be replaced with a DB sequence to guarantee uniqueness.
 */
export function generateProjectCode(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit random
  return `GAL-${year}-${seq}`;
}
