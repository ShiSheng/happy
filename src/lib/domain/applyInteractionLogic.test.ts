// @vitest-environment node
import { describe, expect, it } from "vitest";
import { applyInteractionLogic } from "./applyInteractionLogic";

const rules = [
  {
    id: "a",
    polarity: "positive" as const,
    name: "早起",
    xpDelta: 10,
    coinDelta: 2,
    active: true,
  },
  {
    id: "b",
    polarity: "positive" as const,
    name: "阅读",
    xpDelta: 5,
    coinDelta: 1,
    active: true,
  },
];

describe("applyInteractionLogic", () => {
  it("多选汇总 XP 与金币", () => {
    const r = applyInteractionLogic({
      rules,
      selectedRuleIds: ["a", "b"],
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.totalXp).toBe(15);
      expect(r.totalCoins).toBe(3);
    }
  });

  it("空选择失败", () => {
    const r = applyInteractionLogic({ rules, selectedRuleIds: [] });
    expect(r.ok).toBe(false);
  });
});
