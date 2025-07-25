# Assets Directory

This directory contains icons and images used throughout the cbot website.

## Supported Formats

### SVG Icons (Recommended)
- **Best for**: Icons, logos, simple graphics
- **Benefits**: Scalable, small file size, theme-compatible
- **Usage**: Navigation, buttons, feature icons

### PNG Images
- **Best for**: Complex graphics, screenshots, detailed images
- **Benefits**: Transparency support, wide compatibility
- **Usage**: Hero images, feature screenshots, complex graphics

### JPG Images
- **Best for**: Photographs, complex images without transparency
- **Benefits**: Excellent compression for photos
- **Usage**: Background images, photos, detailed graphics

## Icon Categories

### Navigation Icons
- `logo.svg` / `logo.png` - Main cbot logo/brand icon
- `home.svg` - Home page icon
- `about.svg` - About page icon
- `download.svg` - Download page icon

### Feature Icons
- `shield.svg` - Security/protection icon
- `performance.svg` - Performance/speed icon
- `user-friendly.svg` - User experience icon
- `advanced.svg` - Advanced features icon

### Action Icons
- `download-btn.svg` - Download button icon
- `learn-more.svg` - Learn more button icon
- `external-link.svg` - External link icon

### Social Icons
- `discord.svg` / `discord.png` - Discord social icon
- `youtube.svg` / `youtube.png` - YouTube social icon
- `github.svg` / `github.png` - GitHub social icon

### Image Assets
- `hero-bg.jpg` - Hero section background
- `feature-showcase.png` - Feature demonstration image
- `cbot-interface.png` - Interface screenshot
- `logo-variants/` - Different logo versions and sizes

## Asset Guidelines

### SVG Icons
- **Format**: SVG for scalability
- **Size**: Optimized for web (minimal file size)
- **Style**: Consistent with black theme and professional design
- **Colors**: Use currentColor for theme consistency
- **Accessibility**: Include proper titles and descriptions

### PNG Images
- **Resolution**: Multiple sizes (1x, 2x, 3x for retina displays)
- **Compression**: Optimized with tools like TinyPNG
- **Transparency**: Use for images requiring transparency
- **Naming**: Descriptive names with size indicators (e.g., `logo-32x32.png`)

### JPG Images
- **Quality**: 85-90% for optimal size/quality balance
- **Progressive**: Use progressive JPEG for better loading
- **Optimization**: Compress with tools like JPEGmini
- **Naming**: Include dimensions for different sizes

## Usage

Icons are referenced in HTML using relative paths:
```html
<img src="assets/icon/logo.svg" alt="cbot logo" class="icon">
```

Or embedded as inline SVG for styling control:
```html
<svg class="icon">
  <use href="assets/icon/sprite.svg#icon-name"></use>
</svg>
```
