// @vitest-environment node
import { describe, expect, it } from "vitest";
import { exchangeGiftLogic } from "./exchangeGiftLogic";

describe("exchangeGiftLogic", () => {
  it("余额不足拒绝", () => {
    const r = exchangeGiftLogic({ currentCoins: 5, giftPrice: 10 });
    expect(r.ok).toBe(false);
  });

  it("成功扣减", () => {
    const r = exchangeGiftLogic({ currentCoins: 20, giftPrice: 7 });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.newBalance).toBe(13);
  });
});
