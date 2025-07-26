class VideoPlayer {
    constructor() {
        this.video = null;
        this.playPauseBtn = null;
        this.progressBar = null;
        this.progressFill = null;
        this.currentTimeDisplay = null;
        this.durationDisplay = null;
        this.fullscreenBtn = null;
        this.isLoaded = false;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.bindEvents();
    }

    setupLazyLoading() {
        const video = document.querySelector('.demo-video[data-lazy="true"]');
        if (!video) return;

        // Create intersection observer for lazy loading
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoaded) {
                    this.loadVideo(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        observer.observe(video);
    }

    loadVideo(video) {
        this.video = video;
        this.isLoaded = true;

        // Load video sources
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach(source => {
            source.src = source.getAttribute('data-src');
            source.removeAttribute('data-src');
        });

        // Load the video
        video.load();

        // Setup custom controls
        this.setupCustomControls();

        // Add loading indicator
        this.showLoadingState();

        // Handle video events
        video.addEventListener('loadedmetadata', () => {
            this.hideLoadingState();
            this.updateDuration();
        });

        video.addEventListener('error', () => {
            this.showErrorState();
        });

        video.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        video.addEventListener('ended', () => {
            this.resetPlayButton();
        });

        console.log('Video lazy loaded and initialized');
    }

    setupCustomControls() {
        if (!this.video) return;

        this.playPauseBtn = document.querySelector('.play-pause-btn');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
        this.currentTimeDisplay = document.querySelector('.current-time');
        this.durationDisplay = document.querySelector('.duration');
        this.fullscreenBtn = document.querySelector('.fullscreen-btn');

        // Hide native controls
        this.video.controls = false;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.play-pause-btn')) {
                this.togglePlayPause();
            }
            
            if (e.target.closest('.fullscreen-btn')) {
                this.toggleFullscreen();
            }
            
            if (e.target.closest('.progress-bar')) {
                this.seekVideo(e);
            }
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.video || document.activeElement !== this.video) return;
            
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.video.currentTime = Math.max(0, this.video.currentTime - 10);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.video.currentTime = Math.min(this.video.duration, this.video.currentTime + 10);
                    break;
                case 'KeyF':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
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
        const container = this.video?.closest('.video-container');
        if (!container) return;

        const loadingElement = document.createElement('div');
        loadingElement.className = 'video-loading';
        loadingElement.innerHTML = `
            <div class="spinner"></div>
            <p>Loading video...</p>
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
        const container = this.video?.closest('.video-container');
        if (!container) return;

        this.hideLoadingState();

        const errorElement = document.createElement('div');
        errorElement.className = 'video-error';
        errorElement.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
            </svg>
            <h3>Video Unavailable</h3>
            <p>Sorry, the video could not be loaded. Please try refreshing the page.</p>
        `;
        container.appendChild(errorElement);
    }

    // Method to preload video for better performance
    preloadVideo() {
        if (this.video && !this.video.src) {
            this.loadVideo(this.video);
        }
    }

    // Method to get video statistics
    getVideoStats() {
        if (!this.video) return null;

        return {
            duration: this.video.duration,
            currentTime: this.video.currentTime,
            played: this.video.played.length > 0,
            paused: this.video.paused,
            ended: this.video.ended,
            volume: this.video.volume,
            muted: this.video.muted
        };
    }
}

// Initialize video player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.videoPlayer = new VideoPlayer();
});

// Export for use in other scripts
window.VideoPlayer = VideoPlayer;
