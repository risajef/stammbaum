import { describe, expect, it, vi } from 'vitest'

import { createBrowserFilePort } from './file-port'
import type { BrowserFileEnvironment } from './file-port'

const environment = (): BrowserFileEnvironment => ({
  document,
  urlApi: {
    createObjectURL: vi.fn(() => 'blob:stammbaum'),
    revokeObjectURL: vi.fn(),
  },
})

describe('browser file port multiple-file opening', () => {
  it('opens any number of files through the native picker', async () => {
    const files = [
      new File(['ruth'], 'Ruth.yaml'),
      new File(['ernst'], 'Ernst.yaml'),
      new File(['cousin'], 'Cousin.yaml'),
    ]
    const showOpenFilePicker = vi.fn().mockResolvedValue(
      files.map((file) => ({ getFile: vi.fn().mockResolvedValue(file) })),
    )
    const port = createBrowserFilePort({
      ...environment(),
      showOpenFilePicker,
    })

    await expect(port.openMany()).resolves.toEqual([
      { name: 'Ruth.yaml', contents: 'ruth' },
      { name: 'Ernst.yaml', contents: 'ernst' },
      { name: 'Cousin.yaml', contents: 'cousin' },
    ])
    expect(showOpenFilePicker).toHaveBeenCalledWith({ multiple: true })
  })

  it('opens multiple files through upload when the native picker is unavailable', async () => {
    const port = createBrowserFilePort(environment())
    const openPromise = port.openMany()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const files = [new File(['ruth'], 'Ruth.yaml'), new File(['ernst'], 'Ernst.yaml')]
    Object.defineProperty(input, 'files', { value: files })
    input.dispatchEvent(new Event('change'))

    expect(input.multiple).toBe(true)
    await expect(openPromise).resolves.toEqual([
      { name: 'Ruth.yaml', contents: 'ruth' },
      { name: 'Ernst.yaml', contents: 'ernst' },
    ])
  })

  it('rejects a cancelled selection without returning partial files', async () => {
    const port = createBrowserFilePort(environment())
    const openPromise = port.openMany()
    const input = document.querySelector('input[type="file"]')
    input?.dispatchEvent(new Event('cancel'))

    await expect(openPromise).rejects.toThrow('Dateiauswahl abgebrochen.')
  })
})
