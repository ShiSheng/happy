import { getPetLevelPresentation } from "@/lib/constants/petLevelPresentation";

/**
 * 优先使用该宠物该等级自定义称呼，否则用全局默认等级称呼。
 */
export function resolvePetLevelDisplayName(
  level: number,
  customByLevel: Partial<Record<number, string>> | undefined,
): string {
  const n = Math.min(Math.max(Math.floor(level), 1), 6);
  const custom = customByLevel?.[n]?.trim();
  if (custom) return custom;
  return getPetLevelPresentation(n).defaultName;
}

/**
 * 优先使用该宠物该等级上传图，否则用全局默认等级图。
 */
export function resolvePetLevelImageSrc(
  level: number,
  customByLevel: Partial<Record<number, string>> | undefined,
): string {
  const n = Math.min(Math.max(Math.floor(level), 1), 6);
  const custom = customByLevel?.[n];
  if (custom && custom.length > 0) return custom;
  return getPetLevelPresentation(n).imageSrc;
}
