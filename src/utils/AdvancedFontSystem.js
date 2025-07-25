export class AdvancedFontSystem {
  constructor() {
    this.loadedFonts = new Set()
    this.fontEffects = new Map()
    this.animations = new Map()
  }

  async loadResponsiveFonts(config) {
    const { breakpoints } = config
    
    for (const [breakpoint, fontConfig] of Object.entries(breakpoints)) {
      await this.loadFont(fontConfig)
      this.applyResponsiveFont(breakpoint, fontConfig)
    }
  }

  async loadFont(fontConfig) {
    const { family, weight, style } = fontConfig
    const fontKey = `${family}-${weight}-${style}`
    
    if (this.loadedFonts.has(fontKey)) return

    try {
      const font = new FontFace(family, `url(https://fonts.googleapis.com/css2?family=${family}:wght@${weight})`)
      await font.load()
      document.fonts.add(font)
      this.loadedFonts.add(fontKey)
    } catch (error) {
      console.warn(`Failed to load font ${family}:`, error)
    }
  }

  applyResponsiveFont(breakpoint, fontConfig) {
    const mediaQuery = `(min-width: ${breakpoint}px)`
    const style = document.createElement('style')
    
    style.textContent = `
      @media ${mediaQuery} {
        .responsive-font {
          font-family: ${fontConfig.family}, ${fontConfig.fallbacks?.join(', ') || 'sans-serif'};
          font-weight: ${fontConfig.weight};
          font-style: ${fontConfig.style};
          font-size: ${fontConfig.size};
          line-height: ${fontConfig.lineHeight};
          letter-spacing: ${fontConfig.letterSpacing};
        }
      }
    `
    
    document.head.appendChild(style)
  }

  applyEffect(element, effect) {
    const { type, properties } = effect
    
    switch (type) {
      case 'gradient':
        this.applyGradientEffect(element, properties)
        break
      case 'glow':
        this.applyGlowEffect(element, properties)
        break
      case 'shadow':
        this.applyShadowEffect(element, properties)
        break
      case 'outline':
        this.applyOutlineEffect(element, properties)
        break
    }
    
    this.fontEffects.set(element, effect)
  }

  applyGradientEffect(element, properties) {
    const { gradient, colors } = properties
    
    if (gradient) {
      element.style.background = gradient
    } else if (colors) {
      element.style.background = `linear-gradient(45deg, ${colors.join(', ')})`
    }
    
    element.style.webkitBackgroundClip = 'text'
    element.style.webkitTextFillColor = 'transparent'
    element.style.backgroundClip = 'text'
  }

  applyGlowEffect(element, properties) {
    const { intensity = 1, color = '#00d4ff' } = properties
    const glowSize = 10 * intensity
    
    element.style.textShadow = `
      0 0 ${glowSize}px ${color},
      0 0 ${glowSize * 2}px ${color},
      0 0 ${glowSize * 3}px ${color}
    `
  }

  applyShadowEffect(element, properties) {
    const { offsetX = 2, offsetY = 2, blur = 4, color = 'rgba(0,0,0,0.5)' } = properties
    element.style.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`
  }

  applyOutlineEffect(element, properties) {
    const { width = 1, color = '#000000' } = properties
    element.style.webkitTextStroke = `${width}px ${color}`
  }

  startContinuousAnimation(element, animation) {
    const { type, duration, intensity } = animation
    
    switch (type) {
      case 'pulse':
        this.startPulseAnimation(element, duration, intensity)
        break
      case 'wave':
        this.startWaveAnimation(element, duration, intensity)
        break
      case 'glow':
        this.startGlowAnimation(element, duration, intensity)
        break
    }
    
    this.animations.set(element, animation)
  }

  startPulseAnimation(element, duration, intensity) {
    const keyframes = `
      @keyframes pulse-${Date.now()} {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(${1 + intensity}); }
      }
    `
    
    this.addKeyframes(keyframes)
    element.style.animation = `pulse-${Date.now()} ${duration}ms infinite ease-in-out`
  }

  startGlowAnimation(element, duration, intensity) {
    const keyframes = `
      @keyframes glow-${Date.now()} {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(${1 + intensity}); }
      }
    `
    
    this.addKeyframes(keyframes)
    element.style.animation = `glow-${Date.now()} ${duration}ms infinite ease-in-out`
  }

  addKeyframes(keyframes) {
    const style = document.createElement('style')
    style.textContent = keyframes
    document.head.appendChild(style)
  }

  optimizeForPerformance() {
    const style = document.createElement('style')
    style.textContent = `
      .font-optimized {
        font-display: swap;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `
    document.head.appendChild(style)
    
    document.querySelectorAll('[class*="font"], .responsive-font').forEach(el => {
      el.classList.add('font-optimized')
    })
  }

  removeEffect(element) {
    element.style.background = ''
    element.style.webkitBackgroundClip = ''
    element.style.webkitTextFillColor = ''
    element.style.backgroundClip = ''
    element.style.textShadow = ''
    element.style.webkitTextStroke = ''
    
    this.fontEffects.delete(element)
  }

  stopAnimation(element) {
    element.style.animation = ''
    this.animations.delete(element)
  }

  getLoadedFonts() {
    return Array.from(this.loadedFonts)
  }

  getFontEffect(element) {
    return this.fontEffects.get(element)
  }

  getAnimation(element) {
    return this.animations.get(element)
  }

  cleanup() {
    this.fontEffects.clear()
    this.animations.clear()
    this.loadedFonts.clear()
  }
}
