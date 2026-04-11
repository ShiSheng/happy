/** 达到该等级所需的最低累计经验（与需求图一致） */
export const LEVEL_MIN_XP: Record<number, number> = {
  1: 0,
  2: 1500,
  3: 3000,
  4: 5000,
  5: 7000,
  6: 10000,
};

export const LEVEL_THRESHOLDS_DESC = [
  { level: 1, minXp: 0, label: "Lv1 · 起步" },
  { level: 2, minXp: 1500, label: "Lv2 · 1500 XP" },
  { level: 3, minXp: 3000, label: "Lv3 · 3000 XP" },
  { level: 4, minXp: 5000, label: "Lv4 · 5000 XP" },
  { level: 5, minXp: 7000, label: "Lv5 · 7000 XP" },
  { level: 6, minXp: 10000, label: "Lv6 · 毕业（10000 XP）" },
] as const;
