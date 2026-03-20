import { chromium } from '@playwright/test'

async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:5174/login')
  await page.fill('#email', process.env.E2E_EMAIL!)
  await page.fill('#password', process.env.E2E_PASSWORD!)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard')
  await page.context().storageState({ path: 'e2e/auth.json' })
  await browser.close()
}

export default globalSetup
