import { EventEmitter } from '../utils/EventEmitter'

export interface GitHubRelease {
  tag_name: string
  name: string
  body: string
  published_at: string
  assets: GitHubAsset[]
  html_url: string
  prerelease: boolean
  draft: boolean
}

export interface GitHubAsset {
  name: string
  download_url: string
  size: number
  content_type: string
  browser_download_url: string
}

export interface DownloadStatus {
  isLoading: boolean
  hasError: boolean
  errorMessage?: string
  lastUpdated?: string
}

export class DownloadManager {
  private eventEmitter: EventEmitter
  private latestRelease: GitHubRelease | null = null
  private status: DownloadStatus
  private isInitialized: boolean = false
  private readonly GITHUB_API_URL = 'https://api.github.com/repos/therealsnopphin/CBot/releases/latest'

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter
    this.status = this.getDefaultStatus()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.setupEventListeners()
      await this.fetchLatestRelease()
      this.isInitialized = true

      console.log('📦 Download Manager initialized')
      this.eventEmitter.emit('download:initialized', { release: this.latestRelease })
    } catch (error) {
      console.error('❌ Failed to initialize Download Manager:', error)
      this.status.hasError = true
      this.status.errorMessage = 'Failed to fetch latest release'
      throw error
    }
  }

  private getDefaultStatus(): DownloadStatus {
    return {
      isLoading: false,
      hasError: false,
      lastUpdated: undefined
    }
  }

  private async fetchLatestRelease(): Promise<void> {
    this.status.isLoading = true
    this.status.hasError = false

    try {
      console.log('🔄 Fetching latest release from GitHub...')
      const response = await fetch(this.GITHUB_API_URL)

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      this.latestRelease = await response.json()
      this.status.lastUpdated = new Date().toISOString()

      console.log('✅ Latest release fetched:', this.latestRelease?.tag_name)
      this.eventEmitter.emit('download:release-fetched', this.latestRelease)

    } catch (error) {
      console.error('❌ Failed to fetch latest release:', error)
      this.status.hasError = true
      this.status.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.eventEmitter.emit('download:error', this.status.errorMessage)
    } finally {
      this.status.isLoading = false
    }
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('download:refresh', () => this.fetchLatestRelease())
    this.eventEmitter.on('download:start', (assetName?: string) => this.downloadAsset(assetName))
  }

  async downloadAsset(assetName?: string): Promise<void> {
    if (!this.latestRelease) {
      console.warn('⚠️ No release data available')
      this.eventEmitter.emit('download:error', 'No release data available')
      return
    }

    try {
      if (assetName) {
        const asset = this.latestRelease.assets.find(a => a.name === assetName)
        if (asset) {
          await this.downloadFile(asset.browser_download_url, asset.name)
        } else {
          throw new Error(`Asset '${assetName}' not found`)
        }
      } else {
        await this.downloadAllAssets()
      }
    } catch (error) {
      console.error('❌ Download failed:', error)
      this.eventEmitter.emit('download:error', error instanceof Error ? error.message : 'Download failed')
    }
  }

  private async downloadAllAssets(): Promise<void> {
    if (!this.latestRelease?.assets.length) {
      throw new Error('No assets available for download')
    }

    console.log('📦 Starting download of all assets...')
    this.eventEmitter.emit('download:started', { total: this.latestRelease.assets.length })

    for (let i = 0; i < this.latestRelease.assets.length; i++) {
      const asset = this.latestRelease.assets[i]
      await this.downloadFile(asset.browser_download_url, asset.name)

      this.eventEmitter.emit('download:progress', {
        current: i + 1,
        total: this.latestRelease.assets.length,
        fileName: asset.name
      })
    }

    console.log('✅ All assets downloaded successfully')
    this.eventEmitter.emit('download:completed')
  }

  private async downloadFile(url: string, fileName: string): Promise<void> {
    try {
      console.log(`📥 Downloading ${fileName}...`)

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to download ${fileName}: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(downloadUrl)

      console.log(`✅ Downloaded ${fileName}`)

    } catch (error) {
      console.error(`❌ Failed to download ${fileName}:`, error)
      throw error
    }
  }

  getLatestRelease(): GitHubRelease | null {
    return this.latestRelease
  }

  getDownloadStatus(): DownloadStatus {
    return { ...this.status }
  }

  async refreshRelease(): Promise<void> {
    await this.fetchLatestRelease()
  }

  formatReleaseDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  getTotalDownloadSize(): string {
    if (!this.latestRelease?.assets.length) return '0 Bytes'

    const totalBytes = this.latestRelease.assets.reduce((sum, asset) => sum + asset.size, 0)
    return this.formatFileSize(totalBytes)
  }

  destroy(): void {
    this.eventEmitter.removeAllListeners()
    this.isInitialized = false
    console.log('📦 Download Manager destroyed')
  }
}
