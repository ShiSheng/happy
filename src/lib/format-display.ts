/**
 * 与 SSR 水合一致：不用依赖运行环境默认 locale / 时区的 toLocaleString()。
 * 时间统一按 UTC 展示，避免 Node 与浏览器本地时区不一致。
 */
export function formatDateTimeUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}/${p(d.getUTCMonth() + 1)}/${p(d.getUTCDate())} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
}

/** 整数千分位，固定 en-US，服务端与浏览器一致 */
export function formatIntegerEn(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
