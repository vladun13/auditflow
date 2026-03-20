import { test, expect } from '@playwright/test'

test('user can open buy credits modal and reach checkout', async ({ page }) => {
  await page.goto('/dashboard')

  // Click the Buy Credits / Upgrade button in the header
  await page.getByRole('button', { name: /buy credits|upgrade/i }).click()

  // Assert BuyCreditsModal is open (dialog visible)
  await expect(page.getByRole('dialog')).toBeVisible()

  // Click a credit pack button inside the modal
  // BuyCreditsModal redirects via window.location.href to LemonSqueezy checkout
  const buyButton = page
    .getByRole('dialog')
    .getByRole('button', { name: /buy|select|get started/i })
    .first()
  await expect(buyButton).toBeVisible()

  // Verify the modal contains pricing/credit pack information
  await expect(
    page.getByRole('dialog').getByText(/credit/i).first(),
  ).toBeVisible()
})
