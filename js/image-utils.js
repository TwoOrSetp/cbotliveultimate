class ImageUtils {
    constructor() {
        this.lazyImages = [];
        this.imageCache = new Map();
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageErrorHandling();
        this.setupWebPSupport();
        this.preloadCriticalImages();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.lazyImageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.lazyImageObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            this.observeLazyImages();
        } else {
            this.loadAllImages();
        }
    }

    observeLazyImages() {
        const lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
        if (lazyImages.length > 0 && this.lazyImageObserver) {
            lazyImages.forEach(img => {
                this.lazyImageObserver.observe(img);
            });
        }
    }

    loadImage(img) {
        const src = img.dataset.src || img.src;
        const srcset = img.dataset.srcset || img.srcset;

        if (src) {
            img.src = src;
            img.removeAttribute('data-src');
        }

        if (srcset) {
            img.srcset = srcset;
            img.removeAttribute('data-srcset');
        }

        img.classList.add('image-fade-in');
        
        img.onload = () => {
            img.classList.add('loaded');
            this.imageCache.set(src, true);
        };

        img.onerror = () => {
            this.handleImageError(img);
        };
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    handleImageError(img) {
        const fallbackSrc = img.dataset.fallback || this.generateFallbackImage(img);
        
        if (fallbackSrc && img.src !== fallbackSrc) {
            img.src = fallbackSrc;
        } else {
            this.createPlaceholder(img);
        }
    }

    generateFallbackImage(img) {
        const alt = img.alt || 'Image';
        const width = img.width || 300;
        const height = img.height || 200;
        
        return `data:image/svg+xml,${encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <rect width="100%" height="100%" fill="#1a1a1a"/>
                <text x="50%" y="50%" text-anchor="middle" dy="0.3em" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                    ${alt}
                </text>
            </svg>
        `)}`;
    }

    createPlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.width = img.width ? `${img.width}px` : '100%';
        placeholder.style.height = img.height ? `${img.height}px` : '200px';
        
        const text = document.createElement('span');
        text.textContent = img.alt || 'Image not available';
        text.style.color = '#6b7280';
        text.style.fontSize = '14px';
        
        placeholder.appendChild(text);
        img.parentNode.replaceChild(placeholder, img);
    }

    setupWebPSupport() {
        this.webpSupported = this.checkWebPSupport();
    }

    checkWebPSupport() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    async preloadCriticalImages() {
        const criticalImages = [
            'assets/icon/logo.svg',
            'assets/images/logos/logo-64x64.png'
        ];

        const preloadPromises = criticalImages.map(src => this.preloadImage(src));
        
        try {
            await Promise.all(preloadPromises);
        } catch (error) {
            console.warn('Some critical images failed to preload:', error);
        }
    }

    preloadImage(src) {
        return new Promise((resolve, reject) => {
            if (this.imageCache.has(src)) {
                resolve(src);
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.imageCache.set(src, true);
                resolve(src);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    optimizeImageDisplay() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (!img.width || !img.height) {
                img.onload = () => {
                    this.setImageDimensions(img);
                };
            }
            
            if (!img.alt) {
                console.warn('Image missing alt text:', img.src);
            }
        });
    }

    setImageDimensions(img) {
        if (!img.hasAttribute('width')) {
            img.setAttribute('width', img.naturalWidth);
        }
        if (!img.hasAttribute('height')) {
            img.setAttribute('height', img.naturalHeight);
        }
    }

    createResponsiveImage(src, alt, sizes = []) {
        const picture = document.createElement('picture');
        
        sizes.forEach(size => {
            const source = document.createElement('source');
            source.media = size.media;
            source.srcset = size.srcset;
            if (size.type) {
                source.type = size.type;
            }
            picture.appendChild(source);
        });

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.className = 'responsive-image';
        picture.appendChild(img);

        return picture;
    }

    addImageGallery(container, images) {
        const gallery = document.createElement('div');
        gallery.className = 'image-gallery';

        images.forEach(imageData => {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const img = document.createElement('img');
            img.src = imageData.src;
            img.alt = imageData.alt;
            img.loading = 'lazy';

            const overlay = document.createElement('div');
            overlay.className = 'gallery-overlay';
            overlay.textContent = imageData.title || imageData.alt;

            item.appendChild(img);
            item.appendChild(overlay);
            gallery.appendChild(item);

            item.addEventListener('click', () => {
                this.openImageModal(imageData);
            });
        });

        container.appendChild(gallery);
    }

    openImageModal(imageData) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop">
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <img src="${imageData.src}" alt="${imageData.alt}" class="modal-image">
                    <div class="modal-caption">${imageData.title || imageData.alt}</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => {
            modal.remove();
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        }, { once: true });
    }

    getImageStats() {
        const images = document.querySelectorAll('img');
        const stats = {
            total: images.length,
            loaded: 0,
            cached: this.imageCache.size,
            formats: { svg: 0, png: 0, jpg: 0, webp: 0, other: 0 }
        };

        images.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                stats.loaded++;
            }

            const src = img.src || img.dataset.src || '';
            const extension = src.split('.').pop().toLowerCase();
            
            if (stats.formats.hasOwnProperty(extension)) {
                stats.formats[extension]++;
            } else {
                stats.formats.other++;
            }
        });

        return stats;
    }
}

const imageUtils = new ImageUtils();

document.addEventListener('DOMContentLoaded', () => {
    try {
        imageUtils.optimizeImageDisplay();

        setTimeout(() => {
            try {
                const stats = imageUtils.getImageStats();
                console.log('Image loading stats:', stats);
            } catch (error) {
                console.warn('Error getting image stats:', error);
            }
        }, 2000);
    } catch (error) {
        console.error('Error initializing image utils:', error);
    }
});

window.imageUtils = imageUtils;
