class AssetLoader {
    constructor() {
        this.assets = new Map();
        this.loadedCount = 0;
        this.totalCount = 0;
        this.onProgress = null;
        this.onComplete = null;
        this.criticalAssets = [];
        this.isLoading = false;
    }

    addAsset(url, type, critical = true) {
        if (!this.assets.has(url)) {
            this.assets.set(url, {
                url,
                type,
                critical,
                loaded: false,
                error: false
            });
            if (critical) {
                this.criticalAssets.push(url);
            }
        }
    }

    discoverAssets() {
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(link => {
            if (link.href && !link.href.includes('data:')) {
                this.addAsset(link.href, 'css', true);
            }
        });

        const preloadLinks = document.querySelectorAll('link[rel="preload"]');
        preloadLinks.forEach(link => {
            if (link.href && !link.href.includes('data:')) {
                const asType = link.getAttribute('as') || 'resource';
                this.addAsset(link.href, asType === 'style' ? 'css' : asType, true);
            }
        });

        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src && !script.src.includes('data:')) {
                this.addAsset(script.src, 'js', true);
            }
        });

        const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
        fontLinks.forEach(link => {
            this.addAsset(link.href, 'font', true);
        });

        const images = document.querySelectorAll('img[src]');
        images.forEach(img => {
            if (img.src && !img.src.includes('data:')) {
                this.addAsset(img.src, 'image', false);
            }
        });

        const backgroundImages = this.extractBackgroundImages();
        backgroundImages.forEach(url => {
            this.addAsset(url, 'image', false);
        });

        this.addDynamicImages();

        this.addAsset(window.location.href, 'document', true);

        this.totalCount = this.criticalAssets.length;
    }

    addDynamicImages() {
        // Add known icons
        const gdIcons = [
            './assets/icons/geodash-icon.svg'
        ];

        gdIcons.forEach(iconPath => {
            this.addAsset(iconPath, 'image', true);
        });

        // Images will be discovered dynamically by ImageManager
        // We'll add a placeholder for the assets directory to ensure it's tracked
        this.addAsset('./assets/images/', 'directory', false);

        console.log('Dynamic image discovery will be handled by ImageManager');
    }

    extractBackgroundImages() {
        const elements = document.querySelectorAll('*');
        const backgroundImages = [];
        
        elements.forEach(element => {
            const style = window.getComputedStyle(element);
            const backgroundImage = style.backgroundImage;
            
            if (backgroundImage && backgroundImage !== 'none') {
                const matches = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/g);
                if (matches) {
                    matches.forEach(match => {
                        const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)$/, '');
                        if (url && !url.startsWith('data:')) {
                            backgroundImages.push(url);
                        }
                    });
                }
            }
        });
        
        return backgroundImages;
    }

    loadAsset(url, type) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout loading ${url}`));
            }, 10000);

            let element;

            switch (type) {
                case 'css':
                case 'style':
                    if (document.querySelector(`link[href="${url}"]`)) {
                        clearTimeout(timeout);
                        resolve();
                        return;
                    }
                    element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.href = url;
                    break;

                case 'js':
                case 'script':
                    if (document.querySelector(`script[src="${url}"]`)) {
                        clearTimeout(timeout);
                        resolve();
                        return;
                    }
                    element = document.createElement('script');
                    element.src = url;
                    element.async = false;
                    break;

                case 'image':
                    element = new Image();
                    element.crossOrigin = 'anonymous';
                    element.src = url;
                    break;

                case 'font':
                    if (document.querySelector(`link[href="${url}"]`)) {
                        clearTimeout(timeout);
                        resolve();
                        return;
                    }
                    element = document.createElement('link');
                    element.rel = 'stylesheet';
                    element.href = url;
                    break;

                case 'document':
                    clearTimeout(timeout);
                    resolve();
                    return;

                default:
                    clearTimeout(timeout);
                    resolve();
                    return;
            }

            const onLoad = () => {
                clearTimeout(timeout);
                element.removeEventListener('load', onLoad);
                element.removeEventListener('error', onError);
                resolve();
            };

            const onError = (error) => {
                clearTimeout(timeout);
                element.removeEventListener('load', onLoad);
                element.removeEventListener('error', onError);
                resolve();
            };

            element.addEventListener('load', onLoad);
            element.addEventListener('error', onError);

            if (type === 'css' || type === 'style' || type === 'font') {
                document.head.appendChild(element);
            } else if (type === 'js' || type === 'script') {
                document.head.appendChild(element);
            }
        });
    }

    async loadCriticalAssets() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.loadedCount = 0;
        
        const loadPromises = this.criticalAssets.map(async (url) => {
            const asset = this.assets.get(url);
            if (!asset || asset.loaded) return;
            
            try {
                await this.loadAsset(url, asset.type);
                asset.loaded = true;
                this.loadedCount++;
                this.updateProgress();
            } catch (error) {
                asset.error = true;
                this.loadedCount++;
                this.updateProgress();
            }
        });
        
        await Promise.allSettled(loadPromises);
        
        await this.waitForFonts();
        await this.waitForDOMReady();
        
        this.isLoading = false;
        
        if (this.onComplete) {
            this.onComplete();
        }
    }

    waitForFonts() {
        return new Promise((resolve) => {
            if (!document.fonts) {
                resolve();
                return;
            }
            
            document.fonts.ready.then(() => {
                setTimeout(resolve, 100);
            }).catch(() => {
                resolve();
            });
        });
    }

    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve, { once: true });
            }
        });
    }

    updateProgress() {
        const progress = this.totalCount > 0 ? (this.loadedCount / this.totalCount) * 100 : 100;
        
        if (this.onProgress) {
            this.onProgress(progress, this.loadedCount, this.totalCount);
        }
    }

    getProgress() {
        return this.totalCount > 0 ? (this.loadedCount / this.totalCount) * 100 : 100;
    }
}

class LoadingScreen {
    constructor() {
        this.loader = new AssetLoader();
        this.progressBar = null;
        this.progressText = null;
        this.loadingScreen = null;
        this.isVisible = true;
        this.startTime = performance.now();
        this.loadingSteps = [];

        this.createLoadingScreen();
        this.setupLoader();
        this.trackPerformance();
    }

    createLoadingScreen() {
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.className = 'loading-screen';
        this.loadingScreen.innerHTML = `
            <div class="loading-container">
                <div class="loading-logo">
                    <div class="loading-cube"></div>
                    <h1>GeoDash</h1>
                </div>
                <div class="loading-progress">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <div class="progress-text">Loading... 0%</div>
                </div>
                <div class="loading-status">Initializing...</div>
            </div>
        `;
        
        document.body.appendChild(this.loadingScreen);
        
        this.progressBar = this.loadingScreen.querySelector('.progress-fill');
        this.progressText = this.loadingScreen.querySelector('.progress-text');
        this.statusText = this.loadingScreen.querySelector('.loading-status');
    }

    setupLoader() {
        this.loader.onProgress = (progress, loaded, total) => {
            this.updateProgress(progress, loaded, total);
        };
        
        this.loader.onComplete = () => {
            this.hideLoadingScreen();
        };
    }

    updateProgress(progress, loaded, total) {
        const roundedProgress = Math.round(progress);
        
        if (this.progressBar) {
            this.progressBar.style.width = `${progress}%`;
        }
        
        if (this.progressText) {
            this.progressText.textContent = `Loading... ${roundedProgress}%`;
        }
        
        if (this.statusText) {
            if (progress < 30) {
                this.statusText.textContent = 'Loading stylesheets...';
            } else if (progress < 60) {
                this.statusText.textContent = 'Loading scripts...';
            } else if (progress < 90) {
                this.statusText.textContent = 'Loading fonts...';
            } else {
                this.statusText.textContent = 'Finalizing...';
            }
        }
    }

    hideLoadingScreen() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        
        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('fade-out');
                
                setTimeout(() => {
                    if (this.loadingScreen && this.loadingScreen.parentNode) {
                        this.loadingScreen.parentNode.removeChild(this.loadingScreen);
                    }
                    
                    document.body.classList.add('loaded');
                    
                    const event = new CustomEvent('siteLoaded');
                    document.dispatchEvent(event);
                }, 500);
            }
        }, 300);
    }

    trackPerformance() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    const loadTime = performance.now() - this.startTime;

                    if (navigation) {
                        console.log('Page Load Performance:', {
                            totalLoadTime: `${loadTime.toFixed(2)}ms`,
                            domContentLoaded: `${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`,
                            loadComplete: `${navigation.loadEventEnd - navigation.loadEventStart}ms`
                        });
                    }
                }, 100);
            });
        }
    }

    async start() {
        this.loader.discoverAssets();
        await this.loader.loadCriticalAssets();
    }
}

export { AssetLoader, LoadingScreen };
