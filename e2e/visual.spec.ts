import { expect, test } from "@playwright/test";

/**
 * 可选视觉回归：本地执行前需 `npm run build`，并安装浏览器 `npx playwright install chromium`。
 * 首次生成基线：VISUAL_SNAPSHOT=1 npx playwright test e2e/visual.spec.ts --update-snapshots
 */
test.describe("visual snapshots (optional)", () => {
  test.skip(
    process.env.VISUAL_SNAPSHOT !== "1",
    "设置 VISUAL_SNAPSHOT=1 时运行；首次加 --update-snapshots",
  );

  test("pet-paradise light theme", async ({ page }) => {
    await page.goto("/pet-paradise");
    await expect(page.getByRole("heading", { name: "宠物乐园" })).toBeVisible();
    await expect(page).toHaveScreenshot("pet-paradise.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
