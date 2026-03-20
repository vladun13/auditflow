import { test, expect } from '@playwright/test'

test('user can view audit results with score and violations', async ({ page }) => {
  // Navigate to reports list to find a completed audit
  await page.goto('/reports')

  // Click the first completed audit card (navigates to /audits/:id)
  const auditCard = page.locator('[class*="cursor-pointer"]').first()
  await auditCard.click()

  // Wait for navigation to audit detail page
  await page.waitForURL(/\/audits\//)

  // Assert WCAG score is visible
  await expect(page.getByText(/WCAG|Score/i).first()).toBeVisible()

  // Assert violation list section is visible
  await expect(
    page.getByText(/violations/i).first(),
  ).toBeVisible()
})
