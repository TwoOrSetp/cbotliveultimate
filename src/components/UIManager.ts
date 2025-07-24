import type { EventEmitter, BotState, PerformanceMetrics, ClickbotConfig } from '../types';

export class UIManager {
  private eventEmitter: EventEmitter;
  private isInitialized: boolean = false;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }

  async init(): Promise<void> {
    this.setupEventListeners();
    this.initializeComponents();
    this.isInitialized = true;
    console.log('UIManager initialized');
  }

  private setupEventListeners(): void {
    this.eventEmitter.on('bot:started', (state: BotState) => {
      this.updateBotStatus('running');
      this.updateStartButton('Stop Clickbot');
    });

    this.eventEmitter.on('bot:stopped', (state: BotState) => {
      this.updateBotStatus('stopped');
      this.updateStartButton('Start Clickbot');
    });

    this.eventEmitter.on('bot:paused', (state: BotState) => {
      this.updateBotStatus('paused');
    });

    this.eventEmitter.on('bot:resumed', (state: BotState) => {
      this.updateBotStatus('running');
    });

    this.eventEmitter.on('metrics:updated', (metrics: PerformanceMetrics) => {
      this.updateMetricsDisplay(metrics);
    });

    this.eventEmitter.on('config:updated', (config: ClickbotConfig) => {
      this.updateConfigDisplay(config);
    });

    this.eventEmitter.on('click:executed', (clickEvent) => {
      this.showClickFeedback(clickEvent);
    });
  }

  private initializeComponents(): void {
    this.initializeStatusIndicator();
    this.initializeMetricsDisplay();
    this.initializeConfigPanel();
    this.initializeNotificationSystem();
  }

  private initializeStatusIndicator(): void {
    const statusIndicator = document.createElement('div');
    statusIndicator.id = 'bot-status-indicator';
    statusIndicator.className = 'status-indicator';
    statusIndicator.innerHTML = `
      <div class="status-light"></div>
      <span class="status-text">Ready</span>
    `;

    const header = document.querySelector('.navbar');
    if (header) {
      header.appendChild(statusIndicator);
    }
  }

  private initializeMetricsDisplay(): void {
    const metricsContainer = document.querySelector('.hero-stats');
    if (metricsContainer) {
      this.updateMetricsElements();
    }
  }

  private initializeConfigPanel(): void {
    const configElements = document.querySelectorAll('.setting-item input');
    configElements.forEach(element => {
      element.addEventListener('change', () => {
        this.handleConfigChange();
      });
    });
  }

  private initializeNotificationSystem(): void {
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'notification-container';
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
  }

  private updateBotStatus(status: 'running' | 'stopped' | 'paused'): void {
    const statusIndicator = document.getElementById('bot-status-indicator');
    if (!statusIndicator) return;

    const statusLight = statusIndicator.querySelector('.status-light') as HTMLElement;
    const statusText = statusIndicator.querySelector('.status-text') as HTMLElement;

    if (statusLight && statusText) {
      statusLight.className = `status-light ${status}`;
      statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }
  }

  private updateStartButton(text: string): void {
    const startButton = document.getElementById('start-bot');
    if (startButton) {
      startButton.textContent = text;
      startButton.classList.toggle('active', text.includes('Stop'));
    }
  }

  private updateMetricsDisplay(metrics: PerformanceMetrics): void {
    this.updateStatNumber('accuracy', metrics.accuracy.toFixed(1));
    this.updateStatNumber('cps', Math.round(metrics.clicksPerSecond).toString());
    this.updateStatNumber('total-clicks', metrics.totalClicks.toString());
  }

  private updateStatNumber(statId: string, value: string): void {
    const statElement = document.querySelector(`[data-stat="${statId}"]`);
    if (statElement) {
      statElement.textContent = value;
    }
  }

  private updateMetricsElements(): void {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((element, index) => {
      const statElement = element as HTMLElement;
      switch (index) {
        case 0:
          statElement.setAttribute('data-stat', 'accuracy');
          break;
        case 1:
          statElement.setAttribute('data-stat', 'cps');
          break;
        case 2:
          statElement.setAttribute('data-stat', 'total-clicks');
          break;
      }
    });
  }

  private updateConfigDisplay(config: ClickbotConfig): void {
    const clickDelaySlider = document.getElementById('click-delay') as HTMLInputElement;
    const randomizationSlider = document.getElementById('randomization') as HTMLInputElement;
    const autoStartCheckbox = document.getElementById('auto-start') as HTMLInputElement;
    const stealthModeCheckbox = document.getElementById('stealth-mode') as HTMLInputElement;

    if (clickDelaySlider) {
      clickDelaySlider.value = config.clickDelay.toString();
      this.updateSliderValue(clickDelaySlider, `${config.clickDelay}ms`);
    }

    if (randomizationSlider) {
      randomizationSlider.value = config.randomization.toString();
      this.updateSliderValue(randomizationSlider, `${config.randomization}%`);
    }

    if (autoStartCheckbox) {
      autoStartCheckbox.checked = config.autoStart;
    }

    if (stealthModeCheckbox) {
      stealthModeCheckbox.checked = config.stealthMode;
    }
  }

  private updateSliderValue(slider: HTMLInputElement, value: string): void {
    const valueDisplay = slider.parentElement?.querySelector('.setting-value');
    if (valueDisplay) {
      valueDisplay.textContent = value;
    }
  }

  private handleConfigChange(): void {
    console.log('Configuration changed');
  }

  private showClickFeedback(clickEvent: any): void {
    const feedback = document.createElement('div');
    feedback.className = 'click-feedback';
    feedback.style.cssText = `
      position: fixed;
      left: ${clickEvent.x}px;
      top: ${clickEvent.y}px;
      width: 20px;
      height: 20px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      animation: clickPulse 0.3s ease-out forwards;
    `;

    document.body.appendChild(feedback);

    setTimeout(() => {
      if (feedback.parentElement) {
        feedback.parentElement.removeChild(feedback);
      }
    }, 300);
  }

  showNotification(message: string, type: 'success' | 'warning' | 'error' = 'success'): void {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    const container = document.getElementById('notification-container');
    if (container) {
      container.appendChild(notification);

      setTimeout(() => {
        notification.classList.add('show');
      }, 100);

      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentElement) {
            notification.parentElement.removeChild(notification);
          }
        }, 300);
      }, 3000);
    }
  }

  updateProgress(progress: number, status: string): void {
    const progressBar = document.querySelector('.progress-fill') as HTMLElement;
    const statusText = document.querySelector('.loading-status') as HTMLElement;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (statusText) {
      statusText.textContent = status;
    }
  }

  showModal(title: string, content: string): void {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-content">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector('.modal-close');
    const overlay = modal;

    const closeModal = () => {
      if (modal.parentElement) {
        modal.parentElement.removeChild(modal);
      }
    };

    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }

  highlightElement(selector: string, duration: number = 2000): void {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.classList.add('highlighted');
      setTimeout(() => {
        element.classList.remove('highlighted');
      }, duration);
    }
  }

  animateValue(element: HTMLElement, start: number, end: number, duration: number): void {
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

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}
