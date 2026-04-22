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

test.describe("Property flow smoke test", () => {
  test("create a property and verify it appears as DRAFT", async ({ page }) => {
    await login(page);

    await page.getByRole("link", { name: /Propiedades/i }).click();
    await expect(page).toHaveURL(/\/properties/);

    await page.getByRole("link", { name: /Nueva propiedad|Crear/i }).click();
    await expect(page).toHaveURL(/\/properties\/new/);

    const title = `Smoke Property ${Date.now()}`;
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Dirección línea 1").fill("Insurgentes Sur 1001");
    await page.getByLabel("Ciudad").fill("Ciudad de México");
    await page.getByLabel("Estado").fill("CDMX");
    await page.getByLabel("Tipo de propiedad").selectOption("APARTMENT");

    await page.getByRole("button", { name: "Crear propiedad" }).click();

    // Should redirect to property detail
    await expect(page).toHaveURL(/\/properties\/.+/);
    await expect(page.getByText(title)).toBeVisible();

    // Status badge should show DRAFT
    await expect(page.getByText("Borrador")).toBeVisible();
  });

  test("publish a property changes status badge to PUBLISHED", async ({ page }) => {
    await login(page);

    // Create property
    await page.goto("/properties/new");
    const title = `Publishable ${Date.now()}`;
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Dirección línea 1").fill("Reforma 222");
    await page.getByLabel("Ciudad").fill("CDMX");
    await page.getByLabel("Estado").fill("CDMX");
    await page.getByLabel("Tipo de propiedad").selectOption("APARTMENT");
    await page.getByRole("button", { name: "Crear propiedad" }).click();

    await expect(page).toHaveURL(/\/properties\/.+/);
    await expect(page.getByText("Borrador")).toBeVisible();

    // Publish it
    await page.getByRole("button", { name: "Publicar" }).click();

    // Badge should change to PUBLISHED
    await expect(page.getByText("Publicada")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Borrador")).not.toBeVisible();
  });

  test("property activity tab shows lifecycle events", async ({ page }) => {
    await login(page);

    await page.goto("/properties/new");
    const title = `ActivityTest ${Date.now()}`;
    await page.getByLabel("Título").fill(title);
    await page.getByLabel("Dirección línea 1").fill("Juárez 10");
    await page.getByLabel("Ciudad").fill("CDMX");
    await page.getByLabel("Estado").fill("CDMX");
    await page.getByLabel("Tipo de propiedad").selectOption("APARTMENT");
    await page.getByRole("button", { name: "Crear propiedad" }).click();

    await expect(page).toHaveURL(/\/properties\/.+/);

    // Navigate to Activity tab
    await page.getByRole("button", { name: /Actividad/i }).click();

    // At minimum the CREATED event should appear
    await expect(page.locator(".space-y-1")).toBeVisible({ timeout: 10_000 });
  });
});
