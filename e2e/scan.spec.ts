import { test, expect } from '@playwright/test'

test('user can start a scan and see results', async ({ page }) => {
  test.setTimeout(120_000) // scan can take 60+ seconds

  // Navigate to scan page
  await page.goto('/scan')

  // Fill URL input and start scan
  await page.fill('input[type="url"]', 'https://example.com')
  await page.getByRole('button', { name: /start scan/i }).click()

  // Should navigate to /audits/:id
  await page.waitForURL(/\/audits\//, { timeout: 15_000 })

  // Wait for scan to complete — look for WCAG score or violations text
  // The page polls every 3s until status === 'completed'
  await expect(
    page.getByText(/WCAG|Score|violations/i).first(),
  ).toBeVisible({ timeout: 120_000 })
})
