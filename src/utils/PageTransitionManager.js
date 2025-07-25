export class PageTransitionManager {
  constructor() {
    this.isTransitioning = false
    this.transitionDuration = 500
    this.defaultTransition = 'fade'
  }

  initialize() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    document.addEventListener('page:changed', (e) => {
      this.handlePageTransition(e.detail.newPage, e.detail.oldPage)
    })
  }

  async handlePageTransition(newPage, oldPage) {
    if (this.isTransitioning) return

    this.isTransitioning = true

    try {
      await this.executeTransition(newPage, oldPage)
    } catch (error) {
      console.error('Page transition failed:', error)
    } finally {
      this.isTransitioning = false
    }
  }

  async executeTransition(newPage, oldPage) {
    const oldSection = document.querySelector(`[data-page-section="${oldPage}"]`)
    const newSection = document.querySelector(`[data-page-section="${newPage}"]`)

    if (!newSection) {
      console.warn(`Page section not found: ${newPage}`)
      return
    }

    // Hide old section with animation
    if (oldSection) {
      await this.animateOut(oldSection)
      oldSection.style.display = 'none'
    }

    // Show new section with animation
    newSection.style.display = 'block'
    await this.animateIn(newSection)
  }

  async animateOut(element) {
    return new Promise(resolve => {
      element.style.transition = `opacity ${this.transitionDuration}ms ease-out`
      element.style.opacity = '0'
      
      setTimeout(resolve, this.transitionDuration)
    })
  }

  async animateIn(element) {
    return new Promise(resolve => {
      element.style.opacity = '0'
      element.style.transition = `opacity ${this.transitionDuration}ms ease-in`
      
      setTimeout(() => {
        element.style.opacity = '1'
        setTimeout(resolve, this.transitionDuration)
      }, 50)
    })
  }

  async slideTransition(oldElement, newElement, direction = 'left') {
    const container = oldElement.parentElement
    const containerWidth = container.offsetWidth

    // Setup
    newElement.style.position = 'absolute'
    newElement.style.top = '0'
    newElement.style.width = '100%'
    newElement.style.transform = direction === 'left' ? 'translateX(100%)' : 'translateX(-100%)'
    newElement.style.display = 'block'

    // Animate
    return new Promise(resolve => {
      const duration = this.transitionDuration
      
      oldElement.style.transition = `transform ${duration}ms ease-in-out`
      newElement.style.transition = `transform ${duration}ms ease-in-out`
      
      oldElement.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)'
      newElement.style.transform = 'translateX(0)'
      
      setTimeout(() => {
        oldElement.style.display = 'none'
        oldElement.style.transform = ''
        oldElement.style.transition = ''
        
        newElement.style.position = ''
        newElement.style.transform = ''
        newElement.style.transition = ''
        
        resolve()
      }, duration)
    })
  }

  async fadeTransition(oldElement, newElement) {
    return new Promise(resolve => {
      const duration = this.transitionDuration / 2
      
      // Fade out old
      oldElement.style.transition = `opacity ${duration}ms ease-out`
      oldElement.style.opacity = '0'
      
      setTimeout(() => {
        oldElement.style.display = 'none'
        newElement.style.display = 'block'
        newElement.style.opacity = '0'
        
        // Fade in new
        newElement.style.transition = `opacity ${duration}ms ease-in`
        setTimeout(() => {
          newElement.style.opacity = '1'
          
          setTimeout(() => {
            oldElement.style.transition = ''
            newElement.style.transition = ''
            resolve()
          }, duration)
        }, 50)
      }, duration)
    })
  }

  async scaleTransition(oldElement, newElement) {
    return new Promise(resolve => {
      const duration = this.transitionDuration
      
      oldElement.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
      oldElement.style.transform = 'scale(0.8)'
      oldElement.style.opacity = '0'
      
      setTimeout(() => {
        oldElement.style.display = 'none'
        newElement.style.display = 'block'
        newElement.style.transform = 'scale(1.2)'
        newElement.style.opacity = '0'
        
        newElement.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`
        
        setTimeout(() => {
          newElement.style.transform = 'scale(1)'
          newElement.style.opacity = '1'
          
          setTimeout(() => {
            oldElement.style.transform = ''
            oldElement.style.transition = ''
            newElement.style.transform = ''
            newElement.style.transition = ''
            resolve()
          }, duration)
        }, 50)
      }, duration)
    })
  }

  setTransitionDuration(duration) {
    this.transitionDuration = duration
  }

  setDefaultTransition(transition) {
    this.defaultTransition = transition
  }

  isTransitionInProgress() {
    return this.isTransitioning
  }

  async waitForTransition() {
    while (this.isTransitioning) {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }

  addTransitionClass(element, className) {
    element.classList.add(`transition-${className}`)
  }

  removeTransitionClass(element, className) {
    element.classList.remove(`transition-${className}`)
  }

  createTransitionStyles() {
    const styles = document.createElement('style')
    styles.textContent = `
      .page-transition-container {
        position: relative;
        overflow: hidden;
      }
      
      .transition-fade {
        transition: opacity 0.5s ease-in-out;
      }
      
      .transition-slide {
        transition: transform 0.5s ease-in-out;
      }
      
      .transition-scale {
        transition: transform 0.5s ease-in-out, opacity 0.5s ease-in-out;
      }
    `
    document.head.appendChild(styles)
  }

  cleanup() {
    this.isTransitioning = false
  }
}
