
// Just add your YouTube URL here and everything else is automatic!

class YouTubeConfig {
    constructor() {
        this.config = {
            // MAIN VIDEO CONFIGURATION
            // Just paste your YouTube URL here - everything else is automatic!
            videoUrl: 'https://www.youtube.com/watch?v=OT6sQPEFGC8',
            
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

        // Set fallback data first
        this.setFallbackData();

        // Then fetch real data from YouTube
        this.fetchRealVideoData(videoId);
    }

    extractVideoId(url) {
        console.log('Extracting video ID from URL:', url);

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                console.log('Extracted video ID:', match[1]);
                return match[1];
            }
        }

        console.error('Could not extract video ID from URL:', url);
        return null;
    }

    updateVideoElement(videoId) {
        const placeholder = document.querySelector('.youtube-placeholder');

        if (placeholder) {
            // Update video ID
            placeholder.setAttribute('data-video-id', videoId);
            console.log('Set video ID on placeholder:', videoId);

            // Update embed URL
            const iframe = document.querySelector('.youtube-iframe');
            if (iframe) {
                const embedUrl = this.buildEmbedUrl(videoId);
                iframe.setAttribute('data-src', embedUrl);
                console.log('Set embed URL:', embedUrl);
            }

            // Trigger video player setup if it exists
            if (window.youtubePlayer && window.youtubePlayer.setupVideoHandlers) {
                console.log('Triggering video player setup');
                window.youtubePlayer.setupVideoHandlers(videoId);
            }

            console.log('Updated video element with ID:', videoId);
        } else {
            console.error('YouTube placeholder not found');
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

    async fetchRealVideoData(videoId) {
        console.log('Fetching real YouTube data for:', videoId);

        try {
            // Try YouTube oEmbed API
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Got real YouTube data:', data);

                // Update title
                const titleElement = document.querySelector('.youtube-title');
                if (titleElement && data.title) {
                    titleElement.textContent = data.title;
                }

                // Update channel
                const channelElement = document.querySelector('.youtube-channel');
                if (channelElement && data.author_name) {
                    channelElement.textContent = `@${data.author_name}`;
                }

                // Update thumbnail
                const thumbnailElement = document.querySelector('.youtube-thumbnail');
                if (thumbnailElement && data.thumbnail_url) {
                    thumbnailElement.src = data.thumbnail_url;
                }

                console.log('Updated video info with real data');
            } else {
                console.warn('YouTube API failed, using fallback data');
                this.setYouTubeThumbnail(videoId);
            }
        } catch (error) {
            console.warn('Failed to fetch YouTube data:', error);
            this.setYouTubeThumbnail(videoId);
        }
    }

    setYouTubeThumbnail(videoId) {
        const thumbnailElement = document.querySelector('.youtube-thumbnail');
        if (thumbnailElement) {
            // Use YouTube's direct thumbnail URL
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            thumbnailElement.src = thumbnailUrl;

            // Fallback to lower quality if maxres fails
            thumbnailElement.onerror = () => {
                thumbnailElement.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                thumbnailElement.onerror = null;
            };
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

// Debug function to test video ID extraction
window.testVideoId = function() {
    const config = window.youtubeConfig;
    const videoId = config.extractVideoId(config.config.videoUrl);
    console.log('=== VIDEO ID TEST ===');
    console.log('Config URL:', config.config.videoUrl);
    console.log('Extracted ID:', videoId);
    console.log('Placeholder element:', document.querySelector('.youtube-placeholder'));
    console.log('Current data-video-id:', document.querySelector('.youtube-placeholder')?.getAttribute('data-video-id'));
    return videoId;
};

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
