export interface FontConfig {
  family: string
  weight: number | string
  style: 'normal' | 'italic' | 'oblique'
  size: string
  lineHeight: string
  letterSpacing: string
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  fallbacks: string[]
  loadTimeout: number
}

export interface FontEffect {
  name: string
  type: 'gradient' | 'shadow' | 'glow' | 'outline' | 'animation' | 'texture'
  properties: Record<string, any>
  duration?: number
  easing?: string
}

export interface ResponsiveFontConfig {
  breakpoints: Record<string, FontConfig>
  scaleFactor: number
  minSize: string
  maxSize: string
}

export class AdvancedFontSystem {
  private loadedFonts: Set<string> = new Set()
  private fontObserver: FontFaceObserver | null = null
  private responsiveConfig: Map<string, ResponsiveFontConfig> = new Map()
  private activeEffects: Map<HTMLElement, FontEffect[]> = new Map()

  constructor() {
    this.init()
  }

  private init(): void {
    this.setupFontDisplay()
    this.setupResponsiveSystem()
    this.preloadSystemFonts()
    this.addFontStyles()
  }

  private setupFontDisplay(): void {
    const style = document.createElement('style')
    style.textContent = `
      @font-face {
        font-family: 'Rajdhani';
        font-display: swap;
        font-weight: 300 700;
        src: url('https://fonts.gstatic.com/s/rajdhani/v15/LDI2apCSOBg7S-QT7q4AOeekWPrP.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'Orbitron';
        font-display: swap;
        font-weight: 400 900;
        src: url('https://fonts.gstatic.com/s/orbitron/v29/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff2') format('woff2');
      }
      
      @font-face {
        font-family: 'JetBrains Mono';
        font-display: swap;
        font-weight: 400 600;
        src: url('https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPVmUsaaDhw.woff2') format('woff2');
      }
    `
    document.head.appendChild(style)
  }

  private addFontStyles(): void {
    if (document.getElementById('advanced-font-styles')) return

    const styles = document.createElement('style')
    styles.id = 'advanced-font-styles'
    styles.textContent = `
      .font-primary {
        font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-feature-settings: 'kern' 1, 'liga' 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .font-secondary {
        font-family: 'Orbitron', 'Courier New', monospace;
        font-feature-settings: 'kern' 1, 'liga' 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .font-mono {
        font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
        font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      .font-effect-gradient {
        background: var(--gradient-primary, linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
      }

      .font-effect-glow {
        text-shadow: 
          0 0 5px currentColor,
          0 0 10px currentColor,
          0 0 15px currentColor,
          0 0 20px currentColor;
      }

      .font-effect-neon {
        color: var(--color-primary, #00d4ff);
        text-shadow: 
          0 0 5px currentColor,
          0 0 10px currentColor,
          0 0 15px currentColor,
          0 0 20px currentColor,
          0 0 35px currentColor,
          0 0 40px currentColor;
        animation: neon-flicker 2s infinite alternate;
      }

      .font-effect-outline {
        -webkit-text-stroke: 2px var(--color-primary, #00d4ff);
        -webkit-text-fill-color: transparent;
        text-stroke: 2px var(--color-primary, #00d4ff);
        text-fill-color: transparent;
      }

      .font-effect-shadow {
        text-shadow: 
          2px 2px 0px rgba(0, 0, 0, 0.8),
          4px 4px 8px rgba(0, 0, 0, 0.6),
          8px 8px 16px rgba(0, 0, 0, 0.4);
      }

      .font-effect-3d {
        text-shadow: 
          1px 1px 0px #ccc,
          2px 2px 0px #c9c9c9,
          3px 3px 0px #bbb,
          4px 4px 0px #b9b9b9,
          5px 5px 0px #aaa,
          6px 6px 1px rgba(0,0,0,.1),
          0 0 5px rgba(0,0,0,.1),
          1px 1px 3px rgba(0,0,0,.3),
          3px 3px 5px rgba(0,0,0,.2),
          5px 5px 10px rgba(0,0,0,.25);
      }

      .font-effect-glitch {
        position: relative;
        animation: glitch 2s infinite;
      }

      .font-effect-glitch::before,
      .font-effect-glitch::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }

      .font-effect-glitch::before {
        animation: glitch-1 0.5s infinite;
        color: #ff0000;
        z-index: -1;
      }

      .font-effect-glitch::after {
        animation: glitch-2 0.5s infinite;
        color: #00ffff;
        z-index: -2;
      }

      .font-effect-wave {
        animation: wave 2s ease-in-out infinite;
      }

      .font-effect-pulse {
        animation: pulse 2s ease-in-out infinite;
      }

      .font-effect-bounce {
        animation: bounce 1s ease-in-out infinite;
      }

      .font-effect-shake {
        animation: shake 0.5s ease-in-out infinite;
      }

      .font-effect-typewriter {
        overflow: hidden;
        border-right: 2px solid var(--color-primary, #00d4ff);
        white-space: nowrap;
        animation: typewriter 3s steps(40, end), blink-caret 0.75s step-end infinite;
      }

      .font-responsive {
        font-size: clamp(var(--font-min-size, 1rem), var(--font-scale, 4vw), var(--font-max-size, 3rem));
        line-height: clamp(1.2, var(--line-height-scale, 1.4), 1.6);
      }

      .font-fluid {
        font-size: calc(var(--font-base-size, 1rem) + var(--font-scale-factor, 1vw));
      }

      @keyframes neon-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
      }

      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }

      @keyframes glitch-1 {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }

      @keyframes glitch-2 {
        0% { transform: translate(0); }
        20% { transform: translate(2px, -2px); }
        40% { transform: translate(2px, 2px); }
        60% { transform: translate(-2px, -2px); }
        80% { transform: translate(-2px, 2px); }
        100% { transform: translate(0); }
      }

      @keyframes wave {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }

      @keyframes typewriter {
        from { width: 0; }
        to { width: 100%; }
      }

      @keyframes blink-caret {
        from, to { border-color: transparent; }
        50% { border-color: var(--color-primary, #00d4ff); }
      }

      @media (max-width: 768px) {
        .font-responsive {
          --font-scale: 6vw;
        }
        
        .font-fluid {
          --font-scale-factor: 2vw;
        }
      }

      @media (max-width: 480px) {
        .font-responsive {
          --font-scale: 8vw;
        }
        
        .font-fluid {
          --font-scale-factor: 3vw;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .font-effect-glitch,
        .font-effect-wave,
        .font-effect-pulse,
        .font-effect-bounce,
        .font-effect-shake,
        .font-effect-typewriter,
        .font-effect-neon {
          animation: none;
        }
      }
    `

    document.head.appendChild(styles)
  }

  private setupResponsiveSystem(): void {
    this.setupViewportObserver()
    this.setupFontScaling()
  }

  private setupViewportObserver(): void {
    const updateFontSizes = () => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
      
      document.documentElement.style.setProperty('--vw', `${vw / 100}px`)
      document.documentElement.style.setProperty('--vh', `${vh / 100}px`)
      
      this.updateResponsiveFonts()
    }

    window.addEventListener('resize', updateFontSizes)
    window.addEventListener('orientationchange', updateFontSizes)
    updateFontSizes()
  }

  private setupFontScaling(): void {
    const root = document.documentElement
    const baseSize = 16
    const minSize = 14
    const maxSize = 20
    
    const updateScale = () => {
      const vw = window.innerWidth
      let scale = 1
      
      if (vw < 768) {
        scale = Math.max(minSize / baseSize, 0.875)
      } else if (vw > 1200) {
        scale = Math.min(maxSize / baseSize, 1.25)
      }
      
      root.style.setProperty('--font-scale-base', scale.toString())
    }

    window.addEventListener('resize', updateScale)
    updateScale()
  }

  private updateResponsiveFonts(): void {
    for (const [selector, config] of this.responsiveConfig) {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        this.applyResponsiveFont(element as HTMLElement, config)
      })
    }
  }

  private applyResponsiveFont(element: HTMLElement, config: ResponsiveFontConfig): void {
    const vw = window.innerWidth
    let activeConfig: FontConfig | null = null

    for (const [breakpoint, fontConfig] of Object.entries(config.breakpoints)) {
      const breakpointValue = parseInt(breakpoint)
      if (vw >= breakpointValue) {
        activeConfig = fontConfig
      }
    }

    if (activeConfig) {
      this.applyFontConfig(element, activeConfig)
    }
  }

  private preloadSystemFonts(): void {
    const systemFonts = [
      'Rajdhani',
      'Orbitron', 
      'JetBrains Mono'
    ]

    systemFonts.forEach(font => {
      this.loadFont(font)
    })
  }

  public async loadFont(fontFamily: string, config?: Partial<FontConfig>): Promise<boolean> {
    if (this.loadedFonts.has(fontFamily)) {
      return true
    }

    const defaultConfig: FontConfig = {
      family: fontFamily,
      weight: 400,
      style: 'normal',
      size: '16px',
      lineHeight: '1.5',
      letterSpacing: 'normal',
      textTransform: 'none',
      fallbacks: ['sans-serif'],
      loadTimeout: 3000
    }

    const finalConfig = { ...defaultConfig, ...config }

    try {
      if ('fonts' in document) {
        const fontFace = new FontFace(
          finalConfig.family,
          `url(https://fonts.googleapis.com/css2?family=${finalConfig.family.replace(' ', '+')}:wght@${finalConfig.weight}&display=swap)`
        )

        await fontFace.load()
        document.fonts.add(fontFace)
      }

      this.loadedFonts.add(fontFamily)
      return true
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}:`, error)
      return false
    }
  }

  public applyFontConfig(element: HTMLElement, config: FontConfig): void {
    const style = element.style
    style.fontFamily = `${config.family}, ${config.fallbacks.join(', ')}`
    style.fontWeight = config.weight.toString()
    style.fontStyle = config.style
    style.fontSize = config.size
    style.lineHeight = config.lineHeight
    style.letterSpacing = config.letterSpacing
    style.textTransform = config.textTransform
  }

  public applyEffect(element: HTMLElement, effect: FontEffect): void {
    const existingEffects = this.activeEffects.get(element) || []
    existingEffects.push(effect)
    this.activeEffects.set(element, existingEffects)

    element.classList.add(`font-effect-${effect.name}`)
    
    if (effect.type === 'gradient') {
      element.style.background = effect.properties.gradient
      element.style.webkitBackgroundClip = 'text'
      element.style.webkitTextFillColor = 'transparent'
    }

    if (effect.properties.dataText) {
      element.setAttribute('data-text', effect.properties.dataText)
    }
  }

  public removeEffect(element: HTMLElement, effectName: string): void {
    const effects = this.activeEffects.get(element)
    if (effects) {
      const filteredEffects = effects.filter(e => e.name !== effectName)
      this.activeEffects.set(element, filteredEffects)
    }

    element.classList.remove(`font-effect-${effectName}`)
  }

  public setResponsiveFont(selector: string, config: ResponsiveFontConfig): void {
    this.responsiveConfig.set(selector, config)
    this.updateResponsiveFonts()
  }

  public optimizeForPerformance(): void {
    const style = document.createElement('style')
    style.textContent = `
      * {
        text-rendering: optimizeSpeed;
      }
      
      .performance-optimized {
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
      }
    `
    document.head.appendChild(style)
  }

  public getLoadedFonts(): string[] {
    return Array.from(this.loadedFonts)
  }

  public isLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily)
  }
}
