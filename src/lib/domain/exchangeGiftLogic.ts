export type ExchangeGiftInput = {
  currentCoins: number;
  giftPrice: number;
};

export type ExchangeGiftResult =
  | { ok: true; newBalance: number }
  | { ok: false; error: string };

/** 礼物使用金币（与需求中「积分价」统一为扣减金币） */
export function exchangeGiftLogic(input: ExchangeGiftInput): ExchangeGiftResult {
  if (input.giftPrice < 0) {
    return { ok: false, error: "礼物价格无效" };
  }
  if (input.currentCoins < input.giftPrice) {
    return { ok: false, error: "金币不足" };
  }
  return { ok: true, newBalance: input.currentCoins - input.giftPrice };
}
