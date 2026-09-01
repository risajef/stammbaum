import { expect, test, type Page } from '@playwright/test'

const addPerson = async (
  page: Page,
  firstName: string,
  lastName: string,
  gender: 'woman' | 'man',
) => {
  await page.getByRole('button', { name: 'Person anlegen' }).click()
  await page.getByLabel('Vorname').fill(firstName)
  await page.getByLabel('Nachname').fill(lastName)
  await page.getByLabel('Geschlecht').selectOption(gender)
  await page.getByRole('button', { name: 'Person speichern' }).click()
  await expect(page.locator('.person-node').filter({ hasText: `${firstName} ${lastName}` })).toBeVisible()
}

const connectPeople = async (page: Page, sourceName: string, targetName: string) => {
  const sourceHandle = page
    .locator('.person-node')
    .filter({ hasText: sourceName })
    .locator('.react-flow__handle.source')
  const targetHandle = page
    .locator('.person-node')
    .filter({ hasText: targetName })
    .locator('.react-flow__handle.target')

  await expect.poll(async () => {
    const sourceBox = await sourceHandle.boundingBox()
    const targetBox = await targetHandle.boundingBox()
    const surfaceBox = await page.locator('.flow-surface').boundingBox()
    if (!sourceBox || !targetBox || !surfaceBox) return false

    const inside = (box: { x: number; y: number; width: number; height: number }) =>
      box.x >= surfaceBox.x &&
      box.y >= surfaceBox.y &&
      box.x + box.width <= surfaceBox.x + surfaceBox.width &&
      box.y + box.height <= surfaceBox.y + surfaceBox.height
    return inside(sourceBox) && inside(targetBox)
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

test.describe('automatische Familienlogik', () => {
  test('ordnet Familie automatisch und leitet den zweiten Elternteil ab', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')
    await addPerson(page, 'Hans', 'Weber', 'man')
    await addPerson(page, 'Lina', 'Weber', 'woman')

    await connectPeople(page, 'Anna Weber', 'Lina Weber')
    await page.getByLabel('Beziehungstyp').selectOption('parent-child')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await connectPeople(page, 'Anna Weber', 'Hans Weber')
    await page.getByLabel('Beziehungstyp').selectOption('marriage')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.locator('.relationship-edge')).toHaveCount(3)
    await expect(page.locator('.relationship-edge--inferred')).toHaveCount(1)

    const annaBox = await page.locator('.person-node').filter({ hasText: 'Anna Weber' }).boundingBox()
    const hansBox = await page.locator('.person-node').filter({ hasText: 'Hans Weber' }).boundingBox()
    const linaBox = await page.locator('.person-node').filter({ hasText: 'Lina Weber' }).boundingBox()
    if (!annaBox || !hansBox || !linaBox) throw new Error('Personenknoten fehlen.')

    expect(Math.abs(annaBox.y - hansBox.y)).toBeLessThan(2)
    expect(linaBox.y).toBeGreaterThan(annaBox.y)

    await page.locator('.relationship-edge--inferred').click()
    await expect(page.getByText(/Automatisch abgeleitet/).first()).toBeVisible()
  })

  test('laesst keine manuelle Knotenbewegung zu', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')

    const node = page.locator('.person-node').filter({ hasText: 'Anna Weber' })
    const before = await node.boundingBox()
    if (!before) throw new Error('Personenknoten fehlt.')

    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
    await page.mouse.down()
    await page.mouse.move(before.x + 180, before.y + 120, { steps: 10 })
    await page.mouse.up()

    const after = await node.boundingBox()
    if (!after) throw new Error('Personenknoten fehlt nach Drag.')
    expect(Math.abs(after.x - before.x)).toBeLessThan(2)
    expect(Math.abs(after.y - before.y)).toBeLessThan(2)
  })

  test('ergaenzt sichere inferred-Beziehungen nach dem Import', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'showOpenFilePicker', {
        configurable: true,
        value: undefined,
      })
    })
    await page.goto('/')

    const yaml = `schemaVersion: 1
persons:
  - id: parent-a
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: 1900
    deathYear: null
    position: null
  - id: spouse-b
    firstName: Hans
    lastName: Weber
    gender: man
    birthYear: 1898
    deathYear: null
    position: null
  - id: child-c
    firstName: Lina
    lastName: Weber
    gender: woman
    birthYear: 1925
    deathYear: null
    position: null
relationships:
  - id: marriage-a-b
    type: marriage
    fromId: parent-a
    toId: spouse-b
    status: explicit
    sourceUrl: null
  - id: parent-a-child-c
    type: parent-child
    fromId: parent-a
    toId: child-c
    status: explicit
    sourceUrl: null
`
    const chooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: 'Oeffnen' }).click()
    const chooser = await chooserPromise
    await chooser.setFiles({ name: 'family.yaml', mimeType: 'application/yaml', buffer: Buffer.from(yaml) })

    await expect(page.locator('.person-node')).toHaveCount(3)
    await expect(page.locator('.relationship-edge')).toHaveCount(3)
    await expect(page.locator('.relationship-edge--inferred')).toHaveCount(1)
  })
})