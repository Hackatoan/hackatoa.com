const { test, expect } = require('@playwright/test');

test.describe('MOTD System', () => {
  test('should display MOTD message on successful fetch', async ({ page }) => {
    // Mock successful MOTD fetch
    await page.route('**/motd.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Hello from test!' }),
      });
    });

    await page.goto('/');

    const motdBody = page.locator('#motd-body');
    await expect(motdBody).toHaveText('Hello from test!');
  });

  test('should display fallback message on 404 response', async ({ page }) => {
    // Mock 404 MOTD fetch
    await page.route('**/motd.json', async route => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not Found' }),
      });
    });

    await page.goto('/');

    const motdBody = page.locator('#motd-body');
    await expect(motdBody).toHaveText('Stay curious. Keep building.');
  });

  test('should display fallback message on network error', async ({ page }) => {
    // Mock network error
    await page.route('**/motd.json', async route => {
      await route.abort('failed');
    });

    await page.goto('/');

    const motdBody = page.locator('#motd-body');
    await expect(motdBody).toHaveText('Stay curious. Keep building.');
  });

  test('should display fallback message if data.message is missing', async ({ page }) => {
    // Mock response missing message field
    await page.route('**/motd.json', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ wrongField: 'No message here' }),
      });
    });

    await page.goto('/');

    const motdBody = page.locator('#motd-body');
    await expect(motdBody).toHaveText('Stay curious. Keep building.');
  });
});
