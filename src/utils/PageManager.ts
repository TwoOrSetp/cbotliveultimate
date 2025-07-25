export interface PageTransition {
  from: string
  to: string
  direction: 'forward' | 'backward'
}

export class PageManager {
  private currentPage = 'home'
  private pages: string[] = ['home', 'features', 'download', 'gallery', 'documentation', 'community', 'about']
  private isTransitioning = false
  private transitionCallbacks: Set<(transition: PageTransition) => void> = new Set()

  constructor() {
    this.initializePages()
    this.setupEventListeners()
    this.updateURL()
  }

  private initializePages(): void {
    // Hide all pages except home
    this.pages.forEach(pageId => {
      const page = document.getElementById(pageId)
      if (page) {
        page.classList.remove('active', 'prev')
        if (pageId === 'home') {
          page.classList.add('active')
        }
      }
    })

    // Update page indicators
    this.updatePageIndicators()
  }

  private setupEventListeners(): void {
    // Navigation links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      const navLink = target.closest('[data-page]') as HTMLElement
      
      if (navLink) {
        e.preventDefault()
        const pageId = navLink.dataset.page
        if (pageId && pageId !== this.currentPage) {
          this.navigateToPage(pageId)
        }
      }
    })

    // Page dots
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('dot')) {
        const pageId = target.dataset.page
        if (pageId && pageId !== this.currentPage) {
          this.navigateToPage(pageId)
        }
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.isTransitioning) return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          this.navigateNext()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          this.navigatePrevious()
          break
        case 'Home':
          e.preventDefault()
          this.navigateToPage('home')
          break
        case 'End':
          e.preventDefault()
          this.navigateToPage('about')
          break
      }
    })

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      const pageId = this.getPageFromURL()
      if (pageId && pageId !== this.currentPage) {
        this.navigateToPage(pageId, false)
      }
    })

    // Mouse wheel navigation (optional)
    let wheelTimeout: number
    document.addEventListener('wheel', (e) => {
      if (this.isTransitioning) return

      clearTimeout(wheelTimeout)
      wheelTimeout = window.setTimeout(() => {
        if (Math.abs(e.deltaY) > 50) {
          if (e.deltaY > 0) {
            this.navigateNext()
          } else {
            this.navigatePrevious()
          }
        }
      }, 150)
    }, { passive: true })
  }

  public navigateToPage(pageId: string, updateHistory = true): void {
    if (this.isTransitioning || pageId === this.currentPage || !this.pages.includes(pageId)) {
      return
    }

    console.log(`🔄 Navigating from ${this.currentPage} to ${pageId}`)

    const fromIndex = this.pages.indexOf(this.currentPage)
    const toIndex = this.pages.indexOf(pageId)
    const direction = toIndex > fromIndex ? 'forward' : 'backward'

    this.isTransitioning = true

    // Emit transition event
    const transition: PageTransition = {
      from: this.currentPage,
      to: pageId,
      direction
    }

    this.transitionCallbacks.forEach(callback => {
      try {
        callback(transition)
      } catch (error) {
        console.error('Error in page transition callback:', error)
      }
    })

    // Get page elements
    const currentPageElement = document.getElementById(this.currentPage)
    const nextPageElement = document.getElementById(pageId)

    if (!currentPageElement || !nextPageElement) {
      console.error('Page elements not found')
      this.isTransitioning = false
      return
    }

    // Set up transition classes
    if (direction === 'forward') {
      nextPageElement.style.transform = 'translateX(100px)'
    } else {
      nextPageElement.style.transform = 'translateX(-100px)'
    }

    // Show next page
    nextPageElement.style.visibility = 'visible'
    nextPageElement.style.opacity = '0'

    // Force reflow
    nextPageElement.offsetHeight

    // Start transition
    requestAnimationFrame(() => {
      // Animate current page out
      if (direction === 'forward') {
        currentPageElement.style.transform = 'translateX(-100px)'
      } else {
        currentPageElement.style.transform = 'translateX(100px)'
      }
      currentPageElement.style.opacity = '0'

      // Animate next page in
      nextPageElement.style.transform = 'translateX(0)'
      nextPageElement.style.opacity = '1'
    })

    // Complete transition
    setTimeout(() => {
      // Update classes
      currentPageElement.classList.remove('active')
      currentPageElement.classList.add('prev')
      nextPageElement.classList.remove('prev')
      nextPageElement.classList.add('active')

      // Reset styles
      currentPageElement.style.visibility = 'hidden'
      currentPageElement.style.transform = ''
      currentPageElement.style.opacity = ''
      nextPageElement.style.transform = ''
      nextPageElement.style.opacity = ''

      // Update state
      this.currentPage = pageId
      this.updatePageIndicators()
      this.updateNavigation()

      if (updateHistory) {
        this.updateURL()
      }

      this.isTransitioning = false

      console.log(`✅ Navigation to ${pageId} complete`)
    }, 600)
  }

  public navigateNext(): void {
    const currentIndex = this.pages.indexOf(this.currentPage)
    if (currentIndex < this.pages.length - 1) {
      this.navigateToPage(this.pages[currentIndex + 1])
    }
  }

  public navigatePrevious(): void {
    const currentIndex = this.pages.indexOf(this.currentPage)
    if (currentIndex > 0) {
      this.navigateToPage(this.pages[currentIndex - 1])
    }
  }

  private updatePageIndicators(): void {
    const dots = document.querySelectorAll('.dot')
    dots.forEach(dot => {
      const pageId = (dot as HTMLElement).dataset.page
      if (pageId === this.currentPage) {
        dot.classList.add('active')
      } else {
        dot.classList.remove('active')
      }
    })
  }

  private updateNavigation(): void {
    const navLinks = document.querySelectorAll('.nav-link')
    navLinks.forEach(link => {
      const pageId = (link as HTMLElement).dataset.page
      if (pageId === this.currentPage) {
        link.classList.add('active')
      } else {
        link.classList.remove('active')
      }
    })
  }

  private updateURL(): void {
    const url = this.currentPage === 'home' ? '/' : `/#${this.currentPage}`
    history.pushState({ page: this.currentPage }, '', url)
  }

  private getPageFromURL(): string {
    const hash = window.location.hash.slice(1)
    return this.pages.includes(hash) ? hash : 'home'
  }

  public onTransition(callback: (transition: PageTransition) => void): void {
    this.transitionCallbacks.add(callback)
  }

  public offTransition(callback: (transition: PageTransition) => void): void {
    this.transitionCallbacks.delete(callback)
  }

  public getCurrentPage(): string {
    return this.currentPage
  }

  public getPages(): string[] {
    return [...this.pages]
  }

  public isCurrentlyTransitioning(): boolean {
    return this.isTransitioning
  }
}
