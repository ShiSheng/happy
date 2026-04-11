// @vitest-environment node
import { describe, expect, it } from "vitest";
import { computeLevel, getLevelProgress } from "./computeLevel";

describe("computeLevel", () => {
  it("等级随阈值递增", () => {
    expect(computeLevel(0).level).toBe(1);
    expect(computeLevel(1499).level).toBe(1);
    expect(computeLevel(1500).level).toBe(2);
    expect(computeLevel(9999).level).toBe(5);
    expect(computeLevel(10000).level).toBe(6);
    expect(computeLevel(10000).graduated).toBe(true);
  });
});

describe("getLevelProgress", () => {
  it("未满级时给出下一级与区间内进度", () => {
    const p = getLevelProgress(331);
    expect(p.maxedOut).toBe(false);
    expect(p.nextLevel).toBe(2);
    expect(p.xpToNext).toBe(1500 - 331);
    expect(p.progressInSegment).toBeCloseTo(331 / 1500, 5);
  });

  it("已毕业时 maxedOut", () => {
    const p = getLevelProgress(10000);
    expect(p.maxedOut).toBe(true);
    expect(p.nextLevel).toBeNull();
  });
});
