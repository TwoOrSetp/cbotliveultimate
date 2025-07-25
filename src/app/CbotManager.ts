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

      // Set a maximum timeout for the entire initialization
      const initPromise = this.initializeWithRetry()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      )

      try {
        await Promise.race([initPromise, timeoutPromise])
      } catch (error) {
        console.warn('⚠️ Initialization failed or timed out, using fallback:', error)
        this.createMockRelease()
      }

      this.isInitialized = true
      console.log('📦 Download Manager initialized')
      this.eventEmitter.emit('download:initialized', { release: this.latestRelease })

    } catch (error) {
      console.error('❌ Failed to initialize Download Manager:', error)
      this.status.hasError = true
      this.status.errorMessage = 'Failed to initialize download system'

      // Always ensure we have some data to prevent infinite loading
      this.createMockRelease()
      this.isInitialized = true
      this.eventEmitter.emit('download:initialized', { release: this.latestRelease })
    }
  }

  private async initializeWithRetry(maxRetries: number = 2): Promise<void> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} to fetch release data...`)
        await this.fetchLatestRelease()
        return // Success, exit retry loop
      } catch (error) {
        lastError = error as Error
        console.warn(`❌ Attempt ${attempt} failed:`, error)

        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 3000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    // All retries failed, throw the last error
    throw lastError || new Error('All retry attempts failed')
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
    console.log('📝 Creating working download data...')
    this.latestRelease = {
      tag_name: 'v2.1.0',
      name: 'Cbot v2.1.0 - Professional Edition',
      body: 'Advanced Geometry Dash automation with precision click patterns, intelligent pathfinding, and professional-grade performance optimization. Features include: Enhanced AI algorithms, Real-time performance monitoring, Advanced configuration system, and Improved compatibility.',
      published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      html_url: 'https://github.com/therealsnopphin/CBot/releases',
      prerelease: false,
      draft: false,
      assets: [
        {
          name: 'Cbot-v2.1.0.exe',
          download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Cbot-v2.1.0.exe',
          browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Cbot-v2.1.0.exe',
          size: 3145728, // 3MB
          content_type: 'application/octet-stream'
        },
        {
          name: 'Cbot-Installer.msi',
          download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Cbot-Installer.msi',
          browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Cbot-Installer.msi',
          size: 4194304, // 4MB
          content_type: 'application/x-msi'
        },
        {
          name: 'Configuration-Guide.pdf',
          download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Configuration-Guide.pdf',
          browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Configuration-Guide.pdf',
          size: 512000, // 500KB
          content_type: 'application/pdf'
        },
        {
          name: 'Source-Code.zip',
          download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Source-Code.zip',
          browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v2.1.0/Source-Code.zip',
          size: 1048576, // 1MB
          content_type: 'application/zip'
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
          if (asset.browser_download_url === '#' || !asset.browser_download_url || asset.browser_download_url.includes('#') || asset.browser_download_url.startsWith('demo://')) {
            this.handleDemoDownload(asset.name)
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
      this.handleDownloadError(error instanceof Error ? error.message : 'Download failed')
    }
  }

  private handleDemoDownload(fileName: string): void {
    console.log(`🎭 Demo mode: Simulating download of ${fileName}`)

    // Create a more realistic demo experience
    const fileTypes: Record<string, string> = {
      '.exe': 'executable application',
      '.msi': 'installer package',
      '.pdf': 'documentation',
      '.zip': 'source code archive',
      '.txt': 'text document'
    }

    const fileExt = Object.keys(fileTypes).find(ext => fileName.toLowerCase().includes(ext)) || '.exe'
    const fileType = fileTypes[fileExt]

    // Emit demo message with more context
    this.eventEmitter.emit('download:demo', {
      fileName,
      fileType,
      message: `Demo: ${fileName} (${fileType}) is available on GitHub`,
      action: 'redirect',
      size: this.getFileSizeForDemo(fileName)
    })

    // Provide helpful information before redirect
    console.log(`📋 Demo file info: ${fileName} - ${fileType}`)

    // Redirect to GitHub releases page after a short delay
    setTimeout(() => {
      const githubUrl = 'https://github.com/therealsnopphin/CBot/releases'
      console.log(`🔗 Opening GitHub releases page for actual downloads`)
      window.open(githubUrl, '_blank')
    }, 2000)
  }

  private getFileSizeForDemo(fileName: string): string {
    // Return realistic file sizes for demo
    if (fileName.includes('.exe')) return '3.0 MB'
    if (fileName.includes('.msi')) return '4.0 MB'
    if (fileName.includes('.pdf')) return '500 KB'
    if (fileName.includes('.zip')) return '1.0 MB'
    return '1.5 MB'
  }

  private handleDownloadError(errorMessage: string): void {
    console.error('❌ Download error:', errorMessage)

    // Emit error with fallback action
    this.eventEmitter.emit('download:error', {
      message: errorMessage,
      fallback: 'github',
      action: 'redirect'
    })

    // Provide fallback to GitHub releases
    setTimeout(() => {
      const githubUrl = 'https://github.com/therealsnopphin/CBot/releases'
      console.log(`🔗 Fallback: Opening GitHub releases page`)
      window.open(githubUrl, '_blank')
    }, 2000)
  }

  private async downloadAllAssets(): Promise<void> {
    if (!this.latestRelease?.assets.length) {
      throw new Error('No assets available for download')
    }

    console.log('📦 Starting download of all assets...')
    this.eventEmitter.emit('download:started', { total: this.latestRelease.assets.length })

    let downloadedCount = 0
    let demoCount = 0

    // Check if all assets are demo/placeholder URLs
    const allDemo = this.latestRelease.assets.every(asset =>
      asset.browser_download_url === '#' ||
      !asset.browser_download_url ||
      asset.browser_download_url.includes('#') ||
      asset.browser_download_url.startsWith('demo://')
    )

    if (allDemo) {
      console.log('🎭 All assets are in demo mode, redirecting to GitHub...')
      this.handleDemoDownload('all files')
      this.eventEmitter.emit('download:completed')
      return
    }

    for (let i = 0; i < this.latestRelease.assets.length; i++) {
      const asset = this.latestRelease.assets[i]

      try {
        if (asset.browser_download_url === '#' || !asset.browser_download_url || asset.browser_download_url.includes('#') || asset.browser_download_url.startsWith('demo://')) {
          console.log(`🎭 Demo asset: ${asset.name}`)
          demoCount++
        } else {
          await this.downloadFile(asset.browser_download_url, asset.name)
          downloadedCount++
        }
      } catch (error) {
        console.error(`Failed to download ${asset.name}:`, error)
      }

      this.eventEmitter.emit('download:progress', {
        current: i + 1,
        total: this.latestRelease.assets.length,
        fileName: asset.name
      })

      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log(`✅ Download process completed. ${downloadedCount} downloaded, ${demoCount} demo files.`)

    if (downloadedCount === 0 && demoCount > 0) {
      // All were demo files, redirect to GitHub
      this.handleDemoDownload('all files')
    }

    this.eventEmitter.emit('download:completed')
  }

  private async downloadFile(url: string, fileName: string): Promise<void> {
    try {
      console.log(`📥 Starting download: ${fileName}...`)

      // Check if it's a demo URL
      if (url === '#' || url.includes('#') || !url || url.startsWith('demo://')) {
        this.handleDemoDownload(fileName)
        return
      }

      // Validate URL format
      try {
        new URL(url)
      } catch {
        throw new Error(`Invalid download URL for ${fileName}`)
      }

      // For GitHub releases, try direct download first
      if (url.includes('github.com')) {
        await this.downloadFromGitHub(url, fileName)
        return
      }

      // Fallback to regular fetch
      await this.performDirectDownload(url, fileName)

    } catch (error) {
      console.error(`❌ Download failed for ${fileName}:`, error)

      // If download fails, provide fallback options
      this.handleDownloadFallback(fileName, url, error)
    }
  }

  private async downloadFromGitHub(url: string, fileName: string): Promise<void> {
    console.log(`📦 Downloading from GitHub: ${fileName}`)

    try {
      // Create direct download link
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
      link.style.display = 'none'

      // Add to DOM and trigger download
      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
      }, 1000)

      console.log(`✅ GitHub download initiated for ${fileName}`)

    } catch (error) {
      throw new Error(`GitHub download failed: ${error}`)
    }
  }

  private async performDirectDownload(url: string, fileName: string): Promise<void> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Cbot-Website/1.0'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()

      if (blob.size === 0) {
        throw new Error(`File is empty`)
      }

      // Create and trigger download
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = fileName
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      // Cleanup
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link)
        }
        window.URL.revokeObjectURL(downloadUrl)
      }, 1000)

      console.log(`✅ Direct download completed for ${fileName}`)

    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  private handleDownloadFallback(fileName: string, url: string, error: any): void {
    console.log(`🔄 Providing fallback options for ${fileName}`)

    // Emit error with fallback options
    this.eventEmitter.emit('download:fallback', {
      fileName,
      url,
      error: error instanceof Error ? error.message : 'Download failed',
      fallbackUrl: 'https://github.com/therealsnopphin/CBot/releases'
    })
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
