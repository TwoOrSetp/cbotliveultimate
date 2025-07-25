import './styles/main.css'
import { Application } from './app/Application.js'
import { DownloadManager } from './app/CbotManager.js'
import { LoadingManager } from './utils/LoadingManager.js'
import { TypingAnimation } from './utils/TypingAnimation.js'
import { NotificationManager } from './utils/NotificationManager.js'
import { AdvancedFontSystem } from './utils/AdvancedFontSystem.js'
import { PageManager } from './utils/PageManager.js'
import { PageTransitionManager } from './utils/PageTransitionManager.js'
import { AnimeAuraBackground } from './utils/AnimeAuraBackground.js'
import { AnimeThemeDemo } from './utils/AnimeThemeDemo.js'

class Main {
  constructor() {
    this.loadingManager = new LoadingManager()
    this.typingAnimation = new TypingAnimation()
    this.notificationManager = new NotificationManager()
    this.fontSystem = new AdvancedFontSystem()
    this.pageManager = new PageManager()
    this.pageTransitionManager = new PageTransitionManager()
    this.animeBackground = new AnimeAuraBackground()
    this.animeDemo = new AnimeThemeDemo()
    this.app = new Application()
    this.downloadManager = new DownloadManager(this.app.getEventEmitter())

    this.loadingManager.applyModernStyling()
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Cbot Website...')

      await this.loadingManager.startLoading()

      await this.app.initialize()

      const downloadInitPromise = this.downloadManager.initialize()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Download manager initialization timeout')), 15000)
      )

      try {
        await Promise.race([downloadInitPromise, timeoutPromise])
      } catch (downloadError) {
        console.warn('⚠️ Download manager initialization failed, continuing anyway:', downloadError)
      }

      await this.hideLoadingScreen()

      this.setupEventListeners()
      this.setupDownloadEventListeners()
      this.setupPageTransitions()
      this.setupKeyboardShortcuts()

      setTimeout(() => {
        const release = this.downloadManager.getLatestRelease()
        if (release) {
          this.updateDownloadSection(release)
        }
      }, 300)

      this.startTypingAnimations()

      console.log('✅ Cbot Website initialized successfully!')
    } catch (error) {
      console.error('❌ Failed to initialize Cbot Website:', error)
      this.handleInitializationError(error)
    }
  }

  async simulateLoading() {
    const loadingScreen = document.getElementById('loading-screen')
    if (!loadingScreen) return

    const progressFill = loadingScreen.querySelector('.progress-fill')
    const loadingStatus = loadingScreen.querySelector('.loading-status')

    const steps = [
      { progress: 20, status: 'Loading modules...', delay: 150 },
      { progress: 40, status: 'Initializing components...', delay: 150 },
      { progress: 60, status: 'Setting up animations...', delay: 150 },
      { progress: 80, status: 'Preparing interface...', delay: 150 },
      { progress: 100, status: 'Ready!', delay: 100 }
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

  async hideLoadingScreen() {
    return new Promise((resolve) => {
      this.loadingManager.hideLoading()

      const app = document.getElementById('app')
      if (app) {
        app.style.display = 'block'
        app.style.opacity = '0'
        app.style.transition = 'opacity 0.5s ease-in'
        app.classList.add('loaded')

        setTimeout(() => {
          app.style.opacity = '1'
          resolve()
        }, 100)
      } else {
        setTimeout(resolve, 800)
      }
    })
  }

  startTypingAnimations() {
    this.setupAdvancedFonts()

    const typingElements = document.querySelectorAll('.typing-text')

    typingElements.forEach((element, index) => {
      const htmlElement = element
      const text = htmlElement.dataset.text || ''
      const delay = parseInt(htmlElement.dataset.delay || '0') + (index * 200)
      const effect = htmlElement.dataset.effect || 'typewriter'

      if (htmlElement.classList.contains('gradient-text')) {
        this.fontSystem.applyEffect(htmlElement, {
          type: 'gradient',
          properties: {
            colors: ['#00d4ff', '#7c3aed', '#f59e0b'],
            gradient: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #f59e0b 100%)'
          }
        })
      }

      setTimeout(() => {
        this.typingAnimation.animate(htmlElement, text, {
          speed: 60,
          cursor: true,
          effect: effect,
          cursorStyle: 'line',
          randomDelay: true,
          highlightWords: ['Cbot', 'Geometry Dash', 'Automation'],
          soundEnabled: false
        })
      }, delay)
    })

    this.setupAdvancedFonts()

    const codeElement = document.querySelector('.typing-code')
    if (codeElement) {
      const codeText = codeElement.dataset.text || ''
      setTimeout(() => {
        this.typingAnimation.animate(codeElement, codeText, {
          speed: 40,
          cursor: false,
          effect: 'matrix',
          randomDelay: true
        })
      }, 4000)
    }

    this.startContinuousAnimations()
  }

  setupAdvancedFonts() {
    this.fontSystem.loadResponsiveFonts({
      breakpoints: {
        '320': {
          family: 'Rajdhani',
          weight: 700,
          style: 'normal',
          size: 'clamp(2rem, 8vw, 4rem)',
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          textTransform: 'none',
          fallbacks: ['sans-serif'],
          loadTimeout: 1000
        },
        '768': {
          family: 'Rajdhani',
          weight: 700,
          style: 'normal',
          size: 'clamp(3rem, 6vw, 5rem)',
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          textTransform: 'none',
          fallbacks: ['sans-serif'],
          loadTimeout: 1000
        },
        '1024': {
          family: 'Rajdhani',
          weight: 700,
          style: 'normal',
          size: 'clamp(4rem, 5vw, 6rem)',
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          textTransform: 'none',
          fallbacks: ['sans-serif'],
          loadTimeout: 1000
        }
      },
      scaleFactor: 1.2,
      minSize: '2rem',
      maxSize: '6rem'
    })

    const heroTitle = document.querySelector('.hero-title .gradient-text')
    if (heroTitle) {
      this.fontSystem.applyEffect(heroTitle, {
        type: 'glow',
        properties: { intensity: 1 }
      })
    }

    this.fontSystem.optimizeForPerformance()
  }

  startContinuousAnimations() {
    const heroTitle = document.querySelector('.hero-title .gradient-text')
    if (heroTitle) {
      this.fontSystem.startContinuousAnimation(heroTitle, {
        type: 'pulse',
        duration: 3000,
        intensity: 0.3
      })
    }
  }

  handleInitializationError(error) {
    console.error('Initialization failed:', error)

    const loadingScreen = document.getElementById('loading-screen')
    const app = document.getElementById('app')

    if (loadingScreen) {
      loadingScreen.style.display = 'none'
    }

    if (app) {
      app.style.display = 'block'
      app.style.opacity = '1'
    }

    this.notificationManager.show('Failed to load some features. The website may not work properly.', 'error')
  }

  setupEventListeners() {
    const getStartedBtn = document.getElementById('get-started')
    const learnMoreBtn = document.getElementById('learn-more')
    const downloadModBtn = document.getElementById('download-mod')

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

    if (downloadModBtn) {
      downloadModBtn.addEventListener('click', () => {
        this.handleDownloadRedirect()
      })
    }

    this.setupNavigation()
    this.setupStatsAnimation()
    this.setupThemeToggle()
  }

  setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle')
    const navMenu = document.querySelector('.nav-menu')

    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active')
        navToggle.classList.toggle('active')
      })
    }
  }

  setupStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number')

    const animateStats = () => {
      statNumbers.forEach(stat => {
        const target = parseInt(stat.dataset.target || '0')
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

  handleGetStarted() {
    window.location.href = '/features.html'
  }

  handleLearnMore() {
    window.location.href = '/about.html'
  }

  handleDownloadRedirect() {
    window.location.href = '/download.html'
  }

  showNotification(message, type = 'info', options = {}) {
    return this.notificationManager.show({
      message,
      type,
      title: options.title,
      duration: options.duration || 5000,
      position: options.position || 'top-right',
      animation: options.animation || 'slide',
      sound: options.sound !== false,
      actions: options.actions,
      ...options
    })
  }

  setupDownloadEventListeners() {
    const eventEmitter = this.app.getEventEmitter()

    eventEmitter.on('download:initialized', (data) => {
      console.log('📦 Download section initialized with release data')
      this.updateDownloadSection(data.release)
      this.updateModStatus('Ready')

      setTimeout(() => {
        this.updateDownloadSection(data.release)
      }, 100)
    })

    eventEmitter.on('download:release-fetched', (release) => {
      console.log('📦 Download section updated with new release data')
      this.updateDownloadSection(release)
    })

    eventEmitter.on('download:started', (data) => {
      this.showNotification(`Starting download of ${data.total} files...`, 'loading', {
        title: 'Download Started',
        persistent: true,
        id: 'download-progress'
      })
      this.setDownloadButtonsLoading(true)
    })

    eventEmitter.on('download:progress', (data) => {
      const progress = Math.round((data.current / data.total) * 100)
      this.notificationManager.updateProgress('download-progress', progress)

      if (data.current === data.total) {
        this.showNotification('All files downloaded successfully!', 'success', {
          title: 'Download Complete',
          animation: 'bounce'
        })
      }
    })

    eventEmitter.on('download:completed', () => {
      this.notificationManager.hide('download-progress')
      this.showNotification('All files downloaded successfully!', 'success', {
        title: 'Download Complete',
        animation: 'bounce',
        actions: [
          {
            id: 'open-folder',
            label: 'Open Folder',
            type: 'primary',
            callback: () => this.showNotification('Files saved to Downloads folder', 'info')
          }
        ]
      })
      this.setDownloadButtonsLoading(false)
    })

    eventEmitter.on('download:error', (errorData) => {
      this.notificationManager.hide('download-progress')

      const message = typeof errorData === 'string' ? errorData : errorData.message
      const hasAction = typeof errorData === 'object' && errorData.action === 'redirect'

      this.showNotification(message, 'error', {
        title: 'Download Failed',
        duration: hasAction ? 3000 : 0,
        actions: [
          {
            id: 'retry',
            label: 'Retry Download',
            type: 'primary',
            callback: () => this.downloadManager.downloadAsset()
          },
          {
            id: 'github',
            label: 'Open GitHub Releases',
            type: 'secondary',
            callback: () => window.open('https://github.com/therealsnopphin/CBot/releases', '_blank')
          }
        ]
      })
    })
  }

  updateDownloadSection(release) {
    if (!release) return

    const downloadSection = document.getElementById('download')
    if (downloadSection) {
      this.updateExistingDownloadSection(release, downloadSection)
    }
  }

  updateExistingDownloadSection(release, section) {
    const releaseDate = this.downloadManager.formatReleaseDate(release.published_at)
    const totalSize = this.downloadManager.getTotalDownloadSize()

    const titleElement = section.querySelector('.download-title')
    if (titleElement) {
      titleElement.textContent = release.name
      titleElement.classList.remove('loading')
    }

    const dateElement = section.querySelector('.release-date')
    if (dateElement) {
      dateElement.textContent = `Released: ${releaseDate}`
    }

    const sizeElement = section.querySelector('.download-size')
    if (sizeElement) {
      sizeElement.textContent = `Size: ${totalSize}`
    }
  }

  updateModStatus(status) {
    const statusButton = document.getElementById('mod-status')
    if (statusButton) {
      statusButton.textContent = `Status: ${status}`
    }
  }

  setDownloadButtonsLoading(loading) {
    const buttons = document.querySelectorAll('.download-btn, .cta-button')
    buttons.forEach(button => {
      if (loading) {
        button.classList.add('loading')
        button.disabled = true
      } else {
        button.classList.remove('loading')
        button.disabled = false
      }
    })
  }

  setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle')
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark'
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
      })
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            this.showNotification('Search functionality coming soon!', 'info')
            break
          case '/':
            e.preventDefault()
            this.showNotification('Help: Ctrl+K for search, Ctrl+D for download', 'info')
            break
          case 'd':
            e.preventDefault()
            const downloadBtn = document.querySelector('.download-btn')
            if (downloadBtn) downloadBtn.click()
            break
        }
      }
    })
  }

  restartTypingAnimations() {
    this.typingAnimation.stopAllAnimations()
    setTimeout(() => {
      this.startTypingAnimations()
    }, 300)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const main = new Main()

  const initTimeout = setTimeout(() => {
    console.error('❌ Application initialization timed out')
    const loadingScreen = document.getElementById('loading-screen')
    const app = document.getElementById('app')

    if (loadingScreen) {
      loadingScreen.style.display = 'none'
    }

    if (app) {
      app.style.display = 'block'
      app.style.opacity = '1'
    }

    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 10000;
    `
    errorDiv.textContent = 'Loading timed out. Some features may not work. Please refresh the page.'
    document.body.appendChild(errorDiv)
  }, 20000)

  main.initialize().finally(() => {
    clearTimeout(initTimeout)
  })
})

if (import.meta.hot) {
  import.meta.hot.accept()
}
