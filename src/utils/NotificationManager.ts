export interface NotificationConfig {
  id?: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom'
  duration?: number
  persistent?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  icon?: string
  actions?: NotificationAction[]
  progress?: number
  sound?: boolean
  animation?: 'slide' | 'fade' | 'bounce' | 'flip' | 'zoom' | 'glow'
  priority?: 'low' | 'normal' | 'high' | 'critical'
  theme?: 'light' | 'dark' | 'auto'
  customClass?: string
  onShow?: () => void
  onHide?: () => void
  onClick?: () => void
  onAction?: (actionId: string) => void
}

export interface NotificationAction {
  id: string
  label: string
  type?: 'primary' | 'secondary' | 'danger'
  icon?: string
  callback?: () => void
}

export interface NotificationInstance {
  id: string
  config: NotificationConfig
  element: HTMLElement
  timer?: number
  createdAt: number
  isVisible: boolean
}

export class NotificationManager {
  private notifications: Map<string, NotificationInstance> = new Map()
  private container: HTMLElement | null = null
  private soundEnabled: boolean = true
  private maxNotifications: number = 5
  private defaultDuration: number = 5000
  private queue: NotificationConfig[] = []
  private isProcessingQueue: boolean = false
  private audioContext: AudioContext | null = null

  constructor() {
    this.createContainer()
    this.setupSounds()
    this.setupKeyboardShortcuts()
  }

  private createContainer(): void {
    if (this.container) return

    this.container = document.createElement('div')
    this.container.className = 'notification-manager'
    this.container.innerHTML = `
      <div class="notification-container top-right" data-position="top-right"></div>
      <div class="notification-container top-left" data-position="top-left"></div>
      <div class="notification-container bottom-right" data-position="bottom-right"></div>
      <div class="notification-container bottom-left" data-position="bottom-left"></div>
      <div class="notification-container top-center" data-position="top-center"></div>
      <div class="notification-container bottom-center" data-position="bottom-center"></div>
    `

    document.body.appendChild(this.container)
    this.addStyles()
  }

  private addStyles(): void {
    if (document.getElementById('notification-styles')) return

    const styles = document.createElement('style')
    styles.id = 'notification-styles'
    styles.textContent = `
      .notification-manager {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
        font-family: var(--font-primary, 'Rajdhani', sans-serif);
      }

      .notification-container {
        position: absolute;
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-width: 400px;
        padding: 20px;
        pointer-events: none;
      }

      .notification-container.top-right {
        top: 0;
        right: 0;
      }

      .notification-container.top-left {
        top: 0;
        left: 0;
      }

      .notification-container.bottom-right {
        bottom: 0;
        right: 0;
        flex-direction: column-reverse;
      }

      .notification-container.bottom-left {
        bottom: 0;
        left: 0;
        flex-direction: column-reverse;
      }

      .notification-container.top-center {
        top: 0;
        left: 50%;
        transform: translateX(-50%);
      }

      .notification-container.bottom-center {
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        flex-direction: column-reverse;
      }

      .notification {
        position: relative;
        min-width: 320px;
        max-width: 400px;
        padding: 16px 20px;
        border-radius: 12px;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        pointer-events: auto;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
      }

      .notification::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--notification-accent, var(--color-primary));
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.3s ease;
      }

      .notification.show::before {
        transform: scaleX(1);
      }

      .notification:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      }

      .notification.success {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
        border-color: rgba(16, 185, 129, 0.3);
        --notification-accent: #10b981;
      }

      .notification.error {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
        border-color: rgba(239, 68, 68, 0.3);
        --notification-accent: #ef4444;
      }

      .notification.warning {
        background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
        border-color: rgba(245, 158, 11, 0.3);
        --notification-accent: #f59e0b;
      }

      .notification.info {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%);
        border-color: rgba(59, 130, 246, 0.3);
        --notification-accent: #3b82f6;
      }

      .notification.loading {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%);
        border-color: rgba(0, 212, 255, 0.3);
        --notification-accent: #00d4ff;
      }

      .notification-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;
      }

      .notification-icon {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--notification-accent);
        color: white;
        font-size: 14px;
        flex-shrink: 0;
      }

      .notification-title {
        font-weight: 600;
        font-size: 16px;
        color: var(--color-text, #ffffff);
        margin: 0;
      }

      .notification-close {
        margin-left: auto;
        background: none;
        border: none;
        color: var(--color-text-muted, #94a3b8);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        font-size: 18px;
        line-height: 1;
      }

      .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text, #ffffff);
      }

      .notification-message {
        color: var(--color-text-secondary, #e2e8f0);
        font-size: 14px;
        line-height: 1.5;
        margin: 0;
      }

      .notification-progress {
        margin-top: 12px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
      }

      .notification-progress-bar {
        height: 100%;
        background: var(--notification-accent);
        border-radius: 2px;
        transition: width 0.3s ease;
      }

      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .notification-action {
        padding: 6px 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.1);
        color: var(--color-text, #ffffff);
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .notification-action:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
      }

      .notification-action.primary {
        background: var(--notification-accent);
        border-color: var(--notification-accent);
        color: white;
      }

      .notification-action.danger {
        background: #ef4444;
        border-color: #ef4444;
        color: white;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes bounceIn {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .notification.animate-slide { animation: slideInRight 0.3s ease-out; }
      .notification.animate-fade { animation: fadeIn 0.3s ease-out; }
      .notification.animate-bounce { animation: bounceIn 0.5s ease-out; }

      @media (max-width: 768px) {
        .notification-container {
          max-width: calc(100vw - 40px);
          padding: 20px;
        }

        .notification {
          min-width: auto;
          max-width: 100%;
        }
      }
    `

    document.head.appendChild(styles)
  }

  show(config: NotificationConfig): string {
    const id = config.id || this.generateId()
    const finalConfig: NotificationConfig = {
      duration: this.defaultDuration,
      position: 'top-right',
      animation: 'slide',
      priority: 'normal',
      sound: this.soundEnabled,
      ...config,
      id
    }

    if (this.notifications.size >= this.maxNotifications) {
      if (finalConfig.priority === 'critical') {
        this.removeOldest()
      } else {
        this.queue.push(finalConfig)
        return id
      }
    }

    this.createNotification(finalConfig)
    return id
  }

  private createNotification(config: NotificationConfig): void {
    const element = this.createElement(config)
    const instance: NotificationInstance = {
      id: config.id!,
      config,
      element,
      createdAt: Date.now(),
      isVisible: false
    }

    this.notifications.set(config.id!, instance)
    this.appendToContainer(element, config.position!)
    this.animateIn(instance)

    if (config.sound) {
      this.playSound(config.type)
    }

    if (config.onShow) {
      config.onShow()
    }

    if (!config.persistent && config.duration! > 0) {
      instance.timer = window.setTimeout(() => {
        this.hide(config.id!)
      }, config.duration)
    }
  }

  private createElement(config: NotificationConfig): HTMLElement {
    const notification = document.createElement('div')
    notification.className = `notification ${config.type} ${config.customClass || ''}`
    notification.setAttribute('data-id', config.id!)

    const icon = this.getIcon(config.type, config.icon)
    const hasTitle = config.title && config.title.trim() !== ''

    notification.innerHTML = `
      ${hasTitle ? `
        <div class="notification-header">
          <div class="notification-icon">${icon}</div>
          <h4 class="notification-title">${config.title}</h4>
          <button class="notification-close" aria-label="Close notification">×</button>
        </div>
      ` : `
        <div class="notification-header">
          <div class="notification-icon">${icon}</div>
          <button class="notification-close" aria-label="Close notification">×</button>
        </div>
      `}
      <p class="notification-message">${config.message}</p>
      ${config.progress !== undefined ? `
        <div class="notification-progress">
          <div class="notification-progress-bar" style="width: ${config.progress}%"></div>
        </div>
      ` : ''}
      ${config.actions && config.actions.length > 0 ? `
        <div class="notification-actions">
          ${config.actions.map(action => `
            <button class="notification-action ${action.type || 'secondary'}" data-action="${action.id}">
              ${action.icon ? `<span class="action-icon">${action.icon}</span>` : ''}
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
    `

    this.setupEventListeners(notification, config)
    return notification
  }

  private setupEventListeners(element: HTMLElement, config: NotificationConfig): void {
    const closeBtn = element.querySelector('.notification-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.hide(config.id!)
      })
    }

    if (config.onClick) {
      element.addEventListener('click', config.onClick)
    }

    const actionButtons = element.querySelectorAll('.notification-action')
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation()
        const actionId = (button as HTMLElement).dataset.action!
        const action = config.actions?.find(a => a.id === actionId)

        if (action?.callback) {
          action.callback()
        }

        if (config.onAction) {
          config.onAction(actionId)
        }
      })
    })
  }

  private getIcon(type: string, customIcon?: string): string {
    if (customIcon) return customIcon

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳',
      custom: '●'
    }

    return icons[type as keyof typeof icons] || icons.info
  }

  private appendToContainer(element: HTMLElement, position: string): void {
    const container = this.container?.querySelector(`[data-position="${position}"]`)
    if (container) {
      container.appendChild(element)
    }
  }

  private animateIn(instance: NotificationInstance): void {
    const { element, config } = instance

    element.classList.add(`animate-${config.animation}`)

    requestAnimationFrame(() => {
      element.classList.add('show')
      instance.isVisible = true
    })
  }

  hide(id: string): boolean {
    const instance = this.notifications.get(id)
    if (!instance) return false

    if (instance.timer) {
      clearTimeout(instance.timer)
    }

    this.animateOut(instance)
    return true
  }

  private animateOut(instance: NotificationInstance): void {
    const { element, config } = instance

    element.style.transition = 'all 0.3s ease-out'
    element.style.transform = 'translateX(100%)'
    element.style.opacity = '0'

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }

      this.notifications.delete(instance.id)

      if (config.onHide) {
        config.onHide()
      }
    }, 300)
  }

  private removeOldest(): void {
    let oldest: NotificationInstance | null = null

    for (const instance of this.notifications.values()) {
      if (!oldest || instance.createdAt < oldest.createdAt) {
        oldest = instance
      }
    }

    if (oldest) {
      this.hide(oldest.id)
    }
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private setupSounds(): void {
    this.createAudioContext()
  }

  private createAudioContext(): void {
    if (typeof window === 'undefined' || !window.AudioContext) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.audioContext = audioContext
    } catch (error) {
      console.warn('Audio context not available:', error)
    }
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAll()
      }
    })
  }

  private playSound(type: string): void {
    if (!this.soundEnabled || !this.audioContext) return

    try {
      const frequencies = {
        success: [523.25, 659.25, 783.99],
        error: [349.23, 293.66],
        warning: [440, 554.37],
        info: [523.25, 659.25],
        loading: [440],
        custom: [523.25]
      }

      const freq = frequencies[type as keyof typeof frequencies] || frequencies.info
      this.playTone(freq, 0.1, 200)
    } catch (error) {
      console.warn('Failed to play notification sound:', error)
    }
  }

  private playTone(frequencies: number[], volume: number, duration: number): void {
    if (!this.audioContext) return

    frequencies.forEach(freq => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext!.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + duration / 1000)

      oscillator.start(this.audioContext!.currentTime)
      oscillator.stop(this.audioContext!.currentTime + duration / 1000)
    })
  }

  updateProgress(id: string, progress: number): boolean {
    const instance = this.notifications.get(id)
    if (!instance) return false

    const progressBar = instance.element.querySelector('.notification-progress-bar') as HTMLElement
    if (progressBar) {
      progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`
    }

    return true
  }

  hideAll(): void {
    for (const instance of this.notifications.values()) {
      this.hide(instance.id)
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled
  }
}
