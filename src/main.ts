import './styles/main.css'
import { Application } from './app/Application'
import { LoadingManager } from './utils/LoadingManager'
import { TypingAnimation } from './utils/TypingAnimation'

class Main {
  private app: Application
  private loadingManager: LoadingManager
  private typingAnimation: TypingAnimation

  constructor() {
    this.loadingManager = new LoadingManager()
    this.typingAnimation = new TypingAnimation()
    this.app = new Application()
  }

  async initialize(): Promise<void> {
    try {
      await this.showLoadingScreen()
      await this.app.initialize()
      await this.hideLoadingScreen()
      this.startTypingAnimations()
      this.setupEventListeners()
      
      console.log('🚀 Application initialized successfully!')
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
    const getStartedBtn = document.getElementById('get-started')
    const learnMoreBtn = document.getElementById('learn-more')

    if (getStartedBtn) {
      getStartedBtn.addEventListener('click', () => {
        this.handleGetStarted()
      })
    }

    if (learnMoreBtn) {
      learnMoreBtn.addEventListener('click', () => {
        this.handleLearnMore()
      })
    }

    this.setupNavigation()
    this.setupScrollEffects()
    this.setupStatsAnimation()
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

  private handleGetStarted(): void {
    console.log('Get Started clicked!')
    this.showNotification('Welcome! Getting started...', 'success')
  }

  private handleLearnMore(): void {
    console.log('Learn More clicked!')
    this.scrollToSection('features')
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
}

document.addEventListener('DOMContentLoaded', () => {
  const main = new Main()
  main.initialize()
})

if (import.meta.hot) {
  import.meta.hot.accept()
}
