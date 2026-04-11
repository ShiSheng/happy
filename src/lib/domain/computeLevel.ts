import { LEVEL_MIN_XP } from "@/lib/constants/levels";

export type LevelResult = {
  level: number;
  graduated: boolean;
};

/**
 * 根据累计 XP 计算等级：Lv6 且 xp>=10000 视为已毕业展示态。
 */
export function computeLevel(totalXp: number): LevelResult {
  const xp = Math.max(0, totalXp);
  if (xp >= (LEVEL_MIN_XP[6] ?? 10_000)) {
    return { level: 6, graduated: true };
  }
  if (xp >= (LEVEL_MIN_XP[5] ?? 7000)) return { level: 5, graduated: false };
  if (xp >= (LEVEL_MIN_XP[4] ?? 5000)) return { level: 4, graduated: false };
  if (xp >= (LEVEL_MIN_XP[3] ?? 3000)) return { level: 3, graduated: false };
  if (xp >= (LEVEL_MIN_XP[2] ?? 1500)) return { level: 2, graduated: false };
  return { level: 1, graduated: false };
}

export type LevelProgress = {
  /** 已满级毕业 */
  maxedOut: boolean;
  /** 下一等级数字，未满级时必有 */
  nextLevel: number | null;
  /** 距下一级阈值还差的 XP */
  xpToNext: number;
  /** 在当前级区间内的进度 0–1（用于进度条） */
  progressInSegment: number;
};

/**
 * 未满级时：下一级门槛来自 LEVEL_MIN_XP；已毕业则 maxedOut。
 */
export function getLevelProgress(totalXp: number): LevelProgress {
  const xp = Math.max(0, totalXp);
  const { level, graduated } = computeLevel(xp);

  if (graduated || level >= 6) {
    return {
      maxedOut: true,
      nextLevel: null,
      xpToNext: 0,
      progressInSegment: 1,
    };
  }

  const nextLevel = level + 1;
  const spanStart = LEVEL_MIN_XP[level] ?? 0;
  const spanEnd = LEVEL_MIN_XP[nextLevel];
  const span = spanEnd - spanStart;
  const xpToNext = Math.max(0, spanEnd - xp);
  const progressInSegment =
    span > 0
      ? Math.min(1, Math.max(0, (xp - spanStart) / span))
      : 1;

  return {
    maxedOut: false,
    nextLevel,
    xpToNext,
    progressInSegment,
  };
}
