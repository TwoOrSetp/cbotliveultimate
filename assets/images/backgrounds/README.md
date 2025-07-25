# Background Images

This directory contains background images for various sections of the website.

## Available Backgrounds

### Hero Section
- `hero-bg.jpg` - Main hero background (1920x1080)
- `hero-bg-mobile.jpg` - Mobile optimized version (768x1024)
- `hero-overlay.png` - Transparent overlay for better text readability

### Section Backgrounds
- `about-bg.jpg` - About section background
- `download-bg.jpg` - Download section background
- `features-bg.png` - Features section with transparency

### Patterns and Textures
- `grid-pattern.png` - Subtle grid pattern overlay
- `noise-texture.png` - Noise texture for depth
- `gradient-overlay.png` - Gradient overlays

## Technical Specifications

### File Formats
- **JPG**: For photographic backgrounds without transparency
- **PNG**: For graphics with transparency or sharp edges
- **WebP**: Modern format for better compression (when supported)

### Sizes
- **Desktop**: 1920x1080 (Full HD)
- **Tablet**: 1024x768
- **Mobile**: 768x1024 (Portrait)
- **Retina**: 2x versions for high-DPI displays

### Optimization
- JPG Quality: 85-90% for optimal size/quality balance
- PNG: Use PNG-8 for simple graphics, PNG-24 for complex
- Progressive JPEG for better perceived loading
- Compress with tools like ImageOptim or TinyPNG

## Usage Examples

### CSS Implementation
```css
/* Basic background */
.hero-section {
  background-image: url('assets/images/backgrounds/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Responsive backgrounds */
@media (max-width: 768px) {
  .hero-section {
    background-image: url('assets/images/backgrounds/hero-bg-mobile.jpg');
  }
}

/* High-DPI support */
@media (-webkit-min-device-pixel-ratio: 2) {
  .hero-section {
    background-image: url('assets/images/backgrounds/hero-bg@2x.jpg');
  }
}

/* Multiple backgrounds with overlay */
.section-with-overlay {
  background-image: 
    url('assets/images/backgrounds/hero-overlay.png'),
    url('assets/images/backgrounds/hero-bg.jpg');
  background-blend-mode: multiply;
}
```

### HTML Implementation
```html
<!-- Picture element for responsive images -->
<picture class="background-image">
  <source media="(min-width: 1200px)" srcset="assets/images/backgrounds/hero-bg-large.jpg">
  <source media="(min-width: 768px)" srcset="assets/images/backgrounds/hero-bg-medium.jpg">
  <img src="assets/images/backgrounds/hero-bg-small.jpg" alt="">
</picture>
```
