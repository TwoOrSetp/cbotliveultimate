import './styles/main.css'
import { Application } from './app/Application'
import { DownloadManager } from './app/CbotManager'
import { LoadingManager } from './utils/LoadingManager'
import { TypingAnimation } from './utils/TypingAnimation'
import { NotificationManager } from './utils/NotificationManager'
import { AdvancedFontSystem } from './utils/AdvancedFontSystem'
import { PageManager } from './utils/PageManager'

class Main {
  private app: Application
  private downloadManager: DownloadManager
  private loadingManager: LoadingManager
  private typingAnimation: TypingAnimation
  private notificationManager: NotificationManager
  private fontSystem: AdvancedFontSystem
  private pageManager: PageManager

  constructor() {
    this.loadingManager = new LoadingManager()
    this.typingAnimation = new TypingAnimation()
    this.notificationManager = new NotificationManager()
    this.fontSystem = new AdvancedFontSystem()
    this.pageManager = new PageManager()
    this.app = new Application()
    this.downloadManager = new DownloadManager(this.app.getEventEmitter())
  }





  async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Cbot Website...')

      // Start advanced loading process
      await this.loadingManager.startLoading()

      // Initialize app first (this should always succeed)
      await this.app.initialize()

      // Initialize download manager with timeout protection
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
      this.startTypingAnimations()
      this.setupEventListeners()
      this.setupDownloadEventListeners()
      this.setupPageTransitions()

      // Force update download section after a short delay
      setTimeout(() => {
        const release = this.downloadManager.getLatestRelease()
        if (release) {
          this.updateDownloadSection(release)
        }
      }, 1000)

      console.log('🚀 Cbot Website initialized successfully!')
    } catch (error) {
      console.error('❌ Failed to initialize application:', error)

      // Force hide loading screen even on error
      await this.hideLoadingScreen()
      this.showErrorMessage('Some features may not work properly. Please refresh the page.')
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
    return new Promise((resolve) => {
      this.loadingManager.hideLoading()

      const app = document.getElementById('app')
      if (app) {
        app.style.display = 'block'
        app.style.opacity = '0'
        app.style.transition = 'opacity 0.5s ease-in'

        setTimeout(() => {
          app.style.opacity = '1'
          resolve()
        }, 100)
      } else {
        setTimeout(resolve, 800) // Wait for CSS transition
      }
    })
  }

  private startTypingAnimations(): void {
    // Apply advanced font effects first
    this.setupAdvancedFonts()

    const typingElements = document.querySelectorAll('.typing-text')

    typingElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const text = htmlElement.dataset.text || ''
      const delay = parseInt(htmlElement.dataset.delay || '0') + (index * 800)
      const effect = htmlElement.dataset.effect || 'typewriter'

      // Apply font effects based on element
      if (htmlElement.classList.contains('gradient-text')) {
        this.fontSystem.applyEffect(htmlElement, {
          name: 'gradient',
          type: 'gradient',
          properties: {
            gradient: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #f59e0b 100%)'
          }
        })
      }

      setTimeout(() => {
        this.typingAnimation.animate(htmlElement, text, {
          speed: 60,
          cursor: true,
          effect: effect as any,
          cursorStyle: 'line',
          randomDelay: true,
          highlightWords: ['Cbot', 'Geometry Dash', 'Automation'],
          soundEnabled: false
        })
      }, delay)
    })

    this.setupAdvancedFonts()

    const codeElement = document.querySelector('.typing-code') as HTMLElement
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

  private setupAdvancedFonts(): void {
    // Load custom fonts
    this.fontSystem.loadFont('Rajdhani', { weight: '300 700' })
    this.fontSystem.loadFont('Orbitron', { weight: '400 900' })
    this.fontSystem.loadFont('JetBrains Mono', { weight: '400 600' })

    // Apply responsive font configurations
    this.fontSystem.setResponsiveFont('.hero-title', {
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
          loadTimeout: 3000
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
          loadTimeout: 3000
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
          loadTimeout: 3000
        }
      },
      scaleFactor: 1.2,
      minSize: '2rem',
      maxSize: '6rem'
    })

    // Apply effects to key elements
    const heroTitle = document.querySelector('.hero-title .gradient-text') as HTMLElement
    if (heroTitle) {
      this.fontSystem.applyEffect(heroTitle, {
        name: 'neon',
        type: 'glow',
        properties: { intensity: 1.5 }
      })
    }

    const brandText = document.querySelector('.brand-text') as HTMLElement
    if (brandText) {
      this.fontSystem.applyEffect(brandText, {
        name: 'glow',
        type: 'glow',
        properties: { intensity: 1 }
      })
    }

    // Optimize performance for animations
    this.fontSystem.optimizeForPerformance()
  }

  private startContinuousAnimations(): void {
    const heroTitle = document.querySelector('.hero-title .gradient-text') as HTMLElement
    if (heroTitle) {
      setInterval(() => {
        if (!this.typingAnimation.isAnimating(heroTitle)) {
          const effects = ['glitch', 'wave', 'matrix']
          const randomEffect = effects[Math.floor(Math.random() * effects.length)]

          this.typingAnimation.animate(heroTitle, heroTitle.dataset.text || 'Geometry Dash Automation', {
            speed: 80,
            cursor: false,
            effect: randomEffect as any,
            highlightWords: ['Geometry Dash', 'Automation']
          })
        }
      }, 15000)
    }
  }

  private setupEventListeners(): void {
    const getStartedBtn = document.getElementById('start-bot')
    const learnMoreBtn = document.getElementById('open-settings')
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
    this.setupScrollEffects()
    this.setupStatsAnimation()
    this.setupThemeToggle()
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

      console.log(`📍 Scrolling to section: ${sectionId} at position: ${targetPosition}`)

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })

      // Highlight the section briefly
      section.style.boxShadow = '0 0 20px var(--color-primary)'
      setTimeout(() => {
        section.style.boxShadow = ''
      }, 2000)
    } else {
      console.warn(`⚠️ Section '${sectionId}' not found`)
      this.showNotification(`Section '${sectionId}' not found`, 'error')
    }
  }

  private handleGetStarted(): void {
    this.scrollToSection('features')
    this.showNotification('Explore Cbot features below!', 'info')
  }

  private handleLearnMore(): void {
    this.scrollToSection('about')
    this.showNotification('Learn more about Cbot', 'info')
  }

  private handleDownloadRedirect(): void {
    // Check if download section exists, if not create it first
    const downloadSection = document.getElementById('download')
    if (!downloadSection) {
      // Force create download section with latest release data
      const release = this.downloadManager.getLatestRelease()
      if (release) {
        this.addDownloadSectionToHTML(release)
      } else {
        this.showNotification('Loading download information...', 'info')
        // Wait for release data and then scroll
        setTimeout(() => {
          const updatedRelease = this.downloadManager.getLatestRelease()
          if (updatedRelease) {
            this.addDownloadSectionToHTML(updatedRelease)
            setTimeout(() => this.scrollToSection('download'), 100)
          } else {
            this.showNotification('Download information not available. Please try again.', 'error')
          }
        }, 1000)
        return
      }
    }

    // Scroll to download section
    setTimeout(() => {
      this.scrollToSection('download')
      this.showNotification('Download section loaded!', 'success')
    }, 100)
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info' | 'warning' | 'loading' = 'info', options?: any): string {
    return this.notificationManager.show({
      message,
      type,
      title: options?.title,
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      animation: options?.animation || 'slide',
      sound: options?.sound !== false,
      actions: options?.actions,
      ...options
    })
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

  private setupDownloadEventListeners(): void {
    const eventEmitter = this.app.getEventEmitter()

    eventEmitter.on('download:initialized', (data) => {
      console.log('📦 Download section initialized with release data')
      this.updateDownloadSection(data.release)
      this.updateModStatus('Ready')

      // Force update the download section immediately
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
            type: 'primary' as const,
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
            type: 'primary' as const,
            callback: () => this.downloadManager.downloadAsset()
          },
          {
            id: 'github',
            label: 'Open GitHub Releases',
            type: 'secondary' as const,
            callback: () => window.open('https://github.com/therealsnopphin/CBot/releases', '_blank')
          }
        ]
      })
    })

    eventEmitter.on('download:demo', (demoData) => {
      const message = typeof demoData === 'string' ? demoData : demoData.message
      const fileName = typeof demoData === 'object' ? demoData.fileName : 'files'

      this.showNotification(
        `Demo Mode: ${fileName} will be available on GitHub releases page`,
        'info',
        {
          title: 'Demo Download',
          duration: 4000,
          actions: [
            {
              id: 'github',
              label: 'View on GitHub',
              type: 'primary' as const,
              callback: () => window.open('https://github.com/therealsnopphin/CBot/releases', '_blank')
            }
          ]
        }
      )
    })

    eventEmitter.on('download:fallback', (fallbackData) => {
      this.showNotification(
        `Download initiated for ${fallbackData.fileName}. If download doesn't start, use the GitHub link.`,
        'warning',
        {
          title: 'Download Started',
          duration: 6000,
          actions: [
            {
              id: 'github-fallback',
              label: 'Open GitHub Releases',
              type: 'primary' as const,
              callback: () => window.open(fallbackData.fallbackUrl, '_blank')
            },
            {
              id: 'retry-download',
              label: 'Retry Download',
              type: 'secondary' as const,
              callback: () => {
                if (fallbackData.url) {
                  window.open(fallbackData.url, '_blank')
                }
              }
            }
          ]
        }
      )
    })

    eventEmitter.on('download:demo', (message) => {
      this.showNotification(message, 'info')
    })
  }

  private updateDownloadSection(release: any): void {
    if (!release) return

    const downloadSection = document.getElementById('download')
    if (downloadSection) {
      this.updateExistingDownloadSection(release, downloadSection)
    } else {
      this.addDownloadSectionToHTML(release)
    }
  }

  private updateModStatus(status: string): void {
    const statusButton = document.getElementById('mod-status')
    if (statusButton) {
      statusButton.textContent = `Status: ${status}`
    }
  }

  private addDownloadSectionToHTML(release: any): void {
    const aboutSection = document.getElementById('about')
    if (!aboutSection) return

    const downloadHTML = this.generateDownloadHTML(release)
    aboutSection.insertAdjacentHTML('beforebegin', downloadHTML)

    this.setupDownloadButtons()
  }

  private updateExistingDownloadSection(release: any, section: HTMLElement): void {
    const releaseDate = this.downloadManager.formatReleaseDate(release.published_at)
    const totalSize = this.downloadManager.getTotalDownloadSize()

    // Update title - remove loading state
    const titleElement = section.querySelector('.download-title')
    if (titleElement) {
      titleElement.textContent = release.name
      titleElement.classList.remove('loading')
    }

    // Update tag
    const tagElement = section.querySelector('.download-tag')
    if (tagElement) tagElement.textContent = release.tag_name

    // Update info
    const dateElement = section.querySelector('.download-date')
    if (dateElement) dateElement.textContent = `Released: ${releaseDate}`

    const sizeElement = section.querySelector('.download-size')
    if (sizeElement) sizeElement.textContent = `Total Size: ${totalSize}`

    const assetsElement = section.querySelector('.download-assets')
    if (assetsElement) assetsElement.textContent = `${release.assets.length} files available`

    // Update description
    const descElement = section.querySelector('.download-description p')
    if (descElement) descElement.textContent = this.formatReleaseBody(release.body)

    // Update download all button - remove loading state
    const downloadAllBtn = section.querySelector('#download-all') as HTMLButtonElement
    if (downloadAllBtn) {
      downloadAllBtn.textContent = 'Download All Files'
      downloadAllBtn.disabled = false
      downloadAllBtn.classList.remove('loading')
    }

    // Update files list - replace loading content
    const filesListElement = section.querySelector('.files-list')
    if (filesListElement) {
      filesListElement.innerHTML = release.assets.map((asset: any) => `
        <div class="file-item">
          <span class="file-name">${asset.name}</span>
          <span class="file-size">${this.downloadManager.formatFileSize(asset.size)}</span>
          <button class="btn btn-outline btn-small download-file" data-asset="${asset.name}">
            Download
          </button>
        </div>
      `).join('')
    }

    // Update files header
    const filesHeaderElement = section.querySelector('.download-files h4')
    if (filesHeaderElement) {
      filesHeaderElement.textContent = 'Individual Files:'
    }

    // Remove any loading indicators
    const loadingElements = section.querySelectorAll('.loading, [class*="loading"]')
    loadingElements.forEach(el => {
      if (el.classList.contains('loading')) {
        el.classList.remove('loading')
      }
    })

    this.setupDownloadButtons()
    console.log('✅ Download section updated successfully')

    // Show success notification
    this.showNotification('Download section loaded successfully!', 'success', {
      title: 'Ready to Download',
      duration: 3000
    })
  }

  private generateDownloadHTML(release: any): string {
    return `
      <section id="download" class="download-section">
        <div class="container">
          ${this.generateDownloadContent(release)}
        </div>
      </section>
    `
  }

  private generateDownloadContent(release: any): string {
    const releaseDate = this.downloadManager.formatReleaseDate(release.published_at)
    const totalSize = this.downloadManager.getTotalDownloadSize()

    return `
      <h2 class="section-title">Download Cbot</h2>
      <div class="download-card">
        <div class="download-header">
          <h3 class="download-title">${release.name}</h3>
          <span class="download-tag">${release.tag_name}</span>
        </div>
        <div class="download-info">
          <p class="download-date">Released: ${releaseDate}</p>
          <p class="download-size">Total Size: ${totalSize}</p>
          <p class="download-assets">${release.assets.length} files available</p>
        </div>
        <div class="download-description">
          <p>${this.formatReleaseBody(release.body)}</p>
        </div>
        <div class="download-actions">
          <button class="btn btn-primary btn-large" id="download-all">
            Download All Files
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"/>
            </svg>
          </button>
          <a href="${release.html_url}" target="_blank" class="btn btn-outline btn-large">
            View on GitHub
          </a>
        </div>
        <div class="download-files">
          <h4>Individual Files:</h4>
          <div class="files-list">
            ${release.assets.map((asset: any) => `
              <div class="file-item">
                <span class="file-name">${asset.name}</span>
                <span class="file-size">${this.downloadManager.formatFileSize(asset.size)}</span>
                <button class="btn btn-outline btn-small download-file" data-asset="${asset.name}">
                  Download
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `
  }

  private formatReleaseBody(body: string): string {
    if (!body) return 'Latest release of Cbot with improvements and bug fixes.'

    return body.split('\n')[0] || body.substring(0, 200) + (body.length > 200 ? '...' : '')
  }

  private setupDownloadButtons(): void {
    const downloadAllBtn = document.getElementById('download-all')
    if (downloadAllBtn) {
      downloadAllBtn.addEventListener('click', async () => {
        try {
          this.showNotification('Starting download...', 'info')
          await this.downloadManager.downloadAsset()
        } catch (error) {
          console.error('Download failed:', error)
          this.showNotification('Download failed. Redirecting to GitHub...', 'error')
          setTimeout(() => {
            window.open('https://github.com/therealsnopphin/CBot/releases', '_blank')
          }, 2000)
        }
      })
    }

    const downloadFileButtons = document.querySelectorAll('.download-file')
    downloadFileButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const assetName = (e.target as HTMLElement).dataset.asset
        if (assetName) {
          try {
            this.showNotification(`Downloading ${assetName}...`, 'info')
            await this.downloadManager.downloadAsset(assetName)
          } catch (error) {
            console.error('Download failed:', error)
            this.showNotification('Download failed. Redirecting to GitHub...', 'error')
            setTimeout(() => {
              window.open('https://github.com/therealsnopphin/CBot/releases', '_blank')
            }, 2000)
          }
        }
      })
    })

    // Add GitHub redirect button functionality
    const githubButtons = document.querySelectorAll('a[href*="github.com"]')
    githubButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault()
        this.showNotification('Opening GitHub releases page...', 'info')
        window.open('https://github.com/therealsnopphin/CBot/releases', '_blank')
      })
    })
  }

  private setDownloadButtonsLoading(isLoading: boolean): void {
    const downloadAllBtn = document.getElementById('download-all')
    const downloadFileButtons = document.querySelectorAll('.download-file')

    if (downloadAllBtn) {
      const button = downloadAllBtn as HTMLButtonElement
      button.disabled = isLoading
      if (isLoading) {
        button.textContent = 'Downloading...'
        button.classList.add('loading')
      } else {
        button.textContent = 'Download All Files'
        button.classList.remove('loading')
      }
    }

    downloadFileButtons.forEach(btn => {
      const button = btn as HTMLButtonElement
      button.disabled = isLoading
      if (isLoading) {
        button.textContent = 'Downloading...'
        button.classList.add('loading')
      } else {
        button.textContent = 'Download'
        button.classList.remove('loading')
      }
    })
  }

  private setupThemeToggle(): void {
    const themeToggle = document.getElementById('theme-toggle')
    const themeManager = this.app.getThemeManager()

    if (themeToggle && themeManager) {
      // Set initial theme to Halo
      const savedTheme = themeManager.getThemePreference()
      const initialTheme = savedTheme === 'auto' ? 'halo' : savedTheme
      themeManager.setTheme(initialTheme as any)
      this.updateThemeToggleState(initialTheme)

      // Add click handlers for each theme option
      const themeOptions = themeToggle.querySelectorAll('.theme-option')
      themeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
          e.stopPropagation()
          const selectedTheme = (option as HTMLElement).dataset.theme
          if (selectedTheme) {
            themeManager.setTheme(selectedTheme as any)
            this.updateThemeToggleState(selectedTheme)
            this.showNotification(`Switched to ${selectedTheme} theme!`, 'success')

            // Add click effect
            option.classList.add('clicked')
            setTimeout(() => option.classList.remove('clicked'), 200)
          }
        })
      })

      // Listen for theme changes
      themeManager.onThemeChange((theme) => {
        this.updateThemeEffects(theme)
        this.updateThemeToggleState(theme)
      })
    }
  }

  private updateThemeToggleState(theme: string): void {
    const themeOptions = document.querySelectorAll('.theme-option')
    themeOptions.forEach(option => {
      const optionTheme = (option as HTMLElement).dataset.theme
      if (optionTheme === theme) {
        option.classList.add('active')
      } else {
        option.classList.remove('active')
      }
    })
  }

  private updateThemeEffects(theme: string): void {
    const body = document.body

    // Add theme transition effect
    body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'

    // Update gradient orbs based on theme
    const orbs = document.querySelectorAll('.gradient-orb')
    orbs.forEach((orb, index) => {
      const htmlOrb = orb as HTMLElement
      if (theme === 'light') {
        htmlOrb.style.opacity = '0.2'
        htmlOrb.style.filter = 'blur(40px)'
      } else {
        htmlOrb.style.opacity = '0.3'
        htmlOrb.style.filter = 'blur(60px)'
      }
    })

    // Restart typing animations with theme-appropriate effects
    setTimeout(() => {
      this.restartTypingAnimations()
    }, 300)
  }

  private setupPageTransitions(): void {
    // Add page transition effects
    this.pageManager.onTransition((transition) => {
      console.log(`🔄 Page transition: ${transition.from} → ${transition.to} (${transition.direction})`)

      // Show notification for page changes (optional)
      if (transition.to !== 'home') {
        this.showNotification(`Navigated to ${transition.to.charAt(0).toUpperCase() + transition.to.slice(1)}`, 'info', {
          title: 'Page Navigation',
          duration: 2000
        })
      }

      // Restart typing animations on new page
      setTimeout(() => {
        this.startTypingAnimations()
      }, 300)
    })

    // Handle initial page load from URL
    const currentHash = window.location.hash.slice(1)
    if (currentHash && currentHash !== 'home') {
      setTimeout(() => {
        this.pageManager.navigateToPage(currentHash, false)
      }, 1000)
    }
  }

  private restartTypingAnimations(): void {
    const heroTitle = document.querySelector('.hero-title .gradient-text') as HTMLElement
    if (heroTitle && !this.typingAnimation.isAnimating(heroTitle)) {
      const currentTheme = document.documentElement.getAttribute('data-theme')
      const effect = currentTheme === 'light' ? 'fade' : 'glitch'

      this.typingAnimation.animate(heroTitle, heroTitle.dataset.text || 'Cbot MRBEAST', {
        speed: 60,
        cursor: false,
        effect: effect as any,
        highlightWords: ['Geometry Dash', 'Automation']
      })
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const main = new Main()

  // Add a maximum timeout for the entire initialization
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

    // Show error message
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 1rem;
      border-radius: 8px;
      z-index: 10000;
    `
    errorDiv.textContent = 'Loading timed out. Some features may not work. Please refresh the page.'
    document.body.appendChild(errorDiv)
  }, 20000) // 20 second maximum timeout

  main.initialize().finally(() => {
    clearTimeout(initTimeout)
  })
})

if (import.meta.hot) {
  import.meta.hot.accept()
}
