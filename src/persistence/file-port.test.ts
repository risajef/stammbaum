import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createBrowserFilePort } from './file-port'
import type { BrowserFileEnvironment } from './file-port'

const urlApi = {
  createObjectURL: vi.fn(() => 'blob:stammbaum'),
  revokeObjectURL: vi.fn(),
}

const environment = (): BrowserFileEnvironment => ({
  document,
  urlApi,
})

describe('browser file port', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.clearAllMocks()
  })

  it('opens and saves through the direct file picker APIs', async () => {
    const writable = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }
    const directEnvironment = {
      ...environment(),
      showOpenFilePicker: vi.fn().mockResolvedValue([
        {
          getFile: vi.fn().mockResolvedValue(new File(['tree'], 'family.yaml')),
        },
      ]),
      showSaveFilePicker: vi.fn().mockResolvedValue({
        createWritable: vi.fn().mockResolvedValue(writable),
      }),
    } as unknown as BrowserFileEnvironment

    const port = createBrowserFilePort(directEnvironment)

    await expect(port.open()).resolves.toEqual({ name: 'family.yaml', contents: 'tree' })
    await port.save('serialized-tree', 'family.yaml')

    expect(writable.write).toHaveBeenCalledWith('serialized-tree')
    expect(writable.close).toHaveBeenCalledOnce()
  })

  it('calls the native save picker with the browser window as receiver', async () => {
    const writable = {
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }
    const showSaveFilePicker = vi.fn(function (this: Window) {
      if (this !== window) {
        throw new TypeError("Failed to execute 'showSaveFilePicker' on 'Window': Illegal invocation")
      }

      return Promise.resolve({
        createWritable: vi.fn().mockResolvedValue(writable),
      })
    })
    Object.defineProperty(window, 'showSaveFilePicker', {
      configurable: true,
      value: showSaveFilePicker,
    })

    const port = createBrowserFilePort()

    await port.save('serialized-tree', 'family.yaml')

    expect(showSaveFilePicker).toHaveBeenCalledOnce()
    expect(writable.write).toHaveBeenCalledWith('serialized-tree')
    expect(writable.close).toHaveBeenCalledOnce()
    delete (window as unknown as { showSaveFilePicker?: unknown }).showSaveFilePicker
  })

  it('opens through upload and saves through download when picker APIs are unavailable', async () => {
    const port = createBrowserFilePort(environment())
    const openPromise = port.open()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['fallback-tree'], 'fallback.yaml')
    Object.defineProperty(input, 'files', { value: [file] })
    input.dispatchEvent(new Event('change'))

    await expect(openPromise).resolves.toEqual({
      name: 'fallback.yaml',
      contents: 'fallback-tree',
    })

    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await port.save('fallback-content', 'fallback.yaml')

    expect(urlApi.createObjectURL).toHaveBeenCalledOnce()
    expect(click).toHaveBeenCalledOnce()
    expect(urlApi.revokeObjectURL).toHaveBeenCalledWith('blob:stammbaum')
  })
})