import { LEVEL_MIN_XP } from "@/lib/constants/levels";

export type PetLevelPresentation = {
  level: number;
  /** 达到该等级所需的最低累计经验 */
  minXp: number;
  /** 该阶段默认称呼（新建宠物、说明文案用） */
  defaultName: string;
  /** 静态资源路径，置于 public/ */
  imageSrc: string;
  /** 图片加载失败时的 emoji 占位 */
  emojiFallback: string;
};

const ROWS: readonly PetLevelPresentation[] = [
  {
    level: 1,
    minXp: LEVEL_MIN_XP[1],
    defaultName: "蛋蛋崽",
    imageSrc: "/pet-levels/1.svg",
    emojiFallback: "🥚",
  },
  {
    level: 2,
    minXp: LEVEL_MIN_XP[2],
    defaultName: "破壳萌新",
    imageSrc: "/pet-levels/2.svg",
    emojiFallback: "🐣",
  },
  {
    level: 3,
    minXp: LEVEL_MIN_XP[3],
    defaultName: "绒毛球球",
    imageSrc: "/pet-levels/3.svg",
    emojiFallback: "🐤",
  },
  {
    level: 4,
    minXp: LEVEL_MIN_XP[4],
    defaultName: "机灵小豆",
    imageSrc: "/pet-levels/4.svg",
    emojiFallback: "🐦",
  },
  {
    level: 5,
    minXp: LEVEL_MIN_XP[5],
    defaultName: "活力伙伴",
    imageSrc: "/pet-levels/5.svg",
    emojiFallback: "🦜",
  },
  {
    level: 6,
    minXp: LEVEL_MIN_XP[6],
    defaultName: "毕业之星",
    imageSrc: "/pet-levels/6.svg",
    emojiFallback: "🎓",
  },
] as const;

export function getPetLevelPresentation(level: number): PetLevelPresentation {
  const n = Math.min(Math.max(Math.floor(level), 1), 6);
  return ROWS[n - 1] ?? ROWS[0];
}

export function listPetLevelPresentations(): readonly PetLevelPresentation[] {
  return ROWS;
}

/** 新建宠物时的默认名称（Lv.1） */
export function defaultNewPetName(): string {
  return getPetLevelPresentation(1).defaultName;
}
