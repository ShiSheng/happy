import type {
  ExchangeHistoryItemDTO,
  GiftDTO,
  InteractionHistoryItemDTO,
  InteractionRuleDTO,
  LevelRowDTO,
  PetDTO,
} from "@/types/domain";
import { LEVEL_THRESHOLDS_DESC } from "@/lib/constants/levels";

export const fixturePet: PetDTO = {
  id: "fixture-pet",
  name: "小伙伴",
  xp: 200,
  coins: 50,
  graduatedAt: null,
  levelPortraits: {},
  levelDisplayNames: {},
};

export const fixtureInteractionRules: InteractionRuleDTO[] = [
  {
    id: "f-pos-1",
    polarity: "positive",
    name: "早起",
    xpDelta: 30,
    coinDelta: 5,
    active: true,
  },
  {
    id: "f-pos-2",
    polarity: "positive",
    name: "阅读 30 分钟",
    xpDelta: 20,
    coinDelta: 3,
    active: true,
  },
  {
    id: "f-neg-1",
    polarity: "negative",
    name: "熬夜",
    xpDelta: -15,
    coinDelta: -2,
    active: true,
  },
];

export const fixtureInteractionHistory: InteractionHistoryItemDTO[] = [
  {
    id: "h1",
    createdAt: new Date().toISOString(),
    polarity: "positive",
    ruleNames: ["早起"],
    xpDelta: 30,
    coinDelta: 5,
  },
];

export const fixtureGifts: GiftDTO[] = [
  { id: "g1", name: "贴纸包", pointCost: 10 },
  { id: "g2", name: "小零食", pointCost: 25 },
];

export const fixtureExchangeHistory: ExchangeHistoryItemDTO[] = [
  {
    id: "e1",
    createdAt: new Date().toISOString(),
    giftName: "贴纸包",
    pointsSpent: 10,
  },
];

export const fixtureLevelRows: LevelRowDTO[] = LEVEL_THRESHOLDS_DESC.map(
  (r) => ({
    level: r.level,
    minXp: r.minXp,
    label: r.label,
  }),
);

export const fixturePets: PetDTO[] = [fixturePet];
