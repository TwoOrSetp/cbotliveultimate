import { EventEmitter } from './core/EventEmitter.js';
import { GameEngine } from './core/GameEngine.js';
import { InputManager } from './core/InputManager.js';
import { AutoPlayer } from './modules/AutoPlayer.js';
import { ClickBot } from './modules/ClickBot.js';
import { SpeedHack } from './modules/SpeedHack.js';
import { NoClip } from './modules/NoClip.js';
import { Trajectory } from './modules/Trajectory.js';
import { ModMenu } from './ui/ModMenu.js';

class GeoDashPro extends EventEmitter {
    constructor() {
        super();
        this.isInitialized = false;
        this.modules = new Map();
        this.performance = {
            startTime: 0,
            fps: 0,
            memory: 0,
            cpu: 0
        };
        
        this.config = {
            version: '2.0.0',
            debug: false,
            stealth: true,
            autoSave: true,
            performance: {
                monitoring: true,
                optimization: true,
                maxFPS: 60
            }
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('🎮 GeoDash Pro v2.0.0 - Initializing...');
            this.performance.startTime = performance.now();
            
            await this.initializeCore();
            await this.initializeModules();
            await this.initializeUI();
            await this.setupEventListeners();
            await this.loadConfiguration();
            
            this.isInitialized = true;
            this.startPerformanceMonitoring();
            
            console.log('✅ GeoDash Pro initialized successfully');
            this.emit('app:initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize GeoDash Pro:', error);
            this.handleInitializationError(error);
        }
    }

    async initializeCore() {
        console.log('🔧 Initializing core systems...');
        
        this.gameEngine = new GameEngine();
        this.inputManager = new InputManager();
        
        this.gameEngine.on('game:started', () => {
            console.log('🎮 Game started');
            this.emit('game:started');
        });
        
        this.gameEngine.on('game:stopped', () => {
            console.log('⏹️ Game stopped');
            this.emit('game:stopped');
        });
        
        this.inputManager.on('game:jump', () => {
            this.gameEngine.emit('player:jump');
        });
        
        console.log('✅ Core systems initialized');
    }

    async initializeModules() {
        console.log('🔌 Initializing modules...');
        
        const moduleConfigs = [
            { name: 'autoPlayer', class: AutoPlayer, args: [this.gameEngine, this.inputManager] },
            { name: 'clickBot', class: ClickBot, args: [this.inputManager] },
            { name: 'speedHack', class: SpeedHack, args: [this.gameEngine] },
            { name: 'noClip', class: NoClip, args: [this.gameEngine] },
            { name: 'trajectory', class: Trajectory, args: [this.gameEngine] }
        ];
        
        for (const config of moduleConfigs) {
            try {
                const module = new config.class(...config.args);
                this.modules.set(config.name, module);
                
                module.on('status:changed', (status) => {
                    this.emit(`${config.name}:status`, status);
                });
                
                module.on('performance:updated', (performance) => {
                    this.emit(`${config.name}:performance`, performance);
                });
                
                console.log(`✅ ${config.name} module initialized`);
            } catch (error) {
                console.warn(`⚠️ Failed to initialize ${config.name}:`, error);
            }
        }
        
        console.log('✅ All modules initialized');
    }

    async initializeUI() {
        console.log('🎨 Initializing user interface...');
        
        this.modMenu = new ModMenu();
        
        this.modules.forEach((module, name) => {
            this.modMenu.registerModule(name, module);
        });
        
        this.modMenu.on('setting:changed', (setting) => {
            this.handleSettingChange(setting);
        });
        
        this.modMenu.on('menu:shown', () => {
            this.emit('ui:menu:shown');
        });
        
        this.modMenu.on('menu:hidden', () => {
            this.emit('ui:menu:hidden');
        });
        
        console.log('✅ User interface initialized');
    }

    async setupEventListeners() {
        console.log('📡 Setting up event listeners...');
        
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleVisibilityChange(false);
            } else {
                this.handleVisibilityChange(true);
            }
        });
        
        window.addEventListener('error', (error) => {
            this.handleError(error);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
        
        console.log('✅ Event listeners set up');
    }

    async loadConfiguration() {
        console.log('⚙️ Loading configuration...');
        
        try {
            const savedConfig = localStorage.getItem('geodash_pro_config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                Object.assign(this.config, config);
                console.log('✅ Configuration loaded from storage');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load configuration:', error);
        }
        
        this.applyConfiguration();
    }

    applyConfiguration() {
        if (this.config.debug) {
            this.enableDebugMode();
        }
        
        if (this.config.stealth) {
            this.enableStealthMode();
        }
        
        this.modules.forEach((module, name) => {
            if (this.config[name]) {
                module.updateConfig(this.config[name]);
            }
        });
    }

    enableDebugMode() {
        console.log('🐛 Debug mode enabled');
        this.setDebugMode(true);
        
        window.GeoDashPro = this;
        window.modules = this.modules;
        window.gameEngine = this.gameEngine;
        window.inputManager = this.inputManager;
    }

    enableStealthMode() {
        console.log('🥷 Stealth mode enabled');
        
        this.modules.forEach(module => {
            if (module.updateConfig) {
                module.updateConfig({ stealthMode: true });
            }
        });
    }

    handleSettingChange(setting) {
        const [moduleName, settingName] = setting.id.split('-');
        
        if (moduleName === 'menu') {
            this.modMenu.updateConfig({ [settingName]: setting.value });
        } else if (this.modules.has(moduleName)) {
            const module = this.modules.get(moduleName);
            
            if (settingName === 'enabled') {
                if (setting.value) {
                    module.activate ? module.activate() : module.start();
                } else {
                    module.deactivate ? module.deactivate() : module.stop();
                }
            } else {
                const config = {};
                config[settingName] = setting.value;
                module.updateConfig(config);
            }
        }
        
        if (this.config.autoSave) {
            this.saveConfiguration();
        }
    }

    saveConfiguration() {
        try {
            const configToSave = {
                ...this.config,
                modules: {}
            };
            
            this.modules.forEach((module, name) => {
                if (module.getConfig) {
                    configToSave.modules[name] = module.getConfig();
                }
            });
            
            localStorage.setItem('geodash_pro_config', JSON.stringify(configToSave));
        } catch (error) {
            console.warn('⚠️ Failed to save configuration:', error);
        }
    }

    startPerformanceMonitoring() {
        if (!this.config.performance.monitoring) return;
        
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 1000);
        
        console.log('📊 Performance monitoring started');
    }

    updatePerformanceMetrics() {
        this.performance.fps = this.gameEngine.getPerformance().avgFPS || 0;
        
        if (performance.memory) {
            this.performance.memory = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
        
        this.performance.cpu = this.calculateCPUUsage();
        
        this.emit('performance:updated', this.performance);
        
        if (this.config.performance.optimization) {
            this.optimizePerformance();
        }
    }

    calculateCPUUsage() {
        const now = performance.now();
        const timeDiff = now - (this.lastCPUCheck || now);
        this.lastCPUCheck = now;
        
        return Math.min(100, Math.max(0, (timeDiff / 16.67) * 100));
    }

    optimizePerformance() {
        if (this.performance.fps < 30) {
            console.log('⚡ Low FPS detected, optimizing...');
            this.modules.forEach(module => {
                if (module.optimizePerformance) {
                    module.optimizePerformance();
                }
            });
        }
        
        if (this.performance.memory > 100) {
            console.log('🧹 High memory usage detected, cleaning up...');
            this.cleanupMemory();
        }
    }

    cleanupMemory() {
        this.modules.forEach(module => {
            if (module.cleanup) {
                module.cleanup();
            }
        });
        
        if (window.gc) {
            window.gc();
        }
    }

    handleVisibilityChange(visible) {
        if (visible) {
            console.log('👁️ Tab became visible');
            this.modules.forEach(module => {
                if (module.resume) {
                    module.resume();
                }
            });
        } else {
            console.log('🙈 Tab became hidden');
            this.modules.forEach(module => {
                if (module.pause) {
                    module.pause();
                }
            });
        }
    }

    handleError(error) {
        console.error('💥 Application error:', error);
        
        this.emit('error', {
            error: error,
            timestamp: Date.now(),
            modules: Array.from(this.modules.keys()),
            performance: this.performance
        });
        
        if (this.config.autoSave) {
            this.saveErrorReport(error);
        }
    }

    saveErrorReport(error) {
        try {
            const report = {
                error: error.toString(),
                stack: error.stack,
                timestamp: Date.now(),
                version: this.config.version,
                modules: Array.from(this.modules.keys()),
                performance: this.performance,
                config: this.config
            };
            
            const reports = JSON.parse(localStorage.getItem('geodash_pro_errors') || '[]');
            reports.push(report);
            
            if (reports.length > 10) {
                reports.shift();
            }
            
            localStorage.setItem('geodash_pro_errors', JSON.stringify(reports));
        } catch (saveError) {
            console.warn('⚠️ Failed to save error report:', saveError);
        }
    }

    handleInitializationError(error) {
        console.error('💥 Initialization failed:', error);
        
        setTimeout(() => {
            console.log('🔄 Attempting recovery...');
            this.attemptRecovery();
        }, 2000);
    }

    attemptRecovery() {
        try {
            this.modules.clear();
            this.initializeModules();
            console.log('✅ Recovery successful');
        } catch (error) {
            console.error('❌ Recovery failed:', error);
        }
    }

    getModule(name) {
        return this.modules.get(name);
    }

    getAllModules() {
        return new Map(this.modules);
    }

    getPerformance() {
        return { ...this.performance };
    }

    getConfig() {
        return { ...this.config };
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.applyConfiguration();
        this.emit('config:updated', this.config);
    }

    cleanup() {
        console.log('🧹 Cleaning up GeoDash Pro...');
        
        this.modules.forEach(module => {
            if (module.cleanup) {
                module.cleanup();
            } else if (module.stop) {
                module.stop();
            } else if (module.deactivate) {
                module.deactivate();
            }
        });
        
        if (this.config.autoSave) {
            this.saveConfiguration();
        }
        
        this.removeAllListeners();
        console.log('✅ Cleanup complete');
    }

    restart() {
        console.log('🔄 Restarting GeoDash Pro...');
        this.cleanup();
        setTimeout(() => {
            this.init();
        }, 1000);
    }

    getStatus() {
        return {
            initialized: this.isInitialized,
            version: this.config.version,
            modules: Array.from(this.modules.keys()),
            performance: this.performance,
            uptime: performance.now() - this.performance.startTime
        };
    }
}

const app = new GeoDashPro();

window.addEventListener('load', () => {
    console.log('🚀 GeoDash Pro loaded and ready!');
});

export { GeoDashPro };
