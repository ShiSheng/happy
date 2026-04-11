// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getPetLevelPresentation } from "@/lib/constants/petLevelPresentation";
import {
  resolvePetLevelDisplayName,
  resolvePetLevelImageSrc,
} from "./petPortrait";

describe("resolvePetLevelDisplayName", () => {
  it("无自定义时用全局默认称呼", () => {
    expect(resolvePetLevelDisplayName(2, {})).toBe(
      getPetLevelPresentation(2).defaultName,
    );
  });

  it("有自定义时优先", () => {
    expect(resolvePetLevelDisplayName(2, { 2: "我的小绿" })).toBe("我的小绿");
  });
});

describe("resolvePetLevelImageSrc", () => {
  it("无自定义时用默认路径", () => {
    const s = resolvePetLevelImageSrc(2, {});
    expect(s).toContain("/pet-levels/2.svg");
  });

  it("有自定义时优先", () => {
    const s = resolvePetLevelImageSrc(2, { 2: "/uploads/pets/x/lv2.png" });
    expect(s).toBe("/uploads/pets/x/lv2.png");
  });
});
