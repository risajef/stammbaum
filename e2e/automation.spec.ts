import { expect, test, type Download, type Page } from '@playwright/test'

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

const readDownload = async (download: Download) => {
  const stream = await download.createReadStream()
  if (!stream) throw new Error('Download konnte nicht gelesen werden.')
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
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

  test('verschiebt Nodes temporär ohne ihre Position zu speichern', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'showSaveFilePicker', {
        configurable: true,
        value: undefined,
      })
    })
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')

    const node = page.locator('.person-node').filter({ hasText: 'Anna Weber' })
    const initialSave = page.waitForEvent('download')
    await page.locator('.topbar-actions').getByRole('button', { name: 'Speichern' }).click()
    await readDownload(await initialSave)

    const before = await node.boundingBox()
    if (!before) throw new Error('Personenknoten fehlt.')

    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
    await page.mouse.down()
    await page.mouse.move(before.x + 180, before.y + 120, { steps: 10 })
    await page.mouse.up()

    await expect.poll(async () => {
      const after = await node.boundingBox()
      return after ? Math.hypot(after.x - before.x, after.y - before.y) : 0
    }).toBeGreaterThan(20)
    await expect(page.getByText('Gespeichert: stammbaum.yaml')).toBeVisible()

    const savedAgain = page.waitForEvent('download')
    await page.locator('.topbar-actions').getByRole('button', { name: 'Speichern' }).click()
    const exportedYaml = await readDownload(await savedAgain)
    expect(exportedYaml).toContain('position: null')
    expect(exportedYaml).not.toMatch(/position:\n\s+x:/)
  })

  test('lässt die Arbeitsfläche per Drag verschieben', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')

    const surface = page.locator('.flow-surface')
    const surfaceBox = await surface.boundingBox()
    const viewport = page.locator('.react-flow__viewport')
    if (!surfaceBox) throw new Error('Arbeitsfläche fehlt.')

    const before = await viewport.evaluate((element) => getComputedStyle(element).transform)
    const startX = surfaceBox.x + 48
    const startY = surfaceBox.y + 48
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 120, startY + 80, { steps: 10 })
    await page.mouse.up()

    await expect.poll(async () => viewport.evaluate((element) => getComputedStyle(element).transform))
      .not.toBe(before)
  })

  test('erlaubt starkes Herauszoomen', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')

    const zoomOut = page.locator('.react-flow__controls-zoomout')
    for (let click = 0; click < 12; click += 1) {
      if (await zoomOut.isDisabled()) break
      await zoomOut.click()
    }

    const scale = await page.locator('.react-flow__viewport').evaluate((element) => {
      const transform = getComputedStyle(element).transform
      const match = transform.match(/^matrix\(([-\d.]+),/)
      if (!match) throw new Error(`Unerwartete Viewport-Transformation: ${transform}`)
      return Number(match[1])
    })
    expect(scale).toBeLessThan(0.3)
  })

  test('ergänzt sichere inferred-Beziehungen nach dem Import', async ({ page }) => {
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
    await page.getByRole('button', { name: 'Öffnen' }).click()
    const chooser = await chooserPromise
    await chooser.setFiles({ name: 'family.yaml', mimeType: 'application/yaml', buffer: Buffer.from(yaml) })

    await expect(page.locator('.person-node')).toHaveCount(3)
    await expect(page.locator('.relationship-edge')).toHaveCount(3)
    await expect(page.locator('.relationship-edge--inferred')).toHaveCount(1)
  })
})