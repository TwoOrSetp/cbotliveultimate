import './styles/main.css';
import { LoadingManager } from './utils/LoadingManager';
import { TypingAnimation } from './utils/TypingAnimation';
import { ParticleSystem } from './utils/ParticleSystem';
import { ClickbotEngine } from './clickbot/ClickbotEngine';
import { UIManager } from './components/UIManager';
import { Dashboard } from './components/Dashboard';
import { PerformanceMonitor } from './components/PerformanceMonitor';
import { SoundSystem } from './utils/SoundSystem';
import { VisualEffects } from './utils/VisualEffects';
import { EventEmitter } from './utils/EventEmitter';
import type { LoadingState, ClickbotConfig } from './types';

class GeoDashApp {
  private loadingManager: LoadingManager;
  private typingAnimation: TypingAnimation;
  private particleSystem: ParticleSystem;
  private clickbotEngine: ClickbotEngine;
  private uiManager: UIManager;
  private dashboard: Dashboard;
  private performanceMonitor: PerformanceMonitor;
  private soundSystem: SoundSystem;
  private visualEffects: VisualEffects;
  private eventEmitter: EventEmitter;
  private isInitialized: boolean = false;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.loadingManager = new LoadingManager();
    this.typingAnimation = new TypingAnimation();
    this.particleSystem = new ParticleSystem();
    this.clickbotEngine = new ClickbotEngine(this.eventEmitter);
    this.uiManager = new UIManager(this.eventEmitter);
    this.dashboard = new Dashboard(this.eventEmitter);
    this.performanceMonitor = new PerformanceMonitor(this.eventEmitter);
    this.soundSystem = new SoundSystem();
    this.visualEffects = new VisualEffects();

    this.init();
  }

  private async init(): Promise<void> {
    try {
      console.log('Starting GeoDash Pro initialization...');
      await this.showLoadingScreen();
      await this.initializeComponents();
      await this.setupEventListeners();
      await this.hideLoadingScreen();
      this.startApplication();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.handleInitializationError(error);
    }
  }

  private handleInitializationError(error: any): void {
    const loadingStatus = document.querySelector('.loading-status') as HTMLElement;
    if (loadingStatus) {
      loadingStatus.textContent = 'Initialization failed. Retrying...';
      loadingStatus.style.color = '#ff4444';
    }

    setTimeout(() => {
      this.hideLoadingScreen();
      this.startApplication();
    }, 2000);
  }

  private async showLoadingScreen(): Promise<void> {
    const loadingScreen = document.getElementById('loading-screen');
    const progressFill = document.querySelector('.progress-fill') as HTMLElement;
    const loadingStatus = document.querySelector('.loading-status') as HTMLElement;
    
    if (!loadingScreen || !progressFill || !loadingStatus) return;

    const steps = [
      { progress: 10, status: 'Loading core modules...' },
      { progress: 25, status: 'Initializing clickbot engine...' },
      { progress: 40, status: 'Setting up neural networks...' },
      { progress: 60, status: 'Loading pattern recognition...' },
      { progress: 80, status: 'Configuring stealth algorithms...' },
      { progress: 95, status: 'Finalizing setup...' },
      { progress: 100, status: 'Ready!' }
    ];

    for (const step of steps) {
      await this.updateLoadingProgress(step.progress, step.status);
      await this.delay(300 + Math.random() * 200);
    }
  }

  private async updateLoadingProgress(progress: number, status: string): Promise<void> {
    const progressFill = document.querySelector('.progress-fill') as HTMLElement;
    const loadingStatus = document.querySelector('.loading-status') as HTMLElement;
    
    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }
    
    if (loadingStatus) {
      loadingStatus.textContent = status;
    }
  }

  private async initializeComponents(): Promise<void> {
    try {
      console.log('Initializing particle system...');
      await this.particleSystem.init();

      console.log('Initializing clickbot engine...');
      await this.clickbotEngine.init();

      console.log('Initializing UI manager...');
      await this.uiManager.init();

      console.log('Initializing dashboard...');
      await this.dashboard.init();

      console.log('Initializing performance monitor...');
      await this.performanceMonitor.init();

      console.log('Initializing sound system...');
      await this.soundSystem.init();

      console.log('Initializing visual effects...');
      await this.visualEffects.init();

      console.log('Setting up animations...');
      this.setupTypingAnimations();
      this.setupParticleEffects();

      console.log('All components initialized successfully');
    } catch (error) {
      console.warn('Some components failed to initialize:', error);
      this.setupTypingAnimations();
    }
  }

  private setupTypingAnimations(): void {
    const typingElements = document.querySelectorAll('.typing-text');
    typingElements.forEach((element, index) => {
      const text = element.getAttribute('data-text') || '';
      const delay = parseInt(element.getAttribute('data-delay') || '0');
      
      setTimeout(() => {
        this.typingAnimation.animate(element as HTMLElement, text, {
          speed: 50,
          cursor: true,
          delay: 0
        });
      }, delay);
    });
  }

  private setupParticleEffects(): void {
    const particleContainer = document.querySelector('.loading-particles');
    if (particleContainer) {
      this.particleSystem.createParticles(particleContainer as HTMLElement, {
        count: 50,
        size: 2,
        speed: 1,
        color: '#00ff88',
        opacity: 0.6
      });
    }
  }

  private async setupEventListeners(): Promise<void> {
    const startButton = document.getElementById('start-bot');
    const configureButton = document.getElementById('configure-bot');
    const dashboardButton = document.getElementById('open-dashboard');

    if (startButton) {
      startButton.addEventListener('click', () => this.handleStartBot());
    }

    if (configureButton) {
      configureButton.addEventListener('click', () => this.handleConfigureBot());
    }

    if (dashboardButton) {
      dashboardButton.addEventListener('click', () => this.handleOpenDashboard());
    }

    this.setupSettingsListeners();
    this.setupNavigationListeners();
    this.setupStatsAnimation();
    this.setupEffectListeners();
  }

  private setupSettingsListeners(): void {
    const clickDelaySlider = document.getElementById('click-delay') as HTMLInputElement;
    const randomizationSlider = document.getElementById('randomization') as HTMLInputElement;
    const autoStartCheckbox = document.getElementById('auto-start') as HTMLInputElement;
    const stealthModeCheckbox = document.getElementById('stealth-mode') as HTMLInputElement;

    if (clickDelaySlider) {
      clickDelaySlider.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        const valueDisplay = clickDelaySlider.parentElement?.querySelector('.setting-value');
        if (valueDisplay) valueDisplay.textContent = `${value}ms`;
        this.updateClickbotConfig({ clickDelay: parseInt(value) });
      });
    }

    if (randomizationSlider) {
      randomizationSlider.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        const valueDisplay = randomizationSlider.parentElement?.querySelector('.setting-value');
        if (valueDisplay) valueDisplay.textContent = `${value}%`;
        this.updateClickbotConfig({ randomization: parseInt(value) });
      });
    }

    if (autoStartCheckbox) {
      autoStartCheckbox.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        this.updateClickbotConfig({ autoStart: checked });
      });
    }

    if (stealthModeCheckbox) {
      stealthModeCheckbox.addEventListener('change', (e) => {
        const checked = (e.target as HTMLInputElement).checked;
        this.updateClickbotConfig({ stealthMode: checked });
      });
    }
  }

  private setupNavigationListeners(): void {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          this.scrollToSection(href.substring(1));
        }
      });
    });

    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }
  }

  private setupStatsAnimation(): void {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const target = parseInt(element.getAttribute('data-target') || '0');
          this.animateNumber(element, 0, target, 2000);
          observer.unobserve(element);
        }
      });
    });

    statNumbers.forEach(stat => observer.observe(stat));
  }

  private animateNumber(element: HTMLElement, start: number, end: number, duration: number): void {
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      
      element.textContent = current.toString();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  private scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private updateClickbotConfig(config: Partial<ClickbotConfig>): void {
    this.clickbotEngine.updateConfig(config);
  }

  private async handleStartBot(): Promise<void> {
    try {
      if (this.clickbotEngine.isRunning()) {
        await this.clickbotEngine.stop();
        this.updateStartButton('Start Clickbot');
        this.soundSystem.playShutdownSound();
        this.visualEffects.createScreenFlash('#ff4444', 0.1);
      } else {
        await this.clickbotEngine.start();
        this.updateStartButton('Stop Clickbot');
        this.soundSystem.playStartupSound();
        this.visualEffects.createBotStartEffect();
        this.visualEffects.createScreenFlash('#00ff88', 0.1);
      }
    } catch (error) {
      console.error('Failed to toggle clickbot:', error);
      this.soundSystem.playErrorSound();
      this.visualEffects.createErrorEffect({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
  }

  private handleConfigureBot(): void {
    const settingsSection = document.getElementById('settings');
    if (settingsSection) {
      settingsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private handleOpenDashboard(): void {
    this.dashboard.show();
    this.soundSystem.playNotificationSound();
    this.visualEffects.createSuccessEffect({ x: window.innerWidth / 2, y: 100 });
  }

  private updateStartButton(text: string): void {
    const startButton = document.getElementById('start-bot');
    if (startButton) {
      startButton.textContent = text;
    }
  }

  private async hideLoadingScreen(): Promise<void> {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app');
    
    if (loadingScreen && appContainer) {
      await this.delay(500);
      
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease-out';
      
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        appContainer.style.display = 'block';
        appContainer.style.opacity = '0';
        appContainer.style.transition = 'opacity 0.5s ease-in';
        
        setTimeout(() => {
          appContainer.style.opacity = '1';
        }, 50);
      }, 500);
    }
  }

  private startApplication(): void {
    this.isInitialized = true;
    console.log('GeoDash Pro application initialized successfully');

    this.soundSystem.playStartupSound();
    this.startMatrixEffect();
    this.eventEmitter.emit('app:ready');
  }

  private startMatrixEffect(): void {
    setInterval(() => {
      if (this.isInitialized) {
        this.visualEffects.createMatrixEffect();
      }
    }, 200);
  }

  private setupEffectListeners(): void {
    this.eventEmitter.on('visual:click-effect', (clickEvent) => {
      this.visualEffects.createClickEffect({ x: clickEvent.x, y: clickEvent.y });
      this.soundSystem.playClickSound();
    });

    this.eventEmitter.on('bot:success', (data) => {
      this.visualEffects.createSuccessEffect({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      this.soundSystem.playSuccessSound();
    });

    this.eventEmitter.on('bot:error', (data) => {
      this.visualEffects.createErrorEffect({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      this.soundSystem.playErrorSound();
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GeoDashApp();
});
