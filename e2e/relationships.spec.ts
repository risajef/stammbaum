import { expect, test, type Page } from '@playwright/test'

const addPerson = async (
  page: Page,
  firstName: string,
  lastName: string,
  gender: 'woman' | 'man' = 'woman',
  deathDate?: string,
) => {
  await page.getByRole('button', { name: 'Person anlegen' }).click()
  await page.getByLabel('Vorname').fill(firstName)
  await page.getByLabel('Nachname').fill(lastName)
  await page.getByLabel('Geschlecht').selectOption(gender)
  if (deathDate) {
    await page.getByLabel('Todesdatum').fill(deathDate)
  }
  await page.getByRole('button', { name: 'Person speichern' }).click()
  await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible()
}

const connectPeople = async (
  page: Page,
  sourceName: string,
  targetName: string,
) => {
  const sourceNode = page.locator('.person-node').filter({ hasText: sourceName })
  const targetNode = page.locator('.person-node').filter({ hasText: targetName })
  const sourceHandle = sourceNode.locator('.react-flow__handle.source')
  const targetHandle = targetNode.locator('.react-flow__handle.target')

  await expect.poll(async () => {
    const sourceBox = await sourceHandle.boundingBox()
    const targetBox = await targetHandle.boundingBox()
    const surfaceBox = await page.locator('.flow-surface').boundingBox()

    if (!sourceBox || !targetBox || !surfaceBox) {
      return false
    }

    const isInsideSurface = (box: { x: number; y: number; width: number; height: number }) =>
      box.x >= surfaceBox.x &&
      box.y >= surfaceBox.y &&
      box.x + box.width <= surfaceBox.x + surfaceBox.width &&
      box.y + box.height <= surfaceBox.y + surfaceBox.height

    return isInsideSurface(sourceBox) && isInsideSurface(targetBox)
  }).toBe(true)

  const sourceBox = await sourceHandle.boundingBox()
  const targetBox = await targetHandle.boundingBox()
  if (!sourceBox || !targetBox) {
    throw new Error('Verbindungshandles konnten nicht vermessen werden.')
  }

  const start = {
    x: sourceBox.x + sourceBox.width / 2,
    y: sourceBox.y + sourceBox.height / 2,
  }
  const end = {
    x: targetBox.x + targetBox.width / 2,
    y: targetBox.y + targetBox.height / 2,
  }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(end.x, end.y, { steps: 20 })
  await page.mouse.up()
}

test.describe('direkte Beziehungen', () => {
  test('legt eine Ehe an und wählt die neue Kante aus', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman')
    await addPerson(page, 'Hans', 'Weber', 'man')

    await connectPeople(page, 'Anna Weber', 'Hans Weber')
    await expect(page.getByRole('heading', { name: 'Beziehung anlegen' })).toBeVisible()
    await page.getByLabel('Beziehungstyp').selectOption('marriage')
    await page.getByLabel('Ehebeginn').fill('1880-05')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.locator('.relationship-edge')).toHaveCount(1)
    await expect(page.locator('.relationship-edge--marriage')).toHaveCount(1)
    await expect(page.getByLabel('Ehebeginn')).toHaveValue('1880-05')
    await expect(page.getByRole('heading', { name: 'Beziehung bearbeiten' })).toBeVisible()
  })

  test('zeigt das implizite Ende einer Ehe aus dem früheren Tod', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber', 'woman', '1925-08-12')
    await addPerson(page, 'Hans', 'Weber', 'man', '1920-03-01')

    await connectPeople(page, 'Anna Weber', 'Hans Weber')
    await page.getByLabel('Beziehungstyp').selectOption('marriage')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.getByLabel('Implizites Eheende')).toHaveText('1920-03-01')
  })

  test('legt eine gerichtete Eltern-Kind-Beziehung an', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Maria', 'Koch')
    await addPerson(page, 'Lina', 'Koch')

    await connectPeople(page, 'Maria Koch', 'Lina Koch')
    await page.getByLabel('Beziehungstyp').selectOption('parent-child')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(page.locator('.relationship-edge')).toHaveCount(1)
    await expect(page.locator('.relationship-edge--parent-child')).toHaveCount(1)
    await expect(page.getByRole('heading', { name: 'Beziehung bearbeiten' })).toBeVisible()
    await expect(page.getByLabel('Beziehungstyp')).toHaveValue('parent-child')
  })

  test('verwirft eine begonnene Verbindung ohne neue Daten', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')
    await addPerson(page, 'Lina', 'Weber')

    await connectPeople(page, 'Anna Weber', 'Lina Weber')
    await expect(page.getByRole('heading', { name: 'Beziehung anlegen' })).toBeVisible()
    await page.getByRole('button', { name: 'Verwerfen' }).click()

    await expect(page.locator('.relationship-edge')).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Wähle ein Objekt' })).toBeVisible()
  })

  test('weist ein ungültiges Ehe-Ziel vor dem Commit zurück', async ({ page }) => {
    await page.goto('/')
    await addPerson(page, 'Anna', 'Weber')
    await addPerson(page, 'Lina', 'Weber')

    await connectPeople(page, 'Anna Weber', 'Lina Weber')
    await page.getByLabel('Beziehungstyp').selectOption('marriage')
    await page.getByRole('button', { name: 'Beziehung speichern' }).click()

    await expect(
      page.getByText('Eine Ehe kann nur zwischen einer Frau und einem Mann angelegt werden.'),
    ).toBeVisible()
    await expect(page.locator('.relationship-edge')).toHaveCount(0)
  })
})