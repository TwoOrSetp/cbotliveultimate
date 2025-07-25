export class LoadingManager {
  constructor() {
    this.loadingScreen = null
    this.progressBar = null
    this.progressGlow = null
    this.progressPercentage = null
    this.loadingStatus = null
    this.assetsListElement = null
    this.loadedAssetsElement = null
    this.totalAssetsElement = null
    this.loadTimeElement = null
    this.cbotLogo = null
    this.animeEnhancement = null

    this.assets = []
    this.loadedCount = 0
    this.startTime = Date.now()
    this.maxLoadingTimeout = null

    this.initializeElements()
    this.initializeAssets()

    document.body.classList.add('loading')
  }

  initializeElements() {
    this.loadingScreen = document.getElementById('loading-screen')
    this.progressBar = document.getElementById('progress-fill')
    this.progressGlow = this.loadingScreen?.querySelector('.progress-glow') || null
    this.progressPercentage = document.getElementById('progress-percentage')
    this.loadingStatus = document.getElementById('loading-status')
    this.assetsListElement = this.loadingScreen?.querySelector('.assets-list') || null
    this.loadedAssetsElement = document.getElementById('loaded-assets')
    this.totalAssetsElement = document.getElementById('total-assets')
    this.loadTimeElement = document.getElementById('load-time')
    this.cbotLogo = document.getElementById('cbot-logo')
    this.animeEnhancement = this.loadingScreen?.querySelector('.anime-enhancement') || null
  }

  initializeAssets() {
    this.assets = [
      { name: 'Core Styles', url: '/styles/main.css', type: 'style', loaded: false },
      { name: 'Application Logic', url: '/src/main.js', type: 'script', loaded: false },
      { name: 'Event System', url: '/src/utils/EventEmitter.js', type: 'script', loaded: false },
      { name: 'Download Manager', url: '/src/app/CbotManager.js', type: 'script', loaded: false },
      { name: 'Theme System', url: '/src/utils/ThemeManager.js', type: 'script', loaded: false },
      { name: 'Animation Engine', url: '/src/utils/TypingAnimation.js', type: 'script', loaded: false },
      { name: 'Font System', url: '/src/utils/AdvancedFontSystem.js', type: 'script', loaded: false },
      { name: 'Page Manager', url: '/src/utils/PageManager.js', type: 'script', loaded: false },
      { name: 'Notification System', url: '/src/utils/NotificationManager.js', type: 'script', loaded: false },
      { name: 'Performance Monitor', url: '/src/utils/PerformanceMonitor.js', type: 'script', loaded: false },
      { name: 'Anime Background', url: '/src/utils/AnimeAuraBackground.js', type: 'script', loaded: false },
      { name: 'Anime Demo', url: '/src/utils/AnimeThemeDemo.js', type: 'script', loaded: false },
      { name: 'Cbot Logo', url: '/cbot.png', type: 'image', loaded: false },
      { name: 'Rajdhani Font', url: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700', type: 'font', loaded: false },
      { name: 'Orbitron Font', url: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900', type: 'font', loaded: false },
      { name: 'JetBrains Mono Font', url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600', type: 'font', loaded: false }
    ]

    this.updateAssetsDisplay()
  }

  async startLoading() {
    console.log('🚀 Starting loading process...')
    
    this.updateProgress(0, 'Initializing Cbot...')
    this.startLoadingAnimation()

    this.maxLoadingTimeout = setTimeout(() => {
      console.warn('⚠️ Loading timeout reached, forcing completion')
      this.forceComplete()
    }, 15000)

    try {
      await this.simulateAssetLoading()
      await this.finalizeLoading()
    } catch (error) {
      console.error('❌ Loading failed:', error)
      this.handleLoadingError(error)
    }
  }

  async simulateAssetLoading() {
    const totalAssets = this.assets.length
    
    for (let i = 0; i < totalAssets; i++) {
      const asset = this.assets[i]
      const progress = Math.round(((i + 1) / totalAssets) * 100)
      
      this.updateProgress(progress, `Loading ${asset.name}...`)
      
      try {
        await this.loadAsset(asset)
        asset.loaded = true
        this.loadedCount++
      } catch (error) {
        console.warn(`⚠️ Failed to load ${asset.name}:`, error)
        asset.error = error.message
        asset.loaded = true
        this.loadedCount++
      }
      
      this.updateAssetsDisplay()
      
      const delay = Math.random() * 200 + 100
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  async loadAsset(asset) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout loading ${asset.name}`))
      }, 5000)

      switch (asset.type) {
        case 'image':
          const img = new Image()
          img.onload = () => {
            clearTimeout(timeout)
            resolve()
          }
          img.onerror = () => {
            clearTimeout(timeout)
            reject(new Error(`Failed to load image: ${asset.name}`))
          }
          img.src = asset.url
          break

        case 'font':
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = asset.url
          link.onload = () => {
            clearTimeout(timeout)
            resolve()
          }
          link.onerror = () => {
            clearTimeout(timeout)
            reject(new Error(`Failed to load font: ${asset.name}`))
          }
          document.head.appendChild(link)
          break

        case 'script':
        case 'style':
        case 'data':
        default:
          setTimeout(() => {
            clearTimeout(timeout)
            resolve()
          }, Math.random() * 500 + 200)
          break
      }
    })
  }

  updateProgress(percentage, status) {
    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`
    }

    if (this.progressGlow) {
      this.progressGlow.style.width = `${percentage}%`
    }

    if (this.progressPercentage) {
      this.progressPercentage.textContent = `${percentage}%`
    }

    if (this.loadingStatus && status) {
      this.loadingStatus.textContent = status
    }

    this.updateLoadTime()
  }

  updateAssetsDisplay() {
    if (this.loadedAssetsElement) {
      this.loadedAssetsElement.textContent = this.loadedCount.toString()
    }

    if (this.totalAssetsElement) {
      this.totalAssetsElement.textContent = this.assets.length.toString()
    }
  }

  updateLoadTime() {
    if (this.loadTimeElement) {
      const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1)
      this.loadTimeElement.textContent = `${elapsed}s`
    }
  }

  startLoadingAnimation() {
    if (this.cbotLogo) {
      this.cbotLogo.classList.add('loading-spin')
    }

    if (this.animeEnhancement) {
      this.animeEnhancement.classList.add('active')
    }
  }

  async finalizeLoading() {
    this.updateProgress(100, 'Ready!')
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('✅ Loading completed successfully')
  }

  hideLoading() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('hidden')
      
      document.body.classList.remove('loading')
      
      setTimeout(() => {
        const app = document.getElementById('app')
        if (app) {
          app.style.display = 'block !important'
          app.style.visibility = 'visible !important'
          app.style.opacity = '1'
          app.classList.add('loaded')
        }
      }, 800)
    }
  }

  forceComplete() {
    if (this.maxLoadingTimeout) {
      clearTimeout(this.maxLoadingTimeout)
      this.maxLoadingTimeout = null
    }
    
    this.updateProgress(100, 'Loading complete!')
    setTimeout(() => this.hideLoading(), 500)
  }

  handleLoadingError(error) {
    console.error('Loading error:', error)
    this.updateProgress(100, 'Loading completed with errors')
    setTimeout(() => this.hideLoading(), 1000)
  }

  applyModernStyling() {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('modern-loading')
    }
  }

  getProgress() {
    return {
      current: this.loadedCount,
      total: this.assets.length,
      percentage: Math.round((this.loadedCount / this.assets.length) * 100),
      loadTime: Date.now() - this.startTime
    }
  }

  cleanup() {
    if (this.maxLoadingTimeout) {
      clearTimeout(this.maxLoadingTimeout)
      this.maxLoadingTimeout = null
    }
    
    document.body.classList.remove('loading')
  }
}
