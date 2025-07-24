export class AdvancedComponents {
    constructor() {
        this.components = new Map();
        this.observers = new Set();
        this.themes = new Map();
        this.currentTheme = 'default';
        
        this.initializeThemes();
        this.setupGlobalStyles();
    }
    
    initializeThemes() {
        this.themes.set('default', {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            background: '#ffffff',
            surface: '#f8f9fa',
            text: '#2d3748',
            textSecondary: '#4a5568',
            border: 'rgba(0, 0, 0, 0.1)',
            shadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        });
        
        this.themes.set('dark', {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            background: '#1a202c',
            surface: '#2d3748',
            text: '#f7fafc',
            textSecondary: '#e2e8f0',
            border: 'rgba(255, 255, 255, 0.1)',
            shadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        });
    }
    
    setupGlobalStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .advanced-component {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                box-sizing: border-box;
            }
            
            .advanced-component:focus {
                outline: 2px solid var(--primary-color);
                outline-offset: 2px;
            }
            
            .ripple-effect {
                position: relative;
                overflow: hidden;
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple-animation 0.6s linear;
                pointer-events: none;
            }
            
            @keyframes ripple-animation {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .floating-label {
                position: relative;
            }
            
            .floating-label input,
            .floating-label textarea {
                width: 100%;
                padding: 12px 16px 8px 16px;
                border: 2px solid var(--border-color);
                border-radius: 8px;
                background: var(--surface-color);
                color: var(--text-color);
                font-size: 16px;
                transition: all 0.3s ease;
            }
            
            .floating-label label {
                position: absolute;
                left: 16px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--text-secondary-color);
                font-size: 16px;
                pointer-events: none;
                transition: all 0.3s ease;
                background: var(--surface-color);
                padding: 0 4px;
            }
            
            .floating-label input:focus,
            .floating-label input:not(:placeholder-shown),
            .floating-label textarea:focus,
            .floating-label textarea:not(:placeholder-shown) {
                border-color: var(--primary-color);
            }
            
            .floating-label input:focus + label,
            .floating-label input:not(:placeholder-shown) + label,
            .floating-label textarea:focus + label,
            .floating-label textarea:not(:placeholder-shown) + label {
                top: 0;
                font-size: 12px;
                color: var(--primary-color);
                transform: translateY(-50%);
            }
        `;
        document.head.appendChild(style);
    }
    
    createButton(options = {}) {
        const button = document.createElement('button');
        button.className = 'advanced-component ripple-effect';
        button.textContent = options.text || 'Button';
        
        const style = {
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            background: options.variant === 'outline' ? 'transparent' : 'var(--primary-color)',
            color: options.variant === 'outline' ? 'var(--primary-color)' : 'white',
            border: options.variant === 'outline' ? '2px solid var(--primary-color)' : 'none',
            boxShadow: 'var(--shadow)',
            ...options.style
        };
        
        Object.assign(button.style, style);
        
        this.addRippleEffect(button);
        this.addHoverEffect(button, options.variant);
        
        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }
        
        return button;
    }
    
    createInput(options = {}) {
        const container = document.createElement('div');
        container.className = 'floating-label advanced-component';
        
        const input = document.createElement(options.multiline ? 'textarea' : 'input');
        input.type = options.type || 'text';
        input.placeholder = ' ';
        input.required = options.required || false;
        
        const label = document.createElement('label');
        label.textContent = options.label || 'Input';
        
        container.appendChild(input);
        container.appendChild(label);
        
        if (options.onChange) {
            input.addEventListener('input', (e) => options.onChange(e.target.value));
        }
        
        return { container, input, label };
    }
    
    createCard(options = {}) {
        const card = document.createElement('div');
        card.className = 'advanced-component';
        
        const style = {
            background: 'var(--surface-color)',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow)',
            border: '1px solid var(--border-color)',
            ...options.style
        };
        
        Object.assign(card.style, style);
        
        if (options.title) {
            const title = document.createElement('h3');
            title.textContent = options.title;
            title.style.margin = '0 0 16px 0';
            title.style.color = 'var(--text-color)';
            card.appendChild(title);
        }
        
        if (options.content) {
            const content = document.createElement('div');
            content.innerHTML = options.content;
            content.style.color = 'var(--text-secondary-color)';
            card.appendChild(content);
        }
        
        this.addHoverEffect(card);
        
        return card;
    }
    
    createModal(options = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const modal = document.createElement('div');
        modal.className = 'modal advanced-component';
        modal.style.cssText = `
            background: var(--surface-color);
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.9);
            transition: transform 0.3s ease;
            box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
        `;
        
        if (options.title) {
            const header = document.createElement('div');
            header.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 16px;
            `;
            
            const title = document.createElement('h2');
            title.textContent = options.title;
            title.style.margin = '0';
            title.style.color = 'var(--text-color)';
            
            const closeBtn = this.createButton({
                text: '×',
                style: {
                    padding: '8px 12px',
                    fontSize: '20px',
                    background: 'transparent',
                    color: 'var(--text-secondary-color)',
                    boxShadow: 'none'
                },
                onClick: () => this.closeModal(overlay)
            });
            
            header.appendChild(title);
            header.appendChild(closeBtn);
            modal.appendChild(header);
        }
        
        if (options.content) {
            const content = document.createElement('div');
            content.innerHTML = options.content;
            content.style.color = 'var(--text-secondary-color)';
            modal.appendChild(content);
        }
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeModal(overlay);
            }
        });
        
        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        });
        
        return { overlay, modal };
    }
    
    closeModal(overlay) {
        overlay.style.opacity = '0';
        overlay.querySelector('.modal').style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    
    createProgressBar(options = {}) {
        const container = document.createElement('div');
        container.className = 'progress-container advanced-component';
        container.style.cssText = `
            width: 100%;
            height: 8px;
            background: var(--border-color);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        `;
        
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        bar.style.cssText = `
            height: 100%;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            border-radius: 4px;
            width: 0%;
            transition: width 0.3s ease;
            position: relative;
            overflow: hidden;
        `;
        
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: shimmer 2s infinite;
        `;
        
        const shimmerKeyframes = `
            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        
        if (!document.querySelector('#shimmer-styles')) {
            const style = document.createElement('style');
            style.id = 'shimmer-styles';
            style.textContent = shimmerKeyframes;
            document.head.appendChild(style);
        }
        
        bar.appendChild(shimmer);
        container.appendChild(bar);
        
        return {
            container,
            setProgress: (value) => {
                bar.style.width = Math.max(0, Math.min(100, value)) + '%';
            }
        };
    }
    
    createToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast advanced-component';
        
        const colors = {
            info: 'var(--primary-color)',
            success: '#43e97b',
            warning: '#feca57',
            error: '#ff6b6b'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: var(--shadow);
            z-index: 10001;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
        
        return toast;
    }
    
    addRippleEffect(element) {
        element.addEventListener('click', (e) => {
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            const ripple = document.createElement('div');
            ripple.className = 'ripple';
            ripple.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
            `;
            
            element.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
    
    addHoverEffect(element, variant = 'filled') {
        element.addEventListener('mouseenter', () => {
            if (variant === 'outline') {
                element.style.background = 'var(--primary-color)';
                element.style.color = 'white';
            } else {
                element.style.transform = 'translateY(-2px)';
                element.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (variant === 'outline') {
                element.style.background = 'transparent';
                element.style.color = 'var(--primary-color)';
            } else {
                element.style.transform = 'translateY(0)';
                element.style.boxShadow = 'var(--shadow)';
            }
        });
    }
    
    setTheme(themeName) {
        const theme = this.themes.get(themeName);
        if (!theme) return;
        
        this.currentTheme = themeName;
        const root = document.documentElement;
        
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--background-color', theme.background);
        root.style.setProperty('--surface-color', theme.surface);
        root.style.setProperty('--text-color', theme.text);
        root.style.setProperty('--text-secondary-color', theme.textSecondary);
        root.style.setProperty('--border-color', theme.border);
        root.style.setProperty('--shadow', theme.shadow);
        
        this.notifyObservers('themeChanged', { theme: themeName, colors: theme });
    }
    
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    notifyObservers(event, data) {
        for (const observer of this.observers) {
            observer(event, data);
        }
    }
    
    registerComponent(name, component) {
        this.components.set(name, component);
    }
    
    getComponent(name) {
        return this.components.get(name);
    }
    
    createCustomComponent(name, factory) {
        this.registerComponent(name, factory);
        return factory;
    }
}
