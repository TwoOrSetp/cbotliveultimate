// Fallback script to prevent infinite loading
(function() {
    'use strict';
    
    // Set a maximum loading time
    const MAX_LOADING_TIME = 5000; // 5 seconds
    
    // Fallback function to show content immediately
    function showContentImmediately() {
        // Remove any loading states
        const loadingElements = document.querySelectorAll('.loading, .loading-state');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
        
        // Show all content
        const hiddenContent = document.querySelectorAll('[style*="display: none"]');
        hiddenContent.forEach(el => {
            if (!el.classList.contains('loading') && !el.classList.contains('loading-state')) {
                el.style.display = '';
            }
        });
        
        // Complete all typing animations immediately
        const typingElements = document.querySelectorAll('.typing-text');
        typingElements.forEach(element => {
            const text = element.getAttribute('data-text');
            if (text && element.textContent !== text) {
                element.textContent = text;
                element.classList.remove('typing');
                element.classList.add('completed');
            }
        });
        
        // Show any hidden sections
        const sections = document.querySelectorAll('section, .section');
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.visibility = 'visible';
        });
        
        console.log('Fallback: Content shown immediately');
    }
    
    // Set timeout to show content if loading takes too long
    setTimeout(showContentImmediately, MAX_LOADING_TIME);
    
    // Also trigger on any JavaScript errors
    window.addEventListener('error', function(e) {
        console.warn('JavaScript error detected, showing content immediately:', e.error);
        showContentImmediately();
    });
    
    // Trigger on unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('Unhandled promise rejection, showing content immediately:', e.reason);
        showContentImmediately();
    });
    
    // Check if page is already loaded
    if (document.readyState === 'complete') {
        setTimeout(showContentImmediately, 1000);
    } else {
        window.addEventListener('load', function() {
            setTimeout(showContentImmediately, 1000);
        });
    }
    
})();
