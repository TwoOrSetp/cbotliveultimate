class ImageManager {
    constructor() {
        this.availableImages = [];
        this.selectedImage = null;
        this.imageCache = new Map();
        this.basePath = './assets/images/';
    }

    async discoverImages() {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];
        const knownImages = [
            'gd-mod-1.svg',
            'gd-mod-2.svg',
            'gd-mod-3.svg',
            'gd-mod-4.svg',
            'image.jpg'
        ];

        for (const imageName of knownImages) {
            const fullPath = this.basePath + imageName;
            try {
                const response = await fetch(fullPath, { method: 'HEAD' });
                if (response.ok) {
                    this.availableImages.push({
                        name: imageName,
                        path: fullPath,
                        type: this.getImageType(imageName)
                    });
                }
            } catch (error) {
                console.warn(`Image not found: ${fullPath}`);
            }
        }

        if (this.availableImages.length === 0) {
            this.createFallbackImage();
        }

        return this.availableImages;
    }

    getImageType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        return extension;
    }

    createFallbackImage() {
        const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
            <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fallback" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#0066cc;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="200" height="200" fill="#1a1a1a" rx="20"/>
                <rect x="50" y="50" width="100" height="100" fill="url(#fallback)" rx="15"/>
                <text x="100" y="105" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="16">GD</text>
            </svg>
        `)}`;

        this.availableImages.push({
            name: 'fallback.svg',
            path: fallbackSvg,
            type: 'svg'
        });
    }

    selectRandomImage() {
        if (this.availableImages.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.availableImages.length);
        this.selectedImage = this.availableImages[randomIndex];
        return this.selectedImage;
    }

    async preloadImage(imagePath) {
        if (this.imageCache.has(imagePath)) {
            return this.imageCache.get(imagePath);
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.imageCache.set(imagePath, img);
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${imagePath}`));
            };
            
            img.src = imagePath;
        });
    }

    async preloadAllImages() {
        const preloadPromises = this.availableImages.map(image => 
            this.preloadImage(image.path).catch(error => {
                console.warn(`Failed to preload ${image.name}:`, error);
                return null;
            })
        );

        await Promise.allSettled(preloadPromises);
    }

    getSelectedImage() {
        return this.selectedImage;
    }

    getAllImages() {
        return this.availableImages;
    }

    async initialize() {
        await this.discoverImages();
        this.selectRandomImage();
        await this.preloadAllImages();
        return this.selectedImage;
    }
}

class GeometryDashHero {
    constructor(imageManager) {
        this.imageManager = imageManager;
        this.heroElement = null;
        this.imageElement = null;
        this.isHovered = false;
    }

    async initialize() {
        this.heroElement = document.querySelector('.hero');
        this.imageElement = document.querySelector('.cube');
        
        if (!this.heroElement || !this.imageElement) {
            console.error('Hero elements not found');
            return;
        }

        await this.setupDynamicImage();
        this.setupHoverEffects();
        this.setupImageRotation();
    }

    async setupDynamicImage() {
        const selectedImage = this.imageManager.getSelectedImage();
        
        if (!selectedImage) {
            console.warn('No image selected');
            return;
        }

        this.imageElement.style.backgroundImage = `url(${selectedImage.path})`;
        this.imageElement.style.backgroundSize = 'cover';
        this.imageElement.style.backgroundPosition = 'center';
        this.imageElement.style.backgroundRepeat = 'no-repeat';
        this.imageElement.style.background = `url(${selectedImage.path}) center/cover no-repeat, var(--gradient)`;
    }

    setupHoverEffects() {
        this.imageElement.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.applyHoverEffect();
        });

        this.imageElement.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.removeHoverEffect();
        });

        this.imageElement.addEventListener('click', () => {
            this.rotateToNextImage();
        });
    }

    applyHoverEffect() {
        this.imageElement.style.transform = 'scale(1.2) translateY(-10px)';
        this.imageElement.style.borderRadius = '50%';
        this.imageElement.style.boxShadow = '0 20px 40px rgba(255, 51, 102, 0.4)';

        this.heroElement.style.background = 'radial-gradient(ellipse at center, rgba(255, 51, 102, 0.2) 0%, rgba(255, 107, 53, 0.1) 50%, transparent 70%)';
        this.heroElement.classList.add('hover-active');

        const placeholder = this.heroElement.querySelector('.hero-placeholder');
        if (placeholder) {
            placeholder.style.borderColor = 'var(--accent-color)';
            placeholder.style.boxShadow = '0 15px 35px rgba(255, 51, 102, 0.2)';
        }
    }

    removeHoverEffect() {
        this.imageElement.style.transform = 'scale(1) translateY(0)';
        this.imageElement.style.borderRadius = '20px';
        this.imageElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';

        this.heroElement.style.background = 'radial-gradient(ellipse at center, rgba(0, 255, 136, 0.1) 0%, transparent 70%)';
        this.heroElement.classList.remove('hover-active');

        const placeholder = this.heroElement.querySelector('.hero-placeholder');
        if (placeholder) {
            placeholder.style.borderColor = 'var(--border-color)';
            placeholder.style.boxShadow = 'none';
        }
    }

    async rotateToNextImage() {
        const currentImage = this.imageManager.getSelectedImage();
        const allImages = this.imageManager.getAllImages();
        
        if (allImages.length <= 1) return;

        const currentIndex = allImages.findIndex(img => img.path === currentImage.path);
        const nextIndex = (currentIndex + 1) % allImages.length;
        
        this.imageManager.selectedImage = allImages[nextIndex];
        
        this.imageElement.style.opacity = '0';
        this.imageElement.style.transform = 'scale(0.8) rotate(180deg)';
        
        setTimeout(() => {
            this.setupDynamicImage();
            this.imageElement.style.opacity = '1';
            this.imageElement.style.transform = this.isHovered ? 'scale(1.2) translateY(-10px)' : 'scale(1) translateY(0)';
        }, 200);
    }

    setupImageRotation() {
        setInterval(() => {
            if (!this.isHovered && Math.random() < 0.1) {
                this.rotateToNextImage();
            }
        }, 5000);
    }
}

export { ImageManager, GeometryDashHero };
