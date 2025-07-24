import { AdvancedNavigation } from './components/AdvancedNavigation';
import { AdvancedLoadingScreen } from './components/AdvancedLoadingScreen';
import { AdvancedParticleSystem } from './components/AdvancedParticleSystem';
import { 
  NavigationItem, 
  EventBus, 
  Logger, 
  LogLevel, 
  ModuleManager,
  ThemeConfig,
  PerformanceMetrics
} from './types';

class AdvancedEventBus implements EventBus {
  private events: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }
}

class AdvancedLogger implements Logger {
  private logLevel: LogLevel = 'info';
  private enableConsoleOutput: boolean = true;
  private enableRemoteLogging: boolean = false;

  constructor(logLevel: LogLevel = 'info') {
    this.logLevel = logLevel;
  }

  debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex >= currentLevelIndex) {
      const timestamp = new Date().toISOString();
      const emoji = this.getLogEmoji(level);
      
      if (this.enableConsoleOutput) {
        const logMethod = level === 'error' ? console.error : 
                         level === 'warn' ? console.warn : 
                         level === 'debug' ? console.debug : console.log;
        
        logMethod(`${emoji} [${timestamp}] ${message}`, data || '');
      }

      if (this.enableRemoteLogging) {
        this.sendToRemoteLogger(level, message, data, timestamp);
      }
    }
  }

  private getLogEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }

  private sendToRemoteLogger(level: LogLevel, message: string, data: any, timestamp: string): void {
    // Implementation for remote logging service
    // This could send logs to a service like LogRocket, Sentry, etc.
  }
}

class AdvancedModuleManager implements ModuleManager {
  private modules: Map<string, any> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  register(name: string, module: any): void {
    this.modules.set(name, module);
    this.logger.debug(`Module registered: ${name}`);
  }

  get<T>(name: string): T {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module not found: ${name}`);
    }
    return module as T;
  }

  async initialize(): Promise<void> {
    this.logger.info('Initializing all modules...');
    
    const initPromises = Array.from(this.modules.entries()).map(async ([name, module]) => {
      try {
        if (module.initialize && typeof module.initialize === 'function') {
          await module.initialize();
          this.logger.debug(`Module initialized: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to initialize module ${name}:`, error);
      }
    });

    await Promise.allSettled(initPromises);
    this.logger.info('Module initialization complete');
  }

  destroy(): void {
    this.logger.info('Destroying all modules...');
    
    this.modules.forEach((module, name) => {
      try {
        if (module.destroy && typeof module.destroy === 'function') {
          module.destroy();
          this.logger.debug(`Module destroyed: ${name}`);
        }
      } catch (error) {
        this.logger.error(`Failed to destroy module ${name}:`, error);
      }
    });

    this.modules.clear();
    this.logger.info('All modules destroyed');
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private logger: Logger;
  private startTime: number;

  constructor(logger: Logger) {
    this.logger = logger;
    this.startTime = performance.now();
    
    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      fps: 0,
      deviceType: this.detectDeviceType(),
      connectionSpeed: this.detectConnectionSpeed()
    };

    this.startMonitoring();
  }

  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = window.innerWidth;
    if (width >= 1024) return 'desktop';
    if (width >= 768) return 'tablet';
    return 'mobile';
  }

  private detectConnectionSpeed(): 'fast' | 'slow' | 'offline' {
    if (!navigator.onLine) return 'offline';
    
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === '4g' || effectiveType === '3g') return 'fast';
      return 'slow';
    }
    
    return 'fast'; // Default assumption
  }

  private startMonitoring(): void {
    // Monitor FPS
    let frames = 0;
    let lastTime = performance.now();
    
    const countFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFPS);
    };
    
    requestAnimationFrame(countFPS);

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }, 5000);
    }
  }

  getMetrics(): PerformanceMetrics {
    this.metrics.loadTime = performance.now() - this.startTime;
    return { ...this.metrics };
  }

  logMetrics(): void {
    const metrics = this.getMetrics();
    this.logger.info('Performance Metrics:', metrics);
  }
}

class GeoDashAdvancedApp {
  private eventBus: AdvancedEventBus;
  private logger: AdvancedLogger;
  private moduleManager: AdvancedModuleManager;
  private performanceMonitor: PerformanceMonitor;
  private loadingScreen: AdvancedLoadingScreen | null = null;
  private navigation: AdvancedNavigation | null = null;
  private particleSystem: AdvancedParticleSystem | null = null;

  constructor() {
    this.eventBus = new AdvancedEventBus();
    this.logger = new AdvancedLogger('debug');
    this.moduleManager = new AdvancedModuleManager(this.logger);
    this.performanceMonitor = new PerformanceMonitor(this.logger);

    this.setupEventListeners();
    this.logger.info('🚀 GeoDash Advanced App initialized');
  }

  private setupEventListeners(): void {
    this.eventBus.on('loading:complete', () => {
      this.onLoadingComplete();
    });

    this.eventBus.on('navigation:click', (data) => {
      this.logger.info('Navigation clicked:', data);
    });

    this.eventBus.on('theme:toggle', () => {
      this.toggleTheme();
    });

    // Performance monitoring
    window.addEventListener('beforeunload', () => {
      this.performanceMonitor.logMetrics();
    });
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('🎯 Starting application initialization...');

      // Initialize loading screen first
      await this.initializeLoadingScreen();

      // Initialize other components
      await this.initializeNavigation();
      await this.initializeParticleSystem();

      // Initialize all modules
      await this.moduleManager.initialize();

      this.logger.info('✅ Application initialization complete');
    } catch (error) {
      this.logger.error('❌ Application initialization failed:', error);
      throw error;
    }
  }

  private async initializeLoadingScreen(): Promise<void> {
    const loadingElement = document.querySelector('.loading-screen') as HTMLElement;
    if (!loadingElement) {
      this.logger.warn('Loading screen element not found');
      return;
    }

    this.loadingScreen = new AdvancedLoadingScreen(
      loadingElement,
      this.eventBus,
      this.logger
    );

    this.moduleManager.register('loadingScreen', this.loadingScreen);
    await this.loadingScreen.initialize();
  }

  private async initializeNavigation(): Promise<void> {
    const navElement = document.querySelector('header') as HTMLElement;
    if (!navElement) {
      this.logger.warn('Navigation element not found');
      return;
    }

    const navigationItems: NavigationItem[] = [
      { id: 'mods', label: 'Mods', href: '#mods', icon: 'icon-mods' },
      { id: 'download', label: 'Download', href: '#download', icon: 'icon-download' },
      { id: 'showcase', label: 'Showcase', href: '#showcase', icon: 'icon-showcase' },
      { id: 'community', label: 'Community', href: '#community', icon: 'icon-community', badge: '12' }
    ];

    this.navigation = new AdvancedNavigation(
      navElement,
      navigationItems,
      this.eventBus,
      this.logger
    );

    this.moduleManager.register('navigation', this.navigation);
    await this.navigation.initialize();
  }

  private async initializeParticleSystem(): Promise<void> {
    const particleContainer = document.querySelector('.particle-container') as HTMLElement;
    if (!particleContainer) {
      // Create particle container if it doesn't exist
      const container = document.createElement('div');
      container.className = 'particle-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
      `;
      document.body.appendChild(container);
    }

    const particleConfig = {
      count: 50,
      speed: 1,
      size: { min: 1, max: 3 },
      color: ['#4a9eff', '#ffffff', '#1e3a8a'],
      opacity: { min: 0.3, max: 1 },
      lifetime: 5000,
      gravity: 0.1,
      wind: 0.05
    };

    this.particleSystem = new AdvancedParticleSystem(
      particleContainer || document.body,
      particleConfig,
      this.eventBus,
      this.logger
    );

    this.moduleManager.register('particleSystem', this.particleSystem);
    await this.particleSystem.initialize();
  }

  private onLoadingComplete(): void {
    this.logger.info('🎉 Loading complete, transitioning to main app');
    
    // Show main content
    document.body.classList.add('loaded');
    
    // Log performance metrics
    this.performanceMonitor.logMetrics();
    
    // Start main app features
    this.startMainAppFeatures();
  }

  private startMainAppFeatures(): void {
    // Initialize typewriter effects for main content
    this.initializeTypewriterEffects();
    
    // Setup scroll animations
    this.setupScrollAnimations();
    
    // Initialize interactive features
    this.initializeInteractiveFeatures();
  }

  private initializeTypewriterEffects(): void {
    // This would initialize typewriter effects for main content
    // Implementation would be similar to the loading screen typewriter
    this.logger.info('🔤 Initializing typewriter effects for main content');
  }

  private setupScrollAnimations(): void {
    // Setup intersection observers for scroll-triggered animations
    this.logger.info('📜 Setting up scroll animations');
  }

  private initializeInteractiveFeatures(): void {
    // Initialize interactive features like hover effects, click animations, etc.
    this.logger.info('🎮 Initializing interactive features');
  }

  private toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');
    this.logger.info('🎨 Theme toggled');
  }

  public destroy(): void {
    this.logger.info('🧹 Destroying application');
    this.moduleManager.destroy();
    this.eventBus.emit('app:destroyed');
  }
}

// Initialize the application
const app = new GeoDashAdvancedApp();

// Auto-start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app.initialize().catch(error => {
      console.error('Failed to initialize application:', error);
    });
  });
} else {
  app.initialize().catch(error => {
    console.error('Failed to initialize application:', error);
  });
}

// Export for global access
(window as any).GeoDashApp = app;

export default app;
