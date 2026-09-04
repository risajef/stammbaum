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
  gender?: 'woman' | 'man',
) => {
  if (await page.locator('.person-node').count() > 0) {
    await panToEmptySpot(page)
  }

  await page.getByRole('button', { name: 'Person anlegen' }).click()
  await page.getByLabel('Vorname').fill(firstName)
  await page.getByLabel('Nachname').fill('Test')
  if (gender) {
    await page.getByLabel('Geschlecht').selectOption(gender)
  }
  await page.getByRole('button', { name: 'Person speichern' }).click()
  await expect(page.locator('.person-node').filter({ hasText: `${firstName} Test` })).toBeVisible()
}

const connectHandles = async (
  page: Page,
  sourceName: string,
  sourceSelector: string,
  targetName: string,
  targetSelector: string,
) => {
  const sourceHandle = page
    .locator('.person-node')
    .filter({ hasText: `${sourceName} Test` })
    .locator(sourceSelector)
  const targetHandle = page
    .locator('.person-node')
    .filter({ hasText: `${targetName} Test` })
    .locator(targetSelector)

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

test.describe('handle-basierte Beziehungen', () => {
  test('schlägt Ehe über seitliche Handles vor und bestätigt sie', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'woman')
    await addPerson(page, 'Hans', 'man')

    await connectHandles(
      page,
      'Anna',
      '.react-flow__handle-left',
      'Hans',
      '.react-flow__handle-right',
    )

    await expect(page.getByRole('heading', { name: 'Beziehung anlegen' })).toBeVisible()
    await expect(page.getByLabel('Beziehungstyp')).toHaveValue('marriage')
    await expect(page.getByLabel('Beziehungstyp')).toBeDisabled()
    await expect(page.locator('.relationship-edge')).toHaveCount(0)

    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.locator('.relationship-edge--marriage')).toHaveCount(1)
  })

  test('ordnet bei umgekehrter Ziehrichtung den unteren Handle als Elternteil zu', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Elternteil')
    await addPerson(page, 'Kind')

    await connectHandles(
      page,
      'Kind',
      '.react-flow__handle-top',
      'Elternteil',
      '.react-flow__handle-bottom',
    )

    await expect(page.getByRole('heading', { name: 'Beziehung anlegen' })).toBeVisible()
    await expect(page.getByLabel('Beziehungstyp')).toHaveValue('parent-child')
    await expect(page.getByLabel('Beziehungstyp')).toBeDisabled()
    await expect(page.locator('.relationship-edge')).toHaveCount(0)

    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.locator('.relationship-edge--parent-child')).toHaveCount(1)
    await expect(page.locator('.relationship-endpoints')).toHaveText(/Elternteil Test.*Kind Test/)
  })

  test('verwirft eine neue handle-basierte Beziehung ohne Kante', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'woman')
    await addPerson(page, 'Hans', 'man')

    await connectHandles(
      page,
      'Anna',
      '.react-flow__handle-left',
      'Hans',
      '.react-flow__handle-right',
    )
    await expect(page.getByRole('heading', { name: 'Beziehung anlegen' })).toBeVisible()

    await page.getByRole('button', { name: 'Verwerfen' }).click()

    await expect(page.locator('.relationship-edge')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeVisible()
  })

  test('zeigt bei unbekanntem Geschlecht keinen seitlichen Ehe-Handle', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Unbekannt')

    const node = page.locator('.person-node').filter({ hasText: 'Unbekannt Test' })
    await expect(node.locator('.react-flow__handle-left')).toHaveCount(0)
    await expect(node.locator('.react-flow__handle-right')).toHaveCount(0)
  })

  test('weist eine doppelte Ehe auch bei umgekehrter Ziehrichtung zurück', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'woman')
    await addPerson(page, 'Hans', 'man')

    await connectHandles(
      page,
      'Anna',
      '.react-flow__handle-left',
      'Hans',
      '.react-flow__handle-right',
    )
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()
    await expect(page.locator('.relationship-edge--marriage')).toHaveCount(1)

    await connectHandles(
      page,
      'Hans',
      '.react-flow__handle-right',
      'Anna',
      '.react-flow__handle-left',
    )
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.getByText('Diese Ehe besteht bereits.')).toBeVisible()
    await expect(page.locator('.relationship-edge--marriage')).toHaveCount(1)
  })
})
