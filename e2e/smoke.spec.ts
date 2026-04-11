import { expect, test } from "@playwright/test";

test.describe("宠物乐园关键路径", () => {
  test("首页重定向到宠物乐园", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/pet-paradise/);
    await expect(page.getByRole("heading", { name: "宠物乐园" })).toBeVisible();
  });

  test("今日互动正向多选并结算", async ({ page }) => {
    await page.goto("/pet-paradise");
    await page.getByRole("button", { name: "今日互动" }).click();
    await page.getByRole("button", { name: /正向行为/ }).click();
    await expect(page.getByText("可多选")).toBeVisible();
    await page.getByRole("checkbox", { name: /早起/ }).check();
    await page.getByRole("button", { name: "确认结算" }).click();
    await expect(page.getByRole("status")).toContainText(/已更新/);
  });

  test("导航可进入小卖部", async ({ page }) => {
    await page.goto("/pet-paradise");
    await page.getByRole("link", { name: "小卖部" }).click();
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.getByRole("heading", { name: "小卖部" })).toBeVisible();
  });

  test("导航可进入系统设置", async ({ page }) => {
    await page.goto("/pet-paradise");
    await page.getByRole("link", { name: "系统设置" }).click();
    await expect(page).toHaveURL(/\/settings/);
    await expect(
      page.getByRole("heading", { name: "系统设置" }),
    ).toBeVisible();
  });
});
