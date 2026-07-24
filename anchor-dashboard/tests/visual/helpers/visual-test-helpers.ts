import { expect, type Page } from "@playwright/test";

export interface RuntimeGuards {
  assertClean(): void;
}

const IGNORED_CONSOLE_ERRORS = [
  /favicon\.ico/i,
];

export const installRuntimeGuards = (page: Page): RuntimeGuards => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (IGNORED_CONSOLE_ERRORS.some((pattern) => pattern.test(text))) return;
    consoleErrors.push(text);
  });

  return {
    assertClean() {
      expect(pageErrors, "Unexpected page errors").toEqual([]);
      expect(consoleErrors, "Unexpected console errors").toEqual([]);
    },
  };
};

export const stabilizeVisualPage = async (page: Page): Promise<void> => {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.waitForTimeout(100);
};

export const getDomSignature = async (
  page: Page,
  rootSelector: string,
): Promise<string> => page.locator(rootSelector).evaluate((root) => {
  const elements = [root, ...root.querySelectorAll("*")];
  return elements.map((element) => {
    const className = typeof element.className === "string" ? element.className : "";
    const inlineStyle = element.getAttribute("style") || "";
    const role = element.getAttribute("role") || "";
    return [
      element.tagName.toLowerCase(),
      className,
      inlineStyle,
      role,
    ].join("|");
  }).join("\n");
});
