export type Polarity = "positive" | "negative";

export type InteractionRuleDTO = {
  id: string;
  polarity: Polarity;
  name: string;
  xpDelta: number;
  coinDelta: number;
  active: boolean;
};

export type PetDTO = {
  id: string;
  name: string;
  xp: number;
  coins: number;
  graduatedAt: string | null;
  /** 该宠物各等级自定义形象 URL（public 路径），未设置则用全局默认图 */
  levelPortraits: Partial<Record<number, string>>;
  /** 各等级展示称呼，覆盖全局默认；未设置的等级用常量表 defaultName */
  levelDisplayNames: Partial<Record<number, string>>;
};

export type InteractionHistoryItemDTO = {
  id: string;
  createdAt: string;
  polarity: Polarity;
  ruleNames: string[];
  xpDelta: number;
  coinDelta: number;
};

export type GiftDTO = {
  id: string;
  name: string;
  pointCost: number;
};

export type ExchangeHistoryItemDTO = {
  id: string;
  createdAt: string;
  giftName: string;
  pointsSpent: number;
};

export type LevelRowDTO = {
  level: number;
  minXp: number;
  label: string;
};
