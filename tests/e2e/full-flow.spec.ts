import { test, expect } from '@playwright/test';

test.describe('FairRent Manual Entry Flow', () => {
  test('loads landing page with correct heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Votre loyer est-il légal/i })).toBeVisible();
  });

  test('navigates to form via manual entry link', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Pas de PDF');
    await expect(page.getByRole('heading', { name: /Informations du bail/i })).toBeVisible();
  });

  test('shows validation errors on empty form submit', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Pas de PDF');
    await page.click('text=Vérifier mon loyer');
    // Should show validation errors
    await expect(page.getByText('Adresse requise')).toBeVisible();
  });

  test('full manual entry flow produces a report', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Pas de PDF');

    // Fill the form
    await page.fill('#address', '55 Rue des Batignolles');
    await page.fill('#postalCode', '75017');
    await page.fill('#surface', '35');
    await page.selectOption('#numberOfRooms', '2');
    await page.selectOption('#constructionPeriod', 'Avant 1946');
    await page.fill('#leaseStartDate', '2025-09-01');
    await page.fill('#rentExcludingCharges', '900');
    await page.fill('#charges', '50');

    // Submit
    await page.click('text=Vérifier mon loyer');

    // Wait for report — should see verdict
    await expect(
      page.getByText(/Conforme|Points d'attention|Dépassement/)
    ).toBeVisible({ timeout: 15000 });

    // Report should show rent comparison
    await expect(page.getByText('Comparaison des loyers')).toBeVisible();
  });
});
