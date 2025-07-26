class YouTubePlayer {
    constructor() {
        this.youtubeContainer = null;
        this.placeholder = null;
        this.iframe = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.isFetchingInfo = false;
        this.clickTimeout = null;
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
        // Prevent multiple setups
        if (this.isLoaded) {
            console.warn('YouTube embed already loaded');
            return;
        }

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

        // Set default content immediately, then try to fetch real data
        this.setDefaultVideoInfo(videoId);
        this.updateVideoThumbnail(videoId);

        // Try to fetch real video information (optional enhancement)
        if (!this.isFetchingInfo) {
            this.fetchYouTubeVideoInfo(videoId);
        }

        // Setup click handler for placeholder with debouncing
        this.placeholder.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.debouncedLoadVideo(videoId);
        });

        // Also handle play button clicks specifically
        const playButton = this.placeholder.querySelector('.youtube-play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.debouncedLoadVideo(videoId);
            });
        }
    }

    debouncedLoadVideo(videoId) {
        // Prevent rapid clicking
        if (this.isLoading) return;

        // Clear any existing timeout
        if (this.clickTimeout) {
            clearTimeout(this.clickTimeout);
        }

        // Add small delay to prevent accidental double clicks
        this.clickTimeout = setTimeout(() => {
            this.loadYouTubeVideo(videoId);
        }, 100);
    }

        console.log('YouTube embed initialized with video ID:', videoId);
    }

    loadYouTubeVideo(videoId) {
        if (!this.iframe || !this.placeholder) return;

        // Prevent multiple clicks
        if (this.isLoading) return;
        this.isLoading = true;

        // Show loading state immediately
        this.showLoadingState();

        // Optimized embed URL for faster loading
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.origin}`;

        // Preload iframe for faster response
        this.iframe.setAttribute('src', embedUrl);

        // Add load event listener for better timing
        this.iframe.onload = () => {
            this.hideLoadingState();
            this.isLoading = false;
            console.log('YouTube video loaded successfully:', videoId);
        };

        // Fallback timeout in case onload doesn't fire
        setTimeout(() => {
            this.hideLoadingState();
            this.isLoading = false;
        }, 3000);

        // Hide placeholder and show iframe with smooth transition
        this.placeholder.style.opacity = '0';
        setTimeout(() => {
            this.placeholder.style.display = 'none';
            this.iframe.style.display = 'block';
            this.iframe.style.opacity = '0';

            // Fade in iframe
            setTimeout(() => {
                this.iframe.style.opacity = '1';
            }, 50);
        }, 300);

        console.log('YouTube video loading:', videoId);
    }

    async fetchYouTubeVideoInfo(videoId) {
        // Prevent infinite fetching
        if (this.isFetchingInfo) {
            console.warn('Already fetching video info, skipping...');
            return;
        }

        this.isFetchingInfo = true;
        console.log('Fetching comprehensive YouTube data for:', videoId);

        try {
            // Try multiple methods to get complete video information
            const videoData = await this.getCompleteVideoData(videoId);

            if (videoData) {
                console.log('Successfully fetched complete YouTube data:', videoData);
                this.updateVideoInfo(videoData);
                this.isFetchingInfo = false;
                return;
            }
        } catch (error) {
            console.warn('Failed to fetch video data:', error.message);
        }

        // Fallback: Use YouTube thumbnail URLs and basic info
        console.log('Using YouTube thumbnail fallback');
        this.updateVideoThumbnail(videoId);
        this.isFetchingInfo = false;
    }

    async getCompleteVideoData(videoId) {
        const methods = [
            () => this.fetchFromOEmbed(videoId),
            () => this.fetchFromNoEmbed(videoId),
            () => this.fetchFromYouTubeAPI(videoId),
            () => this.extractFromYouTubePage(videoId)
        ];

        for (const method of methods) {
            try {
                const data = await method();
                if (data && data.title) {
                    return data;
                }
            } catch (error) {
                console.warn('Method failed, trying next:', error.message);
                continue;
            }
        }

        return null;
    }

    async fetchFromOEmbed(videoId) {
        const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

        const response = await fetch(url, {
            signal: AbortSignal.timeout(3000),
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`oEmbed failed: ${response.status}`);

        const data = await response.json();
        return {
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url,
            source: 'oembed'
        };
    }

    async fetchFromNoEmbed(videoId) {
        const url = `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`;

        const response = await fetch(url, {
            signal: AbortSignal.timeout(3000),
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`NoEmbed failed: ${response.status}`);

        const data = await response.json();
        return {
            title: data.title,
            author: data.author_name,
            thumbnail: data.thumbnail_url,
            source: 'noembed'
        };
    }

    async fetchFromYouTubeAPI(videoId) {
        // This would require an API key, but we can try the public endpoint
        const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=YOUR_API_KEY`;

        // Skip this method for now since it requires API key
        throw new Error('YouTube API requires key');
    }

    async extractFromYouTubePage(videoId) {
        // Try to extract data from YouTube page metadata
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        try {
            // This is a fallback method - in practice, CORS will block this
            // But we can try other proxy services
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

            const response = await fetch(proxyUrl, {
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) throw new Error(`Proxy failed: ${response.status}`);

            const data = await response.json();
            const html = data.contents;

            // Extract title from meta tags
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
            const authorMatch = html.match(/<meta name="author" content="([^"]+)"/);
            const thumbnailMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

            if (titleMatch) {
                return {
                    title: titleMatch[1],
                    author: authorMatch ? authorMatch[1] : 'Unknown',
                    thumbnail: thumbnailMatch ? thumbnailMatch[1] : null,
                    source: 'page-extract'
                };
            }
        } catch (error) {
            throw new Error(`Page extraction failed: ${error.message}`);
        }

        throw new Error('No data found in page');
    }



    updateVideoInfo(info) {
        if (!this.placeholder) return;

        console.log('Updating video info:', info);

        // Update title
        const titleElement = this.placeholder.querySelector('.youtube-title');
        if (titleElement && info.title) {
            titleElement.textContent = info.title;
        }

        // Update channel/author
        const channelElement = this.placeholder.querySelector('.youtube-channel');
        if (channelElement && info.author) {
            channelElement.textContent = `@${info.author.replace('@', '')}`;
        }

        // Update thumbnail (with error prevention)
        const thumbnailElement = this.placeholder.querySelector('.youtube-thumbnail');
        if (thumbnailElement && info.thumbnail) {
            // Remove any existing error handlers to prevent loops
            thumbnailElement.onerror = null;

            // Set new error handler that doesn't call updateVideoThumbnail
            thumbnailElement.onerror = () => {
                console.warn('Custom thumbnail failed, keeping default');
                thumbnailElement.onerror = null; // Remove handler to prevent loops
            };

            thumbnailElement.src = info.thumbnail;
        }

        console.log('Video info updated successfully');
    }

    updateVideoThumbnail(videoId) {
        const thumbnailElement = this.placeholder?.querySelector('.youtube-thumbnail');
        if (thumbnailElement && videoId) {
            // Use YouTube's thumbnail URLs
            const thumbnailUrls = [
                `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
                `https://img.youtube.com/vi/${videoId}/default.jpg`
            ];

            // Try thumbnails in order of quality
            this.tryThumbnails(thumbnailElement, thumbnailUrls, 0);
        }
    }

    tryThumbnails(imgElement, urls, index) {
        if (index >= urls.length) {
            // All thumbnails failed, keep the default SVG
            console.warn('All YouTube thumbnails failed, using default');
            return;
        }

        const img = new Image();
        img.onload = () => {
            imgElement.src = urls[index];
            console.log(`Loaded thumbnail: ${urls[index]}`);
        };
        img.onerror = () => {
            // Try next thumbnail
            this.tryThumbnails(imgElement, urls, index + 1);
        };
        img.src = urls[index];
    }

    showVideoInfoLoading() {
        const loadingOverlay = this.placeholder?.querySelector('.youtube-loading-overlay');
        const titleElement = this.placeholder?.querySelector('.youtube-title');
        const channelElement = this.placeholder?.querySelector('.youtube-channel');
        const thumbnailElement = this.placeholder?.querySelector('.youtube-thumbnail');

        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

        if (titleElement) {
            titleElement.classList.add('loading');
        }

        if (channelElement) {
            channelElement.classList.add('loading');
        }

        if (thumbnailElement) {
            thumbnailElement.classList.add('loading');
        }

        // Add loading class to placeholder
        if (this.placeholder) {
            this.placeholder.classList.add('loading');
        }
    }

    hideVideoInfoLoading() {
        console.log('Hiding video info loading...');

        const loadingOverlay = this.placeholder?.querySelector('.youtube-loading-overlay');
        const titleElement = this.placeholder?.querySelector('.youtube-title');
        const channelElement = this.placeholder?.querySelector('.youtube-channel');
        const thumbnailElement = this.placeholder?.querySelector('.youtube-thumbnail');

        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            // Force hide with style as backup
            loadingOverlay.style.display = 'none';
            console.log('Loading overlay hidden');
        }

        if (titleElement) {
            titleElement.classList.remove('loading');
        }

        if (channelElement) {
            channelElement.classList.remove('loading');
        }

        if (thumbnailElement) {
            thumbnailElement.classList.remove('loading');
        }

        // Remove loading class from placeholder
        if (this.placeholder) {
            this.placeholder.classList.remove('loading');
        }

        console.log('Video info loading state cleared');
    }

    forceHideLoading() {
        console.log('Force hiding all loading states');

        // Force hide loading overlay
        const loadingOverlay = this.placeholder?.querySelector('.youtube-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.add('hidden');
        }

        // Set default content immediately
        const videoId = this.placeholder?.getAttribute('data-video-id');
        if (videoId) {
            this.setDefaultVideoInfo(videoId);
            this.updateVideoThumbnail(videoId);
        }

        // Clear all states
        this.hideVideoInfoLoading();
        this.isFetchingInfo = false;

        console.log('Force hide completed');
    }

    setDefaultVideoInfo(videoId) {
        // Set default info if API calls fail
        this.updateVideoInfo({
            title: 'cbot Demo - Advanced Minecraft Client',
            author: 'snopphin',
            thumbnail: null // Will use YouTube thumbnail
        });
    }

    bindEvents() {
        // Handle download button clicks (prevent interference with video)
        document.addEventListener('click', (e) => {
            // Download button handling
            if (e.target.closest('.video-download-btn')) {
                // Let the download button work normally
                return;
            }

            // YouTube configuration
            if (e.target.closest('.youtube-config-btn')) {
                e.preventDefault();
                this.showYouTubeConfig();
            }

            // Prevent any other clicks from interfering with video
            if (e.target.closest('.youtube-embed-container') && !e.target.closest('.youtube-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
            }
        });

        // Handle escape key to close any modals
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                this.closeModals();
            }
        });

        // Handle window resize for responsive video
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        // Adjust video container on resize if needed
        if (this.iframe && this.iframe.style.display === 'block') {
            // Force iframe to maintain aspect ratio
            const container = this.iframe.closest('.youtube-embed-container');
            if (container) {
                const width = container.offsetWidth;
                const height = (width * 9) / 16; // 16:9 aspect ratio
                this.iframe.style.height = `${height}px`;
            }
        }
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

    // Utility function to extract video ID from YouTube URL
    static extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return null;
    }

    // Method to update video from URL or ID
    setVideoFromUrl(urlOrId) {
        const videoId = YouTubePlayer.extractVideoId(urlOrId) || urlOrId;

        if (videoId && this.placeholder) {
            this.placeholder.setAttribute('data-video-id', videoId);
            this.fetchYouTubeVideoInfo(videoId);
            console.log('Video updated to:', videoId);
        } else {
            console.error('Invalid YouTube URL or video ID:', urlOrId);
        }
    }

    // Reset all states (useful for debugging)
    reset() {
        this.isLoading = false;
        this.isFetchingInfo = false;
        this.isLoaded = false;

        if (this.clickTimeout) {
            clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
        }

        this.hideVideoInfoLoading();
        console.log('YouTube player reset');
    }
}

// Initialize YouTube player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.youtubePlayer = new YouTubePlayer();
});

// Export for use in other scripts
window.YouTubePlayer = YouTubePlayer;
