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

const openFile = async (page: Page, file: { name: string; buffer: Buffer }) => {
  const chooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Öffnen' }).click()
  const chooser = await chooserPromise
  await chooser.setFiles(file)
}

test.describe('Datei-Workflow', () => {
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

  test('exportiert und importiert einen vollständigen Stammbaum', async ({ page }) => {
    await page.goto('/')
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

    const downloadPromise = page.waitForEvent('download')
    await page.locator('.topbar-actions').getByRole('button', { name: 'Speichern' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('stammbaum.yaml')
    const exportedPath = await download.path()
    expect(exportedPath).toBeTruthy()

    await page.getByRole('button', { name: 'Neu' }).click()
    await expect(page.locator('.person-node')).toHaveCount(0)
    await openFile(page, { name: 'stammbaum.yaml', buffer: Buffer.from(await download.createReadStream().then(async (stream) => {
      if (!stream) throw new Error('Export konnte nicht gelesen werden.')
      const chunks: Buffer[] = []
      for await (const chunk of stream) chunks.push(Buffer.from(chunk))
      return Buffer.concat(chunks)
    })) })

    await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()
    await expect(page.locator('.person-node').filter({ hasText: 'Hans Weber' })).toBeVisible()
    await expect(page.locator('.relationship-edge')).toHaveCount(1)
  })

  test('exportiert genau die aktuell gefilterte Ansicht mit sprechendem Dateinamen', async ({ page }) => {
    await page.goto('/')
    const yaml = `schemaVersion: 1
persons:
  - id: anchor
    firstName: Ernst
    lastName: Weber
    gender: null
    birthYear: null
    deathYear: null
    position: null
  - id: ancestor
    firstName: Anna
    lastName: Weber
    gender: woman
    birthYear: null
    deathYear: null
    position: null
  - id: ancestor-partner
    firstName: Hans
    lastName: Weber
    gender: man
    birthYear: null
    deathYear: null
    position: null
  - id: hidden
    firstName: Versteckt
    lastName: Weber
    gender: null
    birthYear: null
    deathYear: null
    position: null
relationships:
  - id: ancestor-anchor
    type: parent-child
    fromId: ancestor
    toId: anchor
    status: explicit
    sourceUrl: null
  - id: ancestor-marriage
    type: marriage
    fromId: ancestor
    toId: ancestor-partner
    status: explicit
    sourceUrl: null`
    await openFile(page, { name: 'source.yaml', buffer: Buffer.from(yaml) })
    await expect(page.locator('.person-node')).toHaveCount(4)

    await page.locator('.person-node').filter({ hasText: 'Ernst Weber' }).click()
    await page.getByRole('button', { name: 'Direkte Vorfahren', exact: true }).click()
    await expect(page.getByText('3 von 4 sichtbar')).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Exportieren' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('Direkte Vorfahren Ernst Weber.yaml')
    const stream = await download.createReadStream()
    if (!stream) throw new Error('Export konnte nicht gelesen werden.')
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))
    const exportedYaml = Buffer.concat(chunks).toString('utf8')

    expect(exportedYaml).toContain('id: anchor')
    expect(exportedYaml).toContain('id: ancestor-partner')
    expect(exportedYaml).not.toContain('id: hidden')
    await expect(page.getByText('Geöffnet: source.yaml')).toBeVisible()
    await expect(page.getByText('Ungespeichert')).not.toBeVisible()
  })

  test('erhält Teil-Datumswerte beim Export und Import', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Person anlegen' }).click()
    await page.getByLabel('Vorname').fill('Anna')
    await page.getByLabel('Nachname').fill('Weber')
    await page.getByLabel('Geburtsdatum').fill('1900-05')
    await page.getByLabel('Todesdatum').fill('1970-08-12')
    await page.getByRole('button', { name: 'Person speichern' }).click()

    await expect(page.locator('.person-node').filter({ hasText: '1900-05 - 1970-08-12' })).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.locator('.topbar-actions').getByRole('button', { name: 'Speichern' }).click()
    const download = await downloadPromise
    const stream = await download.createReadStream()
    if (!stream) throw new Error('Export konnte nicht gelesen werden.')
    const chunks: Buffer[] = []
    for await (const chunk of stream) chunks.push(Buffer.from(chunk))

    await page.getByRole('button', { name: 'Neu' }).click()
    await openFile(page, { name: 'dates.yaml', buffer: Buffer.concat(chunks) })

    await expect(page.locator('.person-node').filter({ hasText: '1900-05 - 1970-08-12' })).toBeVisible()
  })

  test('lehnt einen ungültigen Import ohne Teilüberschreiben ab', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')
    const invalidYaml = Buffer.from('schemaVersion: [')

    page.once('dialog', (dialog) => dialog.accept())
    await openFile(page, { name: 'invalid.yaml', buffer: invalidYaml })

    await expect(page.getByRole('alert')).toContainText('gültige YAML-Syntax')
    await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()
  })

  test('zeigt ungespeicherte Änderungen und bestätigt das Ersetzen', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')
    await expect(page.getByText('Ungespeichert')).toBeVisible()

    page.once('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name: 'Neu' }).click()
    await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Neu' }).click()
    await expect(page.locator('.person-node')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeVisible()
  })

  test('setzt eine neue Person in die Mitte des aktuellen Sichtbereichs', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')

    const surface = page.locator('.flow-surface')
    const firstNode = page.locator('.person-node').filter({ hasText: 'Anna Weber' })
    const surfaceBox = await surface.boundingBox()
    const firstBox = await firstNode.boundingBox()
    if (!surfaceBox || !firstBox) throw new Error('Canvas oder erste Person konnte nicht vermessen werden.')

    await page.getByRole('button', { name: 'Person anlegen' }).click()
    await page.getByLabel('Vorname').fill('Hans')
    await page.getByLabel('Nachname').fill('Meyer')
    await page.getByRole('button', { name: 'Person speichern' }).click()

    const newNode = page.locator('.person-node').filter({ hasText: 'Hans Meyer' })
    await expect(newNode).toBeVisible()
    await expect.poll(async () => {
      const currentSurfaceBox = await surface.boundingBox()
      const currentNodeBox = await newNode.boundingBox()
      if (!currentSurfaceBox || !currentNodeBox) return Number.POSITIVE_INFINITY
      const surfaceCenter = {
        x: currentSurfaceBox.x + currentSurfaceBox.width / 2,
        y: currentSurfaceBox.y + currentSurfaceBox.height / 2,
      }
      const nodeCenter = {
        x: currentNodeBox.x + currentNodeBox.width / 2,
        y: currentNodeBox.y + currentNodeBox.height / 2,
      }
      return Math.hypot(nodeCenter.x - surfaceCenter.x, nodeCenter.y - surfaceCenter.y)
    }).toBeLessThan(36)
  })

  test('verschiebt eine neu angelegte Person auch bei aktivem Filter', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')

    await page.locator('.person-node').filter({ hasText: 'Anna Weber' }).click()
    await page.getByRole('button', { name: 'Nur Blutsverwandte' }).click()
    await expect(page.getByText('1 von 1 sichtbar')).toBeVisible()

    await addPerson(page, 'Lina', 'Weber')
    const newNode = page.locator('.person-node').filter({ hasText: 'Lina Weber' })
    const before = await newNode.boundingBox()
    if (!before) throw new Error('Neue Person fehlt.')

    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
    await page.mouse.down()
    await page.mouse.move(before.x + 180, before.y + 120, { steps: 10 })
    await page.mouse.up()

    await expect.poll(async () => {
      const after = await newNode.boundingBox()
      return after ? Math.hypot(after.x - before.x, after.y - before.y) : 0
    }).toBeGreaterThan(20)
  })
})
