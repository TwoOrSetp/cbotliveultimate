// YouTube Video Configuration System
// Just add your YouTube URL here and everything else is automatic!

class YouTubeConfig {
    constructor() {
        this.config = {
            // MAIN VIDEO CONFIGURATION
            // Just paste your YouTube URL here - everything else is automatic!
            videoUrl: 'https://youtube.com/watch?v=V63UTu4bZspr3frz',
            
            // OPTIONAL: Override automatic detection
            fallbackTitle: 'cbot Demo - Advanced Minecraft Client',
            fallbackChannel: 'snopphin',
            
            // ADVANCED OPTIONS
            autoplay: true,
            showRelated: false,
            modestBranding: true,
            enableJSAPI: true
        };
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.applyConfig());
        } else {
            this.applyConfig();
        }
    }

    applyConfig() {
        const videoId = this.extractVideoId(this.config.videoUrl);
        
        if (!videoId) {
            console.error('Invalid YouTube URL:', this.config.videoUrl);
            return;
        }

        console.log('Applying YouTube config for video:', videoId);
        
        // Update the HTML with the video ID
        this.updateVideoElement(videoId);
        
        // Set fallback data
        this.setFallbackData();
    }

    extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }

        return null;
    }

    updateVideoElement(videoId) {
        const placeholder = document.querySelector('.youtube-placeholder');
        
        if (placeholder) {
            // Update video ID
            placeholder.setAttribute('data-video-id', videoId);
            
            // Update embed URL
            const iframe = document.querySelector('.youtube-iframe');
            if (iframe) {
                const embedUrl = this.buildEmbedUrl(videoId);
                iframe.setAttribute('data-src', embedUrl);
            }
            
            console.log('Updated video element with ID:', videoId);
        }
    }

    buildEmbedUrl(videoId) {
        const params = new URLSearchParams({
            autoplay: this.config.autoplay ? '1' : '0',
            rel: this.config.showRelated ? '1' : '0',
            modestbranding: this.config.modestBranding ? '1' : '0',
            playsinline: '1',
            enablejsapi: this.config.enableJSAPI ? '1' : '0',
            origin: window.location.origin
        });

        return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    }

    setFallbackData() {
        // Set fallback title and channel
        const titleElement = document.querySelector('.youtube-title');
        const channelElement = document.querySelector('.youtube-channel');
        
        if (titleElement) {
            titleElement.textContent = this.config.fallbackTitle;
        }
        
        if (channelElement) {
            channelElement.textContent = `@${this.config.fallbackChannel}`;
        }
    }

    // Method to update video URL programmatically
    updateVideo(newUrl) {
        this.config.videoUrl = newUrl;
        this.applyConfig();
        
        // Trigger re-fetch of video data
        if (window.youtubePlayer) {
            const videoId = this.extractVideoId(newUrl);
            if (videoId) {
                window.youtubePlayer.reset();
                window.youtubePlayer.setVideoFromUrl(newUrl);
            }
        }
    }

    // Get current configuration
    getConfig() {
        return { ...this.config };
    }

    // Update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.applyConfig();
    }

    // Validate YouTube URL
    isValidYouTubeUrl(url) {
        return this.extractVideoId(url) !== null;
    }

    // Get video info from URL
    getVideoInfo() {
        const videoId = this.extractVideoId(this.config.videoUrl);
        return {
            videoId,
            url: this.config.videoUrl,
            embedUrl: videoId ? this.buildEmbedUrl(videoId) : null,
            isValid: videoId !== null
        };
    }

    // Create shareable config
    exportConfig() {
        return {
            videoUrl: this.config.videoUrl,
            fallbackTitle: this.config.fallbackTitle,
            fallbackChannel: this.config.fallbackChannel,
            timestamp: new Date().toISOString()
        };
    }

    // Import config from object
    importConfig(configData) {
        if (configData.videoUrl && this.isValidYouTubeUrl(configData.videoUrl)) {
            this.updateConfig(configData);
            console.log('Imported YouTube config:', configData);
        } else {
            console.error('Invalid config data:', configData);
        }
    }
}

// Auto-initialize when script loads
window.youtubeConfig = new YouTubeConfig();

// Global helper functions
window.updateYouTubeVideo = (url) => {
    window.youtubeConfig.updateVideo(url);
};

window.getYouTubeConfig = () => {
    return window.youtubeConfig.getConfig();
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YouTubeConfig;
}
