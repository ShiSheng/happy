/**
 * 与 SSR 水合一致：不用依赖运行环境默认 locale / 时区。
 * 时间统一按中国标准时间（UTC+8，无夏令时）展示。
 */
const CHINA_OFFSET_MS = 8 * 60 * 60 * 1000;

export function formatDateTimeChina(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  const t = new Date(d.getTime() + CHINA_OFFSET_MS);
  return `${t.getUTCFullYear()}/${p(t.getUTCMonth() + 1)}/${p(t.getUTCDate())} ${p(t.getUTCHours())}:${p(t.getUTCMinutes())}:${p(t.getUTCSeconds())} 北京时间`;
}

/** 整数千分位，固定 en-US，服务端与浏览器一致 */
export function formatIntegerEn(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
