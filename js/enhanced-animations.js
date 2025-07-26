// Enhanced Animations and Background Effects for CBot

document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedTypingAnimations();
    initializeBackgroundEffects();
    initializeParticleSystem();
    initializeScrollEffects();
    initializeInteractiveElements();
});

// Enhanced Typing Animation System
function initializeEnhancedTypingAnimations() {
    const typingElements = document.querySelectorAll('.typing-text');
    
    typingElements.forEach((element, index) => {
        const text = element.getAttribute('data-text');
        if (!text) return;
        
        const delay = parseInt(element.getAttribute('data-delay')) || index * 800;
        const speed = parseInt(element.getAttribute('data-speed')) || 50;
        
        element.textContent = '';
        element.classList.add('typing');
        
        setTimeout(() => {
            enhancedTypeText(element, text, speed);
        }, delay);
    });
}

function enhancedTypeText(element, text, speed) {
    if (!element || !text) return;
    
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length && element) {
            element.textContent += text.charAt(i);
            i++;
            
            // Add typing sound effect (optional)
            if (i % 3 === 0) {
                playTypingSound();
            }
            
            setTimeout(type, speed);
        } else {
            if (element) {
                element.classList.remove('typing');
                element.classList.add('completed');
                
                // Add completion effect
                element.style.animation = 'textGlow 0.5s ease-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        }
    }
    
    type();
}

// Background Effects System
function initializeBackgroundEffects() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;
    
    // Create additional floating elements
    createFloatingElements();
    
    // Add mouse parallax effect
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        const floatingElements = document.querySelectorAll('.floating-logo');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.5;
            const x = (mouseX - 0.5) * speed * 20;
            const y = (mouseY - 0.5) * speed * 20;
            
            element.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

function createFloatingElements() {
    const heroBackground = document.querySelector('.hero-background');
    if (!heroBackground) return;
    
    // Create additional particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        
        heroBackground.appendChild(particle);
    }
    
    // Create additional floating logos
    for (let i = 0; i < 3; i++) {
        const logo = document.createElement('div');
        logo.className = 'floating-logo';
        logo.innerHTML = '<img src="assets/icon/logo.jpg" alt="cbot logo" class="rotating-logo">';
        logo.style.left = Math.random() * 80 + 10 + '%';
        logo.style.top = Math.random() * 80 + 10 + '%';
        logo.style.animationDelay = Math.random() * 10 + 's';
        logo.style.animationDuration = (Math.random() * 10 + 25) + 's';
        
        heroBackground.appendChild(logo);
    }
}

// Enhanced Particle System
function initializeParticleSystem() {
    const particles = document.querySelectorAll('.particle');
    
    particles.forEach((particle, index) => {
        // Add glow effect
        particle.style.boxShadow = `
            0 0 10px var(--primary-color),
            0 0 20px var(--primary-color),
            0 0 30px var(--primary-color)
        `;
        
        // Add interaction
        particle.addEventListener('mouseenter', () => {
            particle.style.transform = 'scale(2)';
            particle.style.opacity = '1';
        });
        
        particle.addEventListener('mouseleave', () => {
            particle.style.transform = 'scale(1)';
            particle.style.opacity = '0.6';
        });
    });
}

// Scroll Effects
function initializeScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for floating elements
        const floatingElements = document.querySelectorAll('.floating-element');
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.3;
            element.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
        
        // Background parallax
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
        
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }, { passive: true });
}

// Interactive Elements
function initializeInteractiveElements() {
    // Enhanced button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', createButtonRipple);
        button.addEventListener('click', createClickEffect);
    });
    
    // Enhanced logo interactions
    const logos = document.querySelectorAll('.floating-logo, .main-rotating-logo');
    logos.forEach(logo => {
        logo.addEventListener('mouseenter', () => {
            logo.style.filter = 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.8))';
            logo.style.transform = 'scale(1.2)';
        });
        
        logo.addEventListener('mouseleave', () => {
            logo.style.filter = '';
            logo.style.transform = '';
        });
    });
}

// Visual Effects Functions
function createButtonRipple(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = e.offsetX + 'px';
    ripple.style.top = e.offsetY + 'px';
    ripple.style.width = ripple.style.height = '20px';
    ripple.style.pointerEvents = 'none';
    
    button.style.position = 'relative';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function createClickEffect(e) {
    // Create particle burst effect
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = e.clientX + 'px';
            particle.style.top = e.clientY + 'px';
            particle.style.width = '4px';
            particle.style.height = '4px';
            particle.style.background = 'var(--primary-color)';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            particle.style.animation = 'clickParticle 1s ease-out forwards';
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            particle.style.setProperty('--end-x', endX + 'px');
            particle.style.setProperty('--end-y', endY + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }, i * 50);
    }
}

function playTypingSound() {
    // Create a subtle typing sound effect using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Fallback if Web Audio API is not available
        console.log('Audio not supported');
    }
}

// Add CSS animations dynamically
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes textGlow {
        0% { text-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
        50% { text-shadow: 0 0 50px rgba(99, 102, 241, 0.8); }
        100% { text-shadow: 0 0 30px rgba(99, 102, 241, 0.5); }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes clickParticle {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(var(--end-x), var(--end-y)) scale(0);
            opacity: 0;
        }
    }
    
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    .floating-logo:hover {
        transition: all 0.3s ease;
    }
    
    .particle:hover {
        transition: all 0.3s ease;
    }
`;

document.head.appendChild(enhancedStyles);

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimize scroll events
const optimizedScrollHandler = debounce(() => {
    // Scroll-based animations
}, 16);

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// Initialize on window load
window.addEventListener('load', () => {
    // Final initialization after all resources are loaded
    document.body.classList.add('enhanced-loaded');
    
    // Add entrance animations
    const elements = document.querySelectorAll('.hero-content, .hero-visual');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 200);
    });
}); 