export interface LoadingAsset {
  name: string
  url: string
  type: 'image' | 'font' | 'script' | 'style' | 'data'
  size?: number
  loaded: boolean
  error?: string
}

export interface LoadingProgress {
  current: number
  total: number
  percentage: number
  currentAsset?: string
  loadTime: number
}

export class LoadingManager {
  private loadingScreen: HTMLElement | null = null
  private progressBar: HTMLElement | null = null
  private progressGlow: HTMLElement | null = null
  private progressPercentage: HTMLElement | null = null
  private loadingStatus: HTMLElement | null = null
  private assetsListElement: HTMLElement | null = null
  private loadedAssetsElement: HTMLElement | null = null
  private totalAssetsElement: HTMLElement | null = null
  private loadTimeElement: HTMLElement | null = null
  private cbotLogo: HTMLElement | null = null

  private assets: LoadingAsset[] = []
  private loadedCount = 0
  private startTime = 0

  constructor() {
    this.startTime = Date.now()
    this.initializeElements()
    this.initializeAssets()
  }

  private initializeElements(): void {
    this.loadingScreen = document.getElementById('loading-screen')
    this.progressBar = document.getElementById('progress-fill')
    this.progressGlow = this.loadingScreen?.querySelector('.progress-glow') || null
    this.progressPercentage = document.getElementById('progress-percentage')
    this.loadingStatus = document.getElementById('loading-status')
    this.assetsListElement = document.getElementById('assets-list')
    this.loadedAssetsElement = document.getElementById('loaded-assets')
    this.totalAssetsElement = document.getElementById('total-assets')
    this.loadTimeElement = document.getElementById('load-time')
    this.cbotLogo = document.getElementById('cbot-logo')
  }

  private initializeAssets(): void {
    this.assets = [
      // Images
      { name: 'Cbot Logo', url: '/cbot.png', type: 'image', loaded: false },
      { name: 'Favicon', url: '/favicon.png', type: 'image', loaded: false },
      
      // Fonts
      { name: 'Rajdhani Font', url: 'fonts/rajdhani', type: 'font', loaded: false },
      { name: 'Orbitron Font', url: 'fonts/orbitron', type: 'font', loaded: false },
      { name: 'JetBrains Mono', url: 'fonts/jetbrains', type: 'font', loaded: false },
      
      // Core Systems
      { name: 'Application Core', url: 'core/application', type: 'script', loaded: false },
      { name: 'Download Manager', url: 'core/downloads', type: 'script', loaded: false },
      { name: 'Notification System', url: 'core/notifications', type: 'script', loaded: false },
      { name: 'Typography Engine', url: 'core/typography', type: 'script', loaded: false },
      { name: 'Theme System', url: 'core/themes', type: 'script', loaded: false },
      
      // UI Components
      { name: 'Button Components', url: 'ui/buttons', type: 'style', loaded: false },
      { name: 'Navigation System', url: 'ui/navigation', type: 'style', loaded: false },
      { name: 'Hero Section', url: 'ui/hero', type: 'style', loaded: false },
      { name: 'Feature Cards', url: 'ui/features', type: 'style', loaded: false },
      
      // Data & APIs
      { name: 'GitHub Integration', url: 'api/github', type: 'data', loaded: false },
      { name: 'Release Data', url: 'api/releases', type: 'data', loaded: false }
    ]

    // Update total assets display
    if (this.totalAssetsElement) {
      this.totalAssetsElement.textContent = this.assets.length.toString()
    }

    // Initialize assets list
    this.updateAssetsList()
  }

  public async startLoading(): Promise<void> {
    console.log('🚀 Starting advanced loading process...')
    
    // Show Cbot logo with animation
    if (this.cbotLogo) {
      this.cbotLogo.style.opacity = '1'
    }

    // Update initial progress
    this.updateProgress()

    // Load assets with realistic timing
    for (let i = 0; i < this.assets.length; i++) {
      const asset = this.assets[i]
      
      // Update current asset
      this.updateProgress(asset.name)
      this.updateAssetStatus(asset, 'loading')
      
      // Simulate loading time based on asset type
      const loadTime = this.getLoadTime(asset.type)
      
      try {
        await this.loadAsset(asset)
        await this.delay(loadTime)
        
        asset.loaded = true
        this.loadedCount++
        this.updateAssetStatus(asset, 'loaded')
        
        console.log(`✅ Loaded: ${asset.name}`)
        
      } catch (error) {
        asset.error = error instanceof Error ? error.message : 'Failed to load'
        asset.loaded = false
        this.updateAssetStatus(asset, 'error')
        console.warn(`❌ Failed to load: ${asset.name}`, error)
        
        // Still count as "processed" for progress
        this.loadedCount++
      }
      
      // Update progress
      this.updateProgress()
      
      // Add small delay between assets for visual effect
      await this.delay(100 + Math.random() * 200)
    }

    // Final status
    this.updateProgress('Complete! Launching Cbot...')
    await this.delay(500)

    console.log('🎉 Loading complete!')
  }

  private async loadAsset(asset: LoadingAsset): Promise<void> {
    switch (asset.type) {
      case 'image':
        return this.loadImage(asset.url)
      case 'font':
      case 'script':
      case 'style':
      case 'data':
        // Simulate loading for demo
        return Promise.resolve()
      default:
        return Promise.resolve()
    }
  }

  private loadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  private getLoadTime(type: string): number {
    const baseTimes = {
      image: 200,
      font: 300,
      script: 400,
      style: 250,
      data: 500
    }
    
    const baseTime = baseTimes[type as keyof typeof baseTimes] || 200
    return baseTime + Math.random() * 200
  }

  private updateProgress(currentAsset?: string): void {
    const percentage = Math.round((this.loadedCount / this.assets.length) * 100)
    const loadTime = (Date.now() - this.startTime) / 1000

    // Update progress bar
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`
    }

    // Update progress glow
    if (this.progressGlow) {
      this.progressGlow.style.width = `${percentage}%`
    }

    // Update percentage
    if (this.progressPercentage) {
      this.progressPercentage.textContent = `${percentage}%`
    }

    // Update status
    if (this.loadingStatus && currentAsset) {
      this.loadingStatus.textContent = `Loading ${currentAsset}...`
    }

    // Update stats
    if (this.loadedAssetsElement) {
      this.loadedAssetsElement.textContent = this.loadedCount.toString()
    }

    if (this.loadTimeElement) {
      this.loadTimeElement.textContent = `${loadTime.toFixed(1)}s`
    }
  }

  private updateAssetsList(): void {
    if (!this.assetsListElement) return

    this.assetsListElement.innerHTML = this.assets.map(asset => `
      <div class="asset-item" data-asset="${asset.name}">
        <span class="asset-name">${asset.name}</span>
        <span class="asset-status loading">Waiting</span>
      </div>
    `).join('')
  }

  private updateAssetStatus(asset: LoadingAsset, status: 'loading' | 'loaded' | 'error'): void {
    const assetElement = this.assetsListElement?.querySelector(`[data-asset="${asset.name}"] .asset-status`)
    if (assetElement) {
      assetElement.className = `asset-status ${status}`
      assetElement.textContent = status === 'loading' ? 'Loading...' : 
                                 status === 'loaded' ? 'Loaded' : 'Error'
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public hideLoading(): void {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden')
    }
  }

  public getAssets(): LoadingAsset[] {
    return [...this.assets]
  }

  public getProgress(): LoadingProgress {
    return {
      current: this.loadedCount,
      total: this.assets.length,
      percentage: Math.round((this.loadedCount / this.assets.length) * 100),
      loadTime: (Date.now() - this.startTime) / 1000
    }
  }
}
