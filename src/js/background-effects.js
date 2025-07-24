class BackgroundEffects {
    constructor() {
        this.starfield = null;
        this.meteors = [];
        this.stars = [];
        this.meteorInterval = null;
        this.isActive = true;
        
        this.init();
    }

    init() {
        this.createStarfield();
        this.generateStars();
        this.startMeteorShower();
        this.setupPerformanceOptimization();
        
        console.log('🌟 Background effects initialized');
    }

    createStarfield() {
        this.starfield = document.createElement('div');
        this.starfield.className = 'starfield';
        document.body.appendChild(this.starfield);
    }

    generateStars() {
        const starCount = window.innerWidth > 768 ? 150 : 75; // Fewer stars on mobile
        
        for (let i = 0; i < starCount; i++) {
            this.createStar();
        }
    }

    createStar() {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const weights = [0.7, 0.25, 0.05]; // 70% small, 25% medium, 5% large
        const size = this.weightedRandom(sizes, weights);
        star.classList.add(size);
        
        // Random position
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Random animation delay
        star.style.animationDelay = Math.random() * 3 + 's';
        
        // Random opacity
        star.style.opacity = 0.3 + Math.random() * 0.7;
        
        this.starfield.appendChild(star);
        this.stars.push(star);
    }

    weightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        return items[items.length - 1];
    }

    startMeteorShower() {
        this.createMeteor(); // Create first meteor immediately
        
        this.meteorInterval = setInterval(() => {
            if (this.isActive && Math.random() < 0.3) { // 30% chance every interval
                this.createMeteor();
            }
        }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
    }

    createMeteor() {
        const meteor = document.createElement('div');
        meteor.className = 'meteor';
        
        // Random starting position (top and left edges)
        const startSide = Math.random() < 0.5 ? 'top' : 'left';
        if (startSide === 'top') {
            meteor.style.left = Math.random() * 100 + '%';
            meteor.style.top = '-50px';
        } else {
            meteor.style.left = '-50px';
            meteor.style.top = Math.random() * 50 + '%'; // Only upper half
        }
        
        // Random animation duration
        const duration = 1.5 + Math.random() * 2; // 1.5-3.5 seconds
        meteor.style.animationDuration = duration + 's';
        
        // Random size variation
        const scale = 0.5 + Math.random() * 1; // 0.5x to 1.5x size
        meteor.style.transform = `scale(${scale})`;
        
        document.body.appendChild(meteor);
        this.meteors.push(meteor);
        
        // Remove meteor after animation
        setTimeout(() => {
            if (meteor.parentNode) {
                meteor.parentNode.removeChild(meteor);
            }
            this.meteors = this.meteors.filter(m => m !== meteor);
        }, duration * 1000 + 500);
    }

    setupPerformanceOptimization() {
        // Pause animations when tab is not visible
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else {
                this.resume();
            }
        });

        // Reduce effects on mobile or low-performance devices
        if (this.isLowPerformanceDevice()) {
            this.optimizeForPerformance();
        }

        // Clean up meteors periodically
        setInterval(() => {
            this.cleanupMeteors();
        }, 10000);
    }

    isLowPerformanceDevice() {
        // Simple performance detection
        const isMobile = window.innerWidth <= 768;
        const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory < 4;
        const hasSlowConnection = navigator.connection && navigator.connection.effectiveType === 'slow-2g';
        
        return isMobile || hasLowMemory || hasSlowConnection;
    }

    optimizeForPerformance() {
        // Reduce star count
        const starsToRemove = this.stars.slice(this.stars.length / 2);
        starsToRemove.forEach(star => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        });
        this.stars = this.stars.slice(0, this.stars.length / 2);
        
        // Reduce meteor frequency
        if (this.meteorInterval) {
            clearInterval(this.meteorInterval);
            this.meteorInterval = setInterval(() => {
                if (this.isActive && Math.random() < 0.15) { // Reduced to 15%
                    this.createMeteor();
                }
            }, 4000 + Math.random() * 6000); // Longer intervals
        }
        
        console.log('🔧 Background effects optimized for performance');
    }

    pause() {
        this.isActive = false;
        if (this.starfield) {
            this.starfield.style.animationPlayState = 'paused';
        }
        this.meteors.forEach(meteor => {
            meteor.style.animationPlayState = 'paused';
        });
    }

    resume() {
        this.isActive = true;
        if (this.starfield) {
            this.starfield.style.animationPlayState = 'running';
        }
        this.meteors.forEach(meteor => {
            meteor.style.animationPlayState = 'running';
        });
    }

    cleanupMeteors() {
        // Remove any orphaned meteors
        this.meteors = this.meteors.filter(meteor => {
            if (!meteor.parentNode) {
                return false;
            }
            return true;
        });
    }

    destroy() {
        this.isActive = false;
        
        if (this.meteorInterval) {
            clearInterval(this.meteorInterval);
        }
        
        if (this.starfield && this.starfield.parentNode) {
            this.starfield.parentNode.removeChild(this.starfield);
        }
        
        this.meteors.forEach(meteor => {
            if (meteor.parentNode) {
                meteor.parentNode.removeChild(meteor);
            }
        });
        
        this.meteors = [];
        this.stars = [];
        
        console.log('🌟 Background effects destroyed');
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.backgroundEffects = new BackgroundEffects();
    });
} else {
    window.backgroundEffects = new BackgroundEffects();
}

export { BackgroundEffects };
