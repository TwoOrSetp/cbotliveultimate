# Icon Directory

This directory contains SVG icons used throughout the cbot website.

## Icon Categories

### Navigation Icons
- `logo.svg` - Main cbot logo/brand icon
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
- `discord.svg` - Discord social icon
- `youtube.svg` - YouTube social icon
- `github.svg` - GitHub social icon

## Icon Guidelines

- **Format**: SVG for scalability
- **Size**: Optimized for web (minimal file size)
- **Style**: Consistent with black theme and professional design
- **Colors**: Use currentColor for theme consistency
- **Accessibility**: Include proper titles and descriptions

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
