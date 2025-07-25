export interface TypingConfig {
  text: string
  speed: number
  cursor: boolean
  duration: number
  easing: string
  delay: number
}

export interface TypingElement {
  element: HTMLElement
  text: string
  config?: Partial<TypingConfig>
}

export class TypingAnimation {
  private activeAnimations: Map<HTMLElement, { cancel: () => void }> = new Map()

  animate(element: HTMLElement, text: string, config: Partial<TypingConfig> = {}): Promise<void> {
    const defaultConfig: TypingConfig = {
      text,
      speed: 50,
      cursor: true,
      duration: text.length * 50,
      easing: 'ease-out',
      delay: 0
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

      const typeNextCharacter = () => {
        if (!isAnimating) {
          resolve()
          return
        }

        if (currentIndex < text.length) {
          element.textContent = text.substring(0, currentIndex + 1)
          currentIndex++
          setTimeout(typeNextCharacter, finalConfig.speed)
        } else {
          if (finalConfig.cursor) {
            this.startCursorBlink(element)
          }
          this.activeAnimations.delete(element)
          resolve()
        }
      }

      setTimeout(() => {
        if (isAnimating) {
          typeNextCharacter()
        }
      }, finalConfig.delay)
    })
  }

  private startCursorBlink(element: HTMLElement): void {
    const originalText = element.textContent?.replace('|', '') || ''
    let showCursor = true

    const blink = () => {
      if (this.activeAnimations.has(element)) {
        element.textContent = originalText + (showCursor ? '|' : '')
        showCursor = !showCursor
        setTimeout(blink, 500)
      }
    }

    blink()
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
