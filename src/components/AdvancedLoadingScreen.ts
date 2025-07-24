import { BaseComponent } from './BaseComponent';
import { LoadingProgress, TypewriterConfig, EventBus, Logger } from '@/types';

export class AdvancedLoadingScreen extends BaseComponent {
  private progress: LoadingProgress;
  private typewriterConfig: TypewriterConfig;
  private progressBar: HTMLElement | null = null;
  private progressText: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;
  private titleElement: HTMLElement | null = null;
  private loadingCube: HTMLElement | null = null;
  private particleContainer: HTMLElement | null = null;
  private currentlyTyping: string | null = null;
  private assets: Map<string, { url: string; type: string; loaded: boolean }> = new Map();

  constructor(
    element: HTMLElement,
    eventBus: EventBus,
    logger: Logger
  ) {
    super('advanced-loading-screen', element, {}, eventBus, logger);
    
    this.progress = {
      current: 0,
      total: 0,
      percentage: 0,
      stage: 'initializing',
      message: 'Initializing systems...',
      errors: []
    };

    this.typewriterConfig = {
      speed: 80,
      delay: 100,
      cursor: true,
      cursorChar: '_',
      loop: false,
      deleteSpeed: 50,
      pauseTime: 2000,
      variableSpeed: true,
      soundEnabled: false
    };
  }

  protected getDefaultConfig(): Record<string, any> {
    return {
      enableParticles: true,
      enableGlassmorphism: true,
      enableAdvancedAnimations: true,
      minimumLoadTime: 2000,
      fadeOutDuration: 1000,
      enableProgressSound: false,
      enableHapticFeedback: false
    };
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing Advanced Loading Screen');
    
    try {
      this.discoverAssets();
      this.render();
      this.setupAdvancedAnimations();
      this.startTypewriterEffects();
      this.startAssetLoading();
      
      this.setState({ isVisible: true });
      this.logger.info('Advanced Loading Screen initialized successfully');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  public render(): void {
    this.element.innerHTML = this.generateLoadingHTML();
    this.attachElements();
    this.applyAdvancedStyling();
  }

  protected async performUpdate(data: Partial<LoadingProgress>): Promise<void> {
    Object.assign(this.progress, data);
    this.updateProgress();
  }

  private generateLoadingHTML(): string {
    return `
      <div class="advanced-loading-container">
        <div class="loading-background">
          <div class="loading-mesh-gradient"></div>
          <div class="loading-particles" id="loading-particles"></div>
        </div>
        
        <div class="loading-content">
          <div class="loading-brand">
            <div class="loading-cube-container">
              <div class="loading-cube">
                <div class="cube-face cube-front"></div>
                <div class="cube-face cube-back"></div>
                <div class="cube-face cube-right"></div>
                <div class="cube-face cube-left"></div>
                <div class="cube-face cube-top"></div>
                <div class="cube-face cube-bottom"></div>
              </div>
              <div class="cube-glow"></div>
            </div>
            
            <h1 class="loading-title" data-text="GeoDash">
              <span class="title-inner"></span>
              <span class="title-glow"></span>
            </h1>
          </div>

          <div class="loading-progress-section">
            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-fill"></div>
                <div class="progress-glow"></div>
              </div>
              <div class="progress-indicators">
                <div class="progress-dot" data-stage="initializing"></div>
                <div class="progress-dot" data-stage="assets"></div>
                <div class="progress-dot" data-stage="scripts"></div>
                <div class="progress-dot" data-stage="fonts"></div>
                <div class="progress-dot" data-stage="finalizing"></div>
              </div>
            </div>
            
            <div class="progress-info">
              <div class="progress-text">Loading... 0%</div>
              <div class="progress-stage">Initializing</div>
            </div>
          </div>

          <div class="loading-status">
            <div class="status-text"></div>
            <div class="status-details">
              <span class="assets-loaded">0</span> / <span class="assets-total">0</span> assets loaded
            </div>
          </div>

          <div class="loading-tips">
            <div class="tip-text">💡 Tip: Click anywhere to create particle effects!</div>
          </div>
        </div>

        <div class="loading-footer">
          <div class="loading-version">v2.0.0</div>
          <div class="loading-copyright">© 2024 GeoDash</div>
        </div>
      </div>
    `;
  }

  private attachElements(): void {
    this.progressBar = this.query<HTMLElement>('.progress-fill');
    this.progressText = this.query<HTMLElement>('.progress-text');
    this.statusText = this.query<HTMLElement>('.status-text');
    this.titleElement = this.query<HTMLElement>('.title-inner');
    this.loadingCube = this.query<HTMLElement>('.loading-cube');
    this.particleContainer = this.query<HTMLElement>('.loading-particles');
  }

  private applyAdvancedStyling(): void {
    this.addClass('advanced-loading-screen');
    
    if (this.config.enableGlassmorphism) {
      this.addClass('glassmorphism-enabled');
    }
    
    if (this.config.enableAdvancedAnimations) {
      this.addClass('advanced-animations-enabled');
    }
  }

  private setupAdvancedAnimations(): void {
    // Cube rotation animation
    if (this.loadingCube) {
      this.createAnimation([
        { transform: 'rotateX(0deg) rotateY(0deg)' },
        { transform: 'rotateX(360deg) rotateY(360deg)' }
      ], {
        duration: 4000,
        iterations: Infinity,
        easing: 'linear'
      }, 'cube-rotation');
    }

    // Particle effects
    if (this.config.enableParticles && this.particleContainer) {
      this.createLoadingParticles();
    }

    // Interactive effects
    this.element.addEventListener('click', (e) => this.createClickEffect(e));
  }

  private createLoadingParticles(): void {
    if (!this.particleContainer) return;

    for (let i = 0; i < 20; i++) {
      const particle = this.createElement('div', 'loading-particle');
      
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background: ${this.getRandomColor()};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        opacity: ${Math.random() * 0.7 + 0.3};
        box-shadow: 0 0 10px currentColor;
      `;
      
      this.particleContainer.appendChild(particle);
    }
  }

  private createClickEffect(event: MouseEvent): void {
    const rect = this.element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    for (let i = 0; i < 8; i++) {
      const ripple = this.createElement('div', 'click-ripple');
      
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 4px;
        height: 4px;
        background: ${this.getRandomColor()};
        border-radius: 50%;
        pointer-events: none;
        animation: ripple-expand 1s ease-out forwards;
        animation-delay: ${i * 0.1}s;
      `;
      
      this.element.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 1000 + (i * 100));
    }
  }

  private getRandomColor(): string {
    const colors = ['#4a9eff', '#ffffff', '#1e3a8a', '#7bb3ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private async startTypewriterEffects(): Promise<void> {
    if (this.titleElement) {
      await this.typeText(this.titleElement, 'GeoDash', 150);
    }
    
    if (this.statusText) {
      await this.typeText(this.statusText, 'Initializing advanced systems...', 60);
    }
  }

  private async typeText(element: HTMLElement, text: string, speed: number = 100): Promise<void> {
    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      element.textContent = text.substring(0, i + 1);
      
      let delay = speed;
      if (this.typewriterConfig.variableSpeed) {
        const char = text[i];
        if (char === '.') delay *= 3;
        if (char === ' ') delay *= 0.5;
        if (char === ',') delay *= 1.5;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 30));
    }
    
    if (this.typewriterConfig.cursor) {
      element.innerHTML = text + `<span class="loading-cursor">${this.typewriterConfig.cursorChar}</span>`;
      
      setTimeout(() => {
        if (element.innerHTML.includes('loading-cursor')) {
          element.textContent = text;
        }
      }, 2000);
    }
  }

  private discoverAssets(): void {
    // CSS files
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      const href = (link as HTMLLinkElement).href;
      if (href && !href.includes('data:')) {
        this.assets.set(href, { url: href, type: 'css', loaded: false });
      }
    });

    // JavaScript files
    document.querySelectorAll('script[src]').forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src && !src.includes('data:')) {
        this.assets.set(src, { url: src, type: 'js', loaded: false });
      }
    });

    // Image assets
    const imageAssets = [
      './assets/images/images.jpg',
      './assets/images/gd-mod-1.jpg',
      './assets/images/test-image.svg',
      './assets/icons/geodash-icon.svg'
    ];

    imageAssets.forEach(imagePath => {
      this.assets.set(imagePath, { url: imagePath, type: 'image', loaded: false });
    });

    this.progress.total = this.assets.size;
    this.updateAssetCounter();
  }

  private async startAssetLoading(): Promise<void> {
    const loadPromises = Array.from(this.assets.entries()).map(([url, asset]) => 
      this.loadAsset(url, asset.type)
    );

    try {
      await Promise.allSettled(loadPromises);
      await this.finalizeLoading();
    } catch (error) {
      this.logger.error('Asset loading failed', error);
      this.progress.errors.push((error as Error).message);
    }
  }

  private async loadAsset(url: string, type: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let element: HTMLElement;

      switch (type) {
        case 'image':
          element = new Image();
          break;
        case 'css':
          element = document.createElement('link');
          (element as HTMLLinkElement).rel = 'stylesheet';
          break;
        case 'js':
          element = document.createElement('script');
          break;
        default:
          element = new Image();
      }

      element.onload = () => {
        this.assets.get(url)!.loaded = true;
        this.progress.current++;
        this.updateProgress();
        resolve();
      };

      element.onerror = () => {
        this.progress.errors.push(`Failed to load: ${url}`);
        this.progress.current++;
        this.updateProgress();
        resolve(); // Don't reject to continue loading other assets
      };

      if (type === 'image') {
        (element as HTMLImageElement).src = url;
      } else if (type === 'css') {
        (element as HTMLLinkElement).href = url;
        document.head.appendChild(element);
      } else if (type === 'js') {
        (element as HTMLScriptElement).src = url;
        document.head.appendChild(element);
      }
    });
  }

  private updateProgress(): void {
    this.progress.percentage = this.progress.total > 0 ? 
      (this.progress.current / this.progress.total) * 100 : 100;

    if (this.progressBar) {
      this.progressBar.style.width = `${this.progress.percentage}%`;
    }

    if (this.progressText) {
      this.progressText.textContent = `Loading... ${Math.round(this.progress.percentage)}%`;
    }

    this.updateStage();
    this.updateAssetCounter();
    this.updateProgressIndicators();
  }

  private updateStage(): void {
    const percentage = this.progress.percentage;
    let newStage: LoadingProgress['stage'];
    let newMessage: string;

    if (percentage < 20) {
      newStage = 'initializing';
      newMessage = 'Initializing core systems...';
    } else if (percentage < 40) {
      newStage = 'assets';
      newMessage = 'Loading visual assets...';
    } else if (percentage < 60) {
      newStage = 'scripts';
      newMessage = 'Loading application scripts...';
    } else if (percentage < 80) {
      newStage = 'fonts';
      newMessage = 'Loading typography...';
    } else {
      newStage = 'finalizing';
      newMessage = 'Finalizing experience...';
    }

    if (newStage !== this.progress.stage) {
      this.progress.stage = newStage;
      this.progress.message = newMessage;
      
      if (this.statusText && this.currentlyTyping !== newMessage) {
        this.typeStatusMessage(newMessage);
      }
    }
  }

  private async typeStatusMessage(message: string): Promise<void> {
    if (!this.statusText || this.currentlyTyping === message) return;
    
    this.currentlyTyping = message;
    this.statusText.textContent = '';
    
    for (let i = 0; i < message.length; i++) {
      if (this.currentlyTyping !== message) break;
      
      this.statusText.textContent = message.substring(0, i + 1);
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 30));
    }
    
    this.currentlyTyping = null;
  }

  private updateAssetCounter(): void {
    const loadedElement = this.query<HTMLElement>('.assets-loaded');
    const totalElement = this.query<HTMLElement>('.assets-total');
    
    if (loadedElement) loadedElement.textContent = this.progress.current.toString();
    if (totalElement) totalElement.textContent = this.progress.total.toString();
  }

  private updateProgressIndicators(): void {
    const indicators = this.queryAll<HTMLElement>('.progress-dot');
    const stages = ['initializing', 'assets', 'scripts', 'fonts', 'finalizing'];
    const currentStageIndex = stages.indexOf(this.progress.stage);
    
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index <= currentStageIndex);
      indicator.classList.toggle('completed', index < currentStageIndex);
    });
  }

  private async finalizeLoading(): Promise<void> {
    // Ensure minimum load time for better UX
    const minLoadTime = this.config.minimumLoadTime || 2000;
    await new Promise(resolve => setTimeout(resolve, minLoadTime));
    
    this.progress.stage = 'finalizing';
    this.progress.percentage = 100;
    this.updateProgress();
    
    await this.typeStatusMessage('Experience ready!');
    
    // Trigger completion
    this.eventBus.emit('loading:complete', {
      progress: this.progress,
      loadTime: performance.now()
    });
    
    await this.fadeOut();
  }

  private async fadeOut(): Promise<void> {
    this.addClass('fade-out');
    
    await new Promise(resolve => 
      setTimeout(resolve, this.config.fadeOutDuration || 1000)
    );
    
    this.destroy();
  }
}
