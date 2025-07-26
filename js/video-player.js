class YouTubePlayer {
    constructor() {
        this.youtubeContainer = null;
        this.placeholder = null;
        this.iframe = null;
        this.player = null;
        this.isLoaded = false;
        this.isLoading = false;
        this.isFetchingInfo = false;
        this.clickTimeout = null;
        this.isPlayerReady = false;
        this.currentVideoId = null;
        this.playerState = null;
        this.init();
    }
    init() {
        this.loadYouTubeAPI();
        this.setupLazyLoading();
        this.bindEvents();
    }
    loadYouTubeAPI() {
        if (window.YT && window.YT.Player) {
            console.log('YouTube API already loaded');
            return;
        }
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = 'https:
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            console.log('Loading YouTube IFrame API...');
        }
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube IFrame API ready');
            this.isPlayerReady = true;
        };
    }
    setupLazyLoading() {
        const youtubeContainer = document.querySelector('.youtube-embed-container[data-lazy="true"]');
        if (!youtubeContainer) return;
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
        const videoId = this.placeholder.getAttribute('data-video-id');
        if (!videoId || videoId === '') {
            console.error('No video ID found in data-video-id attribute');
            console.log('Please set data-video-id="YOUR_VIDEO_ID" in the HTML');
            return;
        }
        console.log('Found video ID:', videoId);
        this.setupVideoHandlers(videoId);
        this.fetchRealYouTubeData(videoId);
    }
    setupVideoHandlers(videoId) {
        console.log('Setting up video handlers for:', videoId);
        this.placeholder.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('=== PLACEHOLDER CLICKED ===');
            const currentVideoId = this.placeholder.getAttribute('data-video-id') || videoId;
            console.log('Using video ID:', currentVideoId);
            this.loadYouTubeVideo(currentVideoId);
        }, true); 
        const playButton = this.placeholder.querySelector('.youtube-play-button');
        if (playButton) {
            console.log('Play button found, setting up click handler');
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('=== PLAY BUTTON CLICKED ===');
                console.log('Video ID for loading:', videoId);
                const currentVideoId = this.placeholder.getAttribute('data-video-id') || videoId;
                console.log('Using video ID:', currentVideoId);
                this.loadYouTubeVideo(currentVideoId);
            }, true); 
        } else {
            console.warn('Play button not found in placeholder');
        }
        this.placeholder.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== DOUBLE CLICK - OPENING YOUTUBE DIRECTLY ===');
            const currentVideoId = this.placeholder.getAttribute('data-video-id') || videoId;
            this.openYouTubeDirectly(currentVideoId);
        });
        console.log('Click handlers set up for video:', videoId);
        console.log('Double-click will open YouTube directly as backup');
        console.log('Video handlers set up, fetching YouTube data...');
    }
    async fetchRealYouTubeData(videoId) {
        console.log('=== FETCHING REAL YOUTUBE DATA ===');
        console.log('Video ID:', videoId);
        try {
            const apiUrl = `https:
            console.log('API URL:', apiUrl);
            const response = await fetch(apiUrl, {
                signal: AbortSignal.timeout(5000)
            });
            if (!response.ok) {
                throw new Error(`API response not OK: ${response.status}`);
            }
            const data = await response.json();
            console.log('Got YouTube data:', data);
            this.updateVideoDisplay(data);
        } catch (error) {
            console.warn('Failed to fetch YouTube data:', error);
            console.log('Using YouTube thumbnail fallback');
            this.setYouTubeThumbnailFallback(videoId);
        }
    }
    updateVideoDisplay(youtubeData) {
        console.log('=== UPDATING VIDEO DISPLAY ===');
        const titleElement = this.placeholder?.querySelector('.youtube-title');
        if (titleElement && youtubeData.title) {
            titleElement.textContent = youtubeData.title;
            console.log('Updated title:', youtubeData.title);
        }
        const channelElement = this.placeholder?.querySelector('.youtube-channel');
        if (channelElement && youtubeData.author_name) {
            channelElement.textContent = `@${youtubeData.author_name}`;
            console.log('Updated channel:', youtubeData.author_name);
        }
        const thumbnailElement = this.placeholder?.querySelector('.youtube-thumbnail');
        if (thumbnailElement && youtubeData.thumbnail_url) {
            thumbnailElement.src = youtubeData.thumbnail_url;
            console.log('Updated thumbnail:', youtubeData.thumbnail_url);
            thumbnailElement.onerror = () => {
                console.warn('Thumbnail failed to load, using YouTube fallback');
                this.setYouTubeThumbnailFallback(this.placeholder.getAttribute('data-video-id'));
            };
        }
        console.log('Video display updated with real YouTube data');
    }
    setYouTubeThumbnailFallback(videoId) {
        const thumbnailElement = this.placeholder?.querySelector('.youtube-thumbnail');
        if (thumbnailElement && videoId) {
            const thumbnailUrl = `https:
            console.log('Setting fallback thumbnail:', thumbnailUrl);
            thumbnailElement.src = thumbnailUrl;
            thumbnailElement.onerror = () => {
                const fallbackUrl = `https:
                console.log('Maxres failed, trying hqdefault:', fallbackUrl);
                thumbnailElement.src = fallbackUrl;
                thumbnailElement.onerror = null; 
            };
        }
    }
    setupVideoHandlers(videoId) {
        console.log('Setting up video handlers for:', videoId);
        this.placeholder.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('=== PLACEHOLDER CLICKED ===');
            const currentVideoId = this.placeholder.getAttribute('data-video-id') || videoId;
            console.log('Using video ID:', currentVideoId);
            this.loadYouTubeVideo(currentVideoId);
        }, true); 
        const playButton = this.placeholder.querySelector('.youtube-play-button');
        if (playButton) {
            console.log('Play button found, setting up click handler');
            playButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('=== PLAY BUTTON CLICKED ===');
                console.log('Video ID for loading:', videoId);
                const currentVideoId = this.placeholder.getAttribute('data-video-id') || videoId;
                console.log('Using video ID:', currentVideoId);
                this.loadYouTubeVideo(currentVideoId);
            }, true); 
        } else {
            console.warn('Play button not found in placeholder');
        }
        this.placeholder.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== DOUBLE CLICK - OPENING YOUTUBE DIRECTLY ===');
            const currentVideoId = this.placeholder.getAttribute('data-video-id') || videoId;
            this.openYouTubeDirectly(currentVideoId);
        });
        console.log('Click handlers set up for video:', videoId);
        console.log('Double-click will open YouTube directly as backup');
        console.log('Video handlers set up, fetching YouTube data...');
    }
    loadYouTubeVideo(videoId) {
        console.log('=== LOADING YOUTUBE VIDEO ===');
        console.log('Video ID:', videoId);
        if (!this.placeholder) {
            console.error('Missing placeholder element');
            return;
        }
        if (!videoId || videoId === '') {
            console.error('No video ID provided or empty video ID');
            return;
        }
        if (this.isLoading) {
            console.log('Already loading, ignoring click');
            return;
        }
        this.isLoading = true;
        this.currentVideoId = videoId;
        console.log('Starting to load YouTube video:', videoId);
        this.placeholder.style.display = 'none';
        if (window.YT && window.YT.Player) {
            this.createYouTubePlayer(videoId);
        } else {
            this.createIframePlayer(videoId);
        }
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    }
    createYouTubePlayer(videoId) {
        console.log('Creating YouTube Player with API');
        if (!this.iframe) {
            console.error('No iframe element found');
            return;
        }
        const playerId = 'youtube-player-' + Date.now();
        this.iframe.id = playerId;
        this.iframe.style.display = 'block';
        this.player = new YT.Player(playerId, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
                autoplay: 1,
                controls: 1,
                fs: 1,
                rel: 0,
                modestbranding: 1,
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin
            },
            events: {
                onReady: (event) => {
                    console.log('YouTube player ready');
                    this.onPlayerReady(event);
                },
                onStateChange: (event) => {
                    console.log('YouTube player state changed:', event.data);
                    this.onPlayerStateChange(event);
                },
                onError: (event) => {
                    console.error('YouTube player error:', event.data);
                    this.onPlayerError(event);
                }
            }
        });
        this.addCustomControls();
    }
    createIframePlayer(videoId) {
        console.log('Creating iframe player (fallback)');
        if (!this.iframe) {
            const container = this.placeholder.parentNode;
            this.iframe = document.createElement('iframe');
            this.iframe.className = 'youtube-iframe';
            container.appendChild(this.iframe);
        }
        const embedUrl = `https:
        this.iframe.src = embedUrl;
        this.iframe.frameBorder = '0';
        this.iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        this.iframe.allowFullscreen = true;
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.borderRadius = '1.5rem';
        this.iframe.style.display = 'block';
        console.log('Iframe player created with enhanced controls');
    }
    onPlayerReady(event) {
        console.log('YouTube player is ready');
        this.isPlayerReady = true;
        if (this.currentVideoId) {
            event.target.loadVideoById(this.currentVideoId);
        }
    }
    onPlayerStateChange(event) {
        this.playerState = event.data;
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                console.log('Video is playing');
                this.updateCustomControls('playing');
                break;
            case YT.PlayerState.PAUSED:
                console.log('Video is paused');
                this.updateCustomControls('paused');
                break;
            case YT.PlayerState.ENDED:
                console.log('Video ended');
                this.updateCustomControls('ended');
                break;
            case YT.PlayerState.BUFFERING:
                console.log('Video is buffering');
                this.updateCustomControls('buffering');
                break;
        }
    }
    onPlayerError(event) {
        console.error('YouTube player error:', event.data);
        this.showErrorState();
    }
    addCustomControls() {
        const container = this.iframe.closest('.youtube-embed-container');
        if (!container || container.querySelector('.custom-youtube-controls')) {
            return;
        }
        const controlsHTML = `
            <div class="custom-youtube-controls">
                <button class="youtube-control-btn play-pause-btn" title="Play/Pause">
                    <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>
                <button class="youtube-control-btn skip-back-btn" title="Skip Back 10s">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,5V1L7,6L12,11V7A6,6 0 0,1 18,13A6,6 0 0,1 12,19A6,6 0 0,1 6,13H4A8,8 0 0,0 12,21A8,8 0 0,0 20,13A8,8 0 0,0 12,5M12.5,8V13.25L16.25,15.1L15.5,16.5L11,14V8H12.5Z"/>
                    </svg>
                </button>
                <button class="youtube-control-btn skip-forward-btn" title="Skip Forward 10s">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,5V1L17,6L12,11V7A6,6 0 0,0 6,13A6,6 0 0,0 12,19A6,6 0 0,0 18,13H20A8,8 0 0,1 12,21A8,8 0 0,1 4,13A8,8 0 0,1 12,5M12.5,8V13.25L16.25,15.1L15.5,16.5L11,14V8H12.5Z"/>
                    </svg>
                </button>
                <button class="youtube-control-btn fullscreen-btn" title="Fullscreen">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                    </svg>
                </button>
                <button class="youtube-control-btn back-btn" title="Back to Thumbnail">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.42-1.41L7.83 13H20v-2z"/>
                    </svg>
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', controlsHTML);
        this.bindCustomControls();
    }
    bindCustomControls() {
        const container = this.iframe.closest('.youtube-embed-container');
        if (!container) return;
        const playPauseBtn = container.querySelector('.play-pause-btn');
        const skipBackBtn = container.querySelector('.skip-back-btn');
        const skipForwardBtn = container.querySelector('.skip-forward-btn');
        const fullscreenBtn = container.querySelector('.fullscreen-btn');
        const backBtn = container.querySelector('.back-btn');
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        if (skipBackBtn) {
            skipBackBtn.addEventListener('click', () => this.skipBackward());
        }
        if (skipForwardBtn) {
            skipForwardBtn.addEventListener('click', () => this.skipForward());
        }
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showYouTubeThumbnail());
        }
    }
    togglePlayPause() {
        if (!this.player || !this.isPlayerReady) {
            console.warn('Player not ready for play/pause');
            return;
        }
        try {
            if (this.playerState === YT.PlayerState.PLAYING) {
                this.player.pauseVideo();
                console.log('Video paused');
            } else {
                this.player.playVideo();
                console.log('Video playing');
            }
        } catch (error) {
            console.error('Error toggling play/pause:', error);
        }
    }
    skipBackward() {
        if (!this.player || !this.isPlayerReady) {
            console.warn('Player not ready for skip');
            return;
        }
        try {
            const currentTime = this.player.getCurrentTime();
            const newTime = Math.max(0, currentTime - 10);
            this.player.seekTo(newTime, true);
            console.log('Skipped backward 10 seconds');
        } catch (error) {
            console.error('Error skipping backward:', error);
        }
    }
    skipForward() {
        if (!this.player || !this.isPlayerReady) {
            console.warn('Player not ready for skip');
            return;
        }
        try {
            const currentTime = this.player.getCurrentTime();
            const duration = this.player.getDuration();
            const newTime = Math.min(duration, currentTime + 10);
            this.player.seekTo(newTime, true);
            console.log('Skipped forward 10 seconds');
        } catch (error) {
            console.error('Error skipping forward:', error);
        }
    }
    toggleFullscreen() {
        const container = this.iframe.closest('.youtube-embed-container');
        if (!container) return;
        try {
            if (document.fullscreenElement) {
                document.exitFullscreen();
                console.log('Exited fullscreen');
            } else {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
                console.log('Entered fullscreen');
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    }
    updateCustomControls(state) {
        const container = this.iframe?.closest('.youtube-embed-container');
        if (!container) return;
        const playIcon = container.querySelector('.play-icon');
        const pauseIcon = container.querySelector('.pause-icon');
        if (playIcon && pauseIcon) {
            if (state === 'playing') {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }
    showYouTubeThumbnail() {
        if (this.player) {
            try {
                this.player.destroy();
            } catch (error) {
                console.warn('Error destroying player:', error);
            }
            this.player = null;
        }
        if (this.iframe) {
            this.iframe.style.display = 'none';
            this.iframe.src = '';
        }
        if (this.placeholder) {
            this.placeholder.style.display = 'block';
        }
        const container = this.iframe?.closest('.youtube-embed-container');
        const customControls = container?.querySelector('.custom-youtube-controls');
        if (customControls) {
            customControls.remove();
        }
        console.log('Returned to thumbnail view');
    }
    openYouTubeDirectly(videoId) {
        console.log('Opening YouTube video directly:', videoId);
        const youtubeUrl = `https:
        window.open(youtubeUrl, '_blank');
    }
    async fetchYouTubeVideoInfo(videoId) {
        return this.fetchRealYouTubeData(videoId);
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
        const url = `https:
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
        const url = `https:
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
        const url = `https:
        throw new Error('YouTube API requires key');
    }
    async extractFromYouTubePage(videoId) {
        const url = `https:
        try {
            const proxyUrl = `https:
            const response = await fetch(proxyUrl, {
                signal: AbortSignal.timeout(5000)
            });
            if (!response.ok) throw new Error(`Proxy failed: ${response.status}`);
            const data = await response.json();
            const html = data.contents;
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
        const titleElement = this.placeholder.querySelector('.youtube-title');
        if (titleElement && info.title) {
            titleElement.textContent = info.title;
        }
        const channelElement = this.placeholder.querySelector('.youtube-channel');
        if (channelElement && info.author) {
            channelElement.textContent = `@${info.author.replace('@', '')}`;
        }
        const thumbnailElement = this.placeholder.querySelector('.youtube-thumbnail');
        if (thumbnailElement && info.thumbnail) {
            thumbnailElement.onerror = null;
            thumbnailElement.onerror = () => {
                console.warn('Custom thumbnail failed, keeping default');
                thumbnailElement.onerror = null; 
            };
            thumbnailElement.src = info.thumbnail;
        }
        console.log('Video info updated successfully');
    }
    updateVideoThumbnail(videoId) {
        const thumbnailElement = this.placeholder?.querySelector('.youtube-thumbnail');
        if (thumbnailElement && videoId) {
            const thumbnailUrls = [
                `https:
                `https:
                `https:
                `https:
            ];
            this.tryThumbnails(thumbnailElement, thumbnailUrls, 0);
        }
    }
    tryThumbnails(imgElement, urls, index) {
        if (index >= urls.length) {
            console.warn('All YouTube thumbnails failed, using default');
            return;
        }
        const img = new Image();
        img.onload = () => {
            imgElement.src = urls[index];
            console.log(`Loaded thumbnail: ${urls[index]}`);
        };
        img.onerror = () => {
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
        if (this.placeholder) {
            this.placeholder.classList.remove('loading');
        }
        console.log('Video info loading state cleared');
    }
    forceHideLoading() {
        console.log('Force hiding all loading states');
        const loadingOverlay = this.placeholder?.querySelector('.youtube-loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            loadingOverlay.classList.add('hidden');
        }
        const videoId = this.placeholder?.getAttribute('data-video-id');
        if (videoId) {
            this.setDefaultVideoInfo(videoId);
            this.updateVideoThumbnail(videoId);
        }
        this.hideVideoInfoLoading();
        this.isFetchingInfo = false;
        console.log('Force hide completed');
    }
    setDefaultVideoInfo(videoId) {
        this.updateVideoInfo({
            title: 'cbot Demo - Advanced Minecraft Client',
            author: 'snopphin',
            thumbnail: null 
        });
    }
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.video-download-btn')) {
                console.log('Download button clicked');
                return true; 
            }
            if (e.target.closest('.youtube-config-btn')) {
                e.preventDefault();
                this.showYouTubeConfig();
                return;
            }
        }, true); 
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('mozfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('MSFullscreenChange', () => {
            this.handleFullscreenChange();
        });
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.youtube-iframe')) {
                document.body.style.cursor = 'default';
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.youtube-iframe')) {
                document.body.style.cursor = '';
            }
        });
    }
    handleFullscreenChange() {
        const container = this.iframe?.closest('.youtube-embed-container');
        if (!container) return;
        const isFullscreen = !!(document.fullscreenElement ||
                                document.webkitFullscreenElement ||
                                document.mozFullScreenElement ||
                                document.msFullscreenElement);
        if (isFullscreen) {
            container.classList.add('fullscreen-active');
        } else {
            container.classList.remove('fullscreen-active');
        }
    }
    handleResize() {
        if (this.iframe && this.iframe.style.display === 'block') {
            const container = this.iframe.closest('.youtube-embed-container');
            if (container) {
                const width = container.offsetWidth;
                const height = (width * 9) / 16; 
                this.iframe.style.height = `${height}px`;
            }
        }
    }
    showYouTubeConfig() {
        console.log('YouTube configuration requested');
    }
    closeModals() {
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
            <a href="https:
                Visit YouTube Channel
            </a>
        `;
        container.appendChild(errorElement);
    }
    changeYouTubeVideo(videoId) {
        if (!videoId) return;
        const placeholder = this.youtubeContainer?.querySelector('.youtube-placeholder');
        if (placeholder) {
            placeholder.setAttribute('data-video-id', videoId);
            if (this.iframe) {
                this.iframe.style.display = 'none';
                this.iframe.removeAttribute('src');
            }
            if (this.placeholder) {
                this.placeholder.style.display = 'block';
            }
            this.fetchRealYouTubeData(videoId);
            console.log('YouTube video changed to:', videoId);
        }
    }
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
    static extractVideoId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ 
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }
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
document.addEventListener('DOMContentLoaded', () => {
    window.youtubePlayer = new YouTubePlayer();
});
window.YouTubePlayer = YouTubePlayer;
window.manualLoadVideo = function(videoId) {
    console.log('=== MANUAL VIDEO LOAD ===');
    if (!videoId) {
        videoId = 'OT6sQPEFGC8'; 
    }
    console.log('Loading video ID:', videoId);
    if (window.youtubePlayer) {
        window.youtubePlayer.loadYouTubeVideo(videoId);
    } else {
        console.error('YouTube player not initialized');
    }
};
window.openYouTubeDirect = function(videoId) {
    console.log('=== OPENING YOUTUBE DIRECTLY ===');
    if (!videoId) {
        videoId = 'OT6sQPEFGC8'; 
    }
    const youtubeUrl = `https:
    console.log('Opening URL:', youtubeUrl);
    window.open(youtubeUrl, '_blank');
};
window.forceIframeLoad = function(videoId) {
    console.log('=== FORCE IFRAME LOAD ===');
    if (!videoId) {
        videoId = 'OT6sQPEFGC8';
    }
    const iframe = document.querySelector('.youtube-iframe');
    const placeholder = document.querySelector('.youtube-placeholder');
    if (iframe && placeholder) {
        const embedUrl = `https:
        iframe.src = embedUrl;
        iframe.style.display = 'block';
        placeholder.style.display = 'none';
        console.log('Iframe forced to load:', embedUrl);
    } else {
        console.error('Iframe or placeholder not found');
    }
};
window.refreshVideoData = function(videoId) {
    console.log('=== REFRESHING VIDEO DATA ===');
    if (!videoId) {
        const placeholder = document.querySelector('.youtube-placeholder');
        videoId = placeholder?.getAttribute('data-video-id') || 'OT6sQPEFGC8';
    }
    console.log('Refreshing data for video ID:', videoId);
    if (window.youtubePlayer && window.youtubePlayer.fetchRealYouTubeData) {
        window.youtubePlayer.fetchRealYouTubeData(videoId);
    } else {
        console.error('YouTube player not available');
    }
};
window.checkVideoState = function() {
    console.log('=== VIDEO STATE CHECK ===');
    console.log('YouTube Player:', window.youtubePlayer);
    console.log('YouTube Config:', window.youtubeConfig);
    const placeholder = document.querySelector('.youtube-placeholder');
    const iframe = document.querySelector('.youtube-iframe');
    console.log('Placeholder:', placeholder);
    console.log('Iframe:', iframe);
    console.log('Video ID on placeholder:', placeholder?.getAttribute('data-video-id'));
    console.log('Iframe src:', iframe?.src);
    if (window.youtubeConfig) {
        const videoId = window.youtubeConfig.extractVideoId(window.youtubeConfig.config.videoUrl);
        console.log('Config video ID:', videoId);
    }
};
