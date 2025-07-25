export class AnimeAuraBackground {
  constructor() {
    this.canvas = null
    this.ctx = null
    this.particles = []
    this.isActive = false
    this.animationId = null
    this.config = {
      particleCount: 50,
      particleSize: 2,
      speed: 0.5,
      colors: ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
    }
  }

  initialize() {
    this.createCanvas()
    this.setupParticles()
    this.setupEventListeners()
  }

  createCanvas() {
    this.canvas = document.createElement('canvas')
    this.canvas.id = 'anime-background'
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      pointer-events: none;
      opacity: 0.6;
    `
    
    document.body.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    this.resizeCanvas()
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  setupParticles() {
    this.particles = []
    
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: Math.random() * this.config.particleSize + 1,
        color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
        opacity: Math.random() * 0.5 + 0.2
      })
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas()
      this.setupParticles()
    })
  }

  start() {
    if (this.isActive) return
    
    this.isActive = true
    this.animate()
  }

  stop() {
    this.isActive = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  animate() {
    if (!this.isActive) return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    this.updateParticles()
    this.drawParticles()
    this.drawConnections()
    
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.vx
      particle.y += particle.vy
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width
      if (particle.x > this.canvas.width) particle.x = 0
      if (particle.y < 0) particle.y = this.canvas.height
      if (particle.y > this.canvas.height) particle.y = 0
      
      // Pulse effect
      particle.opacity = 0.3 + Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.2
    })
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.save()
      this.ctx.globalAlpha = particle.opacity
      this.ctx.fillStyle = particle.color
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fill()
      
      // Glow effect
      this.ctx.shadowBlur = 10
      this.ctx.shadowColor = particle.color
      this.ctx.fill()
      
      this.ctx.restore()
    })
  }

  drawConnections() {
    const maxDistance = 100
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const particle1 = this.particles[i]
        const particle2 = this.particles[j]
        
        const dx = particle1.x - particle2.x
        const dy = particle1.y - particle2.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < maxDistance) {
          const opacity = (1 - distance / maxDistance) * 0.2
          
          this.ctx.save()
          this.ctx.globalAlpha = opacity
          this.ctx.strokeStyle = '#ffffff'
          this.ctx.lineWidth = 1
          this.ctx.beginPath()
          this.ctx.moveTo(particle1.x, particle1.y)
          this.ctx.lineTo(particle2.x, particle2.y)
          this.ctx.stroke()
          this.ctx.restore()
        }
      }
    }
  }

  setTheme(theme) {
    switch (theme) {
      case 'anime-aura':
        this.config.colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
        break
      case 'halo':
        this.config.colors = ['#00ff88', '#0088ff', '#88ff00', '#ff8800', '#8800ff']
        break
      case 'dark':
        this.config.colors = ['#00d4ff', '#7c3aed', '#f59e0b', '#10b981', '#ef4444']
        break
      default:
        this.config.colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
    }
    
    this.setupParticles()
  }

  addMouseInteraction() {
    let mouseX = 0
    let mouseY = 0
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // Attract particles to mouse
      this.particles.forEach(particle => {
        const dx = mouseX - particle.x
        const dy = mouseY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance < 100) {
          const force = (100 - distance) / 100 * 0.01
          particle.vx += dx * force
          particle.vy += dy * force
        }
      })
    })
  }

  setIntensity(intensity) {
    this.config.particleCount = Math.floor(50 * intensity)
    this.config.speed = 0.5 * intensity
    this.setupParticles()
  }

  hide() {
    if (this.canvas) {
      this.canvas.style.opacity = '0'
    }
  }

  show() {
    if (this.canvas) {
      this.canvas.style.opacity = '0.6'
    }
  }

  destroy() {
    this.stop()
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }
  }

  getConfig() {
    return { ...this.config }
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
    this.setupParticles()
  }
}
