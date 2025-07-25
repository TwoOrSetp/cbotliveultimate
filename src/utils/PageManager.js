export class PageManager {
  constructor() {
    this.currentPage = 'home'
    this.pages = new Map()
    this.history = []
    this.maxHistory = 10
  }

  initialize() {
    this.setupEventListeners()
    this.detectCurrentPage()
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-page]')
      if (link) {
        e.preventDefault()
        const page = link.dataset.page
        this.navigateToPage(page)
      }
    })

    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.page) {
        this.navigateToPage(e.state.page, false)
      }
    })
  }

  detectCurrentPage() {
    const path = window.location.pathname
    const hash = window.location.hash.slice(1)
    
    if (hash) {
      this.currentPage = hash
    } else if (path.includes('features')) {
      this.currentPage = 'features'
    } else if (path.includes('download')) {
      this.currentPage = 'download'
    } else if (path.includes('about')) {
      this.currentPage = 'about'
    } else {
      this.currentPage = 'home'
    }
  }

  navigateToPage(page, addToHistory = true) {
    if (page === this.currentPage) return

    const previousPage = this.currentPage
    this.currentPage = page

    if (addToHistory) {
      this.addToHistory(previousPage)
      this.updateURL(page)
    }

    this.showPage(page)
    this.updateNavigation(page)
    this.dispatchPageChange(page, previousPage)
  }

  showPage(page) {
    const sections = document.querySelectorAll('[data-page-section]')
    sections.forEach(section => {
      section.style.display = 'none'
    })

    const targetSection = document.querySelector(`[data-page-section="${page}"]`)
    if (targetSection) {
      targetSection.style.display = 'block'
    }
  }

  updateNavigation(page) {
    const navLinks = document.querySelectorAll('[data-page]')
    navLinks.forEach(link => {
      link.classList.remove('active')
      if (link.dataset.page === page) {
        link.classList.add('active')
      }
    })
  }

  updateURL(page) {
    const url = page === 'home' ? '/' : `#${page}`
    window.history.pushState({ page }, '', url)
  }

  addToHistory(page) {
    this.history.push(page)
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    }
  }

  goBack() {
    if (this.history.length > 0) {
      const previousPage = this.history.pop()
      this.navigateToPage(previousPage, false)
    }
  }

  dispatchPageChange(newPage, oldPage) {
    const event = new CustomEvent('page:changed', {
      detail: { newPage, oldPage }
    })
    document.dispatchEvent(event)
  }

  getCurrentPage() {
    return this.currentPage
  }

  getHistory() {
    return [...this.history]
  }

  clearHistory() {
    this.history = []
  }

  registerPage(name, config) {
    this.pages.set(name, config)
  }

  unregisterPage(name) {
    this.pages.delete(name)
  }

  getPageConfig(name) {
    return this.pages.get(name)
  }

  getAllPages() {
    return Array.from(this.pages.keys())
  }

  isValidPage(page) {
    return this.pages.has(page) || ['home', 'features', 'download', 'about'].includes(page)
  }

  setTitle(title) {
    document.title = title
  }

  setMetaDescription(description) {
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description
  }

  preloadPage(page) {
    // Placeholder for page preloading logic
    console.log(`Preloading page: ${page}`)
  }

  cleanup() {
    this.pages.clear()
    this.history = []
  }
}
