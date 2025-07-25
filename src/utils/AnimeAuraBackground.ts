export interface AnimeAuraConfig {
  particleCount: number
  energyLineCount: number
  auraIntensity: number
  animationSpeed: number
  colorScheme: 'cyan-magenta' | 'rainbow' | 'electric'
  enableParticles: boolean
  enableEnergyLines: boolean
  enableAuraCore: boolean
}

export class AnimeAuraBackground {
  private container: HTMLElement | null = null
  private animationFrame: number | null = null
  private particles: HTMLElement[] = []
  private energyLines: HTMLElement[] = []
  private auraCore: HTMLElement | null = null
  private config: AnimeAuraConfig
  private isActive = false

  constructor(config: Partial<AnimeAuraConfig> = {}) {
    this.config = {
      particleCount: 12,
      energyLineCount: 6,
      auraIntensity: 0.8,
      animationSpeed: 1,
      colorScheme: 'cyan-magenta',
      enableParticles: true,
      enableEnergyLines: true,
      enableAuraCore: true,
      ...config
    }
  }

  public initialize(): void {
    this.createContainer()
    this.createAuraCore()
    this.createParticles()
    this.createEnergyLines()
    this.startAnimation()
    this.isActive = true
    console.log('🌟 Anime Aura Background initialized')
  }

  public destroy(): void {
    this.stopAnimation()
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    this.particles = []
    this.energyLines = []
    this.auraCore = null
    this.container = null
    this.isActive = false
    console.log('🌟 Anime Aura Background destroyed')
  }

  public updateConfig(newConfig: Partial<AnimeAuraConfig>): void {
    this.config = { ...this.config, ...newConfig }
    if (this.isActive) {
      this.destroy()
      this.initialize()
    }
  }

  public setIntensity(intensity: number): void {
    this.config.auraIntensity = Math.max(0, Math.min(1, intensity))
    if (this.container) {
      this.container.style.opacity = this.config.auraIntensity.toString()
    }
  }

  public pause(): void {
    this.stopAnimation()
  }

  public resume(): void {
    if (this.isActive) {
      this.startAnimation()
    }
  }

  private createContainer(): void {
    this.container = document.createElement('div')
    this.container.className = 'anime-aura-background'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -3;
      overflow: hidden;
      pointer-events: none;
      opacity: ${this.config.auraIntensity};
    `
    document.body.appendChild(this.container)
  }

  private createAuraCore(): void {
    if (!this.config.enableAuraCore || !this.container) return

    this.auraCore = document.createElement('div')
    this.auraCore.className = 'anime-energy-core'
    this.auraCore.style.cssText = `
      position: absolute;
      width: 300px;
      height: 300px;
      background: conic-gradient(from 0deg, #00ffff, #ff00ff, #ffff00, #ff0080, #00ff80, #8000ff, #00ffff);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.4;
      filter: blur(30px);
      animation: energy-flow ${4 / this.config.animationSpeed}s linear infinite;
    `
    this.container.appendChild(this.auraCore)
  }

  private createParticles(): void {
    if (!this.config.enableParticles || !this.container) return

    const particlesContainer = document.createElement('div')
    particlesContainer.className = 'anime-aura-particles'
    particlesContainer.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
    `

    for (let i = 0; i < this.config.particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'anime-particle'
      
      const size = Math.random() * 6 + 2
      const x = Math.random() * 100
      const y = Math.random() * 100
      const delay = Math.random() * 6
      const duration = (Math.random() * 4 + 4) / this.config.animationSpeed

      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 50%;
        top: ${y}%;
        left: ${x}%;
        box-shadow: 
          0 0 10px rgba(255, 255, 255, 0.9),
          0 0 20px rgba(0, 255, 255, 0.7),
          0 0 30px rgba(255, 0, 255, 0.5);
        animation: particle-float ${duration}s ease-in-out infinite;
        animation-delay: ${delay}s;
      `

      this.particles.push(particle)
      particlesContainer.appendChild(particle)
    }

    this.container.appendChild(particlesContainer)
  }

  private createEnergyLines(): void {
    if (!this.config.enableEnergyLines || !this.container) return

    const linesContainer = document.createElement('div')
    linesContainer.className = 'anime-energy-lines'
    linesContainer.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
    `

    for (let i = 0; i < this.config.energyLineCount; i++) {
      const line = document.createElement('div')
      line.className = 'anime-energy-line'
      
      const width = Math.random() * 200 + 100
      const x = Math.random() * 100
      const y = Math.random() * 100
      const rotation = Math.random() * 360
      const delay = Math.random() * 4
      const duration = (Math.random() * 3 + 3) / this.config.animationSpeed

      line.style.cssText = `
        position: absolute;
        width: ${width}px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #00ffff, #ff00ff, transparent);
        top: ${y}%;
        left: ${x}%;
        transform: rotate(${rotation}deg);
        opacity: 0.6;
        animation: energy-flow ${duration}s linear infinite;
        animation-delay: ${delay}s;
      `

      this.energyLines.push(line)
      linesContainer.appendChild(line)
    }

    this.container.appendChild(linesContainer)
  }

  private startAnimation(): void {
    if (this.animationFrame) return

    const animate = () => {
      this.updateParticles()
      this.updateEnergyLines()
      this.updateAuraCore()
      this.animationFrame = requestAnimationFrame(animate)
    }

    this.animationFrame = requestAnimationFrame(animate)
  }

  private stopAnimation(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  private updateParticles(): void {
    if (!this.config.enableParticles) return

    this.particles.forEach((particle, index) => {
      const time = Date.now() * 0.001
      const offset = index * 0.5
      
      const baseX = parseFloat(particle.style.left) || Math.random() * 100
      const baseY = parseFloat(particle.style.top) || Math.random() * 100
      
      const floatX = Math.sin(time * this.config.animationSpeed + offset) * 2
      const floatY = Math.cos(time * this.config.animationSpeed + offset) * 3
      
      particle.style.transform = `translate(${floatX}px, ${floatY}px) scale(${1 + Math.sin(time * 2 + offset) * 0.2})`
    })
  }

  private updateEnergyLines(): void {
    if (!this.config.enableEnergyLines) return

    this.energyLines.forEach((line, index) => {
      const time = Date.now() * 0.001
      const offset = index * 0.3
      
      const rotation = (time * this.config.animationSpeed * 20 + offset * 60) % 360
      const opacity = 0.4 + Math.sin(time * 2 + offset) * 0.3
      
      line.style.transform = `rotate(${rotation}deg)`
      line.style.opacity = opacity.toString()
    })
  }

  private updateAuraCore(): void {
    if (!this.config.enableAuraCore || !this.auraCore) return

    const time = Date.now() * 0.001
    const rotation = (time * this.config.animationSpeed * 30) % 360
    const scale = 1 + Math.sin(time * 1.5) * 0.1
    const opacity = 0.3 + Math.sin(time * 2) * 0.2

    this.auraCore.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`
    this.auraCore.style.opacity = opacity.toString()
  }

  public createLoadingEnhancement(): void {
    const loadingScreen = document.getElementById('loading-screen')
    if (!loadingScreen) return

    const enhancement = document.createElement('div')
    enhancement.className = 'anime-loading-enhancement'
    enhancement.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(0,255,255,0.1) 0%, transparent 70%);
      animation: aura-pulse 3s ease-in-out infinite;
      pointer-events: none;
      z-index: 1;
    `

    loadingScreen.appendChild(enhancement)

    const progressBar = loadingScreen.querySelector('.progress-fill') as HTMLElement
    if (progressBar) {
      progressBar.style.background = 'linear-gradient(90deg, #00ffff, #ff00ff, #ffff00)'
      progressBar.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.6), 0 0 40px rgba(255, 0, 255, 0.4)'
    }

    const logo = loadingScreen.querySelector('.cbot-logo') as HTMLElement
    if (logo) {
      logo.style.border = '2px solid rgba(0, 255, 255, 0.8)'
      logo.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8), 0 0 60px rgba(255, 0, 255, 0.6)'
    }
  }

  public isInitialized(): boolean {
    return this.isActive
  }
}
