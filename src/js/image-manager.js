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

        // Tạo danh sách TẤT CẢ các tên file có thể có
        const possibleNames = [
            // Tên file cụ thể
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
            // Tất cả chữ cái đơn
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
            // Tất cả số đơn và kép
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
            // Tên phổ biến
            'avatar', 'banner', 'logo', 'header', 'footer', 'main', 'home', 'index', 'default', 'temp', 'new',
            'screenshot', 'capture', 'wallpaper', 'texture', 'background', 'bg',
            // Tên ngẫu nhiên có thể có
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

        // Kiểm tra trực tiếp file images.jpg nếu chưa tìm thấy
        if (!discoveredImages.some(img => img.includes('images'))) {
            console.log('🔍 Checking specifically for images.jpg...');
            try {
                const response = await fetch(this.basePath + 'images.jpg', { method: 'HEAD' });
                if (response.ok) {
                    discoveredImages.push('images.jpg');
                    console.log('✅ Found images.jpg directly!');
                }
            } catch (error) {
                console.log('❌ images.jpg not found');
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
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 200, 200);

        const gradient = ctx.createLinearGradient(0, 0, 200, 200);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#4a9eff');
        gradient.addColorStop(1, '#1e3a8a');

        ctx.fillStyle = gradient;
        ctx.fillRect(40, 40, 120, 120);

        ctx.fillStyle = '#000000';
        ctx.fillRect(60, 60, 80, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GD', 100, 100);

        const fallbackDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        this.availableImages.push({
            name: 'fallback.jpg',
            path: fallbackDataUrl,
            type: 'jpg',
            priority: 0,
            source: 'fallback'
        });
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
        this.setupClickInstructions();
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

        // Update tooltip with current image info
        const totalImages = this.imageManager.getAllImages().length;
        this.imageElement.setAttribute('data-tooltip', `🎮 ${selectedImage.name} | Click to cycle through ${totalImages} mods | Hover for effects`);

        // Update status indicator
        this.updateStatusIndicator(selectedImage, totalImages);
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

        if (allImages.length <= 1) return;

        // Instead of sequential rotation, randomly select a different image
        let nextImage;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            const randomIndex = Math.floor(Math.random() * allImages.length);
            nextImage = allImages[randomIndex];
            attempts++;
        } while (nextImage.path === currentImage.path && attempts < maxAttempts);

        // If we couldn't find a different image after max attempts, use sequential
        if (nextImage.path === currentImage.path) {
            const currentIndex = allImages.findIndex(img => img.path === currentImage.path);
            const nextIndex = (currentIndex + 1) % allImages.length;
            nextImage = allImages[nextIndex];
        }

        this.imageManager.selectedImage = nextImage;

        console.log(`Rotating to image: ${nextImage.name} (${nextImage.type})`);

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
        await this.discoverIcons();

        if (this.availableIcons.length === 0) {
            console.warn('No icons found');
            return;
        }

        const navBrand = document.querySelector('.nav-brand');
        if (!navBrand) {
            console.warn('Nav brand element not found');
            return;
        }

        const existingIcon = navBrand.querySelector('.nav-icon');
        if (existingIcon) {
            existingIcon.remove();
        }

        const icon = document.createElement('img');
        icon.src = this.availableIcons[0].path;
        icon.alt = 'GeoDash Icon';
        icon.className = 'nav-icon';

        const h1 = navBrand.querySelector('h1');
        if (h1) {
            navBrand.insertBefore(icon, h1);
        } else {
            navBrand.appendChild(icon);
        }

        console.log('Navigation icon loaded:', this.availableIcons[0].name);
    }

    getAvailableIcons() {
        return this.availableIcons;
    }
}

export { ImageManager, GeometryDashHero, IconManager };
