export class TypingAnimation {
    constructor(options = {}) {
        this.instances = new Map();
        this.globalConfig = {
            typeSpeed: options.typeSpeed || 80,
            deleteSpeed: options.deleteSpeed || 40,
            pauseDelay: options.pauseDelay || 2000,
            cursorChar: options.cursorChar || '|',
            cursorBlinkSpeed: options.cursorBlinkSpeed || 530,
            showCursor: options.showCursor !== false,
            loop: options.loop !== false,
            shuffle: options.shuffle || false,
            smartBackspace: options.smartBackspace !== false,
            fadeOut: options.fadeOut || false,
            fadeOutClass: options.fadeOutClass || 'typed-fade-out',
            fadeOutDelay: options.fadeOutDelay || 500,
            preStringTyped: options.preStringTyped || null,
            onStringTyped: options.onStringTyped || null,
            onLastStringTyped: options.onLastStringTyped || null,
            onTypingPaused: options.onTypingPaused || null,
            onTypingResumed: options.onTypingResumed || null,
            onComplete: options.onComplete || null,
            onDestroy: options.onDestroy || null
        };
        
        this.setupGlobalStyles();
    }
    
    setupGlobalStyles() {
        if (document.querySelector('#typing-animation-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'typing-animation-styles';
        style.textContent = `
            .typing-cursor {
                display: inline-block;
                vertical-align: top;
                animation: typing-blink 1.06s infinite;
                color: var(--primary-blue);
                font-weight: 300;
            }
            
            .typing-cursor.typing-cursor-hidden {
                opacity: 0;
            }
            
            @keyframes typing-blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }
            
            .typed-fade-out {
                opacity: 0;
                transition: opacity 0.25s;
            }
            
            .typing-container {
                position: relative;
                display: inline-block;
            }
            
            .typing-text {
                display: inline-block;
                min-height: 1em;
            }
            
            .typing-gradient {
                background: var(--gradient-primary);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                background-size: 200% 200%;
                animation: gradient-shift 3s ease-in-out infinite;
            }
            
            .typing-glow {
                text-shadow: 0 0 10px var(--primary-blue), 0 0 20px var(--primary-blue), 0 0 30px var(--primary-blue);
                animation: glow-pulse 2s ease-in-out infinite;
            }
            
            .typing-matrix {
                font-family: 'JetBrains Mono', monospace;
                color: #00ff41;
                text-shadow: 0 0 5px #00ff41;
            }
            
            .typing-neon {
                color: #fff;
                text-shadow: 
                    0 0 5px var(--primary-blue),
                    0 0 10px var(--primary-blue),
                    0 0 15px var(--primary-blue),
                    0 0 20px var(--primary-blue);
                animation: neon-flicker 1.5s infinite alternate;
            }
            
            @keyframes neon-flicker {
                0%, 18%, 22%, 25%, 53%, 57%, 100% {
                    text-shadow: 
                        0 0 5px var(--primary-blue),
                        0 0 10px var(--primary-blue),
                        0 0 15px var(--primary-blue),
                        0 0 20px var(--primary-blue);
                }
                20%, 24%, 55% {
                    text-shadow: none;
                }
            }
            
            .typing-hologram {
                background: linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.5) 50%, transparent 70%);
                background-size: 200% 200%;
                animation: hologram-scan 2s linear infinite;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            @keyframes hologram-scan {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    create(element, strings, options = {}) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }
        
        if (!element) {
            console.error('TypingAnimation: Element not found');
            return null;
        }
        
        const config = { ...this.globalConfig, ...options };
        const instanceId = this.generateId();
        
        const instance = {
            id: instanceId,
            element: element,
            strings: Array.isArray(strings) ? strings : [strings],
            config: config,
            currentStringIndex: 0,
            currentCharIndex: 0,
            isTyping: false,
            isDeleting: false,
            isPaused: false,
            isComplete: false,
            cursor: null,
            timeout: null,
            originalContent: element.innerHTML
        };
        
        this.instances.set(instanceId, instance);
        this.initializeInstance(instance);
        
        return instanceId;
    }
    
    initializeInstance(instance) {
        const { element, config } = instance;
        
        element.classList.add('typing-container');
        element.innerHTML = '';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'typing-text';
        element.appendChild(textSpan);
        
        if (config.showCursor) {
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = config.cursorChar;
            element.appendChild(cursor);
            instance.cursor = cursor;
        }
        
        this.startTyping(instance);
    }
    
    startTyping(instance) {
        if (instance.isPaused || instance.isComplete) return;
        
        const { strings, config, currentStringIndex } = instance;
        const currentString = strings[currentStringIndex];
        
        if (config.preStringTyped) {
            config.preStringTyped(currentStringIndex, instance);
        }
        
        instance.isTyping = true;
        this.typeString(instance, currentString);
    }
    
    typeString(instance, string) {
        const { config, element } = instance;
        const textSpan = element.querySelector('.typing-text');
        
        if (instance.currentCharIndex < string.length) {
            const char = string.charAt(instance.currentCharIndex);
            textSpan.textContent += char;
            instance.currentCharIndex++;
            
            const delay = this.getRandomDelay(config.typeSpeed);
            instance.timeout = setTimeout(() => this.typeString(instance, string), delay);
        } else {
            this.onStringComplete(instance);
        }
    }
    
    onStringComplete(instance) {
        const { config, strings, currentStringIndex } = instance;
        
        instance.isTyping = false;
        
        if (config.onStringTyped) {
            config.onStringTyped(currentStringIndex, instance);
        }
        
        if (currentStringIndex === strings.length - 1) {
            if (config.onLastStringTyped) {
                config.onLastStringTyped(instance);
            }
            
            if (config.loop) {
                instance.timeout = setTimeout(() => {
                    this.startDeleting(instance);
                }, config.pauseDelay);
            } else {
                this.complete(instance);
            }
        } else {
            instance.timeout = setTimeout(() => {
                this.startDeleting(instance);
            }, config.pauseDelay);
        }
    }
    
    startDeleting(instance) {
        if (instance.isPaused || instance.isComplete) return;
        
        instance.isDeleting = true;
        this.deleteString(instance);
    }
    
    deleteString(instance) {
        const { config, element } = instance;
        const textSpan = element.querySelector('.typing-text');
        const currentText = textSpan.textContent;
        
        if (instance.currentCharIndex > 0) {
            if (config.smartBackspace && instance.strings.length > 1) {
                const nextString = instance.strings[(instance.currentStringIndex + 1) % instance.strings.length];
                const commonLength = this.getCommonLength(currentText, nextString);
                
                if (instance.currentCharIndex <= commonLength) {
                    this.onDeleteComplete(instance);
                    return;
                }
            }
            
            textSpan.textContent = currentText.substring(0, instance.currentCharIndex - 1);
            instance.currentCharIndex--;
            
            const delay = this.getRandomDelay(config.deleteSpeed);
            instance.timeout = setTimeout(() => this.deleteString(instance), delay);
        } else {
            this.onDeleteComplete(instance);
        }
    }
    
    onDeleteComplete(instance) {
        instance.isDeleting = false;
        instance.currentStringIndex = (instance.currentStringIndex + 1) % instance.strings.length;
        
        instance.timeout = setTimeout(() => {
            this.startTyping(instance);
        }, instance.config.typeSpeed);
    }
    
    complete(instance) {
        instance.isComplete = true;
        
        if (instance.config.fadeOut) {
            instance.element.classList.add(instance.config.fadeOutClass);
        }
        
        if (instance.config.onComplete) {
            instance.config.onComplete(instance);
        }
    }
    
    pause(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;
        
        instance.isPaused = true;
        if (instance.timeout) {
            clearTimeout(instance.timeout);
        }
        
        if (instance.config.onTypingPaused) {
            instance.config.onTypingPaused(instance);
        }
    }
    
    resume(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance || !instance.isPaused) return;
        
        instance.isPaused = false;
        
        if (instance.isTyping) {
            const currentString = instance.strings[instance.currentStringIndex];
            this.typeString(instance, currentString);
        } else if (instance.isDeleting) {
            this.deleteString(instance);
        } else {
            this.startTyping(instance);
        }
        
        if (instance.config.onTypingResumed) {
            instance.config.onTypingResumed(instance);
        }
    }
    
    destroy(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) return;
        
        if (instance.timeout) {
            clearTimeout(instance.timeout);
        }
        
        instance.element.innerHTML = instance.originalContent;
        instance.element.classList.remove('typing-container');
        
        if (instance.config.onDestroy) {
            instance.config.onDestroy(instance);
        }
        
        this.instances.delete(instanceId);
    }
    
    destroyAll() {
        for (const [instanceId] of this.instances) {
            this.destroy(instanceId);
        }
    }
    
    getRandomDelay(baseDelay) {
        return baseDelay + Math.random() * 50 - 25;
    }
    
    getCommonLength(str1, str2) {
        let i = 0;
        while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
            i++;
        }
        return i;
    }
    
    generateId() {
        return 'typing_' + Math.random().toString(36).substr(2, 9);
    }
    
    getInstance(instanceId) {
        return this.instances.get(instanceId);
    }
    
    getAllInstances() {
        return Array.from(this.instances.values());
    }
    
    getStats() {
        return {
            totalInstances: this.instances.size,
            activeInstances: Array.from(this.instances.values()).filter(i => !i.isComplete).length,
            completedInstances: Array.from(this.instances.values()).filter(i => i.isComplete).length
        };
    }
}
