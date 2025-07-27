(function() {
    'use strict';
    const MAX_LOADING_TIME = 5000; 
    function showContentImmediately() {
        const loadingElements = document.querySelectorAll('.loading, .loading-state');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
        const hiddenContent = document.querySelectorAll('[style*="display: none"]');
        hiddenContent.forEach(el => {
            if (!el.classList.contains('loading') && !el.classList.contains('loading-state')) {
                el.style.display = '';
            }
        });
        const typingElements = document.querySelectorAll('.typing-text');
        typingElements.forEach(element => {
            const text = element.getAttribute('data-text');
            if (text && element.textContent !== text) {
                element.textContent = text;
                element.classList.remove('typing');
                element.classList.add('completed');
            }
        });
        const sections = document.querySelectorAll('section, .section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
        });
        console.log('Fallback: Content shown immediately');
    }
    setTimeout(showContentImmediately, MAX_LOADING_TIME);
    window.addEventListener('error', function(e) {
        console.warn('JavaScript error detected, showing content immediately:', e.error);
        showContentImmediately();
    });
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Unhandled promise rejection, showing content immediately:', e.reason);
        showContentImmediately();
    });
    if (document.readyState === 'complete') {
        setTimeout(showContentImmediately, 1000);
    } else {
        window.addEventListener('load', function() {
            setTimeout(showContentImmediately, 1000);
        });
    }
})();
