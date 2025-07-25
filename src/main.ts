import './styles/main.css'
import { Application } from './app/Application'
import { DownloadManager } from './app/CbotManager'
import { LoadingManager } from './utils/LoadingManager'
import { TypingAnimation } from './utils/TypingAnimation'

class Main {
  private app: Application
  private downloadManager: DownloadManager
  private loadingManager: LoadingManager
  private typingAnimation: TypingAnimation

  constructor() {
    this.loadingManager = new LoadingManager()
    this.typingAnimation = new TypingAnimation()
    this.app = new Application()
    this.downloadManager = new DownloadManager(this.app.getEventEmitter())
  }

  async initialize(): Promise<void> {
    try {
      await this.showLoadingScreen()

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
    this.scrollToSection('features')
    this.showNotification('Explore Cbot features below!', 'info')
  }

  private handleLearnMore(): void {
    this.scrollToSection('about')
    this.showNotification('Learn more about Cbot', 'info')
  }

  private handleDownloadRedirect(): void {
    this.scrollToSection('download')
    this.showNotification('Redirecting to download section...', 'info')
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

  private setupDownloadEventListeners(): void {
    const eventEmitter = this.app.getEventEmitter()

    eventEmitter.on('download:initialized', (data) => {
      this.updateDownloadSection(data.release)
      this.updateModStatus('Ready')
    })

    eventEmitter.on('download:release-fetched', (release) => {
      this.updateDownloadSection(release)
    })

    eventEmitter.on('download:started', (data) => {
      this.showNotification(`Starting download of ${data.total} files...`, 'info')
      this.setDownloadButtonsLoading(true)
    })

    eventEmitter.on('download:progress', (data) => {
      this.showNotification(`Downloaded ${data.current}/${data.total}: ${data.fileName}`, 'info')
    })

    eventEmitter.on('download:completed', () => {
      this.showNotification('All files downloaded successfully!', 'success')
      this.setDownloadButtonsLoading(false)
    })

    eventEmitter.on('download:error', (error) => {
      this.showNotification(`Download error: ${error}`, 'error')
    })

    eventEmitter.on('download:demo', (message) => {
      this.showNotification(message, 'info')
    })
  }

  private updateDownloadSection(release: any): void {
    if (!release) return

    this.createDownloadSection(release)
  }

  private createDownloadSection(release: any): void {
    const downloadSection = document.getElementById('download')
    if (!downloadSection) {
      this.addDownloadSectionToHTML(release)
    } else {
      this.updateExistingDownloadSection(release, downloadSection)
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
    const container = section.querySelector('.container')
    if (container) {
      container.innerHTML = this.generateDownloadContent(release)
      this.setupDownloadButtons()
    }
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
