class ImageManager {
    constructor() {
        this.availableImages = [];
        this.selectedImage = null;
        this.imageCache = new Map();
        this.basePath = './assets/images/';
        this.iconPath = './assets/icons/';
        this.discoveredElements = new Set();
    }

    async discoverImages() {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
        const priorityOrder = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];

        const foundImages = [];

        const discoveredImages = await this.scanImagesDirectory(imageExtensions);

        for (const imageName of discoveredImages) {
            const fullPath = this.basePath + imageName;
            try {
                const response = await fetch(fullPath, { method: 'HEAD' });
                if (response.ok) {
                    foundImages.push({
                        name: imageName,
                        path: fullPath,
                        type: this.getImageType(imageName),
                        priority: this.getFormatPriority(imageName, priorityOrder)
                    });
                }
            } catch (error) {
                console.warn(`Image not found: ${fullPath}`);
            }
        }

        await this.discoverDOMImages(foundImages);

        foundImages.sort((a, b) => a.priority - b.priority);
        this.availableImages = foundImages;

        if (this.availableImages.length === 0) {
            this.createFallbackImage();
        }

        return this.availableImages;
    }

    async scanImagesDirectory(imageExtensions) {
        const discoveredImages = [];
        const checkPromises = [];
        const possibleNames = [
            'images', 'image', 'img', 'pic', 'picture', 'photo',
            'gd-mod-1', 'gd-mod-2', 'gd-mod-3', 'gd-mod-4', 'gd-mod-5', 'gd-mod-6',
            'mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'mod-6',
            'geometry-1', 'geometry-2', 'geometry-3', 'geometry-4',
            'dash-1', 'dash-2', 'dash-3', 'dash-4',
            'level-1', 'level-2', 'level-3', 'level-4',
            'cube-1', 'cube-2', 'cube-3', 'cube-4',
            'icon-1', 'icon-2', 'icon-3', 'icon-4',
            'bg-1', 'bg-2', 'bg-3', 'bg-4',
            'background-1', 'background-2', 'background-3', 'background-4',
            'hero-1', 'hero-2', 'hero-3', 'hero-4',
            'showcase-1', 'showcase-2', 'showcase-3', 'showcase-4',
            'demo-1', 'demo-2', 'demo-3', 'demo-4',
            'sample-1', 'sample-2', 'sample-3', 'sample-4',
            'test-1', 'test-2', 'test-3', 'test-4',
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            'avatar', 'banner', 'logo', 'header', 'footer', 'main', 'home', 'index', 'default', 'temp', 'new',
            'screenshot', 'capture', 'wallpaper', 'texture', 'background', 'bg',
            'abc', 'xyz', 'test', 'demo', 'sample', 'example', 'random', 'random-name',
            'file', 'data', 'asset', 'resource', 'content', 'media'
        ];

        // Kiểm tra tất cả các tên với tất cả các extension
        for (const baseName of possibleNames) {
            for (const extension of imageExtensions) {
                const fileName = `${baseName}.${extension}`;
                const fullPath = this.basePath + fileName;

                checkPromises.push(
                    fetch(fullPath, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok) {
                                discoveredImages.push(fileName);
                                console.log(`✅ Found image: ${fileName}`);
                            }
                        })
                        .catch(() => {
                            // Bỏ qua file không tồn tại
                        })
                );
            }
        }

        // Thêm kiểm tra cho các tên file phổ biến khác
        const additionalNames = [
            'images', 'Pictures', 'IMAGES', 'Image', 'IMG', 'Img',
            'photo1', 'photo2', 'photo3', 'photo4', 'photo5',
            'pic1', 'pic2', 'pic3', 'pic4', 'pic5',
            'img1', 'img2', 'img3', 'img4', 'img5',
            'file1', 'file2', 'file3', 'file4', 'file5',
            'untitled', 'Untitled', 'new', 'New', 'copy', 'Copy',
            'download', 'Download', 'temp', 'Temp', 'test', 'Test'
        ];

        for (const name of additionalNames) {
            for (const extension of imageExtensions) {
                const fileName = `${name}.${extension}`;
                const fullPath = this.basePath + fileName;

                checkPromises.push(
                    fetch(fullPath, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok && !discoveredImages.includes(fileName)) {
                                discoveredImages.push(fileName);
                                console.log(`✅ Found additional image: ${fileName}`);
                            }
                        })
                        .catch(() => {
                            // Bỏ qua file không tồn tại
                        })
                );
            }
        }

        // Kiểm tra các file được tham chiếu trong DOM
        const domReferencedImages = this.extractImageNamesFromDOM();
        for (const imageName of domReferencedImages) {
            if (this.isImageUrl(imageName)) {
                const fileName = this.extractFileName(imageName);
                const fullPath = this.basePath + fileName;

                checkPromises.push(
                    fetch(fullPath, { method: 'HEAD' })
                        .then(response => {
                            if (response.ok && !discoveredImages.includes(fileName)) {
                                discoveredImages.push(fileName);
                                console.log(`✅ Found DOM referenced image: ${fileName}`);
                            }
                        })
                        .catch(() => {
                            // Bỏ qua file không tồn tại
                        })
                );
            }
        }

        await Promise.allSettled(checkPromises);

        // Direct check for common files that might exist
        const directCheckFiles = ['images.jpg', 'image.jpg', 'img.jpg', 'photo.jpg', 'pic.jpg'];

        for (const fileName of directCheckFiles) {
            if (!discoveredImages.includes(fileName)) {
                try {
                    const response = await fetch(this.basePath + fileName, { method: 'HEAD' });
                    if (response.ok) {
                        discoveredImages.push(fileName);
                        console.log(`✅ Direct check found: ${fileName}`);
                    }
                } catch (error) {
                    // Silent fail for direct checks
                }
            }
        }

        // Sắp xếp theo độ ưu tiên format
        discoveredImages.sort((a, b) => {
            const priorityOrder = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
            const aExt = a.split('.').pop().toLowerCase();
            const bExt = b.split('.').pop().toLowerCase();
            const aPriority = priorityOrder.indexOf(aExt);
            const bPriority = priorityOrder.indexOf(bExt);
            return aPriority - bPriority;
        });

        console.log(`🎯 Discovered ${discoveredImages.length} images in assets/images directory:`);
        console.log(discoveredImages);

        return discoveredImages;
    }

    extractImageNamesFromDOM() {
        const imageNames = [];

        // Check img src attributes
        const imgElements = document.querySelectorAll('img[src]');
        imgElements.forEach(img => {
            if (img.src && img.src.includes('/assets/images/')) {
                imageNames.push(img.src);
            }
        });

        // Check CSS background images
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const backgroundImage = style.backgroundImage;

            if (backgroundImage && backgroundImage !== 'none') {
                const matches = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/g);
                if (matches) {
                    matches.forEach(match => {
                        const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)$/, '');
                        if (url && url.includes('/assets/images/')) {
                            imageNames.push(url);
                        }
                    });
                }
            }
        });

        // Check data attributes
        allElements.forEach(element => {
            Array.from(element.attributes).forEach(attr => {
                if (attr.name.startsWith('data-') && attr.value.includes('/assets/images/')) {
                    imageNames.push(attr.value);
                }
            });
        });

        return imageNames;
    }

    async discoverDOMImages(foundImages) {
        const imgElements = document.querySelectorAll('img[src]');
        imgElements.forEach(img => {
            if (img.src && !img.src.includes('data:') && !this.isAlreadyDiscovered(img.src)) {
                foundImages.push({
                    name: this.extractFileName(img.src),
                    path: img.src,
                    type: this.getImageType(img.src),
                    priority: this.getFormatPriority(img.src, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']),
                    source: 'img-element'
                });
                this.discoveredElements.add(img.src);
            }
        });

        const pictureElements = document.querySelectorAll('picture source[srcset]');
        pictureElements.forEach(source => {
            const srcset = source.getAttribute('srcset');
            if (srcset) {
                const urls = this.extractUrlsFromSrcset(srcset);
                urls.forEach(url => {
                    if (!this.isAlreadyDiscovered(url)) {
                        foundImages.push({
                            name: this.extractFileName(url),
                            path: url,
                            type: this.getImageType(url),
                            priority: this.getFormatPriority(url, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']),
                            source: 'picture-element'
                        });
                        this.discoveredElements.add(url);
                    }
                });
            }
        });

        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const backgroundImage = style.backgroundImage;

            if (backgroundImage && backgroundImage !== 'none') {
                const urls = this.extractBackgroundImageUrls(backgroundImage);
                urls.forEach(url => {
                    if (!this.isAlreadyDiscovered(url)) {
                        foundImages.push({
                            name: this.extractFileName(url),
                            path: url,
                            type: this.getImageType(url),
                            priority: this.getFormatPriority(url, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']),
                            source: 'background-image'
                        });
                        this.discoveredElements.add(url);
                    }
                });
            }

            const dataAttributes = Array.from(element.attributes)
                .filter(attr => attr.name.startsWith('data-') && this.isImageUrl(attr.value));

            dataAttributes.forEach(attr => {
                if (!this.isAlreadyDiscovered(attr.value)) {
                    foundImages.push({
                        name: this.extractFileName(attr.value),
                        path: attr.value,
                        type: this.getImageType(attr.value),
                        priority: this.getFormatPriority(attr.value, ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']),
                        source: 'data-attribute'
                    });
                    this.discoveredElements.add(attr.value);
                }
            });
        });
    }

    getImageType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        return extension;
    }

    getFormatPriority(filename, priorityOrder) {
        const type = this.getImageType(filename);
        const index = priorityOrder.indexOf(type);
        return index === -1 ? priorityOrder.length : index;
    }

    extractFileName(url) {
        return url.split('/').pop().split('?')[0];
    }

    extractUrlsFromSrcset(srcset) {
        return srcset.split(',')
            .map(src => src.trim().split(' ')[0])
            .filter(url => url && !url.startsWith('data:'));
    }

    extractBackgroundImageUrls(backgroundImage) {
        const urls = [];
        const matches = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/g);
        if (matches) {
            matches.forEach(match => {
                const url = match.replace(/url\(['"]?/, '').replace(/['"]?\)$/, '');
                if (url && !url.startsWith('data:')) {
                    urls.push(url);
                }
            });
        }
        return urls;
    }

    isImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        const imageExtensions = ['jpg', 'jpeg', 'png', 'svg', 'webp', 'gif'];
        const extension = url.split('.').pop().toLowerCase().split('?')[0];
        return imageExtensions.includes(extension);
    }

    isAlreadyDiscovered(url) {
        return this.discoveredElements.has(url) ||
               this.availableImages.some(img => img.path === url);
    }

    createFallbackImage() {
        console.log('🎨 Creating fallback image...');

        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 400, 400);

        // Main gradient
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#4a9eff');
        gradient.addColorStop(1, '#1e3a8a');

        ctx.fillStyle = gradient;
        ctx.fillRect(50, 50, 300, 300);

        // Inner frame
        ctx.fillStyle = '#000000';
        ctx.fillRect(100, 100, 200, 200);

        // Center icon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GD', 200, 200);

        // Decorative elements
        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 4;
        ctx.strokeRect(75, 75, 250, 250);

        const fallbackDataUrl = canvas.toDataURL('image/png', 1.0);

        this.availableImages.push({
            name: 'fallback-generated.png',
            path: fallbackDataUrl,
            type: 'png',
            priority: 999, // Low priority
            source: 'generated-fallback'
        });

        console.log('✅ Fallback image created successfully');
    }

    selectRandomImage() {
        if (this.availableImages.length === 0) {
            return null;
        }

        // Shuffle the array to ensure true randomness
        const shuffledImages = [...this.availableImages];
        for (let i = shuffledImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
        }

        // Select the first image from shuffled array
        this.selectedImage = shuffledImages[0];

        console.log(`Randomly selected image: ${this.selectedImage.name} (${this.selectedImage.type}) from ${this.availableImages.length} available images`);

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
        try {
            console.log('🔍 Starting image discovery...');
            await this.discoverImages();

            if (this.availableImages.length === 0) {
                console.warn('⚠️ No images discovered, creating fallback');
                this.createFallbackImage();
            }

            console.log(`📸 Discovered ${this.availableImages.length} images`);
            this.selectRandomImage();

            console.log('⏳ Preloading images...');
            await this.preloadAllImages();

            console.log('✅ ImageManager initialized successfully');
            return this.selectedImage;

        } catch (error) {
            console.error('❌ ImageManager initialization failed:', error);
            this.createFallbackImage();
            this.selectRandomImage();
            return this.selectedImage;
        }
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
        this.setupClickInstructions();
    }

    async setupDynamicImage() {
        const selectedImage = this.imageManager.getSelectedImage();

        if (!selectedImage) {
            console.warn('⚠️ No image selected - using fallback');
            this.setFallbackDisplay();
            return;
        }

        try {
            // Preload image to ensure it exists
            await this.preloadImageElement(selectedImage.path);

            // Apply image with proper layering
            this.imageElement.style.backgroundImage = `url("${selectedImage.path}")`;
            this.imageElement.style.backgroundSize = 'cover';
            this.imageElement.style.backgroundPosition = 'center';
            this.imageElement.style.backgroundRepeat = 'no-repeat';
            this.imageElement.style.backgroundBlendMode = 'overlay';

            // Update UI elements
            const totalImages = this.imageManager.getAllImages().length;
            this.updateTooltip(selectedImage, totalImages);
            this.updateStatusIndicator(selectedImage, totalImages);

            console.log(`✅ Image loaded successfully: ${selectedImage.name}`);

        } catch (error) {
            console.error(`❌ Failed to load image: ${selectedImage.name}`, error);
            this.setFallbackDisplay();
        }
    }

    async preloadImageElement(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load: ${imagePath}`));
            img.src = imagePath;
        });
    }

    setFallbackDisplay() {
        this.imageElement.style.backgroundImage = 'none';
        this.imageElement.style.background = 'var(--theme-gradient)';
        this.imageElement.setAttribute('data-tooltip', '🎮 Loading mods... | Click to refresh');

        // Add fallback text
        if (!this.imageElement.querySelector('.fallback-text')) {
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-text';
            fallbackText.innerHTML = '<span>GD</span>';
            this.imageElement.appendChild(fallbackText);
        }
    }

    updateTooltip(selectedImage, totalImages) {
        const tooltipText = `🎮 ${selectedImage.name} | ${selectedImage.type.toUpperCase()} | ${totalImages} mods available | Click to cycle`;
        this.imageElement.setAttribute('data-tooltip', tooltipText);
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
            this.showClickFeedback();
            this.rotateToNextImage();
        });
    }

    applyHoverEffect() {
        this.imageElement.style.transform = 'scale(1.2) translateY(-10px)';
        this.imageElement.style.borderRadius = '50%';
        this.imageElement.style.boxShadow = '0 20px 40px rgba(74, 158, 255, 0.6)';
        this.imageElement.style.borderColor = 'var(--theme-white)';

        this.heroElement.style.background = 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.1) 0%, rgba(74, 158, 255, 0.15) 50%, transparent 70%)';
        this.heroElement.classList.add('hover-active');

        const placeholder = this.heroElement.querySelector('.hero-placeholder');
        if (placeholder) {
            placeholder.style.borderColor = 'var(--theme-blue)';
            placeholder.style.boxShadow = '0 15px 35px rgba(74, 158, 255, 0.3)';
        }
    }

    removeHoverEffect() {
        this.imageElement.style.transform = 'scale(1) translateY(0)';
        this.imageElement.style.borderRadius = '20px';
        this.imageElement.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)';
        this.imageElement.style.borderColor = 'var(--theme-blue)';

        this.heroElement.style.background = 'radial-gradient(ellipse at center, rgba(74, 158, 255, 0.15) 0%, transparent 70%)';
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

        if (allImages.length === 0) {
            console.warn('⚠️ No images available for rotation');
            return;
        }

        if (allImages.length === 1) {
            console.log('ℹ️ Only one image available, refreshing current');
            await this.setupDynamicImage();
            return;
        }

        // Smart image selection - avoid current image
        const nextImage = this.selectNextImage(currentImage, allImages);
        this.imageManager.selectedImage = nextImage;

        console.log(`🔄 Rotating: ${currentImage?.name} → ${nextImage.name} (${nextImage.type})`);

        // Smooth transition animation
        await this.performImageTransition();
    }

    selectNextImage(currentImage, allImages) {
        const availableImages = allImages.filter(img =>
            !currentImage || img.path !== currentImage.path
        );

        if (availableImages.length === 0) {
            return allImages[0]; // Fallback to first image
        }

        // Random selection from available images
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        return availableImages[randomIndex];
    }

    async performImageTransition() {
        // Start transition
        this.imageElement.style.transition = 'all 0.3s ease';
        this.imageElement.style.opacity = '0';
        this.imageElement.style.transform = 'scale(0.9) rotate(5deg)';

        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, 150));

        // Load new image
        await this.setupDynamicImage();

        // Fade in with new image
        this.imageElement.style.opacity = '1';
        this.imageElement.style.transform = this.isHovered
            ? 'scale(1.2) translateY(-10px)'
            : 'scale(1) translateY(0)';

        // Reset transition
        setTimeout(() => {
            this.imageElement.style.transition = '';
        }, 300);
    }

    setupImageRotation() {
        setInterval(() => {
            if (!this.isHovered && Math.random() < 0.1) {
                this.rotateToNextImage();
            }
        }, 5000);
    }

    setupClickInstructions() {
        // Create floating instruction text
        const instructionElement = document.createElement('div');
        instructionElement.className = 'click-instruction';
        instructionElement.innerHTML = `
            <div class="instruction-content">
                <span class="instruction-icon">👆</span>
                <span class="instruction-text">Click to cycle through mods</span>
                <span class="instruction-subtext">Hover for effects</span>
            </div>
        `;

        this.heroElement.appendChild(instructionElement);

        // Show instruction for 5 seconds, then fade out
        setTimeout(() => {
            instructionElement.classList.add('fade-out');
            setTimeout(() => {
                if (instructionElement.parentNode) {
                    instructionElement.parentNode.removeChild(instructionElement);
                }
            }, 1000);
        }, 5000);

        // Hide instruction when user first interacts
        const hideInstruction = () => {
            instructionElement.classList.add('fade-out');
            this.imageElement.removeEventListener('click', hideInstruction);
            this.imageElement.removeEventListener('mouseenter', hideInstruction);
        };

        this.imageElement.addEventListener('click', hideInstruction);
        this.imageElement.addEventListener('mouseenter', hideInstruction);
    }

    updateStatusIndicator(selectedImage, totalImages) {
        // Option to disable status indicator - set this to false if you don't want it
        const showStatusIndicator = false; // Change to true if you want the status indicator

        if (!showStatusIndicator) {
            // Remove existing status indicator if disabled
            const existingStatus = this.heroElement.querySelector('.image-status');
            if (existingStatus) {
                existingStatus.remove();
            }
            return;
        }

        // Remove existing status indicator
        const existingStatus = this.heroElement.querySelector('.image-status');
        if (existingStatus) {
            existingStatus.remove();
        }

        // Create new status indicator
        const statusElement = document.createElement('div');
        statusElement.className = 'image-status';
        statusElement.innerHTML = `
            <div class="status-content">
                <div class="status-header">
                    <span class="status-icon">🖼️</span>
                    <span class="status-title">Current Mod</span>
                </div>
                <div class="status-info">
                    <div class="status-name">${selectedImage.name}</div>
                    <div class="status-details">${selectedImage.type.toUpperCase()} • ${totalImages} total mods</div>
                </div>
            </div>
        `;

        this.heroElement.appendChild(statusElement);

        // Animate in
        setTimeout(() => {
            statusElement.classList.add('show');
        }, 100);
    }

    showClickFeedback() {
        // Create click ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        this.imageElement.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);

        // Show temporary click text
        const clickText = document.createElement('div');
        clickText.className = 'click-feedback-text';
        clickText.textContent = '🔄 Switching mod...';
        this.heroElement.appendChild(clickText);

        setTimeout(() => {
            clickText.classList.add('show');
        }, 50);

        setTimeout(() => {
            clickText.classList.add('fade-out');
            setTimeout(() => {
                if (clickText.parentNode) {
                    clickText.parentNode.removeChild(clickText);
                }
            }, 300);
        }, 1500);
    }
}

class IconManager {
    constructor() {
        this.iconPath = './assets/icons/';
        this.availableIcons = [];
    }

    async discoverIcons() {
        const knownIcons = [
            'geodash-icon.svg'
        ];

        for (const iconName of knownIcons) {
            const fullPath = this.iconPath + iconName;
            try {
                const response = await fetch(fullPath, { method: 'HEAD' });
                if (response.ok) {
                    this.availableIcons.push({
                        name: iconName,
                        path: fullPath,
                        type: iconName.split('.').pop().toLowerCase()
                    });
                }
            } catch (error) {
                console.warn(`Icon not found: ${fullPath}`);
            }
        }

        return this.availableIcons;
    }

    async loadNavIcon() {
        try {
            console.log('🎯 Discovering navigation icons...');
            await this.discoverIcons();

            if (this.availableIcons.length === 0) {
                console.warn('⚠️ No icons found, creating fallback');
                this.createFallbackIcon();
            }

            const navBrand = document.querySelector('.nav-brand');
            if (!navBrand) {
                console.error('❌ Nav brand element not found');
                return;
            }

            // Remove existing icon if present
            const existingIcon = navBrand.querySelector('.nav-icon');
            if (existingIcon) {
                existingIcon.remove();
                console.log('🗑️ Removed existing icon');
            }

            // Create and configure icon element
            const icon = document.createElement('img');
            icon.src = this.availableIcons[0].path;
            icon.alt = 'GeoDash Icon';
            icon.className = 'nav-icon';
            icon.loading = 'eager';

            // Add error handling for icon loading
            icon.onerror = () => {
                console.error('❌ Failed to load icon, using fallback');
                icon.style.display = 'none';
            };

            icon.onload = () => {
                console.log('✅ Navigation icon loaded successfully');
            };

            // Insert icon before the h1 element
            const h1 = navBrand.querySelector('h1');
            if (h1) {
                navBrand.insertBefore(icon, h1);
                console.log('📍 Icon inserted before title');
            } else {
                navBrand.appendChild(icon);
                console.log('📍 Icon appended to nav brand');
            }

            console.log(`🎯 Navigation icon loaded: ${this.availableIcons[0].name}`);

        } catch (error) {
            console.error('❌ Failed to load navigation icon:', error);
        }
    }

    createFallbackIcon() {
        // Create a simple fallback icon using data URL
        const fallbackSvg = `data:image/svg+xml;base64,${btoa(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="15" fill="#4a9eff" stroke="#ffffff" stroke-width="2"/>
                <text x="16" y="20" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="10" font-weight="bold">GD</text>
            </svg>
        `)}`;

        this.availableIcons.push({
            name: 'fallback-icon.svg',
            path: fallbackSvg,
            type: 'svg'
        });

        console.log('🎨 Created fallback navigation icon');
    }

    getAvailableIcons() {
        return this.availableIcons;
    }
}

export { ImageManager, GeometryDashHero, IconManager };
