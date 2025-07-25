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

      // Try to fetch latest release, but don't fail initialization if it fails
      try {
        await this.fetchLatestRelease()
      } catch (fetchError) {
        console.warn('⚠️ Could not fetch latest release, using mock data:', fetchError)
        this.createMockRelease()
      }

      this.isInitialized = true
      console.log('📦 Download Manager initialized')
      this.eventEmitter.emit('download:initialized', { release: this.latestRelease })

    } catch (error) {
      console.error('❌ Failed to initialize Download Manager:', error)
      this.status.hasError = true
      this.status.errorMessage = 'Failed to initialize download system'

      // Still initialize with mock data to prevent app from hanging
      this.createMockRelease()
      this.isInitialized = true
      this.eventEmitter.emit('download:initialized', { release: this.latestRelease })
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

      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(this.GITHUB_API_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cbot-Website'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found or no releases available')
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      this.latestRelease = await response.json()
      this.status.lastUpdated = new Date().toISOString()

      console.log('✅ Latest release fetched:', this.latestRelease?.tag_name)
      this.eventEmitter.emit('download:release-fetched', this.latestRelease)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ GitHub API request timed out')
        this.status.errorMessage = 'GitHub API request timed out'
      } else {
        console.error('❌ Failed to fetch latest release:', error)
        this.status.errorMessage = error instanceof Error ? error.message : 'Unknown error'
      }

      this.status.hasError = true
      this.eventEmitter.emit('download:error', this.status.errorMessage)

      // Create mock data for testing if API fails
      this.createMockRelease()
    } finally {
      this.status.isLoading = false
    }
  }

  private createMockRelease(): void {
    console.log('📝 Creating mock release data for testing...')
    this.latestRelease = {
      tag_name: 'v1.0.0',
      name: 'Cbot v1.0.0 - Latest Release',
      body: 'Latest version of Cbot with improved performance and new features.',
      published_at: new Date().toISOString(),
      html_url: 'https://github.com/therealsnopphin/CBot/releases',
      prerelease: false,
      draft: false,
      assets: [
        {
          name: 'Cbot.exe',
          download_url: '#',
          browser_download_url: '#',
          size: 2048000,
          content_type: 'application/octet-stream'
        },
        {
          name: 'README.txt',
          download_url: '#',
          browser_download_url: '#',
          size: 1024,
          content_type: 'text/plain'
        }
      ]
    }
    this.eventEmitter.emit('download:release-fetched', this.latestRelease)
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('download:refresh', () => this.fetchLatestRelease())
    this.eventEmitter.on('download:start', (assetName?: string) => this.downloadAsset(assetName))
  }

  async downloadAsset(assetName?: string): Promise<void> {
    if (!this.latestRelease) {
      console.warn('⚠️ No release data available')
      this.eventEmitter.emit('download:error', 'No release data available. Please refresh the page.')
      return
    }

    try {
      if (assetName) {
        const asset = this.latestRelease.assets.find(a => a.name === assetName)
        if (asset) {
          if (asset.browser_download_url === '#') {
            this.showDemoMessage(asset.name)
          } else {
            await this.downloadFile(asset.browser_download_url, asset.name)
          }
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

  private showDemoMessage(fileName: string): void {
    this.eventEmitter.emit('download:demo', `Demo mode: Would download ${fileName}. Connect to real GitHub repository for actual downloads.`)
  }

  private async downloadAllAssets(): Promise<void> {
    if (!this.latestRelease?.assets.length) {
      throw new Error('No assets available for download')
    }

    console.log('📦 Starting download of all assets...')
    this.eventEmitter.emit('download:started', { total: this.latestRelease.assets.length })

    let downloadedCount = 0
    for (let i = 0; i < this.latestRelease.assets.length; i++) {
      const asset = this.latestRelease.assets[i]

      try {
        if (asset.browser_download_url === '#') {
          this.showDemoMessage(asset.name)
        } else {
          await this.downloadFile(asset.browser_download_url, asset.name)
        }
        downloadedCount++
      } catch (error) {
        console.error(`Failed to download ${asset.name}:`, error)
      }

      this.eventEmitter.emit('download:progress', {
        current: i + 1,
        total: this.latestRelease.assets.length,
        fileName: asset.name
      })

      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log(`✅ Download process completed. ${downloadedCount}/${this.latestRelease.assets.length} files processed.`)
    this.eventEmitter.emit('download:completed')
  }

  private async downloadFile(url: string, fileName: string): Promise<void> {
    try {
      console.log(`📥 Downloading ${fileName}...`)

      // Check if it's a demo URL
      if (url === '#' || url.includes('#')) {
        this.showDemoMessage(fileName)
        return
      }

      // Add timeout to prevent infinite pending
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Cbot-Website'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to download ${fileName}: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.style.display = 'none'

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      }, 100)

      console.log(`✅ Downloaded ${fileName}`)

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Download timeout: ${fileName} took too long to download`)
      }
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
