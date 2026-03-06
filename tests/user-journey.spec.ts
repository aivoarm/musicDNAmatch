import { test, expect } from '@playwright/test';

test.describe('E2E User Journey: MusicDNA Discovery', () => {

    test('Complete Flow: Landing -> DNA -> Soulmates', async ({ page }) => {
        // 1. Landing & Intro Sequence
        await page.goto('/');
        await expect(page).toHaveTitle(/musicDNAmatch/);

        // The landing page might have a "Begin" button to start the intro
        const beginTrigger = page.getByRole('button', { name: /Begin DNA Discovery/i });
        if (await beginTrigger.isVisible()) {
            await beginTrigger.click();
        }

        // Handle the name input if it appears
        const nameInput = page.getByPlaceholder('What is your name?');
        if (await nameInput.isVisible()) {
            await nameInput.fill('E2E Tester');
            await page.keyboard.press('Enter');
        }

        // Handle the "Start My Journey" button after the story sequence
        const startJourney = page.getByText(/Start My Journey/i);
        await expect(startJourney).toBeVisible({ timeout: 15000 });
        await startJourney.click();

        // 2. Sources Stage
        // We'll skip adding tracks to move fast, or add one YouTube track
        const youtubeInput = page.getByPlaceholder(/Song 1/i);
        await youtubeInput.fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        await page.keyboard.press('Enter');

        // Wait for the track to resolve (CheckCircle appears)
        await expect(page.locator('.text-\\[\\#FF0000\\]:has-text("")')).toBeVisible({ timeout: 10000 });

        const nextGenres = page.getByText(/Next: Genres Confirmation/i);
        await nextGenres.click();

        // 3. Genre Selection
        // Select a few genres
        const genres = ['Jazz', 'Indie Rock', 'R&B'];
        for (const genre of genres) {
            await page.getByText(genre, { exact: true }).click();
        }

        // Confirm and start analysis
        await page.getByText(/Confirm & Continue/i).click();

        // 4. Analyzing Stage
        // Wait for the analysis to hit 100% and show "Find Soulmates" or "View My DNA"
        await expect(page.getByText(/Find Soulmates/i)).toBeVisible({ timeout: 30000 });

        await page.getByText(/Find Soulmates/i).click();

        // 5. Email Capture (Checkpoint)
        // This is the new logic we added.
        const testEmail = `e2e-${Date.now()}@example.com`;
        await page.getByPlaceholder('your@email.com').fill(testEmail);
        await page.getByRole('button', { name: /Find Connections/i }).click();

        // 6. Arrival at Soulmates
        await expect(page).toHaveURL(/.*soulmates/);
        await expect(page.getByText(/Musical Soulmates/i)).toBeVisible();

        // 7. Express Interest
        // Wait for profiles (Anonymous Signal or real ones)
        const expressBtn = page.getByText(/Express Interest/i).first();
        await expect(expressBtn).toBeVisible({ timeout: 10000 });
        await expressBtn.click();

        // Verify modal and registration
        await expect(page.getByText(/Your Email/i)).toBeVisible();
        await page.getByRole('button', { name: /Express Interest/i }).last().click();
        await expect(page.getByText(/Interest Registered/i)).toBeVisible();
    });

});
