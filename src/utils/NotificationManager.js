export class NotificationManager {
  constructor() {
    this.notifications = new Map()
    this.container = null
    this.defaultOptions = {
      type: 'info',
      duration: 5000,
      position: 'top-right',
      animation: 'slide',
      sound: false,
      persistent: false
    }
    this.init()
  }

  init() {
    this.createContainer()
    this.addStyles()
  }

  createContainer() {
    this.container = document.createElement('div')
    this.container.className = 'notification-container'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `
    document.body.appendChild(this.container)
  }

  addStyles() {
    if (document.getElementById('notification-styles')) return

    const styles = document.createElement('style')
    styles.id = 'notification-styles'
    styles.textContent = `
      .notification {
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        min-width: 300px;
        max-width: 400px;
        pointer-events: auto;
        transform: translateX(100%);
        transition: all 0.3s ease;
        border-left: 4px solid #00d4ff;
      }
      .notification.show {
        transform: translateX(0);
      }
      .notification.success {
        border-left-color: #10b981;
      }
      .notification.error {
        border-left-color: #ef4444;
      }
      .notification.warning {
        border-left-color: #f59e0b;
      }
      .notification.loading {
        border-left-color: #8b5cf6;
      }
      .notification-title {
        font-weight: bold;
        margin-bottom: 4px;
      }
      .notification-message {
        font-size: 14px;
        opacity: 0.9;
      }
      .notification-actions {
        margin-top: 12px;
        display: flex;
        gap: 8px;
      }
      .notification-action {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      .notification-action:hover {
        background: rgba(255, 255, 255, 0.2);
      }
      .notification-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
        opacity: 0.7;
      }
      .notification-close:hover {
        opacity: 1;
      }
    `
    document.head.appendChild(styles)
  }

  show(options) {
    if (typeof options === 'string') {
      options = { message: options }
    }

    const config = { ...this.defaultOptions, ...options }
    const id = config.id || this.generateId()

    const notification = this.createNotification(config, id)
    this.container.appendChild(notification)

    setTimeout(() => notification.classList.add('show'), 10)

    if (!config.persistent && config.duration > 0) {
      setTimeout(() => this.hide(id), config.duration)
    }

    this.notifications.set(id, { element: notification, config })
    return id
  }

  createNotification(config, id) {
    const notification = document.createElement('div')
    notification.className = `notification ${config.type}`
    notification.dataset.id = id

    let html = ''

    if (config.title) {
      html += `<div class="notification-title">${config.title}</div>`
    }

    html += `<div class="notification-message">${config.message}</div>`

    if (config.actions && config.actions.length > 0) {
      html += '<div class="notification-actions">'
      config.actions.forEach(action => {
        html += `<button class="notification-action" data-action="${action.id}">${action.label}</button>`
      })
      html += '</div>'
    }

    html += '<button class="notification-close">&times;</button>'

    notification.innerHTML = html

    this.setupEventListeners(notification, config)

    return notification
  }

  setupEventListeners(notification, config) {
    const closeBtn = notification.querySelector('.notification-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide(notification.dataset.id)
      })
    }

    const actionBtns = notification.querySelectorAll('.notification-action')
    actionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.action
        const action = config.actions?.find(a => a.id === actionId)
        if (action && action.callback) {
          action.callback()
        }
        this.hide(notification.dataset.id)
      })
    })
  }

  hide(id) {
    const notification = this.notifications.get(id)
    if (!notification) return

    notification.element.classList.remove('show')
    
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element)
      }
      this.notifications.delete(id)
    }, 300)
  }

  hideAll() {
    this.notifications.forEach((notification, id) => {
      this.hide(id)
    })
  }

  updateProgress(id, progress) {
    const notification = this.notifications.get(id)
    if (!notification) return

    let progressBar = notification.element.querySelector('.progress-bar')
    if (!progressBar) {
      progressBar = document.createElement('div')
      progressBar.className = 'progress-bar'
      progressBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
      `
      
      const progressFill = document.createElement('div')
      progressFill.className = 'progress-fill'
      progressFill.style.cssText = `
        height: 100%;
        background: #00d4ff;
        transition: width 0.3s ease;
        width: 0%;
      `
      
      progressBar.appendChild(progressFill)
      notification.element.appendChild(progressBar)
    }

    const progressFill = progressBar.querySelector('.progress-fill')
    if (progressFill) {
      progressFill.style.width = `${progress}%`
    }
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  success(message, options = {}) {
    return this.show({ ...options, message, type: 'success' })
  }

  error(message, options = {}) {
    return this.show({ ...options, message, type: 'error' })
  }

  warning(message, options = {}) {
    return this.show({ ...options, message, type: 'warning' })
  }

  info(message, options = {}) {
    return this.show({ ...options, message, type: 'info' })
  }

  loading(message, options = {}) {
    return this.show({ ...options, message, type: 'loading', persistent: true })
  }

  getNotifications() {
    return Array.from(this.notifications.keys())
  }

  clear() {
    this.hideAll()
  }

  destroy() {
    this.hideAll()
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
    
    const styles = document.getElementById('notification-styles')
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles)
    }
  }
}
