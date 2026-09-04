import { expect, test, type Page } from '@playwright/test'

const addPerson = async (page: Page) => {
  await page.getByRole('button', { name: 'Person anlegen' }).click()
  await page.getByLabel('Vorname').fill('Anna')
  await page.getByLabel('Nachname').fill('Weber')
  await page.getByRole('button', { name: 'Person speichern' }).click()
  await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()
}

test.describe('Datei-Fallback', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'showOpenFilePicker', {
        configurable: true,
        value: undefined,
      })
      Object.defineProperty(window, 'showSaveFilePicker', {
        configurable: true,
        value: undefined,
      })
    })
  })

  test('lädt und speichert ohne direkte Dateisystem-API', async ({ page }) => {
    await page.goto('/')
    await addPerson(page)

    const downloadPromise = page.waitForEvent('download')
    await page.locator('.topbar-actions').getByRole('button', { name: 'Speichern' }).click()
    const download = await downloadPromise
    const downloadedPath = await download.path()
    expect(downloadedPath).toBeTruthy()

    await page.getByRole('button', { name: 'Neu' }).click()
    const chooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Öffnen' }).click()
    const chooser = await chooserPromise
    await chooser.setFiles(downloadedPath as string)

    await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()
  })
})