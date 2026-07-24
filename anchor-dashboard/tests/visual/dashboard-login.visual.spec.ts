import { expect, test } from "@playwright/test";
import {
  installRuntimeGuards,
  stabilizeVisualPage,
} from "./helpers/visual-test-helpers";

test("dashboard login UI remains pixel-identical", async ({ page }) => {
  const runtimeGuards = installRuntimeGuards(page);

  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "UC ANCHOR Portal" }),
  ).toBeVisible();
  await expect(page.getByPlaceholder("이메일 (또는 아이디)")).toBeVisible();
  await expect(page.getByPlaceholder("비밀번호")).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();

  await stabilizeVisualPage(page);
  await expect(page).toHaveScreenshot("dashboard-login.png", {
    fullPage: false,
  });

  runtimeGuards.assertClean();
});
