import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = "admin@localapartmentexperts.com";
const ADMIN_PASSWORD = "Admin1234!";

async function login(page: Parameters<typeof test>[1]["page"]) {
  await page.goto("/login");
  await page.getByLabel("Correo electrónico").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test.describe("Lead flow smoke test", () => {
  test("create a lead and verify it appears in the leads list", async ({ page }) => {
    await login(page);

    await page.getByRole("link", { name: /Prospectos/i }).click();
    await expect(page).toHaveURL(/\/leads/);

    await page.getByRole("link", { name: /Nuevo prospecto|Crear/i }).click();
    await expect(page).toHaveURL(/\/leads\/new/);

    const firstName = `Smoke${Date.now()}`;
    await page.getByLabel("Nombre").fill(firstName);
    await page.getByLabel("Apellido").fill("TestLead");

    await page.getByRole("button", { name: "Crear prospecto" }).click();

    // Should redirect to lead detail
    await expect(page).toHaveURL(/\/leads\/.+/);
    await expect(page.getByText(`${firstName} TestLead`)).toBeVisible();
  });

  test("add a note to a lead and verify it appears", async ({ page }) => {
    await login(page);

    // Create a lead first
    await page.goto("/leads/new");
    const firstName = `NoteTest${Date.now()}`;
    await page.getByLabel("Nombre").fill(firstName);
    await page.getByLabel("Apellido").fill("Playwright");
    await page.getByRole("button", { name: "Crear prospecto" }).click();
    await expect(page).toHaveURL(/\/leads\/.+/);

    // Navigate to Notes tab
    await page.getByRole("button", { name: /Notas/i }).click();

    // Write a note
    const noteText = `Playwright smoke note ${Date.now()}`;
    await page.getByPlaceholder(/Escribe una nota/i).fill(noteText);
    await page.getByRole("button", { name: "Guardar nota" }).click();

    // Note should appear in the list
    await expect(page.getByText(noteText)).toBeVisible({ timeout: 10_000 });
  });

  test("change lead status from NEW to CONTACTED", async ({ page }) => {
    await login(page);

    await page.goto("/leads/new");
    const firstName = `StatusTest${Date.now()}`;
    await page.getByLabel("Nombre").fill(firstName);
    await page.getByLabel("Apellido").fill("Playwright");
    await page.getByRole("button", { name: "Crear prospecto" }).click();
    await expect(page).toHaveURL(/\/leads\/.+/);

    // Find and change the status dropdown
    const statusSelect = page.getByRole("combobox").filter({ hasText: /Nuevo|NEW/i }).first();
    await statusSelect.selectOption("CONTACTED");

    // Badge should update
    await expect(page.getByText("Contactado")).toBeVisible({ timeout: 10_000 });
  });
});
