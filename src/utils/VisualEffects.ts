import type { Position, Size } from '../types';

export class VisualEffects {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private effects: Effect[] = [];
  private animationId: number | null = null;
  private isRunning: boolean = false;

  async init(): Promise<void> {
    this.createCanvas();
    this.startRenderLoop();
    console.log('Visual effects system initialized');
  }

  private createCanvas(): void {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'visual-effects-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;

    document.body.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private startRenderLoop(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.render();
  }

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.effects = this.effects.filter(effect => {
      this.updateEffect(effect);
      this.drawEffect(effect);
      return effect.life > 0;
    });

    this.animationId = requestAnimationFrame(() => this.render());
  }

  private updateEffect(effect: Effect): void {
    effect.life -= effect.decay;
    effect.position.x += effect.velocity.x;
    effect.position.y += effect.velocity.y;
    effect.velocity.x *= effect.friction;
    effect.velocity.y *= effect.friction;
    effect.size *= effect.sizeDecay;
    effect.opacity *= effect.opacityDecay;
  }

  private drawEffect(effect: Effect): void {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.globalAlpha = effect.opacity;
    this.ctx.fillStyle = effect.color;
    this.ctx.shadowBlur = effect.glow;
    this.ctx.shadowColor = effect.color;

    switch (effect.type) {
      case 'circle':
        this.drawCircle(effect);
        break;
      case 'square':
        this.drawSquare(effect);
        break;
      case 'star':
        this.drawStar(effect);
        break;
      case 'lightning':
        this.drawLightning(effect);
        break;
      case 'ripple':
        this.drawRipple(effect);
        break;
    }

    this.ctx.restore();
  }

  private drawCircle(effect: Effect): void {
    if (!this.ctx) return;
    
    this.ctx.beginPath();
    this.ctx.arc(effect.position.x, effect.position.y, effect.size, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawSquare(effect: Effect): void {
    if (!this.ctx) return;
    
    const size = effect.size * 2;
    this.ctx.fillRect(
      effect.position.x - size / 2,
      effect.position.y - size / 2,
      size,
      size
    );
  }

  private drawStar(effect: Effect): void {
    if (!this.ctx) return;
    
    const spikes = 5;
    const outerRadius = effect.size;
    const innerRadius = effect.size * 0.5;
    
    this.ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / spikes;
      const x = effect.position.x + Math.cos(angle) * radius;
      const y = effect.position.y + Math.sin(angle) * radius;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawLightning(effect: Effect): void {
    if (!this.ctx) return;
    
    this.ctx.strokeStyle = effect.color;
    this.ctx.lineWidth = effect.size / 5;
    this.ctx.beginPath();
    
    const segments = 10;
    const length = effect.size * 2;
    let currentX = effect.position.x;
    let currentY = effect.position.y;
    
    this.ctx.moveTo(currentX, currentY);
    
    for (let i = 0; i < segments; i++) {
      currentX += (Math.random() - 0.5) * 20;
      currentY += length / segments;
      this.ctx.lineTo(currentX, currentY);
    }
    
    this.ctx.stroke();
  }

  private drawRipple(effect: Effect): void {
    if (!this.ctx) return;
    
    this.ctx.strokeStyle = effect.color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(effect.position.x, effect.position.y, effect.size, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  createClickEffect(position: Position): void {
    this.effects.push({
      type: 'ripple',
      position: { ...position },
      velocity: { x: 0, y: 0 },
      size: 5,
      color: '#00ff88',
      opacity: 1,
      life: 1,
      decay: 0.02,
      friction: 0.98,
      sizeDecay: 1.05,
      opacityDecay: 0.95,
      glow: 10
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      
      this.effects.push({
        type: 'circle',
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        size: 2 + Math.random() * 3,
        color: `hsl(${120 + Math.random() * 60}, 100%, 50%)`,
        opacity: 0.8,
        life: 1,
        decay: 0.015,
        friction: 0.95,
        sizeDecay: 0.98,
        opacityDecay: 0.97,
        glow: 5
      });
    }
  }

  createSuccessEffect(position: Position): void {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = 3 + Math.random() * 4;
      
      this.effects.push({
        type: 'star',
        position: { ...position },
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        },
        size: 8 + Math.random() * 5,
        color: '#00ff88',
        opacity: 1,
        life: 1,
        decay: 0.01,
        friction: 0.92,
        sizeDecay: 0.99,
        opacityDecay: 0.96,
        glow: 15
      });
    }
  }

  createErrorEffect(position: Position): void {
    for (let i = 0; i < 6; i++) {
      this.effects.push({
        type: 'lightning',
        position: {
          x: position.x + (Math.random() - 0.5) * 50,
          y: position.y + (Math.random() - 0.5) * 50
        },
        velocity: { x: 0, y: 0 },
        size: 30 + Math.random() * 20,
        color: '#ff4444',
        opacity: 1,
        life: 1,
        decay: 0.05,
        friction: 1,
        sizeDecay: 1,
        opacityDecay: 0.9,
        glow: 20
      });
    }
  }

  createBotStartEffect(): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 100 + Math.random() * 50;
      
      this.effects.push({
        type: 'circle',
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius
        },
        velocity: {
          x: Math.cos(angle) * 2,
          y: Math.sin(angle) * 2
        },
        size: 5 + Math.random() * 5,
        color: '#00ff88',
        opacity: 1,
        life: 1,
        decay: 0.008,
        friction: 0.99,
        sizeDecay: 1.02,
        opacityDecay: 0.98,
        glow: 10
      });
    }
  }

  createMatrixEffect(): void {
    const columns = Math.floor(window.innerWidth / 20);
    
    for (let i = 0; i < columns; i++) {
      if (Math.random() < 0.1) {
        this.effects.push({
          type: 'square',
          position: {
            x: i * 20,
            y: -10
          },
          velocity: { x: 0, y: 2 + Math.random() * 3 },
          size: 8,
          color: '#00ff88',
          opacity: 0.8,
          life: 1,
          decay: 0.002,
          friction: 1,
          sizeDecay: 1,
          opacityDecay: 0.995,
          glow: 5
        });
      }
    }
  }

  createScreenFlash(color: string = '#ffffff', intensity: number = 0.3): void {
    if (!this.ctx || !this.canvas) return;
    
    this.ctx.save();
    this.ctx.globalAlpha = intensity;
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    
    setTimeout(() => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }, 100);
  }

  getEffectCount(): number {
    return this.effects.length;
  }

  clearAllEffects(): void {
    this.effects = [];
  }

  destroy(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
    this.effects = [];
  }
}

interface Effect {
  type: 'circle' | 'square' | 'star' | 'lightning' | 'ripple';
  position: Position;
  velocity: Position;
  size: number;
  color: string;
  opacity: number;
  life: number;
  decay: number;
  friction: number;
  sizeDecay: number;
  opacityDecay: number;
  glow: number;
}
