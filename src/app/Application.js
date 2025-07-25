import { EventEmitter } from '../utils/EventEmitter.js'
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js'
import { ThemeManager } from '../utils/ThemeManager.js'

export class Application {
  constructor(config = {}) {
    this.config = {
      debug: false,
      theme: 'dark',
      animations: true,
      performance: true,
      ...config
    }

    this.eventEmitter = new EventEmitter()
    this.performanceMonitor = new PerformanceMonitor()
    this.themeManager = new ThemeManager()
    this.isInitialized = false
  }

  async initialize() {
    if (this.isInitialized) {
      console.warn('Application already initialized')
      return
    }

    try {
      console.log('🚀 Initializing Application...')
      
      await this.initializeCore()
      await this.initializeModules()
      await this.setupEventListeners()
      
      this.isInitialized = true
      this.eventEmitter.emit('app:initialized', { config: this.config })
      
      console.log('✅ Application initialized successfully')
    } catch (error) {
      console.error('❌ Failed to initialize Application:', error)
      this.eventEmitter.emit('app:error', { error, phase: 'initialization' })
      throw error
    }
  }

  async initializeCore() {
    if (this.config.performance) {
      await this.performanceMonitor.initialize()
      this.performanceMonitor.startMonitoring()
    }

    await this.themeManager.initialize()
    
    if (this.config.debug) {
      this.enableDebugMode()
    }
  }

  async initializeModules() {
    const modules = [
      { name: 'Theme Manager', init: () => this.themeManager.loadSavedTheme() },
      { name: 'Performance Monitor', init: () => this.performanceMonitor.setupMetrics() }
    ]

    for (const module of modules) {
      try {
        await module.init()
        console.log(`✅ ${module.name} initialized`)
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${module.name}:`, error)
      }
    }
  }

  async setupEventListeners() {
    this.eventEmitter.on('theme:changed', (data) => {
      console.log('Theme changed:', data.theme)
      this.config.theme = data.theme
    })

    this.eventEmitter.on('performance:warning', (data) => {
      if (this.config.debug) {
        console.warn('Performance warning:', data)
      }
    })

    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden()
      } else {
        this.handlePageVisible()
      }
    })
  }

  enableDebugMode() {
    console.log('🐛 Debug mode enabled')
    window.cbotApp = this
    
    this.eventEmitter.on('*', (eventName, data) => {
      console.log(`[DEBUG] Event: ${eventName}`, data)
    })
  }

  handlePageHidden() {
    if (this.config.performance) {
      this.performanceMonitor.pauseMonitoring()
    }
    this.eventEmitter.emit('app:hidden')
  }

  handlePageVisible() {
    if (this.config.performance) {
      this.performanceMonitor.resumeMonitoring()
    }
    this.eventEmitter.emit('app:visible')
  }

  getEventEmitter() {
    return this.eventEmitter
  }

  getPerformanceMonitor() {
    return this.performanceMonitor
  }

  getThemeManager() {
    return this.themeManager
  }

  getConfig() {
    return { ...this.config }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.eventEmitter.emit('app:config-updated', { config: this.config })
  }

  isReady() {
    return this.isInitialized
  }

  async restart() {
    console.log('🔄 Restarting Application...')
    
    await this.cleanup()
    this.isInitialized = false
    await this.initialize()
    
    console.log('✅ Application restarted successfully')
  }

  async cleanup() {
    try {
      console.log('🧹 Cleaning up Application...')
      
      if (this.performanceMonitor) {
        this.performanceMonitor.stopMonitoring()
      }
      
      this.eventEmitter.removeAllListeners()
      this.eventEmitter.emit('app:cleanup')
      
      console.log('✅ Application cleanup completed')
    } catch (error) {
      console.error('❌ Error during cleanup:', error)
    }
  }

  getMetrics() {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      performance: this.performanceMonitor ? this.performanceMonitor.getMetrics() : null,
      theme: this.themeManager ? this.themeManager.getCurrentTheme() : null,
      eventListeners: this.eventEmitter ? this.eventEmitter.getListenerCount() : 0
    }
  }

  async waitForInitialization(timeout = 10000) {
    if (this.isInitialized) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Application initialization timeout'))
      }, timeout)

      this.eventEmitter.once('app:initialized', () => {
        clearTimeout(timeoutId)
        resolve()
      })

      this.eventEmitter.once('app:error', (data) => {
        clearTimeout(timeoutId)
        reject(data.error)
      })
    })
  }

  handleError(error, context = 'unknown') {
    console.error(`Application error in ${context}:`, error)
    
    this.eventEmitter.emit('app:error', {
      error,
      context,
      timestamp: Date.now(),
      config: this.config
    })

    if (this.config.debug) {
      throw error
    }
  }

  async healthCheck() {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      checks: {
        initialized: this.isInitialized,
        eventEmitter: !!this.eventEmitter,
        performanceMonitor: !!this.performanceMonitor,
        themeManager: !!this.themeManager
      }
    }

    if (!this.isInitialized) {
      health.status = 'unhealthy'
      health.issues = ['Application not initialized']
    }

    return health
  }

  setTheme(theme) {
    if (this.themeManager) {
      this.themeManager.setTheme(theme)
      this.config.theme = theme
    }
  }

  toggleAnimations() {
    this.config.animations = !this.config.animations
    this.eventEmitter.emit('app:animations-toggled', { enabled: this.config.animations })
    
    document.body.classList.toggle('no-animations', !this.config.animations)
  }

  getVersion() {
    return '1.0.0'
  }

  getBuildInfo() {
    return {
      version: this.getVersion(),
      buildDate: new Date().toISOString(),
      environment: 'production'
    }
  }
}
