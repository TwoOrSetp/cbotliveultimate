async function initializeApp() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeAnimations();
    initializeParallax();
    initializeDownloadTracking();
    initializeFormValidation();

    await initializeGeometryDashHero();

    if (window.innerWidth > 768) {
        createParticleEffect();
    }

    document.body.classList.add('app-initialized');
}

async function initializeGeometryDashHero() {
    const startTime = performance.now();

    try {
        console.log('🚀 Initializing GeoDash Hero System...');

        // Import modules
        const { ImageManager, GeometryDashHero, IconManager } = await import('./image-manager.js');

        // Initialize icon system
        console.log('🎯 Loading navigation icons...');
        const iconManager = new IconManager();
        await iconManager.loadNavIcon();

        // Initialize image system
        console.log('🖼️ Initializing image management...');
        const imageManager = new ImageManager();
        await imageManager.initialize();

        // Initialize hero component
        console.log('🎮 Setting up hero interactions...');
        const gdHero = new GeometryDashHero(imageManager);
        await gdHero.initialize();

        // System status report
        const selectedImage = imageManager.getSelectedImage();
        const allImages = imageManager.getAllImages();
        const allIcons = iconManager.getAvailableIcons();
        const initTime = Math.round(performance.now() - startTime);

        console.log('\n🎉 GeoDash Hero System Ready!');
        console.log('═══════════════════════════════');
        console.log(`⚡ Initialization time: ${initTime}ms`);
        console.log(`📸 Current mod: ${selectedImage?.name || 'None'} (${selectedImage?.type || 'N/A'})`);
        console.log(`🖼️ Total mods discovered: ${allImages.length}`);
        console.log(`🎯 Icons loaded: ${allIcons.length}`);
        console.log('═══════════════════════════════');

        if (allImages.length > 0) {
            console.log('📋 Available mods:');
            allImages.forEach((img, index) => {
                const indicator = img === selectedImage ? '👉' : '  ';
                console.log(`${indicator} ${index + 1}. ${img.name} (${img.type.toUpperCase()})`);
            });
        }

        if (allImages.length > 1) {
            console.log('\n💡 Tip: Click the cube to cycle through mods!');
        }

        // Initialize typewriter effects
        console.log('⌨️ Starting typewriter effects...');
        initializeTypewriterEffects();

        return { imageManager, gdHero, iconManager };

    } catch (error) {
        console.error('❌ GeoDash Hero initialization failed:', error);
        console.error('Stack trace:', error.stack);

        // Attempt graceful degradation
        try {
            console.log('🔧 Attempting fallback initialization...');
            const fallbackElement = document.querySelector('.cube');
            if (fallbackElement) {
                fallbackElement.style.background = 'var(--theme-gradient)';
                fallbackElement.innerHTML = '<div class="fallback-text"><span>GD</span></div>';
                console.log('✅ Fallback display activated');
            }
        } catch (fallbackError) {
            console.error('❌ Fallback initialization also failed:', fallbackError);
        }

        return null;
    }
}

class TypewriterEffect {
    constructor(element, options = {}) {
        this.element = element;
        this.originalText = element.textContent;
        this.speed = options.speed || 100;
        this.delay = options.delay || 0;
        this.cursor = options.cursor !== false;
        this.cursorChar = options.cursorChar || '|';
        this.loop = options.loop || false;
        this.deleteSpeed = options.deleteSpeed || 50;
        this.pauseTime = options.pauseTime || 2000;

        this.currentIndex = 0;
        this.isDeleting = false;
        this.isComplete = false;
    }

    async start() {
        // Clear the element and add cursor
        this.element.textContent = '';
        if (this.cursor) {
            this.element.innerHTML = `<span class="typewriter-cursor">${this.cursorChar}</span>`;
        }

        // Wait for initial delay
        if (this.delay > 0) {
            await new Promise(resolve => setTimeout(resolve, this.delay));
        }

        await this.typeText();
    }

    async typeText() {
        return new Promise((resolve) => {
            const type = () => {
                if (!this.isDeleting && this.currentIndex < this.originalText.length) {
                    // Typing forward
                    const currentText = this.originalText.substring(0, this.currentIndex + 1);
                    this.updateDisplay(currentText);
                    this.playTypingSound();
                    this.currentIndex++;

                    // Variable speed based on character
                    let nextDelay = this.speed;
                    const currentChar = this.originalText[this.currentIndex - 1];
                    if (currentChar === ' ') nextDelay *= 0.5; // Faster for spaces
                    if (['.', '!', '?'].includes(currentChar)) nextDelay *= 2; // Slower for punctuation

                    setTimeout(type, nextDelay + Math.random() * 30);

                } else if (this.isDeleting && this.currentIndex > 0) {
                    // Deleting backward
                    const currentText = this.originalText.substring(0, this.currentIndex - 1);
                    this.updateDisplay(currentText);
                    this.currentIndex--;
                    setTimeout(type, this.deleteSpeed);

                } else if (!this.isDeleting && this.currentIndex === this.originalText.length) {
                    // Finished typing
                    this.isComplete = true;
                    this.element.classList.add('typewriter-complete');

                    if (this.loop) {
                        setTimeout(() => {
                            this.isDeleting = true;
                            type();
                        }, this.pauseTime);
                    } else {
                        // Remove cursor after completion
                        setTimeout(() => {
                            this.removeCursor();
                            resolve();
                        }, 1000);
                    }

                } else if (this.isDeleting && this.currentIndex === 0) {
                    // Finished deleting, start typing again
                    this.isDeleting = false;
                    setTimeout(type, 500);
                }
            };

            type();
        });
    }

    playTypingSound() {
        // Optional: Add subtle typing sound effect
        // Uncomment if you want audio feedback
        /*
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
            audio.volume = 0.1;
            audio.play().catch(() => {}); // Ignore errors
        } catch (e) {}
        */
    }

    updateDisplay(text) {
        if (this.cursor) {
            this.element.innerHTML = `${text}<span class="typewriter-cursor">${this.cursorChar}</span>`;
        } else {
            this.element.textContent = text;
        }
    }

    removeCursor() {
        const cursor = this.element.querySelector('.typewriter-cursor');
        if (cursor) {
            cursor.remove();
        }
    }
}

async function initializeTypewriterEffects() {
    try {
        // Main hero title
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const titleTypewriter = new TypewriterEffect(heroTitle, {
                speed: 80,
                delay: 500,
                cursor: true,
                cursorChar: '_'
            });
            await titleTypewriter.start();
        }

        // Hero description with delay
        const heroDescription = document.querySelector('.hero-description');
        if (heroDescription) {
            const descTypewriter = new TypewriterEffect(heroDescription, {
                speed: 30,
                delay: 200,
                cursor: false
            });
            await descTypewriter.start();
        }

        // Section titles with staggered delays
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach((title, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const typewriter = new TypewriterEffect(title, {
                            speed: 60,
                            delay: index * 200,
                            cursor: true,
                            cursorChar: '|'
                        });
                        typewriter.start();
                        observer.unobserve(title);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(title);
        });

        // Feature card titles
        const featureCards = document.querySelectorAll('.feature-card h3');
        featureCards.forEach((cardTitle, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            const typewriter = new TypewriterEffect(cardTitle, {
                                speed: 50,
                                delay: 0,
                                cursor: false
                            });
                            typewriter.start();
                        }, index * 300);
                        observer.unobserve(cardTitle);
                    }
                });
            }, { threshold: 0.7 });

            observer.observe(cardTitle);
        });

        // Navigation brand with special effect
        const navBrand = document.querySelector('.nav-brand h1');
        if (navBrand) {
            const brandTypewriter = new TypewriterEffect(navBrand, {
                speed: 150,
                delay: 100,
                cursor: true,
                cursorChar: '▌',
                loop: false
            });
            brandTypewriter.start();
        }

        console.log('✅ Typewriter effects initialized');

    } catch (error) {
        console.error('❌ Failed to initialize typewriter effects:', error);
    }
}

function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.feature-card, .download-content, .hero-content');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

function initializeParallax() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-image');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

function createParticleEffect() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    
    document.body.appendChild(canvas);
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 136, ${particle.opacity})`;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

function initializeDownloadTracking() {
    const downloadButtons = document.querySelectorAll('a[href*="download"]');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            console.log('Download initiated');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'engagement',
                    'event_label': 'cbot_download'
                });
            }
        });
    });
}

function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            console.log('Form submitted:', data);
            
            form.reset();
            showNotification('Thank you for your submission!');
        });
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: var(--dark-bg);
        padding: 1rem 2rem;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

export default initializeApp;
