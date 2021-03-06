import { createRoot } from 'react-dom/client'
import { BasePlugin, Uppy } from '@uppy/core'
import findDOMElement from '@uppy/utils/lib/findDOMElement'
import { Dashboard, ImportSourceOption } from './Dashboard'

export type { ImportSourceOption } from './Dashboard'
export interface UploadProgress {
  bytesTotal: number
  bytesUploaded: number
  name: string
  percentage: number
}

export interface EmojiMeta {
  emoji: string
  skin_tone_support: boolean
  name: string
  slug: string
  unicode_version: string
  emoji_version: string
}

export interface UploadResultData {
  action: 'add' | 'remove'
  signedId?: string
  viewUrl?: string
  downloadUrl?: string
  url?: string
  emoji?: EmojiMeta
  color?: string
  meta?: {
    name?: string
    size?: number
    blurHash?: string
    contentType?: string
    width?: number
    height?: number
    source: 'origin' | 'external'
  }
}

export interface ActionButtonOption {
  icon?: string
  label: string
  onClick?: VoidFunction
}

export interface UnsplashImage {
  id: string
  width: number
  height: number
  fullUrl: string
  smallUrl: string
  username: string
  blurHash: string
}

export interface DashboardPluginOptions {
  target: HTMLElement
  blockId?: string
  onProgress?: (progress: UploadProgress) => void
  onUploaded?: (data: UploadResultData) => void
  onFileLoaded?: (file: File) => void
  prepareFileUpload?: (
    blockId: string,
    type: string,
    file: any
  ) => Promise<{
    endpoint: string
    headers: any
    blobKey: string
    signedId: string
    downloadUrl: string
    viewUrl: string
  }>
  fetchUnsplashImages?: (
    query: string,
    page: number,
    perPage: number
  ) => Promise<{ success: boolean; data: UnsplashImage[] }>
  fileType: string
  importSources: ImportSourceOption[]
  showRemoveButton?: boolean
}

export type SourceType = 'upload' | 'link' | 'unsplash' | 'emoji' | 'gallery'

export const DashboardPluginName = 'mc-dashboard'

export class DashboardPlugin extends BasePlugin {
  opts: DashboardPluginOptions

  constructor(uppy: Uppy, opts: DashboardPluginOptions) {
    super(uppy, opts)
    this.id = DashboardPluginName
    this.type = 'orchestrator'
    this.opts = opts
  }

  override install(): void {
    const { target } = this.opts

    if (target) {
      this.mount(target, this as any)
    }
  }

  override uninstall(): void {}

  mount(target: any, plugin: any): void {
    const callerPluginName = plugin.id

    const targetElement = findDOMElement(target)

    if (targetElement) {
      this.uppy.log(`Installing ${callerPluginName} to a DOM element '${target}'`)

      const root = createRoot(targetElement)
      root.render(this.render())
    }
  }

  render(): JSX.Element {
    return (
      <Dashboard
        importSources={this.opts.importSources}
        pluginOptions={this.opts}
        uppy={this.uppy}
        pluginId={this.id}
      />
    )
  }
}
