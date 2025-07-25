import { EventEmitter } from '../utils/EventEmitter.js'

export class DownloadManager {
  constructor(eventEmitter) {
    this.eventEmitter = eventEmitter
    this.latestRelease = null
    this.status = this.getDefaultStatus()
    this.isInitialized = false
    this.GITHUB_API_URL = 'https://api.github.com/repos/therealsnopphin/CBot/releases/latest'
  }

  async initialize() {
    if (this.isInitialized) return

    try {
      this.setupEventListeners()

      const initPromise = this.initializeWithRetry()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Initialization timeout')), 10000)
      )

      await Promise.race([initPromise, timeoutPromise])

      this.isInitialized = true
      this.eventEmitter.emit('download:initialized', {
        release: this.latestRelease,
        status: this.status
      })

      console.log('✅ Download Manager initialized successfully')
    } catch (error) {
      console.error('❌ Download Manager initialization failed:', error)
      this.handleError(error)
      throw error
    }
  }

  async initializeWithRetry(maxRetries = 3) {
    let lastError

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📦 Fetching release data (attempt ${attempt}/${maxRetries})...`)
        await this.fetchLatestRelease()
        return
      } catch (error) {
        lastError = error
        console.warn(`⚠️ Attempt ${attempt} failed:`, error.message)
        
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Failed to initialize after retries')
  }

  async fetchLatestRelease() {
    try {
      this.updateStatus({ isLoading: true, hasError: false })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)

      const response = await fetch(this.GITHUB_API_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Cbot-Website'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const release = await response.json()
      
      if (!this.isValidRelease(release)) {
        throw new Error('Invalid release data received from GitHub API')
      }

      this.latestRelease = release
      this.updateStatus({ 
        isLoading: false, 
        hasError: false, 
        lastUpdated: new Date().toISOString() 
      })

      this.eventEmitter.emit('download:release-fetched', release)
      console.log('📦 Latest release fetched:', release.name)

    } catch (error) {
      this.updateStatus({ 
        isLoading: false, 
        hasError: true, 
        errorMessage: error.message 
      })
      throw error
    }
  }

  isValidRelease(release) {
    return release && 
           typeof release.tag_name === 'string' &&
           typeof release.name === 'string' &&
           Array.isArray(release.assets) &&
           typeof release.published_at === 'string'
  }

  async downloadAsset(assetName = null) {
    if (!this.latestRelease) {
      throw new Error('No release data available')
    }

    try {
      const asset = assetName 
        ? this.latestRelease.assets.find(a => a.name === assetName)
        : this.latestRelease.assets[0]

      if (!asset) {
        throw new Error(assetName ? `Asset "${assetName}" not found` : 'No assets available')
      }

      this.eventEmitter.emit('download:started', {
        asset: asset.name,
        size: asset.size,
        total: this.latestRelease.assets.length
      })

      const success = await this.performDownload(asset)
      
      if (success) {
        this.eventEmitter.emit('download:completed', { asset: asset.name })
      } else {
        this.eventEmitter.emit('download:fallback', {
          fileName: asset.name,
          url: asset.browser_download_url,
          fallbackUrl: this.latestRelease.html_url
        })
      }

    } catch (error) {
      console.error('Download failed:', error)
      this.eventEmitter.emit('download:error', {
        message: `Download failed: ${error.message}`,
        action: 'redirect'
      })
    }
  }

  async performDownload(asset) {
    try {
      const response = await fetch(asset.browser_download_url)
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = asset.name
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (error) {
      console.error('Direct download failed:', error)
      return false
    }
  }

  setupEventListeners() {
    this.eventEmitter.on('download:request', (data) => {
      this.downloadAsset(data.assetName)
    })

    this.eventEmitter.on('download:refresh', () => {
      this.fetchLatestRelease()
    })
  }

  getLatestRelease() {
    return this.latestRelease
  }

  getStatus() {
    return { ...this.status }
  }

  isReady() {
    return this.isInitialized && this.latestRelease !== null && !this.status.hasError
  }

  getDefaultStatus() {
    return {
      isLoading: false,
      hasError: false,
      errorMessage: undefined,
      lastUpdated: undefined
    }
  }

  updateStatus(updates) {
    this.status = { ...this.status, ...updates }
    this.eventEmitter.emit('download:status-updated', this.status)
  }

  handleError(error) {
    console.error('Download Manager Error:', error)
    this.updateStatus({
      hasError: true,
      errorMessage: error.message,
      isLoading: false
    })
  }

  formatReleaseDate(dateString) {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Unknown date'
    }
  }

  getTotalDownloadSize() {
    if (!this.latestRelease || !this.latestRelease.assets) {
      return 'Unknown size'
    }

    const totalBytes = this.latestRelease.assets.reduce((sum, asset) => sum + (asset.size || 0), 0)
    
    if (totalBytes === 0) return 'Unknown size'
    
    const units = ['B', 'KB', 'MB', 'GB']
    let size = totalBytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  getAssetList() {
    if (!this.latestRelease || !this.latestRelease.assets) {
      return []
    }

    return this.latestRelease.assets.map(asset => ({
      name: asset.name,
      size: asset.size,
      downloadUrl: asset.browser_download_url,
      contentType: asset.content_type
    }))
  }

  async refreshData() {
    try {
      await this.fetchLatestRelease()
      return true
    } catch (error) {
      console.error('Failed to refresh data:', error)
      return false
    }
  }

  cleanup() {
    this.eventEmitter.removeAllListeners('download:request')
    this.eventEmitter.removeAllListeners('download:refresh')
    this.latestRelease = null
    this.status = this.getDefaultStatus()
    this.isInitialized = false
  }
}
