export class AnimeThemeDemo {
  private demoContainer: HTMLElement | null = null
  private isRunning = false

  constructor() {
    this.createDemoContainer()
  }

  public startDemo(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.showDemoContainer()
    this.runDemoSequence()
    console.log('🌟 Anime Theme Demo started')
  }

  public stopDemo(): void {
    if (!this.isRunning) return

    this.isRunning = false
    this.hideDemoContainer()
    console.log('🌟 Anime Theme Demo stopped')
  }

  private createDemoContainer(): void {
    this.demoContainer = document.createElement('div')
    this.demoContainer.id = 'anime-theme-demo'
    this.demoContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 300px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #00ffff;
      border-radius: 15px;
      padding: 20px;
      z-index: 10000;
      display: none;
      backdrop-filter: blur(20px);
      box-shadow: 
        0 0 30px rgba(0, 255, 255, 0.8),
        0 0 60px rgba(255, 0, 255, 0.6),
        inset 0 0 20px rgba(0, 255, 255, 0.1);
      animation: demo-container-pulse 3s ease-in-out infinite;
    `

    this.demoContainer.innerHTML = `
      <div style="text-align: center; color: #ffffff; font-family: 'Orbitron', sans-serif;">
        <h2 style="
          color: #00ffff; 
          margin-bottom: 20px; 
          text-shadow: 0 0 10px #00ffff;
          animation: demo-title-glow 2s ease-in-out infinite alternate;
        ">
          ⚡ Anime Aura Theme ⚡
        </h2>
        
        <div id="demo-features" style="margin-bottom: 20px; text-align: left;">
          <div class="demo-feature" style="margin: 10px 0; opacity: 0;">
            ✨ Dynamic Particle System
          </div>
          <div class="demo-feature" style="margin: 10px 0; opacity: 0;">
            🌟 Energy Aura Effects
          </div>
          <div class="demo-feature" style="margin: 10px 0; opacity: 0;">
            ⚡ Glowing UI Elements
          </div>
          <div class="demo-feature" style="margin: 10px 0; opacity: 0;">
            🎨 Anime-Inspired Colors
          </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button id="demo-close" style="
            background: linear-gradient(135deg, #ff00ff, #ff0080);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
            transition: all 0.3s ease;
          ">
            Close Demo
          </button>
          <button id="demo-activate" style="
            background: linear-gradient(135deg, #00ffff, #00ff80);
            border: none;
            color: black;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
            transition: all 0.3s ease;
          ">
            Activate Theme
          </button>
        </div>
      </div>
    `

    // Add demo-specific styles
    const demoStyles = document.createElement('style')
    demoStyles.textContent = `
      @keyframes demo-container-pulse {
        0%, 100% {
          border-color: #00ffff;
          box-shadow: 
            0 0 30px rgba(0, 255, 255, 0.8),
            0 0 60px rgba(255, 0, 255, 0.6),
            inset 0 0 20px rgba(0, 255, 255, 0.1);
        }
        50% {
          border-color: #ff00ff;
          box-shadow: 
            0 0 30px rgba(255, 0, 255, 0.8),
            0 0 60px rgba(0, 255, 255, 0.6),
            inset 0 0 20px rgba(255, 0, 255, 0.1);
        }
      }

      @keyframes demo-title-glow {
        0% {
          text-shadow: 0 0 10px #00ffff;
        }
        100% {
          text-shadow: 0 0 20px #00ffff, 0 0 30px #ff00ff;
        }
      }

      @keyframes demo-feature-appear {
        0% {
          opacity: 0;
          transform: translateX(-20px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }

      #demo-close:hover {
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(255, 0, 255, 0.8);
      }

      #demo-activate:hover {
        transform: scale(1.05);
        box-shadow: 0 0 25px rgba(0, 255, 255, 0.8);
      }
    `

    document.head.appendChild(demoStyles)
    document.body.appendChild(this.demoContainer)

    // Add event listeners
    const closeBtn = this.demoContainer.querySelector('#demo-close')
    const activateBtn = this.demoContainer.querySelector('#demo-activate')

    closeBtn?.addEventListener('click', () => this.stopDemo())
    activateBtn?.addEventListener('click', () => this.activateAnimeTheme())
  }

  private showDemoContainer(): void {
    if (this.demoContainer) {
      this.demoContainer.style.display = 'block'
      this.demoContainer.style.opacity = '0'
      this.demoContainer.style.transform = 'translate(-50%, -50%) scale(0.8)'
      
      setTimeout(() => {
        if (this.demoContainer) {
          this.demoContainer.style.transition = 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          this.demoContainer.style.opacity = '1'
          this.demoContainer.style.transform = 'translate(-50%, -50%) scale(1)'
        }
      }, 50)
    }
  }

  private hideDemoContainer(): void {
    if (this.demoContainer) {
      this.demoContainer.style.transition = 'all 0.3s ease'
      this.demoContainer.style.opacity = '0'
      this.demoContainer.style.transform = 'translate(-50%, -50%) scale(0.8)'
      
      setTimeout(() => {
        if (this.demoContainer) {
          this.demoContainer.style.display = 'none'
        }
      }, 300)
    }
  }

  private async runDemoSequence(): Promise<void> {
    if (!this.demoContainer) return

    const features = this.demoContainer.querySelectorAll('.demo-feature')
    
    // Animate features appearing one by one
    for (let i = 0; i < features.length; i++) {
      if (!this.isRunning) break
      
      const feature = features[i] as HTMLElement
      feature.style.animation = 'demo-feature-appear 0.5s ease-out forwards'
      feature.style.animationDelay = `${i * 0.2}s`
      
      await this.delay(200)
    }

    // Add some sparkle effects
    if (this.isRunning) {
      this.addSparkleEffects()
    }
  }

  private addSparkleEffects(): void {
    if (!this.demoContainer) return

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        if (!this.isRunning || !this.demoContainer) return

        const sparkle = document.createElement('div')
        sparkle.style.cssText = `
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffffff;
          border-radius: 50%;
          top: ${Math.random() * 100}%;
          left: ${Math.random() * 100}%;
          box-shadow: 0 0 10px #ffffff;
          animation: sparkle-twinkle 1s ease-in-out;
          pointer-events: none;
        `

        const sparkleStyles = document.createElement('style')
        sparkleStyles.textContent = `
          @keyframes sparkle-twinkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
        `
        document.head.appendChild(sparkleStyles)

        this.demoContainer.appendChild(sparkle)

        setTimeout(() => {
          if (sparkle.parentNode) {
            sparkle.parentNode.removeChild(sparkle)
          }
          if (sparkleStyles.parentNode) {
            sparkleStyles.parentNode.removeChild(sparkleStyles)
          }
        }, 1000)
      }, i * 300)
    }
  }

  private activateAnimeTheme(): void {
    // Trigger theme change to anime-aura
    const themeOption = document.querySelector('[data-theme="anime-aura"]') as HTMLElement
    if (themeOption) {
      themeOption.click()
    }
    
    // Show activation effect
    this.showActivationEffect()
    
    // Close demo after activation
    setTimeout(() => {
      this.stopDemo()
    }, 2000)
  }

  private showActivationEffect(): void {
    const effect = document.createElement('div')
    effect.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(0,255,255,0.3) 0%, transparent 70%);
      z-index: 9999;
      pointer-events: none;
      animation: activation-flash 1s ease-out;
    `

    const effectStyles = document.createElement('style')
    effectStyles.textContent = `
      @keyframes activation-flash {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
      }
    `
    document.head.appendChild(effectStyles)
    document.body.appendChild(effect)

    setTimeout(() => {
      if (effect.parentNode) {
        effect.parentNode.removeChild(effect)
      }
      if (effectStyles.parentNode) {
        effectStyles.parentNode.removeChild(effectStyles)
      }
    }, 1000)
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  public isActive(): boolean {
    return this.isRunning
  }

  public destroy(): void {
    this.stopDemo()
    if (this.demoContainer && this.demoContainer.parentNode) {
      this.demoContainer.parentNode.removeChild(this.demoContainer)
    }
    this.demoContainer = null
  }
}
