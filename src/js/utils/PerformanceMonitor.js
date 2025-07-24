import { EventEmitter } from '../core/EventEmitter.js';

class PerformanceMonitor extends EventEmitter {
    constructor() {
        super();
        this.isActive = false;
        this.metrics = {
            fps: 0,
            avgFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            frameTime: 0,
            memory: {
                used: 0,
                total: 0,
                limit: 0
            },
            cpu: {
                usage: 0,
                cores: navigator.hardwareConcurrency || 4
            },
            network: {
                downlink: 0,
                effectiveType: 'unknown',
                rtt: 0
            },
            battery: {
                level: 1,
                charging: true
            }
        };
        
        this.history = {
            fps: [],
            frameTime: [],
            memory: [],
            cpu: []
        };
        
        this.config = {
            updateInterval: 1000,
            historyLength: 60,
            enableDetailedMetrics: true,
            enableNetworkMonitoring: true,
            enableBatteryMonitoring: true
        };
        
        this.thresholds = {
            lowFPS: 30,
            highMemory: 100,
            highCPU: 80,
            lowBattery: 0.2
        };
        
        this.alerts = {
            performance: false,
            memory: false,
            battery: false
        };
        
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.startTime = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeAPIs();
        console.log('📊 PerformanceMonitor initialized');
    }

    setupEventListeners() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });
    }

    async initializeAPIs() {
        try {
            if ('connection' in navigator) {
                this.networkAPI = navigator.connection;
                this.networkAPI.addEventListener('change', () => {
                    this.updateNetworkMetrics();
                });
            }
        } catch (error) {
            console.warn('Network API not available:', error);
        }

        try {
            if ('getBattery' in navigator) {
                this.batteryAPI = await navigator.getBattery();
                this.batteryAPI.addEventListener('chargingchange', () => {
                    this.updateBatteryMetrics();
                });
                this.batteryAPI.addEventListener('levelchange', () => {
                    this.updateBatteryMetrics();
                });
            }
        } catch (error) {
            console.warn('Battery API not available:', error);
        }
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.startTime = performance.now();
        this.frameCount = 0;
        this.lastFrameTime = this.startTime;
        
        this.startMonitoring();
        this.emit('monitor:started');
        console.log('📊 Performance monitoring started');
    }

    stop() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.stopMonitoring();
        this.emit('monitor:stopped', this.getReport());
        console.log('⏹️ Performance monitoring stopped');
    }

    pause() {
        if (!this.isActive) return;
        
        this.stopMonitoring();
        this.emit('monitor:paused');
    }

    resume() {
        if (!this.isActive) return;
        
        this.startMonitoring();
        this.emit('monitor:resumed');
    }

    startMonitoring() {
        this.monitoringInterval = setInterval(() => {
            this.updateMetrics();
        }, this.config.updateInterval);
        
        this.frameMonitoring();
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.frameMonitoringId) {
            cancelAnimationFrame(this.frameMonitoringId);
            this.frameMonitoringId = null;
        }
    }

    frameMonitoring() {
        const monitor = (timestamp) => {
            if (!this.isActive) return;
            
            this.frameCount++;
            const deltaTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            
            this.metrics.frameTime = deltaTime;
            this.metrics.fps = Math.round(1000 / deltaTime);
            
            this.updateFPSHistory();
            this.frameMonitoringId = requestAnimationFrame(monitor);
        };
        
        this.frameMonitoringId = requestAnimationFrame(monitor);
    }

    updateMetrics() {
        this.updateFPSMetrics();
        this.updateMemoryMetrics();
        this.updateCPUMetrics();
        
        if (this.config.enableNetworkMonitoring) {
            this.updateNetworkMetrics();
        }
        
        if (this.config.enableBatteryMonitoring) {
            this.updateBatteryMetrics();
        }
        
        this.checkThresholds();
        this.emit('metrics:updated', this.metrics);
    }

    updateFPSMetrics() {
        if (this.frameCount === 0) return;
        
        const elapsedTime = (performance.now() - this.startTime) / 1000;
        this.metrics.avgFPS = Math.round(this.frameCount / elapsedTime);
        
        this.metrics.minFPS = Math.min(this.metrics.minFPS, this.metrics.fps);
        this.metrics.maxFPS = Math.max(this.metrics.maxFPS, this.metrics.fps);
    }

    updateFPSHistory() {
        this.history.fps.push(this.metrics.fps);
        this.history.frameTime.push(this.metrics.frameTime);
        
        if (this.history.fps.length > this.config.historyLength) {
            this.history.fps.shift();
            this.history.frameTime.shift();
        }
    }

    updateMemoryMetrics() {
        if (performance.memory) {
            this.metrics.memory.used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            this.metrics.memory.total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
            this.metrics.memory.limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
            
            this.history.memory.push(this.metrics.memory.used);
            
            if (this.history.memory.length > this.config.historyLength) {
                this.history.memory.shift();
            }
        }
    }

    updateCPUMetrics() {
        const now = performance.now();
        const timeDiff = now - (this.lastCPUCheck || now);
        this.lastCPUCheck = now;
        
        const expectedFrameTime = 1000 / 60;
        const actualFrameTime = this.metrics.frameTime || expectedFrameTime;
        
        this.metrics.cpu.usage = Math.min(100, Math.max(0, 
            (actualFrameTime / expectedFrameTime) * 100
        ));
        
        this.history.cpu.push(this.metrics.cpu.usage);
        
        if (this.history.cpu.length > this.config.historyLength) {
            this.history.cpu.shift();
        }
    }

    updateNetworkMetrics() {
        if (this.networkAPI) {
            this.metrics.network.downlink = this.networkAPI.downlink || 0;
            this.metrics.network.effectiveType = this.networkAPI.effectiveType || 'unknown';
            this.metrics.network.rtt = this.networkAPI.rtt || 0;
        }
    }

    updateBatteryMetrics() {
        if (this.batteryAPI) {
            this.metrics.battery.level = this.batteryAPI.level;
            this.metrics.battery.charging = this.batteryAPI.charging;
        }
    }

    checkThresholds() {
        const newAlerts = {
            performance: this.metrics.fps < this.thresholds.lowFPS,
            memory: this.metrics.memory.used > this.thresholds.highMemory,
            battery: this.metrics.battery.level < this.thresholds.lowBattery && !this.metrics.battery.charging
        };
        
        Object.keys(newAlerts).forEach(alertType => {
            if (newAlerts[alertType] && !this.alerts[alertType]) {
                this.emit('alert:triggered', {
                    type: alertType,
                    metrics: this.metrics,
                    timestamp: Date.now()
                });
            } else if (!newAlerts[alertType] && this.alerts[alertType]) {
                this.emit('alert:resolved', {
                    type: alertType,
                    metrics: this.metrics,
                    timestamp: Date.now()
                });
            }
        });
        
        this.alerts = newAlerts;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getHistory() {
        return { ...this.history };
    }

    getReport() {
        const uptime = (performance.now() - this.startTime) / 1000;
        
        return {
            uptime: uptime,
            totalFrames: this.frameCount,
            metrics: this.getMetrics(),
            history: this.getHistory(),
            averages: {
                fps: this.history.fps.length > 0 ? 
                    this.history.fps.reduce((a, b) => a + b, 0) / this.history.fps.length : 0,
                frameTime: this.history.frameTime.length > 0 ? 
                    this.history.frameTime.reduce((a, b) => a + b, 0) / this.history.frameTime.length : 0,
                memory: this.history.memory.length > 0 ? 
                    this.history.memory.reduce((a, b) => a + b, 0) / this.history.memory.length : 0,
                cpu: this.history.cpu.length > 0 ? 
                    this.history.cpu.reduce((a, b) => a + b, 0) / this.history.cpu.length : 0
            },
            alerts: this.alerts,
            timestamp: Date.now()
        };
    }

    exportData() {
        const report = this.getReport();
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-report-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.emit('data:exported', report);
    }

    reset() {
        this.frameCount = 0;
        this.startTime = performance.now();
        this.lastFrameTime = this.startTime;
        
        this.metrics.minFPS = Infinity;
        this.metrics.maxFPS = 0;
        
        this.history.fps = [];
        this.history.frameTime = [];
        this.history.memory = [];
        this.history.cpu = [];
        
        this.alerts = {
            performance: false,
            memory: false,
            battery: false
        };
        
        this.emit('monitor:reset');
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        if (this.isActive) {
            this.stop();
            this.start();
        }
        
        this.emit('config:updated', this.config);
    }

    updateThresholds(newThresholds) {
        Object.assign(this.thresholds, newThresholds);
        this.emit('thresholds:updated', this.thresholds);
    }

    getSystemInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: this.networkAPI ? {
                effectiveType: this.networkAPI.effectiveType,
                downlink: this.networkAPI.downlink,
                rtt: this.networkAPI.rtt
            } : null,
            battery: this.batteryAPI ? {
                level: this.batteryAPI.level,
                charging: this.batteryAPI.charging,
                chargingTime: this.batteryAPI.chargingTime,
                dischargingTime: this.batteryAPI.dischargingTime
            } : null
        };
    }

    getConfig() {
        return { ...this.config };
    }

    getThresholds() {
        return { ...this.thresholds };
    }

    isMonitoring() {
        return this.isActive;
    }
}

export { PerformanceMonitor };
