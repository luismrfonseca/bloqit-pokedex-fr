import { test, expect } from '@playwright/test';

test.describe('Catch & Note Flow', () => {
  test('should search, catch, and add a note to a Pokémon', async ({ page }) => {
    // 1. Go to Home
    await page.goto('/');
    await expect(page).toHaveTitle(/Pokédex Tracker/);

    // 2. Search for Pikachu
    const searchInput = page.getByPlaceholder('Search by name or number…');
    await searchInput.fill('pikachu');
    
    // Wait for the card to be visible (virtualization might take a moment)
    const pikachuCard = page.locator('div:has-text("Pikachu")').first();
    await expect(pikachuCard).toBeVisible();

    // 3. Catch Pikachu
    const catchButton = pikachuCard.locator('button:has-text("Catch!")');
    await catchButton.click();

    // Verify it changed to "Release"
    await expect(pikachuCard.locator('button:has-text("Release")')).toBeVisible();

    // 4. Navigate to My Pokédex
    await page.click('a:has-text("My Pokédex")');
    await expect(page).toHaveURL(/.*pokedex/);

    // 5. Verify Pikachu is in the Pokédex
    const pokedexPikachu = page.locator('div:has-text("Pikachu")').first();
    await expect(pokedexPikachu).toBeVisible();

    // 6. Open Detail Modal
    // Click specifically on the name to ensure we trigger the modal
    await page.getByRole('heading', { name: 'Pikachu' }).click();
    
    // 7. Add Note
    const noteArea = page.getByPlaceholder('Add a personal note about this Pokémon...');
    // Increase timeout significantly for the first load of detail
    await noteArea.waitFor({ state: 'visible', timeout: 20000 });
    await noteArea.fill('Este é o meu Pikachu de teste!');
    
    const saveButton = page.locator('button:has-text("Save Note")');
    await saveButton.click();

    // Verify "Saved" state
    await expect(page.locator('button:has-text("Saved")')).toBeVisible();

    // 8. Close Modal
    await page.getByLabel('Close').click();
    await expect(page.locator('text=Base Stats')).not.toBeVisible();

    // 9. Re-open and verify note persistence
    await page.getByRole('heading', { name: 'Pikachu' }).click();
    await expect(noteArea).toBeVisible();
    await expect(noteArea).toHaveValue('Este é o meu Pikachu de teste!');
  });
});
