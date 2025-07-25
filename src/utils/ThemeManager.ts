export type Theme = 'light' | 'dark' | 'auto'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
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
    const lightTheme: ThemeConfig = {
      name: 'light',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1a202c',
        textSecondary: '#4a5568',
        border: '#e2e8f0',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565'
      },
      fonts: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Inter, sans-serif',
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
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem'
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)'
      }
    }

    const darkTheme: ThemeConfig = {
      name: 'dark',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#a0aec0',
        border: '#2d3748',
        success: '#68d391',
        warning: '#fbb040',
        error: '#fc8181'
      },
      fonts: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Inter, sans-serif',
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
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem'
      },
      shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.3)'
      }
    }

    this.themes.set('light', lightTheme)
    this.themes.set('dark', darkTheme)
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
    
    let actualTheme: 'light' | 'dark'
    
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

  private async applyTheme(themeName: 'light' | 'dark'): Promise<void> {
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
