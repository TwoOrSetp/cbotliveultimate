export class AnimeThemeDemo {
  constructor() {
    this.isActive = false
    this.effects = []
    this.animationId = null
  }

  initialize() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    document.addEventListener('theme:changed', (e) => {
      if (e.detail.theme === 'anime-aura') {
        this.activate()
      } else {
        this.deactivate()
      }
    })
  }

  activate() {
    if (this.isActive) return
    
    this.isActive = true
    this.createAnimeEffects()
    this.startAnimations()
  }

  deactivate() {
    if (!this.isActive) return
    
    this.isActive = false
    this.stopAnimations()
    this.removeAnimeEffects()
  }

  createAnimeEffects() {
    this.addFloatingElements()
    this.addGlowEffects()
    this.addParticleTrails()
    this.addColorShifts()
  }

  addFloatingElements() {
    const floatingElements = [
      { char: '✨', size: '20px' },
      { char: '🌟', size: '16px' },
      { char: '💫', size: '18px' },
      { char: '⭐', size: '14px' }
    ]

    floatingElements.forEach((element, index) => {
      const floater = document.createElement('div')
      floater.className = 'anime-floater'
      floater.textContent = element.char
      floater.style.cssText = `
        position: fixed;
        font-size: ${element.size};
        pointer-events: none;
        z-index: 1000;
        animation: float-${index} ${3 + Math.random() * 2}s infinite ease-in-out;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `
      
      document.body.appendChild(floater)
      this.effects.push(floater)
    })

    this.addFloatingKeyframes()
  }

  addFloatingKeyframes() {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float-0 {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      @keyframes float-1 {
        0%, 100% { transform: translateX(0px) rotate(0deg); }
        50% { transform: translateX(20px) rotate(-180deg); }
      }
      @keyframes float-2 {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        50% { transform: translate(-15px, -15px) scale(1.2); }
      }
      @keyframes float-3 {
        0%, 100% { transform: translate(0px, 0px) rotate(0deg); }
        25% { transform: translate(10px, -10px) rotate(90deg); }
        75% { transform: translate(-10px, 10px) rotate(-90deg); }
      }
    `
    document.head.appendChild(style)
    this.effects.push(style)
  }

  addGlowEffects() {
    const glowElements = document.querySelectorAll('.hero-title, .cta-button, .nav-brand')
    
    glowElements.forEach(element => {
      element.style.textShadow = `
        0 0 10px #ff6b9d,
        0 0 20px #ff6b9d,
        0 0 30px #ff6b9d,
        0 0 40px #4ecdc4
      `
      element.style.animation = 'anime-glow 2s ease-in-out infinite alternate'
    })

    const glowStyle = document.createElement('style')
    glowStyle.textContent = `
      @keyframes anime-glow {
        from { filter: brightness(1) hue-rotate(0deg); }
        to { filter: brightness(1.3) hue-rotate(30deg); }
      }
    `
    document.head.appendChild(glowStyle)
    this.effects.push(glowStyle)
  }

  addParticleTrails() {
    document.addEventListener('mousemove', this.createParticleTrail.bind(this))
  }

  createParticleTrail(e) {
    if (!this.isActive) return

    const particle = document.createElement('div')
    particle.className = 'anime-particle'
    particle.style.cssText = `
      position: fixed;
      width: 4px;
      height: 4px;
      background: radial-gradient(circle, #ff6b9d, #4ecdc4);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      animation: particle-fade 1s ease-out forwards;
    `

    document.body.appendChild(particle)

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    }, 1000)
  }

  addColorShifts() {
    const colorShiftStyle = document.createElement('style')
    colorShiftStyle.textContent = `
      @keyframes particle-fade {
        0% { 
          opacity: 1; 
          transform: scale(1) translate(0, 0); 
        }
        100% { 
          opacity: 0; 
          transform: scale(0) translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px); 
        }
      }
      
      .anime-theme .gradient-text {
        background: linear-gradient(45deg, #ff6b9d, #4ecdc4, #45b7d1, #96ceb4, #feca57);
        background-size: 400% 400%;
        animation: anime-gradient 3s ease infinite;
      }
      
      @keyframes anime-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `
    document.head.appendChild(colorShiftStyle)
    this.effects.push(colorShiftStyle)
  }

  startAnimations() {
    document.body.classList.add('anime-theme')
    this.animateElements()
  }

  animateElements() {
    if (!this.isActive) return

    // Animate floating elements
    const floaters = document.querySelectorAll('.anime-floater')
    floaters.forEach((floater, index) => {
      const randomX = Math.random() * window.innerWidth
      const randomY = Math.random() * window.innerHeight
      
      floater.style.transition = 'all 3s ease-in-out'
      floater.style.left = randomX + 'px'
      floater.style.top = randomY + 'px'
    })

    setTimeout(() => this.animateElements(), 3000)
  }

  stopAnimations() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    
    document.body.classList.remove('anime-theme')
  }

  removeAnimeEffects() {
    this.effects.forEach(effect => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect)
      }
    })
    this.effects = []

    // Remove glow effects
    const glowElements = document.querySelectorAll('.hero-title, .cta-button, .nav-brand')
    glowElements.forEach(element => {
      element.style.textShadow = ''
      element.style.animation = ''
      element.style.filter = ''
    })

    // Remove particle trails
    document.removeEventListener('mousemove', this.createParticleTrail.bind(this))
    
    // Remove existing particles
    const particles = document.querySelectorAll('.anime-particle')
    particles.forEach(particle => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    })
  }

  addSpecialEffect(type) {
    switch (type) {
      case 'sakura':
        this.addSakuraPetals()
        break
      case 'lightning':
        this.addLightningEffect()
        break
      case 'aurora':
        this.addAuroraEffect()
        break
    }
  }

  addSakuraPetals() {
    for (let i = 0; i < 10; i++) {
      const petal = document.createElement('div')
      petal.textContent = '🌸'
      petal.style.cssText = `
        position: fixed;
        font-size: 20px;
        pointer-events: none;
        z-index: 1000;
        left: ${Math.random() * 100}%;
        top: -50px;
        animation: sakura-fall ${5 + Math.random() * 3}s linear infinite;
      `
      
      document.body.appendChild(petal)
      this.effects.push(petal)
    }

    const sakuraStyle = document.createElement('style')
    sakuraStyle.textContent = `
      @keyframes sakura-fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(sakuraStyle)
    this.effects.push(sakuraStyle)
  }

  isAnimeThemeActive() {
    return this.isActive
  }

  cleanup() {
    this.deactivate()
  }
}
