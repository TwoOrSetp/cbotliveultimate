# Asset Management Guide

This guide covers the management and optimization of all assets (SVG, PNG, JPG) used in the cbot website.

## Directory Structure

```
assets/
├── icon/                    # SVG icons and small graphics
│   ├── logo.svg
│   ├── navigation/         # Navigation icons
│   ├── features/          # Feature icons
│   └── social/            # Social media icons
├── images/                 # PNG and JPG images
│   ├── backgrounds/       # Background images
│   ├── features/          # Feature screenshots
│   ├── interface/         # UI screenshots
│   ├── logos/            # Logo variants
│   └── social/           # Social media images
└── ASSET-MANAGEMENT.md    # This file
```

## File Format Guidelines

### SVG (Scalable Vector Graphics)
**Best for**: Icons, logos, simple illustrations, graphics that need to scale

**Advantages**:
- Infinitely scalable without quality loss
- Small file sizes for simple graphics
- Can be styled with CSS
- Supports animations and interactions
- SEO-friendly (searchable text)

**Usage**:
```html
<!-- Inline SVG (best for styling) -->
<svg class="icon" viewBox="0 0 24 24">
  <path d="..."/>
</svg>

<!-- External SVG -->
<img src="assets/icon/logo.svg" alt="cbot logo" class="logo">

<!-- CSS background -->
.icon-background {
  background-image: url('assets/icon/pattern.svg');
}
```

### PNG (Portable Network Graphics)
**Best for**: Screenshots, UI elements, images with transparency, graphics with sharp edges

**Advantages**:
- Lossless compression
- Supports transparency
- Great for screenshots and UI elements
- Wide browser support

**Usage**:
```html
<!-- Basic PNG image -->
<img src="assets/images/interface/main-screen.png" alt="Main interface">

<!-- Responsive PNG with multiple sizes -->
<img src="assets/images/logo-128.png" 
     srcset="assets/images/logo-128.png 1x, 
             assets/images/logo-256.png 2x"
     alt="cbot logo">
```

### JPG (JPEG)
**Best for**: Photographs, complex images, backgrounds without transparency

**Advantages**:
- Excellent compression for photographs
- Small file sizes for complex images
- Universal browser support

**Usage**:
```html
<!-- Background image -->
<div class="hero" style="background-image: url('assets/images/backgrounds/hero.jpg')">

<!-- Responsive JPG -->
<picture>
  <source media="(min-width: 1200px)" srcset="assets/images/bg-large.jpg">
  <source media="(min-width: 768px)" srcset="assets/images/bg-medium.jpg">
  <img src="assets/images/bg-small.jpg" alt="Background">
</picture>
```

## Optimization Guidelines

### SVG Optimization
```bash
# Using SVGO (Node.js tool)
npm install -g svgo
svgo input.svg -o output.svg

# Manual optimization tips:
# - Remove unnecessary metadata
# - Simplify paths
# - Use currentColor for theme compatibility
# - Minimize decimal places
# - Remove unused elements
```

### PNG Optimization
```bash
# Using ImageOptim (macOS)
imageoptim *.png

# Using TinyPNG (online tool)
# Visit tinypng.com and upload images

# Using pngquant (command line)
pngquant --quality=65-90 input.png --output output.png
```

### JPG Optimization
```bash
# Using ImageOptim
imageoptim *.jpg

# Using jpegoptim
jpegoptim --max=85 *.jpg

# Using cjpeg (libjpeg)
cjpeg -quality 85 -progressive input.jpg > output.jpg
```

## Responsive Image Implementation

### HTML Picture Element
```html
<picture>
  <!-- High resolution displays -->
  <source media="(min-width: 1200px)" 
          srcset="assets/images/hero-1920.jpg 1x, 
                  assets/images/hero-3840.jpg 2x">
  
  <!-- Tablet -->
  <source media="(min-width: 768px)" 
          srcset="assets/images/hero-1024.jpg 1x, 
                  assets/images/hero-2048.jpg 2x">
  
  <!-- Mobile -->
  <img src="assets/images/hero-640.jpg" 
       srcset="assets/images/hero-640.jpg 1x, 
               assets/images/hero-1280.jpg 2x"
       alt="Hero image">
</picture>
```

### CSS Responsive Backgrounds
```css
.hero-section {
  background-image: url('assets/images/backgrounds/hero-mobile.jpg');
}

@media (min-width: 768px) {
  .hero-section {
    background-image: url('assets/images/backgrounds/hero-tablet.jpg');
  }
}

@media (min-width: 1200px) {
  .hero-section {
    background-image: url('assets/images/backgrounds/hero-desktop.jpg');
  }
}

/* High-DPI support */
@media (-webkit-min-device-pixel-ratio: 2) {
  .hero-section {
    background-image: url('assets/images/backgrounds/hero-desktop@2x.jpg');
  }
}
```

## Performance Best Practices

### Lazy Loading
```html
<!-- Native lazy loading -->
<img src="assets/images/feature.png" 
     alt="Feature screenshot" 
     loading="lazy">

<!-- Intersection Observer API -->
<img data-src="assets/images/feature.png" 
     alt="Feature screenshot" 
     class="lazy-load">
```

### WebP Support
```html
<picture>
  <source srcset="assets/images/hero.webp" type="image/webp">
  <source srcset="assets/images/hero.jpg" type="image/jpeg">
  <img src="assets/images/hero.jpg" alt="Hero image">
</picture>
```

### CSS Image Optimization
```css
/* Optimize image rendering */
img {
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* Prevent layout shift */
.image-container {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

## Asset Naming Conventions

### File Naming
```
Format: [category]-[description]-[size].[extension]

Examples:
- logo-main-256x256.png
- icon-download-24x24.svg
- bg-hero-1920x1080.jpg
- feature-combat-800x600.png
- social-discord-32x32.png
```

### Directory Organization
```
assets/
├── icon/
│   ├── navigation/
│   ├── features/
│   ├── social/
│   └── ui/
├── images/
│   ├── backgrounds/
│   │   ├── desktop/
│   │   ├── tablet/
│   │   └── mobile/
│   ├── features/
│   ├── interface/
│   └── logos/
│       ├── png/
│       ├── svg/
│       └── ico/
```

## Quality Assurance Checklist

### Before Adding Assets
- [ ] Optimize file size without compromising quality
- [ ] Use appropriate format (SVG/PNG/JPG)
- [ ] Include multiple sizes for responsive design
- [ ] Add descriptive alt text
- [ ] Test on different devices and screen densities
- [ ] Validate accessibility compliance
- [ ] Check loading performance impact

### Asset Review
- [ ] Files are properly compressed
- [ ] Naming convention is followed
- [ ] Directory structure is maintained
- [ ] Documentation is updated
- [ ] Responsive variants are included
- [ ] Browser compatibility is verified

## Tools and Resources

### Optimization Tools
- **SVGO**: SVG optimization
- **TinyPNG**: PNG/JPG compression
- **ImageOptim**: Multi-format optimization
- **Squoosh**: Google's image optimization tool
- **WebP Converter**: Convert to WebP format

### Design Tools
- **Figma**: UI design and asset export
- **Adobe Illustrator**: Vector graphics
- **Adobe Photoshop**: Raster image editing
- **Sketch**: UI/UX design
- **Canva**: Quick graphics creation

### Testing Tools
- **Lighthouse**: Performance auditing
- **WebPageTest**: Loading performance
- **GTmetrix**: Speed analysis
- **Chrome DevTools**: Network analysis
