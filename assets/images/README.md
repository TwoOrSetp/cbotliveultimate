# Images Directory

This directory contains PNG and JPG images for the cbot website.

## Directory Structure

```
assets/images/
├── backgrounds/          # Background images
├── features/            # Feature demonstration images
├── interface/           # Interface screenshots
├── logos/              # Logo variants in different formats
├── social/             # Social media images
└── thumbnails/         # Thumbnail versions of images
```

## Image Categories

### Background Images
- `hero-bg.jpg` - Main hero section background
- `section-bg.png` - Section background with transparency
- `pattern-overlay.png` - Subtle pattern overlays

### Feature Images
- `combat-features.png` - Combat module demonstration
- `movement-features.png` - Movement enhancement showcase
- `visual-features.png` - Visual enhancement examples
- `interface-preview.png` - Main interface screenshot

### Logo Variants
- `logo-light.png` - Logo for dark backgrounds
- `logo-dark.png` - Logo for light backgrounds
- `logo-icon.png` - Icon-only version
- `favicon.ico` - Browser favicon

### Social Media
- `og-image.jpg` - Open Graph image for social sharing
- `twitter-card.jpg` - Twitter card image
- `discord-banner.png` - Discord server banner

## Optimization Guidelines

### PNG Images
- Use PNG-8 for simple graphics with limited colors
- Use PNG-24 for complex graphics with transparency
- Optimize with tools like TinyPNG or ImageOptim
- Provide multiple resolutions for retina displays

### JPG Images
- Use 85-90% quality for optimal compression
- Use progressive JPEG for better perceived loading
- Optimize file sizes while maintaining visual quality
- Consider WebP format for modern browsers

### Responsive Images
- Provide multiple sizes for different screen resolutions
- Use descriptive naming: `image-320w.jpg`, `image-640w.jpg`, etc.
- Implement lazy loading for better performance
- Use appropriate image formats for each use case

## Usage Examples

### HTML Implementation
```html
<!-- Responsive image with multiple sources -->
<picture>
  <source media="(min-width: 768px)" srcset="assets/images/hero-bg-large.jpg">
  <source media="(min-width: 480px)" srcset="assets/images/hero-bg-medium.jpg">
  <img src="assets/images/hero-bg-small.jpg" alt="cbot interface">
</picture>

<!-- High-DPI support -->
<img src="assets/images/logo.png" 
     srcset="assets/images/logo.png 1x, assets/images/logo@2x.png 2x" 
     alt="cbot logo">
```

### CSS Background Images
```css
.hero-section {
  background-image: url('assets/images/backgrounds/hero-bg.jpg');
  background-size: cover;
  background-position: center;
}

/* Retina support */
@media (-webkit-min-device-pixel-ratio: 2) {
  .hero-section {
    background-image: url('assets/images/backgrounds/hero-bg@2x.jpg');
  }
}
```
