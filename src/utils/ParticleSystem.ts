import type { ParticleConfig, Position } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private isRunning: boolean = false;

  async init(): Promise<void> {
    console.log('ParticleSystem initialized');
  }

  createParticles(container: HTMLElement, config: ParticleConfig): void {
    this.setupCanvas(container);
    this.generateParticles(config);
    this.startAnimation();
  }

  private setupCanvas(container: HTMLElement): void {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';

    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.canvas || !this.ctx) return;

    const rect = this.canvas.parentElement!.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  private generateParticles(config: ParticleConfig): void {
    if (!this.canvas) return;

    this.particles = [];
    
    for (let i = 0; i < config.count; i++) {
      const particle: Particle = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        size: config.size + Math.random() * config.size,
        opacity: config.opacity,
        color: config.color,
        life: 0,
        maxLife: 1000 + Math.random() * 2000
      };
      
      this.particles.push(particle);
    }
  }

  private startAnimation(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animate();
  }

  private animate(): void {
    if (!this.isRunning || !this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle, index) => {
      this.updateParticle(particle);
      this.drawParticle(particle);

      if (particle.life >= particle.maxLife) {
        this.respawnParticle(particle);
      }
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  private updateParticle(particle: Particle): void {
    if (!this.canvas) return;

    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life++;

    if (particle.x < 0 || particle.x > this.canvas.width) {
      particle.vx *= -1;
    }
    if (particle.y < 0 || particle.y > this.canvas.height) {
      particle.vy *= -1;
    }

    particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
    particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

    const lifeRatio = particle.life / particle.maxLife;
    particle.opacity = Math.max(0, 1 - lifeRatio);
  }

  private drawParticle(particle: Particle): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = particle.color;
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = particle.color;

    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  private respawnParticle(particle: Particle): void {
    if (!this.canvas) return;

    particle.x = Math.random() * this.canvas.width;
    particle.y = Math.random() * this.canvas.height;
    particle.life = 0;
    particle.opacity = 0.6;
  }

  addParticleAt(position: Position, config: Partial<ParticleConfig> = {}): void {
    if (!this.canvas) return;

    const defaultConfig: ParticleConfig = {
      count: 1,
      size: 2,
      speed: 1,
      color: '#00ff88',
      opacity: 0.6
    };

    const finalConfig = { ...defaultConfig, ...config };

    const particle: Particle = {
      x: position.x,
      y: position.y,
      vx: (Math.random() - 0.5) * finalConfig.speed * 2,
      vy: (Math.random() - 0.5) * finalConfig.speed * 2,
      size: finalConfig.size,
      opacity: finalConfig.opacity,
      color: finalConfig.color,
      life: 0,
      maxLife: 500 + Math.random() * 1000
    };

    this.particles.push(particle);
  }

  createExplosion(position: Position, particleCount: number = 20): void {
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      
      this.addParticleAt(position, {
        size: 1 + Math.random() * 2,
        speed: speed,
        color: `hsl(${120 + Math.random() * 60}, 100%, 50%)`,
        opacity: 0.8
      });
    }
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy(): void {
    this.stop();
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
  }

  getParticleCount(): number {
    return this.particles.length;
  }

  setParticleColor(color: string): void {
    this.particles.forEach(particle => {
      particle.color = color;
    });
  }

  setParticleSpeed(speed: number): void {
    this.particles.forEach(particle => {
      const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (currentSpeed > 0) {
        const ratio = speed / currentSpeed;
        particle.vx *= ratio;
        particle.vy *= ratio;
      }
    });
  }
}
