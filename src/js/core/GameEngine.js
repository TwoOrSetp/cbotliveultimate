import { EventEmitter } from './EventEmitter.js';

class GameEngine extends EventEmitter {
    constructor() {
        super();
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.targetFPS = 60;
        this.deltaTime = 0;
        
        this.gameState = {
            level: null,
            player: {
                x: 0,
                y: 0,
                velocity: { x: 0, y: 0 },
                isGrounded: false,
                isDead: false
            },
            camera: { x: 0, y: 0 },
            score: 0,
            attempts: 0,
            startTime: 0,
            elapsedTime: 0
        };
        
        this.config = {
            speed: 1.0,
            gravity: 0.8,
            jumpForce: 15,
            autoPlay: false,
            noClip: false,
            showTrajectory: false,
            stealthMode: true
        };
        
        this.performance = {
            frameHistory: [],
            avgFPS: 0,
            minFPS: Infinity,
            maxFPS: 0,
            memoryUsage: 0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startPerformanceMonitoring();
        console.log('🎮 GameEngine initialized');
    }

    setupEventListeners() {
        this.on('player:jump', () => this.handlePlayerJump());
        this.on('player:death', () => this.handlePlayerDeath());
        this.on('level:complete', () => this.handleLevelComplete());
        this.on('config:update', (newConfig) => this.updateConfig(newConfig));
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.gameState.startTime = performance.now();
        this.lastFrameTime = performance.now();
        
        this.gameLoop = requestAnimationFrame((timestamp) => this.loop(timestamp));
        this.emit('game:started', this.gameState);
        
        console.log('🚀 Game started');
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.emit('game:stopped', this.gameState);
        console.log('⏹️ Game stopped');
    }

    pause() {
        if (!this.isRunning || this.isPaused) return;
        
        this.isPaused = true;
        this.emit('game:paused', this.gameState);
        console.log('⏸️ Game paused');
    }

    resume() {
        if (!this.isRunning || !this.isPaused) return;
        
        this.isPaused = false;
        this.lastFrameTime = performance.now();
        this.emit('game:resumed', this.gameState);
        console.log('▶️ Game resumed');
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        
        this.deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        this.frameCount++;
        
        this.calculateFPS();
        this.updatePerformanceMetrics();
        
        if (!this.isPaused) {
            this.update();
            this.render();
        }
        
        this.gameLoop = requestAnimationFrame((timestamp) => this.loop(timestamp));
    }

    update() {
        this.gameState.elapsedTime = performance.now() - this.gameState.startTime;
        
        this.updatePlayer();
        this.updateCamera();
        this.checkCollisions();
        
        this.emit('game:update', {
            deltaTime: this.deltaTime,
            gameState: this.gameState,
            performance: this.performance
        });
    }

    render() {
        this.emit('game:render', {
            gameState: this.gameState,
            fps: this.fps,
            frameCount: this.frameCount
        });
    }

    updatePlayer() {
        const player = this.gameState.player;
        const speedMultiplier = this.config.speed;
        
        if (!player.isDead) {
            player.velocity.y += this.config.gravity * speedMultiplier;
            player.x += player.velocity.x * speedMultiplier;
            player.y += player.velocity.y * speedMultiplier;
            
            if (player.y > 600) {
                player.isGrounded = true;
                player.y = 600;
                player.velocity.y = 0;
            }
        }
        
        this.emit('player:updated', player);
    }

    updateCamera() {
        const camera = this.gameState.camera;
        const player = this.gameState.player;
        
        camera.x = player.x - 400;
        camera.y = player.y - 300;
        
        this.emit('camera:updated', camera);
    }

    checkCollisions() {
        if (this.config.noClip) return;
        
        const player = this.gameState.player;
        
        this.emit('collision:check', player);
    }

    handlePlayerJump() {
        const player = this.gameState.player;
        
        if (player.isGrounded && !player.isDead) {
            player.velocity.y = -this.config.jumpForce;
            player.isGrounded = false;
            this.emit('player:jumped', player);
        }
    }

    handlePlayerDeath() {
        this.gameState.player.isDead = true;
        this.gameState.attempts++;
        this.emit('player:died', this.gameState);
        
        setTimeout(() => this.respawnPlayer(), 1000);
    }

    handleLevelComplete() {
        this.gameState.score += 1000;
        this.emit('level:completed', this.gameState);
    }

    respawnPlayer() {
        this.gameState.player = {
            x: 0,
            y: 0,
            velocity: { x: 0, y: 0 },
            isGrounded: false,
            isDead: false
        };
        
        this.emit('player:respawned', this.gameState.player);
    }

    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.emit('config:updated', this.config);
    }

    calculateFPS() {
        this.fps = Math.round(1000 / this.deltaTime);
    }

    updatePerformanceMetrics() {
        this.performance.frameHistory.push(this.fps);
        
        if (this.performance.frameHistory.length > 60) {
            this.performance.frameHistory.shift();
        }
        
        this.performance.avgFPS = Math.round(
            this.performance.frameHistory.reduce((a, b) => a + b, 0) / 
            this.performance.frameHistory.length
        );
        
        this.performance.minFPS = Math.min(this.performance.minFPS, this.fps);
        this.performance.maxFPS = Math.max(this.performance.maxFPS, this.fps);
        
        if (performance.memory) {
            this.performance.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        }
    }

    startPerformanceMonitoring() {
        setInterval(() => {
            this.emit('performance:update', this.performance);
        }, 1000);
    }

    getGameState() {
        return { ...this.gameState };
    }

    getConfig() {
        return { ...this.config };
    }

    getPerformance() {
        return { ...this.performance };
    }
}

export { GameEngine };
