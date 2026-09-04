import { expect, test, type Page } from '@playwright/test'

const panToEmptySpot = async (page: Page) => {
  const surface = page.locator('.flow-surface')
  const surfaceBox = await surface.boundingBox()
  if (!surfaceBox) throw new Error('Arbeitsfläche fehlt.')

  const startX = surfaceBox.x + surfaceBox.width - 40
  const startY = surfaceBox.y + surfaceBox.height - 40
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX - 180, startY, { steps: 10 })
  await page.mouse.up()
}

const addPerson = async (
  page: Page,
  firstName: string,
  lastName: string,
  gender: 'woman' | 'man' = 'woman',
) => {
  if (await page.locator('.person-node').count() > 0) {
    await panToEmptySpot(page)
  }

  await page.getByRole('button', { name: 'Person anlegen' }).click()
  await page.getByLabel('Vorname').fill(firstName)
  await page.getByLabel('Nachname').fill(lastName)
  await page.getByLabel('Geschlecht').selectOption(gender)
  await page.getByRole('button', { name: 'Person speichern' }).click()
  await expect(page.locator('.person-node').filter({ hasText: `${firstName} ${lastName}` })).toBeVisible()
}

const connectPeople = async (
  page: Page,
  sourceName: string,
  targetName: string,
  sourceHandleSelector = '.react-flow__handle-bottom',
  targetHandleSelector = '.react-flow__handle-top',
) => {
  const sourceHandle = page
    .locator('.person-node')
    .filter({ hasText: sourceName })
    .locator(sourceHandleSelector)
  const targetHandle = page
    .locator('.person-node')
    .filter({ hasText: targetName })
    .locator(targetHandleSelector)

  await expect.poll(async () => {
    const sourceBox = await sourceHandle.boundingBox()
    const targetBox = await targetHandle.boundingBox()
    const surfaceBox = await page.locator('.flow-surface').boundingBox()

    if (!sourceBox || !targetBox || !surfaceBox) return false

    const isInsideSurface = (box: { x: number; y: number; width: number; height: number }) =>
      box.x >= surfaceBox.x &&
      box.y >= surfaceBox.y &&
      box.x + box.width <= surfaceBox.x + surfaceBox.width &&
      box.y + box.height <= surfaceBox.y + surfaceBox.height

    return isInsideSurface(sourceBox) && isInsideSurface(targetBox)
  }).toBe(true)

  const sourceBox = await sourceHandle.boundingBox()
  const targetBox = await targetHandle.boundingBox()
  if (!sourceBox || !targetBox) throw new Error('Verbindungshandles fehlen.')

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2)
  await page.mouse.down()
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 20,
  })
  await page.mouse.up()
}

const createMarriage = async (page: Page) => {
  await addPerson(page, 'Anna', 'Weber', 'woman')
  await addPerson(page, 'Hans', 'Weber', 'man')
  await connectPeople(
    page,
    'Anna Weber',
    'Hans Weber',
    '.react-flow__handle-left',
    '.react-flow__handle-right',
  )
  await page.getByRole('button', { name: 'Beziehung speichern' }).click()
  await expect(page.locator('.relationship-edge')).toHaveCount(1)
}

test.describe('Beziehungsdetails', () => {
  test('ändert Status und Quelle einer ausgewählten Beziehung', async ({ page }) => {
    await page.goto('/')
    await createMarriage(page)

    await page.getByLabel('Status').selectOption('inferred')
    await page.getByLabel('Quelle (URL)').fill('https://example.org/register/28')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.locator('.relationship-edge--inferred')).toHaveCount(1)
    await expect(page.getByRole('status', { name: 'Geschlussfolgert' })).toBeVisible()
    await expect(page.getByLabel('Quelle (URL)')).toHaveValue('https://example.org/register/28')
  })

  test('weist eine ungültige Quelle am Quellenfeld zurück', async ({ page }) => {
    await page.goto('/')
    await createMarriage(page)

    await page.getByLabel('Quelle (URL)').fill('example.org/register/28')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(
      page.getByText('Die Quelle muss eine gültige HTTP- oder HTTPS-URL sein.'),
    ).toBeVisible()
    await expect(page.getByLabel('Quelle (URL)')).toHaveAttribute('aria-invalid', 'true')
    await expect(page.locator('.relationship-edge--explicit')).toHaveCount(1)
  })

  test('entfernt nur die ausgewählte Beziehung', async ({ page }) => {
    await page.goto('/')
    await createMarriage(page)
    await addPerson(page, 'Lina', 'Weber')
    await connectPeople(page, 'Anna Weber', 'Lina Weber')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()
    await expect(page.locator('.relationship-edge')).toHaveCount(3)

    await page.locator('.react-flow__edge.relationship-edge').first().dispatchEvent('click')
    await expect(page.getByRole('button', { name: 'Beziehung entfernen' })).toBeVisible()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Beziehung entfernen' }).click()

    await expect(page.locator('.relationship-edge')).toHaveCount(1)
  })
})
