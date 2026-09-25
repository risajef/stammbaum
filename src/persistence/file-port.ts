export interface OpenedFile {
  name: string
  contents: string
}

interface OpenFileHandle {
  getFile: () => Promise<File>
}

interface SaveFileHandle {
  createWritable: () => Promise<{
    write: (contents: string) => Promise<void>
    close: () => Promise<void>
  }>
}

interface SaveFilePickerOptions {
  suggestedName?: string
}

export interface BrowserFileEnvironment {
  document: Document
  urlApi: {
    createObjectURL: (blob: Blob) => string
    revokeObjectURL: (url: string) => void
  }
  showOpenFilePicker?: (options?: { multiple?: boolean }) => Promise<OpenFileHandle[]>
  showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<SaveFileHandle>
}

const browserEnvironment = (): BrowserFileEnvironment => {
  if (typeof window === 'undefined') {
    throw new Error('Der Dateizugriff ist nur im Browser verfügbar.')
  }

  const browserWindow = window as unknown as BrowserFileEnvironment
  return {
    document: window.document,
    urlApi: {
      createObjectURL: URL.createObjectURL.bind(URL),
      revokeObjectURL: URL.revokeObjectURL.bind(URL),
    },
    showOpenFilePicker: browserWindow.showOpenFilePicker?.bind(window),
    showSaveFilePicker: browserWindow.showSaveFilePicker?.bind(window),
  }
}

const openWithUpload = (environment: BrowserFileEnvironment): Promise<OpenedFile> =>
  new Promise((resolve, reject) => {
    const input = environment.document.createElement('input')
    input.type = 'file'
    input.accept = '.yaml,.yml,text/yaml,application/yaml'
    input.hidden = true

    const cleanUp = () => input.remove()

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) {
        cleanUp()
        reject(new Error('Es wurde keine YAML-Datei ausgewählt.'))
        return
      }

      void file
        .text()
        .then((contents) => {
          cleanUp()
          resolve({ name: file.name, contents })
        })
        .catch((fileError: unknown) => {
          cleanUp()
          reject(fileError)
        })
    })

    input.addEventListener('cancel', () => {
      cleanUp()
      reject(new Error('Dateiauswahl abgebrochen.'))
    })

    environment.document.body.append(input)
    input.click()
  })

const openManyWithUpload = (environment: BrowserFileEnvironment): Promise<OpenedFile[]> =>
  new Promise((resolve, reject) => {
    const input = environment.document.createElement('input')
    input.type = 'file'
    input.accept = '.yaml,.yml,text/yaml,application/yaml'
    input.multiple = true
    input.hidden = true

    const cleanUp = () => input.remove()

    input.addEventListener('change', () => {
      const files = Array.from(input.files ?? [])
      if (files.length === 0) {
        cleanUp()
        reject(new Error('Es wurde keine YAML-Datei ausgewählt.'))
        return
      }

      void Promise.all(files.map(async (file) => ({
        name: file.name,
        contents: await file.text(),
      })))
        .then((openedFiles) => {
          cleanUp()
          resolve(openedFiles)
        })
        .catch((fileError: unknown) => {
          cleanUp()
          reject(fileError)
        })
    })

    input.addEventListener('cancel', () => {
      cleanUp()
      reject(new Error('Dateiauswahl abgebrochen.'))
    })

    environment.document.body.append(input)
    input.click()
  })

const saveWithDownload = async (
  environment: BrowserFileEnvironment,
  contents: string,
  filename: string,
) => {
  const objectUrl = environment.urlApi.createObjectURL(
    new Blob([contents], { type: 'application/yaml;charset=utf-8' }),
  )
  const link = environment.document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.hidden = true
  environment.document.body.append(link)

  try {
    link.click()
  } finally {
    link.remove()
    environment.urlApi.revokeObjectURL(objectUrl)
  }
}

export const createBrowserFilePort = (
  environment: BrowserFileEnvironment = browserEnvironment(),
) => ({
  async open(): Promise<OpenedFile> {
    if (environment.showOpenFilePicker) {
      const [handle] = await environment.showOpenFilePicker()
      if (!handle) {
        throw new Error('Es wurde keine YAML-Datei ausgewählt.')
      }

      const file = await handle.getFile()
      return { name: file.name, contents: await file.text() }
    }

    return openWithUpload(environment)
  },

  async openMany(): Promise<OpenedFile[]> {
    if (environment.showOpenFilePicker) {
      const handles = await environment.showOpenFilePicker({ multiple: true })
      if (handles.length === 0) {
        throw new Error('Es wurde keine YAML-Datei ausgewählt.')
      }

      return Promise.all(handles.map(async (handle) => {
        const file = await handle.getFile()
        return { name: file.name, contents: await file.text() }
      }))
    }

    return openManyWithUpload(environment)
  },

  async save(contents: string, filename: string): Promise<void> {
    if (environment.showSaveFilePicker) {
      const handle = await environment.showSaveFilePicker({ suggestedName: filename })
      const writable = await handle.createWritable()
      await writable.write(contents)
      await writable.close()
      return
    }

    await saveWithDownload(environment, contents, filename)
  },
})
