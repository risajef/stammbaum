import { expect, test, type Page } from '@playwright/test'

const addPerson = async (
  page: Page,
  firstName: string,
  lastName: string,
  gender: 'woman' | 'man' = 'woman',
) => {
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
) => {
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
  await page.getByRole('button', { name: 'Oeffnen' }).click()
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

  test('exportiert und importiert einen vollstaendigen Stammbaum', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')
    await addPerson(page, 'Hans', 'Weber', 'man')
    await connectPeople(page, 'Anna Weber', 'Hans Weber')
    await page.getByLabel('Beziehungstyp').selectOption('marriage')
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

  test('lehnt einen ungueltigen Import ohne Teilueberschreiben ab', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')
    const invalidYaml = Buffer.from('schemaVersion: [')

    page.once('dialog', (dialog) => dialog.accept())
    await openFile(page, { name: 'invalid.yaml', buffer: invalidYaml })

    await expect(page.getByRole('alert')).toContainText('gueltige YAML-Syntax')
    await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()
  })

  test('zeigt ungespeicherte Aenderungen und bestaetigt das Ersetzen', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')
    await expect(page.getByText('Ungespeichert')).toBeVisible()

    page.once('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name: 'Neu' }).click()
    await expect(page.locator('.person-node').filter({ hasText: 'Anna Weber' })).toBeVisible()

    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Neu' }).click()
    await expect(page.locator('.person-node')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Waehle ein Objekt' })).toBeVisible()
  })
})