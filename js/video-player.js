class YouTubePlayer {
    constructor() {
        this.youtubeContainer = null;
        this.placeholder = null;
        this.iframe = null;
        this.isLoaded = false;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.bindEvents();
    }

    setupLazyLoading() {
        const youtubeContainer = document.querySelector('.youtube-embed-container[data-lazy="true"]');
        if (!youtubeContainer) return;

        // Create intersection observer for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoaded) {
                    this.setupYouTubeEmbed(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        observer.observe(youtubeContainer);
    }

    setupYouTubeEmbed(container) {
        this.youtubeContainer = container;
        this.placeholder = container.querySelector('.youtube-placeholder');
        this.iframe = container.querySelector('.youtube-iframe');
        this.isLoaded = true;

        if (!this.placeholder || !this.iframe) {
            console.error('YouTube placeholder or iframe not found');
            return;
        }

        // Get video ID from placeholder
        const videoId = this.placeholder.getAttribute('data-video-id');
        if (!videoId) {
            console.error('YouTube video ID not found');
            return;
        }

        // Setup click handler for placeholder
        this.placeholder.addEventListener('click', () => {
            this.loadYouTubeVideo(videoId);
        });

        console.log('YouTube embed initialized with video ID:', videoId);
    }

    loadYouTubeVideo(videoId) {
        if (!this.iframe || !this.placeholder) return;

        // Show loading state
        this.showLoadingState();

        // Set iframe source
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        this.iframe.setAttribute('src', embedUrl);

        // Hide placeholder and show iframe
        this.placeholder.style.display = 'none';
        this.iframe.style.display = 'block';

        // Hide loading state after a delay
        setTimeout(() => {
            this.hideLoadingState();
        }, 1500);

        console.log('YouTube video loaded:', videoId);
    }

    bindEvents() {
        // Handle YouTube video configuration updates
        document.addEventListener('click', (e) => {
            if (e.target.closest('.youtube-config-btn')) {
                this.showYouTubeConfig();
            }
        });

        // Handle escape key to close any modals
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.closeModals();
            }
        });
    }

    showYouTubeConfig() {
        // This could be used to show a modal for changing the YouTube video
        console.log('YouTube configuration requested');
    }

    closeModals() {
        // Close any open modals or overlays
        const modals = document.querySelectorAll('.modal, .overlay');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    togglePlayPause() {
        if (!this.video || !this.playPauseBtn) return;

        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');

        if (this.video.paused) {
            this.video.play().then(() => {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            }).catch(error => {
                console.error('Error playing video:', error);
                this.showErrorState();
            });
        } else {
            this.video.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }

    resetPlayButton() {
        if (!this.playPauseBtn) return;
        
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');
        
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    }

    seekVideo(e) {
        if (!this.video || !this.progressBar) return;

        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * this.video.duration;

        this.video.currentTime = Math.max(0, Math.min(newTime, this.video.duration));
    }

    updateProgress() {
        if (!this.video || !this.progressFill || !this.currentTimeDisplay) return;

        const percentage = (this.video.currentTime / this.video.duration) * 100;
        this.progressFill.style.width = `${percentage}%`;
        this.currentTimeDisplay.textContent = this.formatTime(this.video.currentTime);
    }

    updateDuration() {
        if (!this.video || !this.durationDisplay) return;
        this.durationDisplay.textContent = this.formatTime(this.video.duration);
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    toggleFullscreen() {
        if (!this.video) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            const container = this.video.closest('.video-container');
            if (container.requestFullscreen) {
                container.requestFullscreen();
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
        }
    }

    showLoadingState() {
        const container = this.youtubeContainer?.closest('.video-container');
        if (!container) return;

        // Remove existing loading element
        this.hideLoadingState();

        const loadingElement = document.createElement('div');
        loadingElement.className = 'video-loading';
        loadingElement.innerHTML = `
            <div class="spinner"></div>
            <p>Loading YouTube video...</p>
        `;
        container.appendChild(loadingElement);
    }

    hideLoadingState() {
        const loadingElement = document.querySelector('.video-loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    showErrorState() {
        const container = this.youtubeContainer?.closest('.video-container');
        if (!container) return;

        this.hideLoadingState();

        const errorElement = document.createElement('div');
        errorElement.className = 'video-error';
        errorElement.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
            </svg>
            <h3>YouTube Video Unavailable</h3>
            <p>Sorry, the YouTube video could not be loaded. Please check your connection or try again later.</p>
            <a href="https://youtube.com/@snopphin" target="_blank" rel="noopener" class="btn btn-primary">
                Visit YouTube Channel
            </a>
        `;
        container.appendChild(errorElement);
    }

    // Method to change YouTube video
    changeYouTubeVideo(videoId) {
        if (!videoId) return;

        const placeholder = this.youtubeContainer?.querySelector('.youtube-placeholder');
        if (placeholder) {
            placeholder.setAttribute('data-video-id', videoId);

            // Reset to placeholder state
            if (this.iframe) {
                this.iframe.style.display = 'none';
                this.iframe.removeAttribute('src');
            }
            if (this.placeholder) {
                this.placeholder.style.display = 'block';
            }

            console.log('YouTube video changed to:', videoId);
        }
    }

    // Method to get current YouTube video info
    getYouTubeInfo() {
        const placeholder = this.youtubeContainer?.querySelector('.youtube-placeholder');
        if (!placeholder) return null;

        return {
            videoId: placeholder.getAttribute('data-video-id'),
            isLoaded: this.iframe?.style.display === 'block',
            title: placeholder.querySelector('.youtube-title')?.textContent,
            channel: placeholder.querySelector('.youtube-channel')?.textContent
        };
    }

    // Method to update YouTube video info
    updateYouTubeInfo(title, channel) {
        const titleElement = this.youtubeContainer?.querySelector('.youtube-title');
        const channelElement = this.youtubeContainer?.querySelector('.youtube-channel');

        if (titleElement && title) {
            titleElement.textContent = title;
        }
        if (channelElement && channel) {
            channelElement.textContent = channel;
        }
    }
}

// Initialize YouTube player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.youtubePlayer = new YouTubePlayer();
});

// Export for use in other scripts
window.YouTubePlayer = YouTubePlayer;
