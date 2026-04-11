// @vitest-environment node
import { describe, expect, it } from "vitest";
import { getPetLevelPresentation, listPetLevelPresentations } from "./petLevelPresentation";

describe("petLevelPresentation", () => {
  it("等级钳制在 1–6 且含经验与资源路径", () => {
    expect(getPetLevelPresentation(0).level).toBe(1);
    expect(getPetLevelPresentation(99).level).toBe(6);
    expect(getPetLevelPresentation(3).minXp).toBe(3000);
    expect(getPetLevelPresentation(3).imageSrc).toMatch(/\/pet-levels\/3\.svg$/);
  });

  it("共 6 条配置", () => {
    expect(listPetLevelPresentations()).toHaveLength(6);
  });
});
