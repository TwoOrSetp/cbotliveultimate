document.addEventListener('DOMContentLoaded', function() {
    try {
        initializeTypingAnimations();
        initializeSmoothScrolling();
        initializeIntersectionObserver();
        initializeParallaxEffect();
        initializeNavbarBehavior();
        initializeNavigation();
    } catch (error) {
        console.error('Error initializing page:', error);
        const typingElements = document.querySelectorAll('.typing-text');
        typingElements.forEach(element => {
            const text = element.getAttribute('data-text');
            if (text) {
                element.textContent = text;
                element.classList.add('completed');
            }
        });
    }
});
function initializeTypingAnimations() {
    const typingElements = document.querySelectorAll('.typing-text');
    typingElements.forEach((element, index) => {
        const text = element.getAttribute('data-text');
        if (!text) return;
        const delay = parseInt(element.getAttribute('data-delay')) || index * 1000;
        element.textContent = '';
        element.classList.add('typing');
        setTimeout(() => {
            typeText(element, text, 50);
        }, delay);
    });
}
function typeText(element, text, speed) {
    if (!element || !text) return;
    let i = 0;
    element.textContent = '';
    function type() {
        if (i < text.length && element) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            if (element) {
                element.classList.remove('typing');
                element.classList.add('completed');
                element.style.animation = 'textGlow 0.5s ease-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        }
    }
    type();
}
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}
function initializeNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage ||
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
    });
}
function initializeIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
        return;
    }
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('download-card')) {
                    const delay = Array.from(entry.target.parentNode.children).indexOf(entry.target) * 200;
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, delay);
                }
            }
        });
    }, observerOptions);
    const elementsToObserve = document.querySelectorAll('.download-card, .social-link, .section-header, .feature-card');
    if (elementsToObserve.length > 0) {
        elementsToObserve.forEach(el => {
            el.classList.add('smooth-appear');
            observer.observe(el);
        });
    }
}
function initializeParallaxEffect() {
    const floatingElements = document.querySelectorAll('.floating-element');
    if (floatingElements.length > 0) {
        let ticking = false;
        function updateParallax() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            floatingElements.forEach((element, index) => {
                const speed = (index + 1) * 0.3;
                element.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
            });
            ticking = false;
        }
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }
}
function initializeNavbarBehavior() {
    const header = document.querySelector('.header');
    if (!header) return; 
    let lastScrollTop = 0;
    let ticking = false;
    function updateHeader() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollTop = scrollTop;
        ticking = false;
    }
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    window.addEventListener('scroll', requestTick, { passive: true });
    updateHeader();
}
function createParticleEffect(x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = 'var(--primary-color)';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '9999';
    particle.style.animation = 'particleFloat 1s ease-out forwards';
    document.body.appendChild(particle);
    setTimeout(() => {
        particle.remove();
    }, 1000);
}
const style = document.createElement('style');
style.textContent = `
    @keyframes particleFloat {
        0% {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px) scale(0);
        }
    }
`;
document.head.appendChild(style);
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn') || e.target.classList.contains('download-btn')) {
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                createParticleEffect(e.clientX + offsetX, e.clientY + offsetY);
            }, i * 50);
        }
    }
});
function addHoverEffects() {
    const cards = document.querySelectorAll('.download-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}
function initializeLoadingStates() {
    const buttons = document.querySelectorAll('.download-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const originalText = this.textContent;
            this.textContent = 'Downloading';
            this.classList.add('loading-dots');
            this.disabled = true;
            setTimeout(() => {
                this.textContent = originalText;
                this.classList.remove('loading-dots');
                this.disabled = false;
            }, 2000);
        });
    });
}
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}
function initializeAccessibility() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
        document.body.classList.add('reduced-motion');
    }
    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            document.body.classList.add('reduced-motion');
        } else {
            document.body.classList.remove('reduced-motion');
        }
    });
}
window.addEventListener('load', () => {
    addHoverEffects();
    initializeLoadingStates();
    initializeKeyboardNavigation();
    initializeAccessibility();
    document.body.classList.add('loaded');
});
window.addEventListener('resize', () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});
window.dispatchEvent(new Event('resize'));
