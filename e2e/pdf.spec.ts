import { test, expect } from '@playwright/test'

test('user can download PDF report', async ({ page }) => {
  test.setTimeout(60_000) // PDF generation can take time

  // Navigate to reports and open a completed audit
  await page.goto('/reports')
  const auditCard = page.locator('[class*="cursor-pointer"]').first()
  await auditCard.click()
  await page.waitForURL(/\/audits\//)

  // Wait for audit detail to fully load (score visible)
  await expect(page.getByText(/WCAG|Score/i).first()).toBeVisible()

  // Listen for download event BEFORE clicking
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: /download pdf/i }).click()

  // Assert download event fires
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('auditflow-report')
})
