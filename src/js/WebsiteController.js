import { AnimationEngine } from './core/AnimationEngine.js';
import { ParticleSystem } from './effects/ParticleSystem.js';
import { AdvancedComponents } from './ui/AdvancedComponents.js';

export class WebsiteController {
    constructor() {
        this.isInitialized = false;
        this.modules = new Map();
        this.observers = new Set();
        this.stats = {
            visitors: 0,
            downloads: 0,
            uptime: Date.now(),
            performance: { fps: 60, memory: 0 }
        };
        
        this.config = {
            animations: true,
            particles: true,
            darkMode: false,
            autoSave: true,
            analytics: true
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Advanced Website Controller...');
            
            await this.initializeCore();
            await this.initializeEffects();
            await this.initializeUI();
            await this.setupEventListeners();
            await this.loadUserPreferences();
            
            this.isInitialized = true;
            this.startPerformanceMonitoring();
            this.trackVisitor();
            
            console.log('✅ Website Controller initialized successfully');
            this.notifyObservers('initialized', this.getStatus());
            
        } catch (error) {
            console.error('❌ Failed to initialize Website Controller:', error);
        }
    }
    
    async initializeCore() {
        this.animationEngine = new AnimationEngine();
        this.components = new AdvancedComponents();
        
        this.animationEngine.addObserver((stats) => {
            this.stats.performance.fps = stats.fps;
        });
        
        this.modules.set('animations', this.animationEngine);
        this.modules.set('components', this.components);
    }
    
    async initializeEffects() {
        if (!this.config.particles) return;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        document.body.appendChild(canvas);
        
        this.particleSystem = new ParticleSystem(canvas);
        this.particleSystem.start();
        
        this.createBackgroundEffects();
        this.modules.set('particles', this.particleSystem);
    }
    
    createBackgroundEffects() {
        this.particleSystem.createEmitter(
            window.innerWidth * 0.1,
            window.innerHeight * 0.5,
            {
                rate: 2,
                particleOptions: {
                    size: 2,
                    life: 3,
                    maxLife: 3,
                    behavior: 'float',
                    color: '#667eea'
                },
                pattern: 'cone',
                angle: 0,
                spread: Math.PI / 4
            }
        );
        
        this.particleSystem.createEmitter(
            window.innerWidth * 0.9,
            window.innerHeight * 0.3,
            {
                rate: 1.5,
                particleOptions: {
                    size: 1.5,
                    life: 4,
                    maxLife: 4,
                    behavior: 'sine',
                    color: '#f093fb'
                },
                pattern: 'cone',
                angle: Math.PI,
                spread: Math.PI / 6
            }
        );
    }
    
    async initializeUI() {
        this.setupNavigationEffects();
        this.setupScrollEffects();
        this.setupButtonEffects();
        this.setupFormEnhancements();
        this.createFloatingActionButton();
        this.setupThemeToggle();
    }
    
    setupNavigationEffects() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            if (currentScrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.backdropFilter = 'blur(20px)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            }
            
            lastScrollY = currentScrollY;
        });
    }
    
    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElementIn(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.hero-content, .stat-item, .feature-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }
    
    animateElementIn(element) {
        this.animationEngine.animate(element, {
            opacity: 1,
            transform: 'translateY(0px)'
        }, {
            duration: 800,
            easing: 'easeOutCubic',
            delay: Math.random() * 200
        });
    }
    
    setupButtonEffects() {
        document.querySelectorAll('.btn').forEach(button => {
            this.components.addRippleEffect(button);
            
            button.addEventListener('mouseenter', () => {
                this.animationEngine.animate(button, {
                    transform: 'translateY(-2px) scale(1.02)'
                }, { duration: 200, easing: 'easeOutQuad' });
            });
            
            button.addEventListener('mouseleave', () => {
                this.animationEngine.animate(button, {
                    transform: 'translateY(0px) scale(1)'
                }, { duration: 200, easing: 'easeOutQuad' });
            });
        });
    }
    
    setupFormEnhancements() {
        document.querySelectorAll('input, textarea').forEach(input => {
            const container = input.closest('.form-group') || input.parentElement;
            
            input.addEventListener('focus', () => {
                container.style.transform = 'scale(1.02)';
                container.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
            });
            
            input.addEventListener('blur', () => {
                container.style.transform = 'scale(1)';
                container.style.boxShadow = 'none';
            });
        });
    }
    
    createFloatingActionButton() {
        const fab = this.components.createButton({
            text: '🚀',
            style: {
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                fontSize: '24px',
                zIndex: '1000',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
            },
            onClick: () => this.showQuickActions()
        });
        
        document.body.appendChild(fab);
        
        let isVisible = false;
        window.addEventListener('scroll', () => {
            const shouldShow = window.scrollY > 300;
            
            if (shouldShow && !isVisible) {
                isVisible = true;
                this.animationEngine.animate(fab, {
                    opacity: 1,
                    transform: 'scale(1)'
                }, { duration: 300, easing: 'easeOutBack' });
            } else if (!shouldShow && isVisible) {
                isVisible = false;
                this.animationEngine.animate(fab, {
                    opacity: 0,
                    transform: 'scale(0)'
                }, { duration: 300, easing: 'easeInBack' });
            }
        });
        
        fab.style.opacity = '0';
        fab.style.transform = 'scale(0)';
    }
    
    showQuickActions() {
        const actions = [
            { text: 'Scroll to Top', action: () => this.scrollToTop() },
            { text: 'Toggle Theme', action: () => this.toggleTheme() },
            { text: 'Download', action: () => this.triggerDownload() },
            { text: 'Contact', action: () => this.showContact() }
        ];
        
        const content = actions.map(action => 
            `<button class="quick-action-btn" onclick="window.websiteController.${action.action.name}()">${action.text}</button>`
        ).join('');
        
        this.components.createModal({
            title: 'Quick Actions',
            content: `
                <div style="display: grid; gap: 12px;">
                    ${content}
                </div>
                <style>
                    .quick-action-btn {
                        padding: 12px 16px;
                        border: none;
                        border-radius: 8px;
                        background: var(--primary-color);
                        color: white;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .quick-action-btn:hover {
                        background: var(--secondary-color);
                        transform: translateY(-2px);
                    }
                </style>
            `
        });
    }
    
    setupThemeToggle() {
        const toggle = document.createElement('button');
        toggle.innerHTML = '🌙';
        toggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: var(--surface-color);
            color: var(--text-color);
            cursor: pointer;
            font-size: 20px;
            z-index: 1001;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
        `;
        
        toggle.addEventListener('click', () => this.toggleTheme());
        document.body.appendChild(toggle);
        
        this.themeToggle = toggle;
    }
    
    toggleTheme() {
        this.config.darkMode = !this.config.darkMode;
        const theme = this.config.darkMode ? 'dark' : 'default';
        
        this.components.setTheme(theme);
        this.themeToggle.innerHTML = this.config.darkMode ? '☀️' : '🌙';
        
        this.saveUserPreferences();
        this.components.createToast(
            `Switched to ${this.config.darkMode ? 'dark' : 'light'} theme`,
            'info'
        );
    }
    
    scrollToTop() {
        this.animationEngine.animate(document.documentElement, {
            scrollTop: 0
        }, {
            duration: 1000,
            easing: 'easeOutCubic'
        });
    }
    
    triggerDownload() {
        this.stats.downloads++;
        this.saveStats();
        
        const progress = this.components.createProgressBar();
        const modal = this.components.createModal({
            title: 'Downloading CBOT Advanced',
            content: `
                <div style="margin: 20px 0;">
                    <p>Preparing your download...</p>
                    <div style="margin: 16px 0;">${progress.container.outerHTML}</div>
                    <p id="download-status">Initializing...</p>
                </div>
            `
        });
        
        this.simulateDownload(modal.modal.querySelector('.progress-bar'), modal.modal.querySelector('#download-status'));
    }
    
    simulateDownload(progressBar, statusElement) {
        const steps = [
            { progress: 10, status: 'Connecting to server...' },
            { progress: 25, status: 'Verifying license...' },
            { progress: 50, status: 'Downloading files...' },
            { progress: 75, status: 'Extracting archive...' },
            { progress: 90, status: 'Finalizing installation...' },
            { progress: 100, status: 'Download complete!' }
        ];
        
        let currentStep = 0;
        
        const updateProgress = () => {
            if (currentStep >= steps.length) return;
            
            const step = steps[currentStep];
            progressBar.style.width = step.progress + '%';
            statusElement.textContent = step.status;
            
            if (step.progress === 100) {
                setTimeout(() => {
                    statusElement.innerHTML = `
                        <div style="color: #43e97b; font-weight: bold;">
                            ✅ Ready to install!<br>
                            <small>Check your downloads folder</small>
                        </div>
                    `;
                }, 500);
            }
            
            currentStep++;
            setTimeout(updateProgress, 800 + Math.random() * 400);
        };
        
        setTimeout(updateProgress, 500);
    }
    
    showContact() {
        this.components.createModal({
            title: 'Contact Us',
            content: `
                <div style="display: grid; gap: 16px;">
                    <div class="floating-label">
                        <input type="text" placeholder=" " required>
                        <label>Your Name</label>
                    </div>
                    <div class="floating-label">
                        <input type="email" placeholder=" " required>
                        <label>Email Address</label>
                    </div>
                    <div class="floating-label">
                        <textarea placeholder=" " rows="4" required></textarea>
                        <label>Message</label>
                    </div>
                    <button onclick="window.websiteController.sendMessage()" style="
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        background: var(--primary-color);
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                    ">Send Message</button>
                </div>
            `
        });
    }
    
    sendMessage() {
        this.components.createToast('Message sent successfully!', 'success');
        document.querySelector('.modal-overlay').click();
    }
    
    async setupEventListeners() {
        window.addEventListener('beforeunload', () => {
            this.saveUserPreferences();
            this.saveStats();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseEffects();
            } else {
                this.resumeEffects();
            }
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    pauseEffects() {
        if (this.particleSystem) {
            this.particleSystem.stop();
        }
        this.animationEngine.stop();
    }
    
    resumeEffects() {
        if (this.particleSystem) {
            this.particleSystem.start();
        }
        this.animationEngine.start();
    }
    
    handleResize() {
        if (this.particleSystem) {
            this.particleSystem.resizeCanvas();
        }
    }
    
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceStats();
        }, 1000);
    }
    
    updatePerformanceStats() {
        if (performance.memory) {
            this.stats.performance.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        this.notifyObservers('performanceUpdate', this.stats.performance);
    }
    
    trackVisitor() {
        if (!this.config.analytics) return;
        
        const sessionId = this.generateSessionId();
        const visitData = {
            sessionId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            viewport: { width: window.innerWidth, height: window.innerHeight }
        };
        
        this.stats.visitors++;
        this.saveStats();
        
        console.log('📊 Visitor tracked:', visitData);
    }
    
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    loadUserPreferences() {
        try {
            const saved = localStorage.getItem('cbot_preferences');
            if (saved) {
                const preferences = JSON.parse(saved);
                Object.assign(this.config, preferences);
                
                if (this.config.darkMode) {
                    this.components.setTheme('dark');
                    if (this.themeToggle) {
                        this.themeToggle.innerHTML = '☀️';
                    }
                }
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }
    
    saveUserPreferences() {
        try {
            localStorage.setItem('cbot_preferences', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }
    
    saveStats() {
        try {
            localStorage.setItem('cbot_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.warn('Failed to save stats:', error);
        }
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
    
    getStatus() {
        return {
            initialized: this.isInitialized,
            modules: Array.from(this.modules.keys()),
            stats: this.stats,
            config: this.config,
            uptime: Date.now() - this.stats.uptime
        };
    }
    
    getModule(name) {
        return this.modules.get(name);
    }
}
