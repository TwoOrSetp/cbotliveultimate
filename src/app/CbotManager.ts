import { EventEmitter } from '../utils/EventEmitter'

export interface CbotConfig {
  clickDelay: number
  randomization: number
  holdDuration: number
  maxCPS: number
  accuracy: number
  adaptiveTiming: boolean
  antiDetection: boolean
  humanBehavior: boolean
  safeMode: boolean
}

export interface CbotMetrics {
  totalClicks: number
  accuracy: number
  clicksPerSecond: number
  averageDelay: number
  uptime: number
  levelsCompleted: number
}

export interface CbotStatus {
  isRunning: boolean
  isPaused: boolean
  currentLevel: string
  performance: 'excellent' | 'good' | 'average' | 'poor'
  lastError?: string
}

export class CbotManager {
  private eventEmitter: EventEmitter
  private config: CbotConfig
  private metrics: CbotMetrics
  private status: CbotStatus
  private isInitialized: boolean = false
  private clickInterval: number | null = null
  private startTime: number = 0

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter
    this.config = this.getDefaultConfig()
    this.metrics = this.getDefaultMetrics()
    this.status = this.getDefaultStatus()
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      await this.loadConfig()
      this.setupEventListeners()
      this.isInitialized = true
      
      console.log('🤖 Cbot Manager initialized')
      this.eventEmitter.emit('cbot:initialized', { config: this.config })
    } catch (error) {
      console.error('❌ Failed to initialize Cbot Manager:', error)
      throw error
    }
  }

  private getDefaultConfig(): CbotConfig {
    return {
      clickDelay: 10,
      randomization: 15,
      holdDuration: 50,
      maxCPS: 20,
      accuracy: 95,
      adaptiveTiming: true,
      antiDetection: true,
      humanBehavior: true,
      safeMode: true
    }
  }

  private getDefaultMetrics(): CbotMetrics {
    return {
      totalClicks: 0,
      accuracy: 0,
      clicksPerSecond: 0,
      averageDelay: 0,
      uptime: 0,
      levelsCompleted: 0
    }
  }

  private getDefaultStatus(): CbotStatus {
    return {
      isRunning: false,
      isPaused: false,
      currentLevel: 'None',
      performance: 'excellent'
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const savedConfig = localStorage.getItem('cbot-config')
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error)
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('cbot-config', JSON.stringify(this.config))
    } catch (error) {
      console.warn('Failed to save config:', error)
    }
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('cbot:start', () => this.start())
    this.eventEmitter.on('cbot:stop', () => this.stop())
    this.eventEmitter.on('cbot:pause', () => this.pause())
    this.eventEmitter.on('cbot:resume', () => this.resume())
    this.eventEmitter.on('cbot:config-update', (newConfig) => this.updateConfig(newConfig))
  }

  start(): void {
    if (this.status.isRunning) return

    this.status.isRunning = true
    this.status.isPaused = false
    this.startTime = Date.now()
    
    this.startClickLoop()
    this.startMetricsUpdate()
    
    console.log('🚀 Cbot started')
    this.eventEmitter.emit('cbot:started', this.status)
  }

  stop(): void {
    if (!this.status.isRunning) return

    this.status.isRunning = false
    this.status.isPaused = false
    
    this.stopClickLoop()
    
    console.log('⏹️ Cbot stopped')
    this.eventEmitter.emit('cbot:stopped', this.status)
  }

  pause(): void {
    if (!this.status.isRunning || this.status.isPaused) return

    this.status.isPaused = true
    this.stopClickLoop()
    
    console.log('⏸️ Cbot paused')
    this.eventEmitter.emit('cbot:paused', this.status)
  }

  resume(): void {
    if (!this.status.isRunning || !this.status.isPaused) return

    this.status.isPaused = false
    this.startClickLoop()
    
    console.log('▶️ Cbot resumed')
    this.eventEmitter.emit('cbot:resumed', this.status)
  }

  private startClickLoop(): void {
    if (this.clickInterval) return

    const baseDelay = this.config.clickDelay
    const performClick = () => {
      if (!this.status.isRunning || this.status.isPaused) return

      this.executeClick()
      
      const randomFactor = this.config.humanBehavior ? 
        (Math.random() - 0.5) * (this.config.randomization / 100) : 0
      const delay = baseDelay * (1 + randomFactor)
      
      setTimeout(performClick, Math.max(1, delay))
    }

    performClick()
  }

  private stopClickLoop(): void {
    if (this.clickInterval) {
      clearInterval(this.clickInterval)
      this.clickInterval = null
    }
  }

  private executeClick(): void {
    if (!this.shouldClick()) return

    this.simulateClick()
    this.metrics.totalClicks++
    
    this.eventEmitter.emit('cbot:click', {
      timestamp: Date.now(),
      delay: this.config.clickDelay,
      position: this.getClickPosition()
    })
  }

  private shouldClick(): boolean {
    if (this.config.safeMode && !this.isGeometryDashActive()) {
      return false
    }

    const currentCPS = this.metrics.clicksPerSecond
    if (currentCPS >= this.config.maxCPS) {
      return false
    }

    if (this.config.adaptiveTiming) {
      return this.adaptiveClickDecision()
    }

    return true
  }

  private isGeometryDashActive(): boolean {
    return document.hasFocus() && document.title.includes('Geometry Dash')
  }

  private adaptiveClickDecision(): boolean {
    const accuracy = this.metrics.accuracy
    const targetAccuracy = this.config.accuracy

    if (accuracy < targetAccuracy - 5) {
      return Math.random() < 0.7
    } else if (accuracy > targetAccuracy + 5) {
      return Math.random() < 0.95
    }

    return Math.random() < 0.85
  }

  private simulateClick(): void {
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })

    const target = this.getClickTarget()
    if (target) {
      target.dispatchEvent(clickEvent)
    }
  }

  private getClickTarget(): Element | null {
    return document.elementFromPoint(
      window.innerWidth / 2,
      window.innerHeight / 2
    )
  }

  private getClickPosition(): { x: number; y: number } {
    const baseX = window.innerWidth / 2
    const baseY = window.innerHeight / 2
    
    if (this.config.humanBehavior) {
      const variance = 10
      return {
        x: baseX + (Math.random() - 0.5) * variance,
        y: baseY + (Math.random() - 0.5) * variance
      }
    }

    return { x: baseX, y: baseY }
  }

  private startMetricsUpdate(): void {
    setInterval(() => {
      if (this.status.isRunning) {
        this.updateMetrics()
      }
    }, 1000)
  }

  private updateMetrics(): void {
    const now = Date.now()
    const uptime = (now - this.startTime) / 1000
    
    this.metrics.uptime = uptime
    this.metrics.clicksPerSecond = this.metrics.totalClicks / Math.max(uptime, 1)
    this.metrics.accuracy = this.calculateAccuracy()
    this.metrics.averageDelay = this.config.clickDelay
    
    this.updatePerformanceStatus()
    this.eventEmitter.emit('cbot:metrics-updated', this.metrics)
  }

  private calculateAccuracy(): number {
    const baseAccuracy = this.config.accuracy
    const variance = Math.random() * 2 - 1
    return Math.max(0, Math.min(100, baseAccuracy + variance))
  }

  private updatePerformanceStatus(): void {
    const accuracy = this.metrics.accuracy
    
    if (accuracy >= 95) {
      this.status.performance = 'excellent'
    } else if (accuracy >= 85) {
      this.status.performance = 'good'
    } else if (accuracy >= 70) {
      this.status.performance = 'average'
    } else {
      this.status.performance = 'poor'
    }
  }

  updateConfig(newConfig: Partial<CbotConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.saveConfig()
    
    console.log('⚙️ Cbot config updated:', newConfig)
    this.eventEmitter.emit('cbot:config-updated', this.config)
  }

  getConfig(): CbotConfig {
    return { ...this.config }
  }

  getMetrics(): CbotMetrics {
    return { ...this.metrics }
  }

  getStatus(): CbotStatus {
    return { ...this.status }
  }

  resetMetrics(): void {
    this.metrics = this.getDefaultMetrics()
    this.eventEmitter.emit('cbot:metrics-reset')
  }

  destroy(): void {
    this.stop()
    this.eventEmitter.removeAllListeners()
    this.isInitialized = false
    console.log('🤖 Cbot Manager destroyed')
  }
}
