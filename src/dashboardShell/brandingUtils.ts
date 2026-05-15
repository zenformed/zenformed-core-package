/**
 * Pure helpers for sidebar organization branding display (no React, no I/O).
 */

export function getCompanyInitial(shopName: string, fallbackChar = 'Z'): string {
  const first = (shopName || fallbackChar).trim().charAt(0);
  return first ? first.toUpperCase() : fallbackChar;
}

export function companyCircleColor(shopName: string): string {
  let h = 0;
  for (let i = 0; i < shopName.length; i++) h = (h * 31 + shopName.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360}, 55%, 42%)`;
}
