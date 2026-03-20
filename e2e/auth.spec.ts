import { test, expect } from '@playwright/test'

// Override storageState — login test needs a fresh browser
test.use({ storageState: { cookies: [], origins: [] } })

test('user can log in and reach dashboard', async ({ page }) => {
  await page.goto('/login')

  await page.fill('#email', process.env.E2E_EMAIL!)
  await page.fill('#password', process.env.E2E_PASSWORD!)
  await page.click('button[type="submit"]')

  await page.waitForURL('**/dashboard')
  await expect(page).toHaveURL(/dashboard/)
})
