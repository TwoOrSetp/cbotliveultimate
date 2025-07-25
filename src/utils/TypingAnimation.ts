export interface TypingConfig {
  text: string
  speed: number
  cursor: boolean
  duration: number
  easing: string
  delay: number
  effect: 'typewriter' | 'fade' | 'slide' | 'glitch' | 'wave' | 'matrix'
  soundEnabled: boolean
  highlightWords: string[]
  cursorStyle: 'line' | 'block' | 'underscore'
  randomDelay: boolean
  scrambleEffect: boolean
}

export interface TypingElement {
  element: HTMLElement
  text: string
  config?: Partial<TypingConfig>
}

export class TypingAnimation {
  private activeAnimations: Map<HTMLElement, { cancel: () => void }> = new Map()
  private audioContext: AudioContext | null = null

  constructor() {
    this.initializeAudio()
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  animate(element: HTMLElement, text: string, config: Partial<TypingConfig> = {}): Promise<void> {
    const defaultConfig: TypingConfig = {
      text,
      speed: 50,
      cursor: true,
      duration: text.length * 50,
      easing: 'ease-out',
      delay: 0,
      effect: 'typewriter',
      soundEnabled: false,
      highlightWords: [],
      cursorStyle: 'line',
      randomDelay: true,
      scrambleEffect: false
    }

    const finalConfig = { ...defaultConfig, ...config }

    if (this.activeAnimations.has(element)) {
      this.activeAnimations.get(element)!.cancel()
    }

    return new Promise((resolve) => {
      let currentIndex = 0
      let isAnimating = true

      const cancel = () => {
        isAnimating = false
        this.activeAnimations.delete(element)
      }

      this.activeAnimations.set(element, { cancel })

      // Prepare element for animation
      this.prepareElement(element, finalConfig)

      const animateNext = () => {
        if (!isAnimating) {
          resolve()
          return
        }

        if (currentIndex < text.length) {
          this.renderCharacter(element, text, currentIndex, finalConfig)
          currentIndex++

          const delay = this.calculateDelay(finalConfig, currentIndex)
          setTimeout(animateNext, delay)
        } else {
          this.finishAnimation(element, finalConfig)
          this.activeAnimations.delete(element)
          resolve()
        }
      }

      setTimeout(() => {
        if (isAnimating) {
          animateNext()
        }
      }, finalConfig.delay)
    })
  }

  private prepareElement(element: HTMLElement, config: TypingConfig): void {
    element.style.position = 'relative'
    element.style.overflow = 'hidden'

    if (config.effect === 'fade') {
      element.style.opacity = '0'
      element.style.transition = 'opacity 0.3s ease'
    }

    if (config.scrambleEffect) {
      element.dataset.originalText = config.text
    }
  }

  private renderCharacter(element: HTMLElement, text: string, index: number, config: TypingConfig): void {
    let displayText = text.substring(0, index + 1)

    switch (config.effect) {
      case 'typewriter':
        this.renderTypewriter(element, displayText, config)
        break
      case 'fade':
        this.renderFade(element, displayText, config, index)
        break
      case 'slide':
        this.renderSlide(element, displayText, config)
        break
      case 'glitch':
        this.renderGlitch(element, displayText, config, index)
        break
      case 'wave':
        this.renderWave(element, displayText, config, index)
        break
      case 'matrix':
        this.renderMatrix(element, displayText, config, index)
        break
      default:
        this.renderTypewriter(element, displayText, config)
    }

    if (config.soundEnabled) {
      this.playTypingSound()
    }
  }

  private renderTypewriter(element: HTMLElement, text: string, config: TypingConfig): void {
    const highlightedText = this.highlightWords(text, config.highlightWords)
    element.innerHTML = highlightedText + this.getCursor(config.cursorStyle, true)
  }

  private renderFade(element: HTMLElement, text: string, config: TypingConfig, index: number): void {
    const chars = text.split('').map((char, i) => {
      const opacity = i <= index ? 1 : 0
      return `<span style="opacity: ${opacity}; transition: opacity 0.3s ease">${char}</span>`
    }).join('')

    element.innerHTML = chars + this.getCursor(config.cursorStyle, true)
    element.style.opacity = '1'
  }

  private renderSlide(element: HTMLElement, text: string, config: TypingConfig): void {
    const chars = text.split('').map((char, i) => {
      return `<span class="slide-char" style="animation-delay: ${i * 0.05}s">${char}</span>`
    }).join('')

    element.innerHTML = chars + this.getCursor(config.cursorStyle, true)
  }

  private renderGlitch(element: HTMLElement, text: string, config: TypingConfig, index: number): void {
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    let displayText = text

    if (Math.random() < 0.1) {
      const glitchIndex = Math.floor(Math.random() * text.length)
      const glitchChar = glitchChars[Math.floor(Math.random() * glitchChars.length)]
      displayText = text.substring(0, glitchIndex) + glitchChar + text.substring(glitchIndex + 1)
    }

    element.innerHTML = this.highlightWords(displayText, config.highlightWords) + this.getCursor(config.cursorStyle, true)

    if (Math.random() < 0.05) {
      element.style.textShadow = '2px 0 #ff0000, -2px 0 #00ff00'
      setTimeout(() => {
        element.style.textShadow = ''
      }, 50)
    }
  }

  private renderWave(element: HTMLElement, text: string, config: TypingConfig, index: number): void {
    const chars = text.split('').map((char, i) => {
      const delay = i * 0.1
      const transform = i <= index ? `translateY(${Math.sin(Date.now() * 0.01 + i) * 2}px)` : 'translateY(20px)'
      return `<span style="display: inline-block; transform: ${transform}; transition: transform 0.3s ease; animation-delay: ${delay}s">${char}</span>`
    }).join('')

    element.innerHTML = chars + this.getCursor(config.cursorStyle, true)
  }

  private renderMatrix(element: HTMLElement, text: string, config: TypingConfig, index: number): void {
    const matrixChars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789'

    const chars = text.split('').map((char, i) => {
      if (i > index) {
        const randomChar = matrixChars[Math.floor(Math.random() * matrixChars.length)]
        return `<span style="color: #00ff00; opacity: 0.3">${randomChar}</span>`
      } else if (i === index) {
        return `<span style="color: #ffffff; text-shadow: 0 0 10px #00ff00">${char}</span>`
      } else {
        return `<span style="color: #00ff88">${char}</span>`
      }
    }).join('')

    element.innerHTML = chars + this.getCursor(config.cursorStyle, true)
  }

  private calculateDelay(config: TypingConfig, index: number): number {
    let delay = config.speed

    if (config.randomDelay) {
      delay += Math.random() * 30 - 15
    }

    return Math.max(10, delay)
  }

  private highlightWords(text: string, words: string[]): string {
    let result = text
    words.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi')
      result = result.replace(regex, `<span class="highlight-word">${word}</span>`)
    })
    return result
  }

  private getCursor(style: string, visible: boolean): string {
    if (!visible) return ''

    const cursors = {
      line: '<span class="typing-cursor typing-cursor-line">|</span>',
      block: '<span class="typing-cursor typing-cursor-block">█</span>',
      underscore: '<span class="typing-cursor typing-cursor-underscore">_</span>'
    }

    return cursors[style as keyof typeof cursors] || cursors.line
  }

  private finishAnimation(element: HTMLElement, config: TypingConfig): void {
    if (config.cursor) {
      this.startCursorBlink(element, config.cursorStyle)
    } else {
      const cursor = element.querySelector('.typing-cursor')
      if (cursor) {
        cursor.remove()
      }
    }
  }

  private startCursorBlink(element: HTMLElement, cursorStyle: string = 'line'): void {
    const textContent = element.innerHTML.replace(/<span class="typing-cursor[^>]*>.*?<\/span>/g, '')
    let showCursor = true

    const blink = () => {
      if (this.activeAnimations.has(element)) {
        const cursor = showCursor ? this.getCursor(cursorStyle, true) : ''
        element.innerHTML = textContent + cursor
        showCursor = !showCursor
        setTimeout(blink, 500)
      }
    }

    blink()
  }

  private playTypingSound(): void {
    if (!this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(800 + Math.random() * 200, this.audioContext.currentTime)
      oscillator.type = 'square'

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.1)
    } catch (error) {
      console.warn('Could not play typing sound:', error)
    }
  }

  stop(element: HTMLElement): void {
    const animation = this.activeAnimations.get(element)
    if (animation) {
      animation.cancel()
    }
  }

  stopAll(): void {
    this.activeAnimations.forEach(animation => animation.cancel())
    this.activeAnimations.clear()
  }

  async typeMultiple(elements: TypingElement[]): Promise<void> {
    const promises = elements.map(({ element, text, config }) => 
      this.animate(element, text, config)
    )
    
    await Promise.all(promises)
  }

  async typeSequential(elements: TypingElement[]): Promise<void> {
    for (const { element, text, config } of elements) {
      await this.animate(element, text, config)
    }
  }

  isAnimating(element: HTMLElement): boolean {
    return this.activeAnimations.has(element)
  }

  getActiveAnimationCount(): number {
    return this.activeAnimations.size
  }

  createTypewriter(element: HTMLElement, texts: string[], config: Partial<TypingConfig> = {}): void {
    let currentTextIndex = 0
    
    const typeNextText = async () => {
      if (currentTextIndex >= texts.length) {
        currentTextIndex = 0
      }
      
      const text = texts[currentTextIndex]
      await this.animate(element, text, config)
      
      setTimeout(() => {
        this.eraseText(element, () => {
          currentTextIndex++
          setTimeout(typeNextText, 500)
        })
      }, 2000)
    }
    
    typeNextText()
  }

  private eraseText(element: HTMLElement, callback: () => void): void {
    const text = element.textContent || ''
    let currentLength = text.length
    
    const eraseNextCharacter = () => {
      if (currentLength > 0) {
        element.textContent = text.substring(0, currentLength - 1)
        currentLength--
        setTimeout(eraseNextCharacter, 30)
      } else {
        callback()
      }
    }
    
    eraseNextCharacter()
  }

  animateCode(element: HTMLElement, code: string, config: Partial<TypingConfig> = {}): Promise<void> {
    const lines = code.split('\n')
    let currentLineIndex = 0
    let currentCharIndex = 0
    
    return new Promise((resolve) => {
      const typeNextCharacter = () => {
        if (currentLineIndex >= lines.length) {
          resolve()
          return
        }
        
        const currentLine = lines[currentLineIndex]
        
        if (currentCharIndex < currentLine.length) {
          const currentText = lines.slice(0, currentLineIndex).join('\n') + 
                             (currentLineIndex > 0 ? '\n' : '') +
                             currentLine.substring(0, currentCharIndex + 1)
          
          element.textContent = currentText
          currentCharIndex++
          setTimeout(typeNextCharacter, config.speed || 30)
        } else {
          currentLineIndex++
          currentCharIndex = 0
          setTimeout(typeNextCharacter, 100)
        }
      }
      
      typeNextCharacter()
    })
  }

  animateWithHighlight(element: HTMLElement, text: string, highlightWords: string[], config: Partial<TypingConfig> = {}): Promise<void> {
    return new Promise((resolve) => {
      let currentIndex = 0
      
      const typeNextCharacter = () => {
        if (currentIndex < text.length) {
          const currentText = text.substring(0, currentIndex + 1)
          let highlightedText = currentText
          
          highlightWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi')
            highlightedText = highlightedText.replace(regex, `<span class="highlight">${word}</span>`)
          })
          
          element.innerHTML = highlightedText
          currentIndex++
          setTimeout(typeNextCharacter, config.speed || 50)
        } else {
          resolve()
        }
      }
      
      setTimeout(typeNextCharacter, config.delay || 0)
    })
  }

  createTypingEffect(container: HTMLElement, texts: string[], options: {
    loop?: boolean
    pauseBetween?: number
    eraseSpeed?: number
  } = {}): void {
    const { loop = true, pauseBetween = 2000, eraseSpeed = 30 } = options
    let currentIndex = 0
    
    const typeText = async () => {
      const text = texts[currentIndex]
      await this.animate(container, text)
      
      if (loop || currentIndex < texts.length - 1) {
        setTimeout(() => {
          this.eraseText(container, () => {
            currentIndex = (currentIndex + 1) % texts.length
            setTimeout(typeText, 500)
          })
        }, pauseBetween)
      }
    }
    
    typeText()
  }

  destroy(): void {
    this.stopAll()
  }
}
