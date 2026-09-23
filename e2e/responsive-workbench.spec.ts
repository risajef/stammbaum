import { expect, test, type Page } from '@playwright/test'

const assertInsideViewport = async (
  page: Page,
  selector: string,
) => {
  const box = await page.locator(selector).boundingBox()
  const viewport = page.viewportSize()
  expect(box).not.toBeNull()
  expect(viewport).not.toBeNull()
  if (!box || !viewport) return
  expect(box.x).toBeGreaterThanOrEqual(0)
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
}

const assertNoOverlap = async (
  page: Page,
  firstSelector: string,
  secondSelector: string,
) => {
  const firstBox = await page.locator(firstSelector).boundingBox()
  const secondBox = await page.locator(secondSelector).boundingBox()
  expect(firstBox).not.toBeNull()
  expect(secondBox).not.toBeNull()
  if (!firstBox || !secondBox) return

  const overlaps =
    firstBox.x < secondBox.x + secondBox.width &&
    secondBox.x < firstBox.x + firstBox.width &&
    firstBox.y < secondBox.y + secondBox.height &&
    secondBox.y < firstBox.y + firstBox.height
  expect(overlaps).toBe(false)
}

test.describe('responsive Workbench', () => {
  test('hält die Desktop-Bereiche getrennt und erreichbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Person anlegen' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Stammbaum-Arbeitsfläche' })).toBeVisible()
    await expect(page.getByRole('complementary', { name: 'Detailinspektor' })).toBeVisible()

    const canvas = await page.locator('.canvas-panel').boundingBox()
    const inspector = await page.locator('.inspector-panel').boundingBox()
    expect(canvas).not.toBeNull()
    expect(inspector).not.toBeNull()
    if (canvas && inspector) {
      expect(inspector.x).toBeGreaterThanOrEqual(canvas.x + canvas.width)
    }
  })

  test('hält alle Personenaktionen im schmalen Inspektor erreichbar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/')

    await page.getByRole('button', { name: 'Person anlegen' }).click()
    await page.getByLabel('Vorname').fill('Anna')
    await page.getByLabel('Nachname').fill('Beispiel')
    await page.getByRole('button', { name: 'Person speichern' }).click()

    const mergeButton = page.getByRole('button', { name: 'Mit anderer Person fusionieren' })
    await expect(mergeButton).toBeVisible()

    const actionLayout = await page.locator('.form-actions').evaluate((element) => {
      const container = element.getBoundingClientRect()
      const buttons = Array.from(element.querySelectorAll('button')).map((button) => {
        const box = button.getBoundingClientRect()
        return {
          bottom: box.bottom,
          left: box.left,
          right: box.right,
          top: box.top,
        }
      })

      return {
        container: {
          bottom: container.bottom,
          left: container.left,
          right: container.right,
          top: container.top,
        },
        buttons,
      }
    })

    expect(actionLayout.buttons).toHaveLength(4)
    for (const button of actionLayout.buttons) {
      expect(button.left).toBeGreaterThanOrEqual(actionLayout.container.left)
      expect(button.right).toBeLessThanOrEqual(actionLayout.container.right)
      expect(button.top).toBeGreaterThanOrEqual(actionLayout.container.top)
      expect(button.bottom).toBeLessThanOrEqual(actionLayout.container.bottom)
    }

    await mergeButton.click()
    await expect(page.getByRole('status')).toContainText('Wähle die zweite Person für die Fusion aus.')
  })

  test('hält Toolbar, Graph und Inspektor auf schmalen Viewports erreichbar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await assertInsideViewport(page, '.topbar')
    await assertInsideViewport(page, '.topbar-actions')
    await expect(page.getByRole('button', { name: 'Neu' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Öffnen' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Speichern' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Stammbaum-Arbeitsfläche' })).toBeVisible()
    await assertNoOverlap(page, '.brand-lockup', '.topbar-actions')
    await assertNoOverlap(page, '.canvas-caption', '.canvas-status')

    await page.getByRole('button', { name: 'Person anlegen' }).click()
    const inspector = page.locator('.inspector-panel')
    await inspector.scrollIntoViewIfNeeded()
    await expect(inspector).toBeVisible()
    await assertInsideViewport(page, '.inspector-panel')
    await assertInsideViewport(page, '.form-actions')
    await expect(page.getByRole('button', { name: 'Person speichern' })).toBeVisible()
  })
})
