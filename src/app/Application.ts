import { EventEmitter } from '../utils/EventEmitter'
import { PerformanceMonitor } from '../utils/PerformanceMonitor'
import { ThemeManager } from '../utils/ThemeManager'

export interface ApplicationConfig {
  debug: boolean
  theme: 'light' | 'dark' | 'auto'
  animations: boolean
  performance: boolean
}

export class Application {
  private eventEmitter: EventEmitter
  private performanceMonitor: PerformanceMonitor
  private themeManager: ThemeManager
  private config: ApplicationConfig
  private isInitialized: boolean = false

  constructor(config: Partial<ApplicationConfig> = {}) {
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
  }

  async initialize(): Promise<void> {
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
      console.error('❌ Application initialization failed:', error)
      throw error
    }
  }

  private async initializeCore(): Promise<void> {
    if (this.config.performance) {
      await this.performanceMonitor.initialize()
    }

    await this.themeManager.initialize(this.config.theme)
    
    this.setupGlobalErrorHandling()
    this.setupPerformanceObserver()
  }

  private async initializeModules(): Promise<void> {
    const modules = [
      this.initializeAnimations(),
      this.initializeInteractions(),
      this.initializeAccessibility()
    ]

    await Promise.all(modules)
  }

  private async initializeAnimations(): Promise<void> {
    if (!this.config.animations) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s')
      return
    }

    this.setupScrollAnimations()
    this.setupHoverEffects()
    this.setupParallaxEffects()
  }

  private async initializeInteractions(): Promise<void> {
    this.setupKeyboardNavigation()
    this.setupTouchGestures()
    this.setupClickEffects()
  }

  private async initializeAccessibility(): Promise<void> {
    this.setupFocusManagement()
    this.setupAriaLabels()
    this.setupScreenReaderSupport()
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this))
    window.addEventListener('scroll', this.handleScroll.bind(this))
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this))
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    document.addEventListener('keydown', this.handleKeyDown.bind(this))
  }

  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error)
      this.eventEmitter.emit('app:error', { error: event.error })
    })

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      this.eventEmitter.emit('app:error', { error: event.reason })
    })
  }

  private setupPerformanceObserver(): void {
    if (!this.config.performance || !('PerformanceObserver' in window)) return

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach(entry => {
          if (entry.entryType === 'navigation') {
            this.eventEmitter.emit('performance:navigation', entry)
          } else if (entry.entryType === 'paint') {
            this.eventEmitter.emit('performance:paint', entry)
          }
        })
      })

      observer.observe({ entryTypes: ['navigation', 'paint'] })
    } catch (error) {
      console.warn('Performance observer setup failed:', error)
    }
  }

  private setupScrollAnimations(): void {
    const elements = document.querySelectorAll('[data-animate]')
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement
          const animation = element.dataset.animate || 'fadeIn'
          element.classList.add(`animate-${animation}`)
          observer.unobserve(element)
        }
      })
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    })

    elements.forEach(el => observer.observe(el))
  }

  private setupHoverEffects(): void {
    const interactiveElements = document.querySelectorAll('.btn, .feature-card, .nav-link')
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        element.classList.add('hover-active')
      })
      
      element.addEventListener('mouseleave', () => {
        element.classList.remove('hover-active')
      })
    })
  }

  private setupParallaxEffects(): void {
    const parallaxElements = document.querySelectorAll('[data-parallax]')
    
    if (parallaxElements.length === 0) return

    const handleParallax = () => {
      const scrollY = window.pageYOffset
      
      parallaxElements.forEach(element => {
        const htmlElement = element as HTMLElement
        const speed = parseFloat(htmlElement.dataset.parallax || '0.5')
        const yPos = -(scrollY * speed)
        htmlElement.style.transform = `translateY(${yPos}px)`
      })
    }

    window.addEventListener('scroll', handleParallax, { passive: true })
  }

  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation')
    })
  }

  private setupTouchGestures(): void {
    if (!('ontouchstart' in window)) return

    document.body.classList.add('touch-device')
    
    let touchStartY = 0
    let touchEndY = 0

    document.addEventListener('touchstart', (event) => {
      touchStartY = event.changedTouches[0].screenY
    }, { passive: true })

    document.addEventListener('touchend', (event) => {
      touchEndY = event.changedTouches[0].screenY
      this.handleSwipeGesture(touchStartY, touchEndY)
    }, { passive: true })
  }

  private setupClickEffects(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      
      if (target.classList.contains('btn') || target.closest('.btn')) {
        this.createRippleEffect(event)
      }
    })
  }

  private setupFocusManagement(): void {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    focusableElements.forEach(element => {
      element.addEventListener('focus', () => {
        element.classList.add('focus-visible')
      })
      
      element.addEventListener('blur', () => {
        element.classList.remove('focus-visible')
      })
    })
  }

  private setupAriaLabels(): void {
    const buttons = document.querySelectorAll('button:not([aria-label])')
    buttons.forEach(button => {
      const text = button.textContent?.trim()
      if (text) {
        button.setAttribute('aria-label', text)
      }
    })
  }

  private setupScreenReaderSupport(): void {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.textContent = 'Skip to main content'
    skipLink.className = 'skip-link'
    document.body.insertBefore(skipLink, document.body.firstChild)

    const mainContent = document.querySelector('main')
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content'
    }
  }

  private handleResize(): void {
    this.eventEmitter.emit('app:resize', {
      width: window.innerWidth,
      height: window.innerHeight
    })
  }

  private handleScroll(): void {
    const scrollY = window.pageYOffset
    const scrollPercent = (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    
    this.eventEmitter.emit('app:scroll', {
      scrollY,
      scrollPercent
    })
  }

  private handleVisibilityChange(): void {
    const isVisible = !document.hidden
    this.eventEmitter.emit('app:visibility', { isVisible })
    
    if (isVisible) {
      console.log('App became visible')
    } else {
      console.log('App became hidden')
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.eventEmitter.emit('app:escape')
    }
  }

  private handleBeforeUnload(): void {
    this.eventEmitter.emit('app:beforeunload')
  }

  private handleSwipeGesture(startY: number, endY: number): void {
    const threshold = 50
    const diff = startY - endY

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.eventEmitter.emit('gesture:swipeup')
      } else {
        this.eventEmitter.emit('gesture:swipedown')
      }
    }
  }

  private createRippleEffect(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest('.btn') as HTMLElement
    if (!button) return

    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    `

    button.style.position = 'relative'
    button.style.overflow = 'hidden'
    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  public getEventEmitter(): EventEmitter {
    return this.eventEmitter
  }

  public getThemeManager(): ThemeManager {
    return this.themeManager
  }

  public getPerformanceMonitor(): PerformanceMonitor {
    return this.performanceMonitor
  }

  public getConfig(): ApplicationConfig {
    return { ...this.config }
  }

  public updateConfig(newConfig: Partial<ApplicationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.eventEmitter.emit('app:config-updated', this.config)
  }

  public destroy(): void {
    this.eventEmitter.removeAllListeners()
    this.performanceMonitor.destroy()
    this.themeManager.destroy()
    this.isInitialized = false
    console.log('Application destroyed')
  }
}
