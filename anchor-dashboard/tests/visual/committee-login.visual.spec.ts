import { expect, test } from "@playwright/test";
import {
  getDomSignature,
  installRuntimeGuards,
  stabilizeVisualPage,
} from "./helpers/visual-test-helpers";

const PUBLIC_MEETING = {
  id: "visual-meeting-1",
  public_code: "visual-access-code",
  committee_id: "ecc_op",
  title: "2026년 제2차 ECC센터운영위원회",
  meeting_date: "2026-08-11T10:00:00+09:00",
  meeting_type: "정기회의",
  status: "진행중",
};

test.beforeEach(async ({ page }) => {
  await page.route("**/functions/v1/committee-vote", async (route) => {
    const body = route.request().postDataJSON() as {
      action?: string;
    };

    if (body.action === "public") {
      await route.fulfill({ json: { ok: true, data: PUBLIC_MEETING } });
      return;
    }

    if (body.action === "authenticate") {
      await route.fulfill({
        json: {
          ok: true,
          data: {
            token: "visual-test-token",
            expires_at: "2099-01-01T00:00:00.000Z",
            member: {
              id: "visual-member-1",
              name: "테스트 위원",
              type: "external",
              role_code: "MEMBER",
            },
          },
        },
      });
      return;
    }

    if (body.action === "context") {
      await route.fulfill({
        json: {
          ok: true,
          data: {
            meeting: PUBLIC_MEETING,
            member: {
              id: "visual-member-1",
              name: "테스트 위원",
              type: "external",
              role_code: "MEMBER",
            },
            agendas: [
              {
                id: "visual-agenda-1",
                meeting_id: PUBLIC_MEETING.id,
                title: "테스트 안건",
                is_evaluation: false,
                sort_order: 1,
              },
            ],
            existing_votes: [],
            has_submitted: false,
            revision: 1,
          },
        },
      });
      return;
    }

    await route.abort("blockedbyclient");
  });
});

test("external committee login UI remains pixel and DOM identical", async ({
  page,
}) => {
  const runtimeGuards = installRuntimeGuards(page);

  await page.goto("/?mode=vote&meetingId=visual-access-code");
  await expect(page.locator(".committee-login-page")).toBeVisible();

  const form = page.locator(".committee-login-form");
  await expect(form).toHaveCount(1);
  await expect(form.locator("input")).toHaveCount(3);

  const pinInput = page.locator("#committee-security-code");
  await expect(pinInput).toHaveAttribute("type", "password");
  await expect(pinInput).toHaveAttribute("inputmode", "numeric");
  await expect(pinInput).toHaveAttribute("pattern", "[0-9]{6}");
  await expect(pinInput).toHaveAttribute("maxlength", "6");

  await stabilizeVisualPage(page);
  await expect(
    page.locator(".committee-login-page"),
  ).toHaveScreenshot("committee-login.png");
  expect(
    await getDomSignature(page, ".committee-login-page"),
  ).toMatchSnapshot("committee-login.dom.txt");

  runtimeGuards.assertClean();
});

test("Enter in the PIN field submits the committee login form", async ({
  page,
}) => {
  const runtimeGuards = installRuntimeGuards(page);
  let authenticationRequests = 0;

  page.on("request", (request) => {
    if (!request.url().includes("/functions/v1/committee-vote")) return;
    const body = request.postDataJSON() as { action?: string };
    if (body.action === "authenticate") authenticationRequests++;
  });

  await page.goto("/?mode=vote&meetingId=visual-access-code");
  await expect(page.locator(".committee-login-form")).toBeVisible();

  await page.locator("#committee-member-code").fill("테스트 위원");
  await page.locator("#committee-security-code").fill("123456");
  await page.locator("#committee-security-code").press("Enter");

  await expect.poll(() => authenticationRequests).toBe(1);
  await expect(
    page.getByRole("heading", { name: "테스트 안건" }),
  ).toBeVisible();
  runtimeGuards.assertClean();
});
