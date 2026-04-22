import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@localapartmentexperts.com";
const ADMIN_PASSWORD = "Admin1234!";

test.describe("Login smoke test", () => {
  test("login with valid credentials redirects to dashboard", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByText("Local AE")).toBeVisible();
    await expect(page.getByText("CRM")).toBeVisible();

    await page.getByLabel("Correo electrónico").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Panel de control")).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Correo electrónico").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña").fill("wrongpassword");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page.getByText("Correo o contraseña incorrectos")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("dashboard summary cards are visible after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Correo electrónico").fill(ADMIN_EMAIL);
    await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/dashboard/);

    // All four summary metric cards should be visible
    await expect(page.getByText("Nuevos")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Sin asignar")).toBeVisible();
  });

  test("navigating to protected route without session redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
