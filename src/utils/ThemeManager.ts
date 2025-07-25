export type Theme = 'light' | 'dark' | 'halo' | 'anime-aura' | 'auto'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  surfaceElevated: string
  surfaceGlass: string
  text: string
  textSecondary: string
  textMuted: string
  textInverse: string
  border: string
  borderHover: string
  borderGlow: string
  success: string
  warning: string
  error: string
  info: string
  shadow: string
  shadowElevated: string
  glow: string
  glowIntense: string
  particle: string
  aurora: string
}

export interface ThemeConfig {
  name: string
  colors: ThemeColors
  fonts: {
    primary: string
    secondary: string
    mono: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    glow: string
    neon: string
  }
  gradients: {
    primary: string
    secondary: string
    accent: string
    aurora: string
    cosmic: string
    neon: string
    glass: string
  }
  effects: {
    blur: string
    brightness: string
    contrast: string
    hue: string
    saturation: string
    backdropBlur: string
    glassEffect: string
  }
  animations: {
    duration: string
    easing: string
    bounce: string
    elastic: string
  }
}

export class ThemeManager {
  private currentTheme: Theme = 'dark'
  private themes: Map<string, ThemeConfig> = new Map()
  private mediaQuery: MediaQueryList | null = null
  private callbacks: Set<(theme: Theme) => void> = new Set()

  constructor() {
    this.initializeDefaultThemes()
    this.setupMediaQuery()
  }

  async initialize(theme: Theme = 'auto'): Promise<void> {
    console.log('🎨 Theme Manager initialized')
    await this.setTheme(theme)
  }

  private initializeDefaultThemes(): void {
    // Halo Theme - Signature exclusive theme
    const haloTheme: ThemeConfig = {
      name: 'halo',
      colors: {
        primary: '#00d4ff',
        secondary: '#7c3aed',
        accent: '#f59e0b',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceElevated: 'rgba(255, 255, 255, 0.1)',
        surfaceGlass: 'rgba(255, 255, 255, 0.08)',
        text: '#ffffff',
        textSecondary: '#e2e8f0',
        textMuted: '#94a3b8',
        textInverse: '#0f172a',
        border: 'rgba(0, 212, 255, 0.2)',
        borderHover: 'rgba(0, 212, 255, 0.4)',
        borderGlow: 'rgba(0, 212, 255, 0.6)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowElevated: 'rgba(0, 0, 0, 0.5)',
        glow: 'rgba(0, 212, 255, 0.4)',
        glowIntense: 'rgba(0, 212, 255, 0.8)',
        particle: '#00d4ff',
        aurora: 'linear-gradient(45deg, #00d4ff, #7c3aed, #f59e0b)'
      },
      fonts: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Orbitron, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem'
      },
      shadows: {
        sm: '0 2px 8px rgba(0, 212, 255, 0.1)',
        md: '0 8px 25px rgba(0, 212, 255, 0.15)',
        lg: '0 25px 50px rgba(0, 212, 255, 0.25)',
        xl: '0 35px 60px rgba(0, 212, 255, 0.4)',
        glow: '0 0 20px rgba(0, 212, 255, 0.5)',
        neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #00d4ff 0%, #7c3aed 100%)',
        secondary: 'linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%)',
        accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        aurora: 'linear-gradient(45deg, #00d4ff 0%, #7c3aed 33%, #f59e0b 66%, #ef4444 100%)',
        cosmic: 'radial-gradient(ellipse at center, #7c3aed 0%, #1a1a2e 70%)',
        neon: 'linear-gradient(90deg, #00d4ff, #7c3aed, #f59e0b)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      },
      effects: {
        blur: 'blur(10px)',
        brightness: 'brightness(1.1)',
        contrast: 'contrast(1.1)',
        hue: 'hue-rotate(0deg)',
        saturation: 'saturate(1.2)',
        backdropBlur: 'blur(20px)',
        glassEffect: 'backdrop-filter: blur(20px); background: rgba(255,255,255,0.1);'
      },
      animations: {
        duration: '0.4s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    }

    // Light Theme - Clean and modern
    const lightTheme: ThemeConfig = {
      name: 'light',
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#f59e0b',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        surface: 'rgba(255, 255, 255, 0.8)',
        surfaceElevated: 'rgba(255, 255, 255, 0.95)',
        surfaceGlass: 'rgba(255, 255, 255, 0.7)',
        text: '#1e293b',
        textSecondary: '#475569',
        textMuted: '#64748b',
        textInverse: '#ffffff',
        border: 'rgba(99, 102, 241, 0.2)',
        borderHover: 'rgba(99, 102, 241, 0.4)',
        borderGlow: 'rgba(99, 102, 241, 0.6)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        shadow: 'rgba(0, 0, 0, 0.1)',
        shadowElevated: 'rgba(0, 0, 0, 0.15)',
        glow: 'rgba(99, 102, 241, 0.3)',
        glowIntense: 'rgba(99, 102, 241, 0.6)',
        particle: '#6366f1',
        aurora: 'linear-gradient(45deg, #6366f1, #8b5cf6, #f59e0b)'
      },
      fonts: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Orbitron, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem'
      },
      shadows: {
        sm: '0 2px 8px rgba(99, 102, 241, 0.1)',
        md: '0 8px 25px rgba(99, 102, 241, 0.15)',
        lg: '0 25px 50px rgba(99, 102, 241, 0.25)',
        xl: '0 35px 60px rgba(99, 102, 241, 0.4)',
        glow: '0 0 20px rgba(99, 102, 241, 0.4)',
        neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        secondary: 'linear-gradient(135deg, #8b5cf6 0%, #f59e0b 100%)',
        accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        aurora: 'linear-gradient(45deg, #6366f1 0%, #8b5cf6 33%, #f59e0b 66%, #ef4444 100%)',
        cosmic: 'radial-gradient(ellipse at center, #8b5cf6 0%, #f8fafc 70%)',
        neon: 'linear-gradient(90deg, #6366f1, #8b5cf6, #f59e0b)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)'
      },
      effects: {
        blur: 'blur(10px)',
        brightness: 'brightness(1.05)',
        contrast: 'contrast(1.05)',
        hue: 'hue-rotate(0deg)',
        saturation: 'saturate(1.1)',
        backdropBlur: 'blur(20px)',
        glassEffect: 'backdrop-filter: blur(20px); background: rgba(255,255,255,0.8);'
      },
      animations: {
        duration: '0.3s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    }

    // Dark Theme - Sleek and professional
    const darkTheme: ThemeConfig = {
      name: 'dark',
      colors: {
        primary: '#00ff88',
        secondary: '#0066ff',
        accent: '#ff6600',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        surface: 'rgba(255, 255, 255, 0.05)',
        surfaceElevated: 'rgba(255, 255, 255, 0.1)',
        surfaceGlass: 'rgba(255, 255, 255, 0.08)',
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        textInverse: '#0f172a',
        border: 'rgba(0, 255, 136, 0.2)',
        borderHover: 'rgba(0, 255, 136, 0.4)',
        borderGlow: 'rgba(0, 255, 136, 0.6)',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        shadow: 'rgba(0, 0, 0, 0.3)',
        shadowElevated: 'rgba(0, 0, 0, 0.5)',
        glow: 'rgba(0, 255, 136, 0.4)',
        glowIntense: 'rgba(0, 255, 136, 0.8)',
        particle: '#00ff88',
        aurora: 'linear-gradient(45deg, #00ff88, #0066ff, #ff6600)'
      },
      fonts: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Orbitron, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem'
      },
      shadows: {
        sm: '0 2px 8px rgba(0, 255, 136, 0.1)',
        md: '0 8px 25px rgba(0, 255, 136, 0.15)',
        lg: '0 25px 50px rgba(0, 255, 136, 0.25)',
        xl: '0 35px 60px rgba(0, 255, 136, 0.4)',
        glow: '0 0 20px rgba(0, 255, 136, 0.5)',
        neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #00ff88 0%, #0066ff 100%)',
        secondary: 'linear-gradient(135deg, #0066ff 0%, #ff6600 100%)',
        accent: 'linear-gradient(135deg, #ff6600 0%, #ef4444 100%)',
        aurora: 'linear-gradient(45deg, #00ff88 0%, #0066ff 33%, #ff6600 66%, #ef4444 100%)',
        cosmic: 'radial-gradient(ellipse at center, #0066ff 0%, #1e293b 70%)',
        neon: 'linear-gradient(90deg, #00ff88, #0066ff, #ff6600)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      },
      effects: {
        blur: 'blur(10px)',
        brightness: 'brightness(1.1)',
        contrast: 'contrast(1.1)',
        hue: 'hue-rotate(0deg)',
        saturation: 'saturate(1.2)',
        backdropBlur: 'blur(20px)',
        glassEffect: 'backdrop-filter: blur(20px); background: rgba(255,255,255,0.1);'
      },
      animations: {
        duration: '0.4s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    }

    this.themes.set('halo', haloTheme)
    // Anime Aura Theme - Dramatic anime-inspired theme
    const animeAuraTheme: ThemeConfig = {
      name: 'anime-aura',
      colors: {
        primary: '#00ffff',
        secondary: '#ff00ff',
        accent: '#ffff00',
        background: '#000000',
        surface: 'rgba(255, 255, 255, 0.03)',
        surfaceElevated: 'rgba(255, 255, 255, 0.06)',
        surfaceGlass: 'rgba(255, 255, 255, 0.08)',
        text: '#ffffff',
        textSecondary: '#f0f0f0',
        textMuted: '#cccccc',
        textInverse: '#000000',
        border: 'rgba(0, 255, 255, 0.2)',
        borderHover: 'rgba(0, 255, 255, 0.4)',
        borderGlow: 'rgba(0, 255, 255, 1)',
        success: '#00ff80',
        warning: '#ffff00',
        error: '#ff0080',
        info: '#00ffff',
        shadow: 'rgba(0, 255, 255, 0.3)',
        shadowElevated: 'rgba(0, 255, 255, 0.5)',
        glow: 'rgba(0, 255, 255, 0.8)',
        glowIntense: 'rgba(0, 255, 255, 1)',
        particle: '#ffffff',
        aurora: 'linear-gradient(135deg, #00ffff, #ff00ff, #ffff00)'
      },
      fonts: {
        primary: 'Rajdhani, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Orbitron, sans-serif',
        mono: 'JetBrains Mono, Consolas, monospace'
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem'
      },
      shadows: {
        sm: '0 0 10px rgba(0, 255, 255, 0.3)',
        md: '0 0 20px rgba(0, 255, 255, 0.5)',
        lg: '0 0 30px rgba(0, 255, 255, 0.7)',
        xl: '0 0 40px rgba(0, 255, 255, 0.9)',
        glow: '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.4)',
        neon: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor'
      },
      gradients: {
        primary: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #ffff00 100%)',
        secondary: 'linear-gradient(45deg, #ff0080 0%, #00ff80 50%, #8000ff 100%)',
        accent: 'linear-gradient(90deg, #ffff00 0%, #ff0080 100%)',
        aurora: 'radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(255,0,255,0.4) 50%, transparent 100%)',
        cosmic: 'conic-gradient(from 0deg, #00ffff, #ff00ff, #ffff00, #ff0080, #00ff80, #8000ff, #00ffff)',
        neon: 'linear-gradient(90deg, #00ffff, #ff00ff, #ffff00)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)'
      },
      effects: {
        blur: 'blur(10px)',
        brightness: 'brightness(1.2)',
        contrast: 'contrast(1.3)',
        hue: 'hue-rotate(0deg)',
        saturation: 'saturate(1.5)',
        backdropBlur: 'blur(20px)',
        glassEffect: 'backdrop-filter: blur(20px); background: rgba(0,0,0,0.8);'
      },
      animations: {
        duration: '0.3s',
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }
    }

    this.themes.set('halo', haloTheme)
    this.themes.set('light', lightTheme)
    this.themes.set('dark', darkTheme)
    this.themes.set('anime-aura', animeAuraTheme)
  }

  private setupMediaQuery(): void {
    if (typeof window === 'undefined') return

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'auto') {
        this.applyTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  async setTheme(theme: Theme): Promise<void> {
    this.currentTheme = theme

    let actualTheme: 'light' | 'dark' | 'halo' | 'anime-aura'

    if (theme === 'auto') {
      actualTheme = this.getSystemTheme()
    } else {
      actualTheme = theme
    }

    await this.applyTheme(actualTheme)
    this.saveThemePreference(theme)
    this.notifyCallbacks(theme)
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  private async applyTheme(themeName: 'light' | 'dark' | 'halo' | 'anime-aura'): Promise<void> {
    const theme = this.themes.get(themeName)
    if (!theme) {
      console.error(`Theme '${themeName}' not found`)
      return
    }

    const root = document.documentElement

    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value)
    })

    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${this.kebabCase(key)}`, value)
    })

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value)
    })

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value)
    })

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value)
    })

    root.setAttribute('data-theme', themeName)
    document.body.className = document.body.className.replace(/theme-\w+/g, '') + ` theme-${themeName}`

    await this.waitForThemeTransition()
  }

  private async waitForThemeTransition(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, 100)
    })
  }

  private kebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
  }

  private saveThemePreference(theme: Theme): void {
    try {
      localStorage.setItem('theme-preference', theme)
    } catch (error) {
      console.warn('Failed to save theme preference:', error)
    }
  }

  getThemePreference(): Theme {
    try {
      const saved = localStorage.getItem('theme-preference') as Theme
      return saved || 'auto'
    } catch (error) {
      console.warn('Failed to load theme preference:', error)
      return 'auto'
    }
  }

  getCurrentTheme(): Theme {
    return this.currentTheme
  }

  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys())
  }

  addTheme(name: string, config: ThemeConfig): void {
    this.themes.set(name, config)
  }

  removeTheme(name: string): boolean {
    if (name === 'light' || name === 'dark') {
      console.warn('Cannot remove default themes')
      return false
    }
    return this.themes.delete(name)
  }

  getThemeConfig(name: string): ThemeConfig | undefined {
    return this.themes.get(name)
  }

  onThemeChange(callback: (theme: Theme) => void): void {
    this.callbacks.add(callback)
  }

  offThemeChange(callback: (theme: Theme) => void): void {
    this.callbacks.delete(callback)
  }

  private notifyCallbacks(theme: Theme): void {
    this.callbacks.forEach(callback => {
      try {
        callback(theme)
      } catch (error) {
        console.error('Error in theme change callback:', error)
      }
    })
  }

  toggleTheme(): void {
    const currentActual = this.currentTheme === 'auto' ? this.getSystemTheme() : this.currentTheme
    const newTheme = currentActual === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
  }

  createThemeToggle(container: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button')
    button.className = 'theme-toggle'
    button.setAttribute('aria-label', 'Toggle theme')
    
    const updateButton = (theme: Theme) => {
      const actualTheme = theme === 'auto' ? this.getSystemTheme() : theme
      button.innerHTML = actualTheme === 'light' ? '🌙' : '☀️'
      button.title = `Switch to ${actualTheme === 'light' ? 'dark' : 'light'} theme`
    }

    updateButton(this.currentTheme)
    this.onThemeChange(updateButton)

    button.addEventListener('click', () => {
      this.toggleTheme()
    })

    container.appendChild(button)
    return button
  }

  generateCSS(): string {
    let css = ':root {\n'
    
    const theme = this.themes.get('dark')
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        css += `  --color-${this.kebabCase(key)}: ${value};\n`
      })
      
      Object.entries(theme.fonts).forEach(([key, value]) => {
        css += `  --font-${this.kebabCase(key)}: ${value};\n`
      })
      
      Object.entries(theme.spacing).forEach(([key, value]) => {
        css += `  --spacing-${key}: ${value};\n`
      })
    }
    
    css += '}\n'
    return css
  }

  destroy(): void {
    this.callbacks.clear()
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', () => {})
    }
  }
}
