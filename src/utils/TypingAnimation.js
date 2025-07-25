export class TypingAnimation {
  constructor() {
    this.activeAnimations = new Map()
    this.defaultOptions = {
      speed: 50,
      cursor: true,
      cursorStyle: 'line',
      effect: 'typewriter',
      randomDelay: false,
      highlightWords: [],
      soundEnabled: false
    }
  }

  animate(element, text, options = {}) {
    const config = { ...this.defaultOptions, ...options }
    const animationId = this.generateId()
    
    this.activeAnimations.set(animationId, {
      element,
      text,
      config,
      currentIndex: 0,
      isRunning: true
    })

    this.startAnimation(animationId)
    return animationId
  }

  startAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId)
    if (!animation || !animation.isRunning) return

    const { element, text, config, currentIndex } = animation
    
    if (currentIndex >= text.length) {
      this.completeAnimation(animationId)
      return
    }

    const char = text[currentIndex]
    const currentText = text.substring(0, currentIndex + 1)
    
    this.updateElementText(element, currentText, config)
    
    animation.currentIndex++
    
    const delay = this.calculateDelay(config, char)
    setTimeout(() => this.startAnimation(animationId), delay)
  }

  updateElementText(element, text, config) {
    if (config.effect === 'matrix') {
      this.applyMatrixEffect(element, text)
    } else if (config.effect === 'glitch') {
      this.applyGlitchEffect(element, text)
    } else {
      element.textContent = text
    }

    if (config.cursor) {
      this.addCursor(element, config.cursorStyle)
    }

    if (config.highlightWords.length > 0) {
      this.highlightWords(element, config.highlightWords)
    }
  }

  applyMatrixEffect(element, text) {
    element.innerHTML = text.split('').map(char => {
      if (Math.random() < 0.1) {
        return `<span class="matrix-char">${char}</span>`
      }
      return char
    }).join('')
  }

  applyGlitchEffect(element, text) {
    element.innerHTML = `<span class="glitch-text" data-text="${text}">${text}</span>`
  }

  addCursor(element, style) {
    const cursor = style === 'block' ? '█' : '|'
    element.innerHTML += `<span class="typing-cursor">${cursor}</span>`
  }

  highlightWords(element, words) {
    let html = element.innerHTML
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      html = html.replace(regex, `<span class="highlight-word">${word}</span>`)
    })
    element.innerHTML = html
  }

  calculateDelay(config, char) {
    let baseDelay = config.speed

    if (config.randomDelay) {
      baseDelay += Math.random() * 30
    }

    if (char === ' ') {
      baseDelay *= 0.5
    } else if (char === '.' || char === '!' || char === '?') {
      baseDelay *= 2
    } else if (char === ',') {
      baseDelay *= 1.5
    }

    return baseDelay
  }

  completeAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId)
    if (!animation) return

    animation.isRunning = false
    
    if (animation.config.cursor) {
      this.removeCursor(animation.element)
    }

    this.activeAnimations.delete(animationId)
  }

  removeCursor(element) {
    const cursor = element.querySelector('.typing-cursor')
    if (cursor) {
      cursor.remove()
    }
  }

  stopAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId)
    if (animation) {
      animation.isRunning = false
      this.activeAnimations.delete(animationId)
    }
  }

  stopAllAnimations() {
    this.activeAnimations.forEach((animation, id) => {
      this.stopAnimation(id)
    })
  }

  pauseAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId)
    if (animation) {
      animation.isRunning = false
    }
  }

  resumeAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId)
    if (animation) {
      animation.isRunning = true
      this.startAnimation(animationId)
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  getActiveAnimations() {
    return Array.from(this.activeAnimations.keys())
  }

  isAnimationRunning(animationId) {
    const animation = this.activeAnimations.get(animationId)
    return animation ? animation.isRunning : false
  }

  setSpeed(animationId, speed) {
    const animation = this.activeAnimations.get(animationId)
    if (animation) {
      animation.config.speed = speed
    }
  }

  addEffect(element, effectName) {
    element.classList.add(`typing-effect-${effectName}`)
  }

  removeEffect(element, effectName) {
    element.classList.remove(`typing-effect-${effectName}`)
  }

  typeText(element, text, speed = 50) {
    return this.animate(element, text, { speed, cursor: false })
  }

  typeWithCursor(element, text, speed = 50) {
    return this.animate(element, text, { speed, cursor: true })
  }

  matrixType(element, text, speed = 40) {
    return this.animate(element, text, { 
      speed, 
      effect: 'matrix', 
      cursor: false,
      randomDelay: true 
    })
  }

  glitchType(element, text, speed = 60) {
    return this.animate(element, text, { 
      speed, 
      effect: 'glitch', 
      cursor: true,
      randomDelay: true 
    })
  }

  cleanup() {
    this.stopAllAnimations()
    this.activeAnimations.clear()
  }
}
