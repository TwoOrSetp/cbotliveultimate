export class AnimationEngine {
    constructor() {
        this.animations = new Map();
        this.timeline = [];
        this.isRunning = false;
        this.currentFrame = 0;
        this.fps = 60;
        this.deltaTime = 0;
        this.lastTime = 0;
        this.observers = new Set();
        
        this.easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInElastic: t => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
            },
            easeOutElastic: t => {
                const c4 = (2 * Math.PI) / 3;
                return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
            },
            easeInBounce: t => 1 - this.easingFunctions.easeOutBounce(1 - t),
            easeOutBounce: t => {
                const n1 = 7.5625;
                const d1 = 2.75;
                if (t < 1 / d1) return n1 * t * t;
                else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
                else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
                else return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        };
        
        this.start();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.currentFrame++;
        
        this.updateAnimations(currentTime);
        this.notifyObservers();
        
        requestAnimationFrame(() => this.animate());
    }
    
    updateAnimations(currentTime) {
        for (const [id, animation] of this.animations) {
            if (animation.paused) continue;
            
            const elapsed = currentTime - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            const easedProgress = this.easingFunctions[animation.easing](progress);
            
            this.updateAnimationProperties(animation, easedProgress);
            
            if (progress >= 1) {
                this.completeAnimation(id, animation);
            }
        }
    }
    
    updateAnimationProperties(animation, progress) {
        for (const property of animation.properties) {
            const currentValue = this.interpolateValue(
                property.from,
                property.to,
                progress
            );
            
            if (property.unit) {
                animation.target.style[property.name] = currentValue + property.unit;
            } else {
                animation.target[property.name] = currentValue;
            }
        }
        
        if (animation.onUpdate) {
            animation.onUpdate(progress, animation.target);
        }
    }
    
    interpolateValue(from, to, progress) {
        if (typeof from === 'number' && typeof to === 'number') {
            return from + (to - from) * progress;
        }
        
        if (Array.isArray(from) && Array.isArray(to)) {
            return from.map((val, index) => val + (to[index] - val) * progress);
        }
        
        if (typeof from === 'object' && typeof to === 'object') {
            const result = {};
            for (const key in from) {
                result[key] = this.interpolateValue(from[key], to[key], progress);
            }
            return result;
        }
        
        return progress < 0.5 ? from : to;
    }
    
    animate(target, properties, options = {}) {
        const id = this.generateId();
        const animation = {
            id,
            target,
            properties: this.parseProperties(target, properties),
            duration: options.duration || 1000,
            easing: options.easing || 'easeOutQuad',
            delay: options.delay || 0,
            startTime: performance.now() + (options.delay || 0),
            paused: false,
            onUpdate: options.onUpdate,
            onComplete: options.onComplete
        };
        
        this.animations.set(id, animation);
        return id;
    }
    
    parseProperties(target, properties) {
        const parsed = [];
        
        for (const [name, value] of Object.entries(properties)) {
            const currentValue = this.getCurrentValue(target, name);
            const targetValue = this.parseValue(value);
            
            parsed.push({
                name,
                from: currentValue.value,
                to: targetValue.value,
                unit: targetValue.unit
            });
        }
        
        return parsed;
    }
    
    getCurrentValue(target, property) {
        let value;
        
        if (target.style && target.style[property]) {
            value = target.style[property];
        } else if (window.getComputedStyle) {
            value = window.getComputedStyle(target)[property];
        } else {
            value = target[property] || 0;
        }
        
        return this.parseValue(value);
    }
    
    parseValue(value) {
        if (typeof value === 'number') {
            return { value, unit: null };
        }
        
        if (typeof value === 'string') {
            const match = value.match(/^([-+]?\d*\.?\d+)(.*)$/);
            if (match) {
                return {
                    value: parseFloat(match[1]),
                    unit: match[2] || null
                };
            }
        }
        
        return { value: 0, unit: null };
    }
    
    completeAnimation(id, animation) {
        if (animation.onComplete) {
            animation.onComplete(animation.target);
        }
        
        this.animations.delete(id);
    }
    
    pauseAnimation(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.paused = true;
        }
    }
    
    resumeAnimation(id) {
        const animation = this.animations.get(id);
        if (animation) {
            animation.paused = false;
        }
    }
    
    stopAnimation(id) {
        this.animations.delete(id);
    }
    
    createTimeline() {
        return new AnimationTimeline(this);
    }
    
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    notifyObservers() {
        for (const observer of this.observers) {
            observer({
                frame: this.currentFrame,
                deltaTime: this.deltaTime,
                fps: 1000 / this.deltaTime,
                activeAnimations: this.animations.size
            });
        }
    }
    
    generateId() {
        return 'anim_' + Math.random().toString(36).substr(2, 9);
    }
    
    getStats() {
        return {
            activeAnimations: this.animations.size,
            currentFrame: this.currentFrame,
            fps: Math.round(1000 / this.deltaTime),
            isRunning: this.isRunning
        };
    }
}

class AnimationTimeline {
    constructor(engine) {
        this.engine = engine;
        this.animations = [];
        this.currentTime = 0;
    }
    
    to(target, properties, options = {}) {
        this.animations.push({
            target,
            properties,
            options: {
                ...options,
                delay: this.currentTime + (options.delay || 0)
            }
        });
        
        this.currentTime += options.duration || 1000;
        return this;
    }
    
    wait(duration) {
        this.currentTime += duration;
        return this;
    }
    
    play() {
        for (const anim of this.animations) {
            this.engine.animate(anim.target, anim.properties, anim.options);
        }
        return this;
    }
}
