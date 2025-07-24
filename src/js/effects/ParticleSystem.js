export class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.emitters = [];
        this.forces = [];
        this.isRunning = false;
        
        this.config = {
            maxParticles: options.maxParticles || 1000,
            gravity: options.gravity || { x: 0, y: 0.1 },
            friction: options.friction || 0.99,
            bounds: options.bounds || { x: 0, y: 0, width: canvas.width, height: canvas.height }
        };
        
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1000';
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.config.bounds = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
    }
    
    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
        });
        
        document.addEventListener('click', (e) => {
            this.createBurst(e.clientX, e.clientY);
        });
    }
    
    createParticle(options = {}) {
        if (this.particles.length >= this.config.maxParticles) {
            this.particles.shift();
        }
        
        const particle = {
            id: Math.random().toString(36).substr(2, 9),
            x: options.x || 0,
            y: options.y || 0,
            vx: options.vx || (Math.random() - 0.5) * 2,
            vy: options.vy || (Math.random() - 0.5) * 2,
            size: options.size || Math.random() * 3 + 1,
            color: options.color || this.randomColor(),
            alpha: options.alpha || 1,
            life: options.life || 1,
            maxLife: options.maxLife || 1,
            mass: options.mass || 1,
            bounce: options.bounce || 0.8,
            trail: options.trail || [],
            maxTrailLength: options.maxTrailLength || 10,
            type: options.type || 'circle',
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || 0,
            scale: options.scale || 1,
            scaleSpeed: options.scaleSpeed || 0,
            behavior: options.behavior || 'default'
        };
        
        this.particles.push(particle);
        return particle;
    }
    
    createEmitter(x, y, options = {}) {
        const emitter = {
            id: Math.random().toString(36).substr(2, 9),
            x: x,
            y: y,
            rate: options.rate || 10,
            lastEmit: 0,
            active: true,
            particleOptions: options.particleOptions || {},
            pattern: options.pattern || 'random',
            angle: options.angle || 0,
            spread: options.spread || Math.PI * 2,
            force: options.force || 1,
            life: options.life || Infinity,
            maxLife: options.maxLife || Infinity
        };
        
        this.emitters.push(emitter);
        return emitter;
    }
    
    addForce(force) {
        this.forces.push(force);
    }
    
    removeForce(force) {
        const index = this.forces.indexOf(force);
        if (index > -1) {
            this.forces.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        this.updateEmitters(deltaTime);
        this.updateParticles(deltaTime);
        this.applyForces();
        this.handleCollisions();
        this.cleanupParticles();
    }
    
    updateEmitters(deltaTime) {
        for (const emitter of this.emitters) {
            if (!emitter.active) continue;
            
            emitter.life -= deltaTime;
            if (emitter.life <= 0 && emitter.maxLife !== Infinity) {
                emitter.active = false;
                continue;
            }
            
            const timeSinceLastEmit = performance.now() - emitter.lastEmit;
            const emitInterval = 1000 / emitter.rate;
            
            if (timeSinceLastEmit >= emitInterval) {
                this.emitParticle(emitter);
                emitter.lastEmit = performance.now();
            }
        }
    }
    
    emitParticle(emitter) {
        let angle, force;
        
        switch (emitter.pattern) {
            case 'cone':
                angle = emitter.angle + (Math.random() - 0.5) * emitter.spread;
                force = emitter.force * (0.5 + Math.random() * 0.5);
                break;
            case 'circle':
                angle = Math.random() * Math.PI * 2;
                force = emitter.force;
                break;
            case 'line':
                angle = emitter.angle;
                force = emitter.force * (0.8 + Math.random() * 0.4);
                break;
            default:
                angle = Math.random() * Math.PI * 2;
                force = emitter.force * Math.random();
        }
        
        const vx = Math.cos(angle) * force;
        const vy = Math.sin(angle) * force;
        
        this.createParticle({
            x: emitter.x,
            y: emitter.y,
            vx: vx,
            vy: vy,
            ...emitter.particleOptions
        });
    }
    
    updateParticles(deltaTime) {
        for (const particle of this.particles) {
            this.updateParticle(particle, deltaTime);
        }
    }
    
    updateParticle(particle, deltaTime) {
        const dt = deltaTime / 16.67;
        
        particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
        if (particle.trail.length > particle.maxTrailLength) {
            particle.trail.shift();
        }
        
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        
        particle.vx *= this.config.friction;
        particle.vy *= this.config.friction;
        
        particle.vy += this.config.gravity.y * particle.mass * dt;
        particle.vx += this.config.gravity.x * particle.mass * dt;
        
        particle.rotation += particle.rotationSpeed * dt;
        particle.scale += particle.scaleSpeed * dt;
        
        particle.life -= dt / 60;
        particle.alpha = particle.life / particle.maxLife;
        
        this.applyBehavior(particle, dt);
        this.handleBounds(particle);
    }
    
    applyBehavior(particle, dt) {
        switch (particle.behavior) {
            case 'orbit':
                if (this.mousePosition) {
                    const dx = this.mousePosition.x - particle.x;
                    const dy = this.mousePosition.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = 100 / (distance + 1);
                    
                    particle.vx += (dy / distance) * force * dt;
                    particle.vy += (-dx / distance) * force * dt;
                }
                break;
                
            case 'attract':
                if (this.mousePosition) {
                    const dx = this.mousePosition.x - particle.x;
                    const dy = this.mousePosition.y - particle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = 50 / (distance + 1);
                    
                    particle.vx += (dx / distance) * force * dt;
                    particle.vy += (dy / distance) * force * dt;
                }
                break;
                
            case 'repel':
                if (this.mousePosition) {
                    const dx = particle.x - this.mousePosition.x;
                    const dy = particle.y - this.mousePosition.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = 100 / (distance + 1);
                    
                    particle.vx += (dx / distance) * force * dt;
                    particle.vy += (dy / distance) * force * dt;
                }
                break;
                
            case 'sine':
                particle.vy += Math.sin(particle.x * 0.01) * 0.1;
                break;
        }
    }
    
    applyForces() {
        for (const force of this.forces) {
            for (const particle of this.particles) {
                const dx = force.x - particle.x;
                const dy = force.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < force.radius) {
                    const strength = force.strength * (1 - distance / force.radius);
                    particle.vx += (dx / distance) * strength;
                    particle.vy += (dy / distance) * strength;
                }
            }
        }
    }
    
    handleBounds(particle) {
        if (particle.x < 0) {
            particle.x = 0;
            particle.vx *= -particle.bounce;
        } else if (particle.x > this.config.bounds.width) {
            particle.x = this.config.bounds.width;
            particle.vx *= -particle.bounce;
        }
        
        if (particle.y < 0) {
            particle.y = 0;
            particle.vy *= -particle.bounce;
        } else if (particle.y > this.config.bounds.height) {
            particle.y = this.config.bounds.height;
            particle.vy *= -particle.bounce;
        }
    }
    
    handleCollisions() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = p1.size + p2.size;
                
                if (distance < minDistance) {
                    const overlap = minDistance - distance;
                    const separationX = (dx / distance) * overlap * 0.5;
                    const separationY = (dy / distance) * overlap * 0.5;
                    
                    p1.x -= separationX;
                    p1.y -= separationY;
                    p2.x += separationX;
                    p2.y += separationY;
                    
                    const tempVx = p1.vx;
                    const tempVy = p1.vy;
                    p1.vx = p2.vx * p1.bounce;
                    p1.vy = p2.vy * p1.bounce;
                    p2.vx = tempVx * p2.bounce;
                    p2.vy = tempVy * p2.bounce;
                }
            }
        }
    }
    
    cleanupParticles() {
        this.particles = this.particles.filter(particle => 
            particle.life > 0 && 
            particle.alpha > 0.01 &&
            particle.x > -100 && particle.x < this.config.bounds.width + 100 &&
            particle.y > -100 && particle.y < this.config.bounds.height + 100
        );
        
        this.emitters = this.emitters.filter(emitter => emitter.active);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (const particle of this.particles) {
            this.renderParticle(particle);
        }
    }
    
    renderParticle(particle) {
        this.ctx.save();
        
        this.renderTrail(particle);
        
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.scale(particle.scale, particle.scale);
        
        switch (particle.type) {
            case 'circle':
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
                
            case 'square':
                this.ctx.fillStyle = particle.color;
                this.ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
                break;
                
            case 'star':
                this.renderStar(particle);
                break;
        }
        
        this.ctx.restore();
    }
    
    renderTrail(particle) {
        if (particle.trail.length < 2) return;
        
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = particle.size * 0.5;
        this.ctx.beginPath();
        
        for (let i = 0; i < particle.trail.length; i++) {
            const point = particle.trail[i];
            const alpha = (i / particle.trail.length) * particle.alpha;
            
            this.ctx.globalAlpha = alpha;
            
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        
        this.ctx.stroke();
    }
    
    renderStar(particle) {
        const spikes = 5;
        const outerRadius = particle.size;
        const innerRadius = particle.size * 0.5;
        
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    createBurst(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;
            
            this.createParticle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: this.randomColor(),
                life: 1,
                maxLife: 1,
                type: Math.random() > 0.5 ? 'circle' : 'star',
                behavior: 'default'
            });
        }
    }
    
    randomColor() {
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b',
            '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
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
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame(() => this.animate());
    }
    
    clear() {
        this.particles = [];
        this.emitters = [];
        this.forces = [];
    }
    
    getStats() {
        return {
            particles: this.particles.length,
            emitters: this.emitters.length,
            forces: this.forces.length,
            isRunning: this.isRunning
        };
    }
}
