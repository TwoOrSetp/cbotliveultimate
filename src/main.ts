import './styles/main.css'
import { Application } from './app/Application'
import { CbotManager } from './app/CbotManager'
import { LoadingManager } from './utils/LoadingManager'
import { TypingAnimation } from './utils/TypingAnimation'

class Main {
  private app: Application
  private cbotManager: CbotManager
  private loadingManager: LoadingManager
  private typingAnimation: TypingAnimation

  constructor() {
    this.loadingManager = new LoadingManager()
    this.typingAnimation = new TypingAnimation()
    this.app = new Application()
    this.cbotManager = new CbotManager(this.app.getEventEmitter())
  }

  async initialize(): Promise<void> {
    try {
      await this.showLoadingScreen()
      await this.app.initialize()
      await this.cbotManager.initialize()
      await this.hideLoadingScreen()
      this.startTypingAnimations()
      this.setupEventListeners()
      this.setupCbotEventListeners()

      console.log('🚀 Cbot Application initialized successfully!')
    } catch (error) {
      console.error('❌ Failed to initialize application:', error)
      this.showErrorMessage('Failed to load application. Please refresh the page.')
    }
  }

  private async showLoadingScreen(): Promise<void> {
    const loadingScreen = document.getElementById('loading-screen')
    if (!loadingScreen) return

    const progressFill = loadingScreen.querySelector('.progress-fill') as HTMLElement
    const loadingStatus = loadingScreen.querySelector('.loading-status') as HTMLElement

    const steps = [
      { progress: 20, status: 'Loading modules...', delay: 300 },
      { progress: 40, status: 'Initializing components...', delay: 400 },
      { progress: 60, status: 'Setting up animations...', delay: 300 },
      { progress: 80, status: 'Preparing interface...', delay: 400 },
      { progress: 100, status: 'Ready!', delay: 200 }
    ]

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay))
      
      if (progressFill) {
        progressFill.style.width = `${step.progress}%`
      }
      
      if (loadingStatus) {
        loadingStatus.textContent = step.status
      }
    }

    await new Promise(resolve => setTimeout(resolve, 500))
  }

  private async hideLoadingScreen(): Promise<void> {
    const loadingScreen = document.getElementById('loading-screen')
    const app = document.getElementById('app')

    if (loadingScreen) {
      loadingScreen.style.opacity = '0'
      loadingScreen.style.transition = 'opacity 0.5s ease-out'
      
      setTimeout(() => {
        loadingScreen.style.display = 'none'
      }, 500)
    }

    if (app) {
      app.style.display = 'block'
      app.style.opacity = '0'
      app.style.transition = 'opacity 0.5s ease-in'
      
      setTimeout(() => {
        app.style.opacity = '1'
      }, 100)
    }
  }

  private startTypingAnimations(): void {
    const typingElements = document.querySelectorAll('.typing-text')
    
    typingElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const text = htmlElement.dataset.text || ''
      const delay = parseInt(htmlElement.dataset.delay || '0') + (index * 500)
      
      setTimeout(() => {
        this.typingAnimation.animate(htmlElement, text, {
          speed: 50,
          cursor: true
        })
      }, delay)
    })

    const codeElement = document.querySelector('.typing-code') as HTMLElement
    if (codeElement) {
      const codeText = codeElement.dataset.text || ''
      setTimeout(() => {
        this.typingAnimation.animate(codeElement, codeText, {
          speed: 30,
          cursor: false
        })
      }, 3000)
    }
  }

  private setupEventListeners(): void {
    const startBotBtn = document.getElementById('start-bot')
    const openSettingsBtn = document.getElementById('open-settings')
    const downloadModBtn = document.getElementById('download-mod')

    if (startBotBtn) {
      startBotBtn.addEventListener('click', () => {
        this.handleStartBot()
      })
    }

    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => {
        this.handleOpenSettings()
      })
    }

    if (downloadModBtn) {
      downloadModBtn.addEventListener('click', () => {
        this.handleDownloadMod()
      })
    }

    this.setupNavigation()
    this.setupScrollEffects()
    this.setupStatsAnimation()
    this.setupSettingsControls()
  }

  private setupNavigation(): void {
    const navLinks = document.querySelectorAll('.nav-link')
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault()
        const href = (link as HTMLAnchorElement).getAttribute('href')
        if (href && href.startsWith('#')) {
          this.scrollToSection(href.substring(1))
        }
      })
    })

    const navToggle = document.querySelector('.nav-toggle')
    const navMenu = document.querySelector('.nav-menu')
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active')
        navToggle.classList.toggle('active')
      })
    }
  }

  private setupScrollEffects(): void {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in')
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll('.feature-card, .about-content, .tech-item')
    animatedElements.forEach(el => observer.observe(el))
  }

  private setupStatsAnimation(): void {
    const statNumbers = document.querySelectorAll('.stat-number')
    
    const animateStats = () => {
      statNumbers.forEach(stat => {
        const target = parseInt((stat as HTMLElement).dataset.target || '0')
        const duration = 2000
        const increment = target / (duration / 16)
        let current = 0
        
        const timer = setInterval(() => {
          current += increment
          if (current >= target) {
            current = target
            clearInterval(timer)
          }
          
          if (target > 1000) {
            stat.textContent = Math.floor(current).toLocaleString()
          } else {
            stat.textContent = current.toFixed(target < 100 ? 1 : 0)
          }
        }, 16)
      })
    }

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats()
          statsObserver.disconnect()
        }
      })
    }, { threshold: 0.5 })

    const statsSection = document.querySelector('.hero-stats')
    if (statsSection) {
      statsObserver.observe(statsSection)
    }
  }

  private scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId)
    if (section) {
      const headerHeight = 80
      const targetPosition = section.offsetTop - headerHeight
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }

  private handleStartBot(): void {
    const status = this.cbotManager.getStatus()

    if (status.isRunning) {
      this.cbotManager.stop()
      this.showNotification('Cbot stopped', 'info')
    } else {
      this.cbotManager.start()
      this.showNotification('Cbot started successfully!', 'success')
    }
  }

  private handleOpenSettings(): void {
    this.scrollToSection('settings')
    this.showNotification('Configure your bot settings below', 'info')
  }

  private handleDownloadMod(): void {
    this.showNotification('Download feature coming soon!', 'info')
    console.log('Download mod clicked!')
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.textContent = message
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)'
    }, 100)
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)'
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  private showErrorMessage(message: string): void {
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      const statusElement = loadingScreen.querySelector('.loading-status')
      if (statusElement) {
        statusElement.textContent = message
        statusElement.style.color = '#ef4444'
      }
    }
  }

  private setupCbotEventListeners(): void {
    const eventEmitter = this.app.getEventEmitter()

    eventEmitter.on('cbot:started', () => {
      this.updateBotButton('Stop Bot', true)
      this.updateModStatus('Running')
    })

    eventEmitter.on('cbot:stopped', () => {
      this.updateBotButton('Start Bot', false)
      this.updateModStatus('Ready')
    })

    eventEmitter.on('cbot:metrics-updated', (metrics) => {
      this.updateStatsDisplay(metrics)
    })
  }

  private setupSettingsControls(): void {
    const controls = [
      'click-delay', 'randomization', 'hold-duration',
      'max-cps', 'accuracy', 'adaptive-timing',
      'anti-detection', 'human-behavior', 'safe-mode'
    ]

    controls.forEach(controlId => {
      const element = document.getElementById(controlId)
      if (element) {
        element.addEventListener('change', () => {
          this.handleSettingChange(controlId, element)
        })
      }
    })
  }

  private handleSettingChange(settingId: string, element: HTMLElement): void {
    const input = element as HTMLInputElement
    let value: any = input.value

    if (input.type === 'checkbox') {
      value = input.checked
    } else if (input.type === 'range') {
      value = parseInt(value)
      this.updateSettingDisplay(settingId, value)
    }

    const configUpdate: any = {}
    configUpdate[this.camelCase(settingId)] = value

    this.cbotManager.updateConfig(configUpdate)
  }

  private camelCase(str: string): string {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
  }

  private updateSettingDisplay(settingId: string, value: number): void {
    const valueElement = document.querySelector(`#${settingId} + .setting-value`)
    if (valueElement) {
      let displayValue = value.toString()

      if (settingId.includes('delay') || settingId.includes('duration')) {
        displayValue += 'ms'
      } else if (settingId.includes('randomization') || settingId.includes('accuracy')) {
        displayValue += '%'
      }

      valueElement.textContent = displayValue
    }
  }

  private updateBotButton(text: string, isActive: boolean): void {
    const startButton = document.getElementById('start-bot')
    if (startButton) {
      startButton.textContent = text
      startButton.classList.toggle('active', isActive)
    }
  }

  private updateModStatus(status: string): void {
    const statusButton = document.getElementById('mod-status')
    if (statusButton) {
      statusButton.textContent = `Status: ${status}`
    }
  }

  private updateStatsDisplay(metrics: any): void {
    const statNumbers = document.querySelectorAll('.stat-number')
    if (statNumbers.length >= 3) {
      (statNumbers[0] as HTMLElement).textContent = metrics.accuracy.toFixed(1)
      (statNumbers[1] as HTMLElement).textContent = Math.round(metrics.clicksPerSecond).toString()
      (statNumbers[2] as HTMLElement).textContent = metrics.totalClicks.toString()
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const main = new Main()
  main.initialize()
})

if (import.meta.hot) {
  import.meta.hot.accept()
}
