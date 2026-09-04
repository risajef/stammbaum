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

export interface BrowserFileEnvironment {
  document: Document
  urlApi: {
    createObjectURL: (blob: Blob) => string
    revokeObjectURL: (url: string) => void
  }
  showOpenFilePicker?: () => Promise<OpenFileHandle[]>
  showSaveFilePicker?: () => Promise<SaveFileHandle>
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

  async save(contents: string, filename: string): Promise<void> {
    if (environment.showSaveFilePicker) {
      const handle = await environment.showSaveFilePicker()
      const writable = await handle.createWritable()
      await writable.write(contents)
      await writable.close()
      return
    }

    await saveWithDownload(environment, contents, filename)
  },
})