export interface TransitionConfig {
  duration: number
  easing: string
  direction: 'fade' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
}

export class PageTransitionManager {
  private isTransitioning = false
  private transitionOverlay: HTMLElement | null = null
  private defaultConfig: TransitionConfig = {
    duration: 600,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    direction: 'fade'
  }

  constructor() {
    this.createTransitionOverlay()
    this.setupNavigationInterception()
  }

  private createTransitionOverlay(): void {
    this.transitionOverlay = document.createElement('div')
    this.transitionOverlay.id = 'page-transition'
    this.transitionOverlay.className = 'page-transition'
    this.transitionOverlay.innerHTML = `
      <div class="transition-content">
        <div class="transition-logo">
          <img src="/cbot.png" alt="Cbot" class="transition-logo-img">
          <div class="transition-spinner"></div>
        </div>
        <div class="transition-text">Loading...</div>
      </div>
    `
    document.body.appendChild(this.transitionOverlay)
  }

  private setupNavigationInterception(): void {
    // Intercept all navigation links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && this.shouldInterceptLink(link)) {
        e.preventDefault()
        this.navigateToPage(link.href, link.textContent || 'Loading...')
      }
    })

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      if (!this.isTransitioning) {
        this.navigateToPage(window.location.href, 'Loading...', false)
      }
    })
  }

  private shouldInterceptLink(link: HTMLAnchorElement): boolean {
    const href = link.href
    const currentOrigin = window.location.origin
    
    // Only intercept internal links
    if (!href.startsWith(currentOrigin)) {
      return false
    }
    
    // Don't intercept links with target="_blank"
    if (link.target === '_blank') {
      return false
    }
    
    // Don't intercept hash links on the same page
    if (href.includes('#') && href.split('#')[0] === window.location.href.split('#')[0]) {
      return false
    }
    
    return true
  }

  public async navigateToPage(
    url: string, 
    loadingText: string = 'Loading...', 
    updateHistory: boolean = true
  ): Promise<void> {
    if (this.isTransitioning) {
      return
    }

    this.isTransitioning = true

    try {
      // Update loading text
      const transitionTextElement = this.transitionOverlay?.querySelector('.transition-text')
      if (transitionTextElement) {
        transitionTextElement.textContent = loadingText
      }

      // Show transition overlay
      await this.showTransition()

      // Fetch the new page
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load page: ${response.status}`)
      }

      const html = await response.text()
      
      // Parse the new page
      const parser = new DOMParser()
      const newDoc = parser.parseFromString(html, 'text/html')
      
      // Update the page content
      await this.updatePageContent(newDoc)
      
      // Update browser history
      if (updateHistory) {
        history.pushState({ url }, '', url)
      }

      // Hide transition overlay
      await this.hideTransition()

    } catch (error) {
      console.error('Page transition failed:', error)
      
      // Fallback to normal navigation
      window.location.href = url
    } finally {
      this.isTransitioning = false
    }
  }

  private async showTransition(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.transitionOverlay) {
        resolve()
        return
      }

      this.transitionOverlay.style.display = 'flex'
      this.transitionOverlay.style.opacity = '0'
      
      // Force reflow
      this.transitionOverlay.offsetHeight
      
      this.transitionOverlay.style.transition = `opacity ${this.defaultConfig.duration}ms ${this.defaultConfig.easing}`
      this.transitionOverlay.style.opacity = '1'
      
      setTimeout(resolve, this.defaultConfig.duration)
    })
  }

  private async hideTransition(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.transitionOverlay) {
        resolve()
        return
      }

      this.transitionOverlay.style.opacity = '0'
      
      setTimeout(() => {
        if (this.transitionOverlay) {
          this.transitionOverlay.style.display = 'none'
        }
        resolve()
      }, this.defaultConfig.duration)
    })
  }

  private async updatePageContent(newDoc: Document): Promise<void> {
    // Update title
    document.title = newDoc.title

    // Update meta tags
    this.updateMetaTags(newDoc)

    // Update main content
    const currentMain = document.querySelector('main')
    const newMain = newDoc.querySelector('main')
    
    if (currentMain && newMain) {
      currentMain.innerHTML = newMain.innerHTML
    }

    // Update navigation active states
    this.updateNavigationStates(newDoc)

    // Reinitialize page-specific scripts
    await this.reinitializeScripts()

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  private updateMetaTags(newDoc: Document): void {
    // Update description
    const currentDesc = document.querySelector('meta[name="description"]')
    const newDesc = newDoc.querySelector('meta[name="description"]')
    
    if (currentDesc && newDesc) {
      currentDesc.setAttribute('content', newDesc.getAttribute('content') || '')
    }

    // Update other meta tags as needed
    const metaTags = ['keywords', 'author', 'robots']
    metaTags.forEach(name => {
      const current = document.querySelector(`meta[name="${name}"]`)
      const newMeta = newDoc.querySelector(`meta[name="${name}"]`)
      
      if (current && newMeta) {
        current.setAttribute('content', newMeta.getAttribute('content') || '')
      }
    })
  }

  private updateNavigationStates(newDoc: Document): void {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active')
    })

    // Add active class to current page nav link
    const newActiveLink = newDoc.querySelector('.nav-link.active')
    if (newActiveLink) {
      const currentPath = newActiveLink.getAttribute('href')
      const currentActiveLink = document.querySelector(`a[href="${currentPath}"]`)
      if (currentActiveLink) {
        currentActiveLink.classList.add('active')
      }
    }
  }

  private async reinitializeScripts(): Promise<void> {
    // Dispatch a custom event to notify that the page content has changed
    const event = new CustomEvent('pageContentChanged', {
      detail: { timestamp: Date.now() }
    })
    document.dispatchEvent(event)

    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100))

    // Reinitialize typing animations
    const typingElements = document.querySelectorAll('.typing-text')
    typingElements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      const text = htmlElement.dataset.text || htmlElement.textContent || ''
      const delay = parseInt(htmlElement.dataset.delay || '0') + (index * 200)
      
      // Clear existing content
      htmlElement.textContent = ''
      
      // Start typing animation
      setTimeout(() => {
        this.typeText(htmlElement, text)
      }, delay)
    })
  }

  private typeText(element: HTMLElement, text: string, speed: number = 50): void {
    let index = 0
    element.textContent = ''
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index)
        index++
      } else {
        clearInterval(typeInterval)
      }
    }, speed)
  }

  public setTransitionConfig(config: Partial<TransitionConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  public isCurrentlyTransitioning(): boolean {
    return this.isTransitioning
  }
}
