/** 统一小写，仅字母数字与下划线，长度 2～20 */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidUsername(normalized: string): boolean {
  return /^[a-z0-9_]{2,20}$/.test(normalized);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 72;
}
