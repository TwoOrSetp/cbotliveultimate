export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark'
    this.themes = {
      dark: {
        name: 'Dark',
        colors: {
          primary: '#00d4ff',
          secondary: '#7c3aed',
          background: '#000000',
          surface: '#1a1a1a',
          text: '#ffffff'
        }
      },
      light: {
        name: 'Light',
        colors: {
          primary: '#0066cc',
          secondary: '#6b46c1',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1a1a1a'
        }
      },
      'anime-aura': {
        name: 'Anime Aura',
        colors: {
          primary: '#ff6b9d',
          secondary: '#4ecdc4',
          background: '#0a0a0a',
          surface: '#1a1a2e',
          text: '#ffffff'
        }
      },
      halo: {
        name: 'Halo',
        colors: {
          primary: '#00ff88',
          secondary: '#0088ff',
          background: '#000011',
          surface: '#001122',
          text: '#ffffff'
        }
      }
    }
  }

  async initialize() {
    this.loadSavedTheme()
    this.setupEventListeners()
  }

  loadSavedTheme() {
    const saved = localStorage.getItem('cbot-theme')
    if (saved && this.themes[saved]) {
      this.setTheme(saved)
    }
  }

  setTheme(themeName) {
    if (!this.themes[themeName]) return

    this.currentTheme = themeName
    const theme = this.themes[themeName]

    document.documentElement.setAttribute('data-theme', themeName)
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value)
    })

    localStorage.setItem('cbot-theme', themeName)
    
    this.updateThemeElements()
    this.dispatchThemeChange()
  }

  updateThemeElements() {
    const themeOptions = document.querySelectorAll('.theme-option')
    themeOptions.forEach(option => {
      option.classList.remove('active')
      if (option.dataset.theme === this.currentTheme) {
        option.classList.add('active')
      }
    })
  }

  dispatchThemeChange() {
    const event = new CustomEvent('theme:changed', {
      detail: { theme: this.currentTheme }
    })
    document.dispatchEvent(event)
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const themeOption = e.target.closest('.theme-option')
      if (themeOption) {
        const theme = themeOption.dataset.theme
        if (theme) {
          this.setTheme(theme)
        }
      }
    })
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getThemes() {
    return Object.keys(this.themes)
  }

  getThemeData(themeName) {
    return this.themes[themeName]
  }

  addTheme(name, themeData) {
    this.themes[name] = themeData
  }

  removeTheme(name) {
    if (name !== 'dark' && name !== 'light') {
      delete this.themes[name]
    }
  }

  toggleTheme() {
    const themes = Object.keys(this.themes)
    const currentIndex = themes.indexOf(this.currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    this.setTheme(themes[nextIndex])
  }

  isDarkTheme() {
    return this.currentTheme === 'dark' || this.currentTheme === 'anime-aura' || this.currentTheme === 'halo'
  }

  isLightTheme() {
    return this.currentTheme === 'light'
  }

  getThemeColor(colorName) {
    const theme = this.themes[this.currentTheme]
    return theme ? theme.colors[colorName] : null
  }

  applyCustomColors(colors) {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value)
    })
  }

  resetToDefault() {
    this.setTheme('dark')
  }

  exportTheme() {
    return {
      name: this.currentTheme,
      data: this.themes[this.currentTheme]
    }
  }

  importTheme(themeData) {
    if (themeData.name && themeData.data) {
      this.addTheme(themeData.name, themeData.data)
      this.setTheme(themeData.name)
    }
  }
}
