import path from 'node:path'

import { expect, test, type Page } from '@playwright/test'

const baseYaml = `schemaVersion: 1
persons:
  - id: parent-1
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
relationships: []`

const openYaml = async (page: Page) => {
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Öffnen' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({
    name: 'base.yaml',
    mimeType: 'text/yaml',
    buffer: Buffer.from(baseYaml),
  })
  await expect(page.getByText('Geöffnet: base.yaml')).toBeVisible()
}

const openDownloadedYaml = async (page: Page, buffer: Buffer) => {
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Öffnen' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles({ name: 'saved.yaml', mimeType: 'text/yaml', buffer })
  await expect(page.getByText('Geöffnet: saved.yaml')).toBeVisible()
}

const importOcr = async (page: Page) => {
  await page.getByRole('textbox', { name: 'OCR-Pfad (Linux)' }).fill(
    path.resolve('e2e/fixtures/ocr'),
  )
  await page.getByRole('button', { name: 'OCR-Pfad einlesen' }).click()
  await expect(page.getByText('1 Quelle · 1 Seite')).toBeVisible()
}

test.describe('OCR-Vorschläge', () => {
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

  test('zeigt den Graphen und darunter Vorschläge mit klickbarem Quelllink und Dokumentenname', async ({ page }) => {
    await page.goto('/')
    await openYaml(page)
    await importOcr(page)

    const card = page.getByRole('article', { name: /Lina Weber/ })
    await expect(card).toBeVisible()
    await expect(card).toContainText('Anna Weber')
    await expect(card).toContainText('Eltern-Kind')
    await expect(card).toContainText('OCR-Vorschlag')
    await expect(card).toContainText('Bewertung')
    await expect(card).toContainText('/100')
    const sourceLink = card.getByRole('link', { name: 'Kirchenbuch 1840 · PP-OCRv6 · Seite 1' })
    await expect(sourceLink).toBeVisible()
    await expect(sourceLink).toHaveAttribute(
      'href',
      'http://127.0.0.1:8767/review?book_id=book-1&page_id=page-1',
    )
    await expect(sourceLink).toHaveAttribute('target', '_blank')
    await expect(page.locator('.ocr-pages')).toHaveCount(0)

    const canvasBox = await page.locator('.canvas-panel').boundingBox()
    const ocrPanelBox = await page.locator('.ocr-panel').boundingBox()
    expect(canvasBox).not.toBeNull()
    expect(ocrPanelBox).not.toBeNull()
    expect(ocrPanelBox!.y).toBeGreaterThan(canvasBox!.y + canvasBox!.height - 1)
  })

  test('öffnet, korrigiert und speichert einen Vorschlag über den bestehenden Workflow', async ({ page }) => {
    await page.goto('/')
    await openYaml(page)
    await importOcr(page)

    await page.getByRole('button', { name: 'Vorschlag bearbeiten' }).click()
    await expect(page.getByLabel('Vorname')).toHaveValue('Lina')
    await page.getByLabel('Vorname').fill('Lina-Marie')
    await page.getByRole('button', { name: 'Person speichern' }).click()
    await expect(page.getByText('Ungespeichert')).toBeVisible()
    await expect(page.getByText('OCR-Vorschlag')).toBeVisible()
    await expect(page.locator('.relationship-edge--ocr-suggestion')).toHaveCount(1)

    const downloadPromise = page.waitForEvent('download')
    await page.locator('.topbar-actions').getByRole('button', { name: 'Speichern' }).click()
    const download = await downloadPromise
    const stream = await download.createReadStream()
    if (!stream) throw new Error('Gespeicherte YAML-Datei konnte nicht gelesen werden.')
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    const savedYaml = Buffer.concat(chunks)
    expect(savedYaml.toString()).toContain('origin: ocr-suggestion')

    await expect(page.getByText('Gespeichert: base.yaml')).toBeVisible()
    await page.getByRole('button', { name: 'Neu' }).click()
    await expect(page.locator('.person-node')).toHaveCount(0)
    await openDownloadedYaml(page, savedYaml)

    await expect(page.locator('.person-node').filter({ hasText: 'Lina-Marie Weber' })).toBeVisible()
    await expect(page.locator('.relationship-edge--ocr-suggestion')).toHaveCount(1)
  })

  test('verwirft eine geöffnete OCR-Korrektur ohne Personen- oder Dirty-Änderung', async ({ page }) => {
    await page.goto('/')
    await openYaml(page)
    await importOcr(page)

    const card = page.getByRole('article', { name: /Lina Weber/ })
    await card.getByRole('button', { name: 'Vorschlag bearbeiten' }).click()
    await page.getByLabel('Vorname').fill('Verworfen')
    await page.getByRole('button', { name: 'Verwerfen' }).click()

    await expect(card).toBeVisible()
    await expect(page.getByText('Geöffnet: base.yaml')).toBeVisible()
    await expect(page.getByText('Ungespeichert')).toHaveCount(0)
    await expect(page.locator('.person-node')).toHaveCount(1)
  })

  test('lehnt einen Vorschlag ab und erhält Personen- und Beziehungszahl', async ({ page }) => {
    await page.goto('/')
    await openYaml(page)
    await importOcr(page)

    await expect(page.locator('.person-node')).toHaveCount(1)
    await expect(page.locator('.relationship-edge')).toHaveCount(0)
    await page.getByRole('button', { name: 'Vorschlag ablehnen' }).click()

    await expect(page.getByRole('article', { name: /Lina Weber/ })).toHaveCount(0)
    await expect(page.locator('.person-node')).toHaveCount(1)
    await expect(page.locator('.relationship-edge')).toHaveCount(0)
    await expect(page.getByText('Geöffnet: base.yaml')).toBeVisible()
  })
})
