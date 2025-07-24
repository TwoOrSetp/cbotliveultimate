import { BaseComponent } from './BaseComponent';
import { ParticleSystem, BackgroundEffect, EventBus, Logger } from '@/types';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  element: HTMLElement;
}

export class AdvancedParticleSystem extends BaseComponent {
  private particles: Map<string, Particle> = new Map();
  private animationFrame: number = 0;
  private isRunning: boolean = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particleConfig: ParticleSystem;
  private lastTime: number = 0;
  private deltaTime: number = 0;

  constructor(
    element: HTMLElement,
    config: ParticleSystem,
    eventBus: EventBus,
    logger: Logger
  ) {
    super('advanced-particle-system', element, config, eventBus, logger);
    this.particleConfig = config;
    this.canvas = this.createElement<HTMLCanvasElement>('canvas', 'particle-canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  protected getDefaultConfig(): Record<string, any> {
    return {
      count: 100,
      speed: 1,
      size: { min: 1, max: 3 },
      color: ['#4a9eff', '#ffffff', '#1e3a8a'],
      opacity: { min: 0.3, max: 1 },
      lifetime: 5000,
      gravity: 0.1,
      wind: 0.05,
      enableInteraction: true,
      enablePhysics: true,
      renderMode: 'canvas', // 'canvas' or 'dom'
      blendMode: 'screen',
      enableTrails: false,
      trailLength: 10
    };
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Advanced Particle System');
    
    try {
      this.setupCanvas();
      this.setupEventListeners();
      this.createInitialParticles();
      this.start();
      
      this.setState({ isVisible: true });
      this.logger.info('Advanced Particle System initialized successfully');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public render(): void {
    // Canvas-based rendering is handled in the animation loop
    if (this.config.renderMode === 'dom') {
      this.renderDOMParticles();
    }
  }

  protected async performUpdate(data: Partial<ParticleSystem>): Promise<void> {
    Object.assign(this.particleConfig, data);
    
    if (data.count && data.count !== this.particles.size) {
      this.adjustParticleCount(data.count);
    }
  }

  private setupCanvas(): void {
    this.element.appendChild(this.canvas);
    this.resizeCanvas();
    
    // Setup canvas properties
    this.ctx.globalCompositeOperation = this.config.blendMode || 'screen';
    
    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      this.resizeCanvas();
    });
    resizeObserver.observe(this.element);
    this.observers.set('resize', resizeObserver);
  }

  private resizeCanvas(): void {
    const rect = this.element.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    
    this.ctx.scale(dpr, dpr);
    this.ctx.globalCompositeOperation = this.config.blendMode || 'screen';
  }

  private setupEventListeners(): void {
    if (this.config.enableInteraction) {
      this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Attract particles to mouse
    this.particles.forEach(particle => {
      const dx = mouseX - particle.x;
      const dy = mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx += (dx / distance) * force * 0.1;
        particle.vy += (dy / distance) * force * 0.1;
      }
    });
  }

  private handleClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    // Create burst effect
    this.createBurst(clickX, clickY, 20);
  }

  private createInitialParticles(): void {
    for (let i = 0; i < this.particleConfig.count; i++) {
      this.createParticle();
    }
  }

  private createParticle(x?: number, y?: number): Particle {
    const id = `particle_${Date.now()}_${Math.random()}`;
    const rect = this.canvas.getBoundingClientRect();
    
    const particle: Particle = {
      id,
      x: x ?? Math.random() * rect.width,
      y: y ?? Math.random() * rect.height,
      vx: (Math.random() - 0.5) * this.particleConfig.speed,
      vy: (Math.random() - 0.5) * this.particleConfig.speed,
      size: this.randomBetween(this.particleConfig.size.min, this.particleConfig.size.max),
      opacity: this.randomBetween(this.particleConfig.opacity.min, this.particleConfig.opacity.max),
      color: this.particleConfig.color[Math.floor(Math.random() * this.particleConfig.color.length)],
      life: this.particleConfig.lifetime,
      maxLife: this.particleConfig.lifetime,
      element: this.createElement('div', 'particle')
    };
    
    this.particles.set(id, particle);
    
    if (this.config.renderMode === 'dom') {
      this.setupDOMParticle(particle);
    }
    
    return particle;
  }

  private setupDOMParticle(particle: Particle): void {
    particle.element.style.cssText = `
      position: absolute;
      width: ${particle.size}px;
      height: ${particle.size}px;
      background: ${particle.color};
      border-radius: 50%;
      pointer-events: none;
      opacity: ${particle.opacity};
      transform: translate(${particle.x}px, ${particle.y}px);
      box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
    `;
    
    this.element.appendChild(particle.element);
  }

  private createBurst(x: number, y: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = this.randomBetween(2, 5);
      const particle = this.createParticle(x, y);
      
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.life = this.randomBetween(1000, 3000);
      particle.maxLife = particle.life;
    }
  }

  private adjustParticleCount(newCount: number): void {
    const currentCount = this.particles.size;
    
    if (newCount > currentCount) {
      // Add particles
      for (let i = 0; i < newCount - currentCount; i++) {
        this.createParticle();
      }
    } else if (newCount < currentCount) {
      // Remove particles
      const particlesToRemove = Array.from(this.particles.keys()).slice(0, currentCount - newCount);
      particlesToRemove.forEach(id => {
        const particle = this.particles.get(id);
        if (particle && particle.element.parentNode) {
          particle.element.parentNode.removeChild(particle.element);
        }
        this.particles.delete(id);
      });
    }
  }

  private start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  private stop(): void {
    this.isRunning = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private animate = (currentTime: number = performance.now()): void => {
    if (!this.isRunning) return;
    
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.updateParticles();
    
    if (this.config.renderMode === 'canvas') {
      this.renderCanvas();
    } else {
      this.renderDOMParticles();
    }
    
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  private updateParticles(): void {
    const rect = this.canvas.getBoundingClientRect();
    const particlesToRemove: string[] = [];
    
    this.particles.forEach((particle, id) => {
      // Update physics
      if (this.config.enablePhysics) {
        particle.vy += this.particleConfig.gravity * (this.deltaTime / 16);
        particle.vx += this.particleConfig.wind * (this.deltaTime / 16);
      }
      
      // Update position
      particle.x += particle.vx * (this.deltaTime / 16);
      particle.y += particle.vy * (this.deltaTime / 16);
      
      // Update life
      particle.life -= this.deltaTime;
      particle.opacity = (particle.life / particle.maxLife) * this.randomBetween(this.particleConfig.opacity.min, this.particleConfig.opacity.max);
      
      // Boundary checking and wrapping
      if (particle.x < 0) particle.x = rect.width;
      if (particle.x > rect.width) particle.x = 0;
      if (particle.y < 0) particle.y = rect.height;
      if (particle.y > rect.height) particle.y = 0;
      
      // Remove dead particles
      if (particle.life <= 0 || particle.opacity <= 0) {
        particlesToRemove.push(id);
      }
    });
    
    // Remove dead particles and create new ones
    particlesToRemove.forEach(id => {
      const particle = this.particles.get(id);
      if (particle && particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
      this.particles.delete(id);
      
      // Create new particle to maintain count
      this.createParticle();
    });
  }

  private renderCanvas(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render particles
    this.particles.forEach(particle => {
      this.ctx.save();
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fillStyle = particle.color;
      this.ctx.shadowBlur = particle.size * 2;
      this.ctx.shadowColor = particle.color;
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    });
  }

  private renderDOMParticles(): void {
    this.particles.forEach(particle => {
      particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
      particle.element.style.opacity = particle.opacity.toString();
    });
  }

  private randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  public destroy(): void {
    this.stop();
    
    // Remove all particles
    this.particles.forEach(particle => {
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
    this.particles.clear();
    
    super.destroy();
  }
}
