# Feature Images

This directory contains images showcasing cbot features and capabilities.

## Image Categories

### Interface Screenshots
- `main-interface.png` - Primary cbot interface
- `settings-panel.png` - Configuration interface
- `module-selector.png` - Module selection screen

### Feature Demonstrations
- `combat-modules.png` - Combat features in action
- `movement-enhancements.png` - Movement capabilities
- `visual-overlays.png` - ESP and visual features
- `world-interaction.png` - World manipulation tools

### Before/After Comparisons
- `vanilla-vs-cbot.png` - Comparison screenshots
- `performance-comparison.png` - Performance metrics
- `feature-comparison.png` - Feature availability chart

## Technical Requirements

### Screenshot Guidelines
- **Resolution**: Minimum 1920x1080 for desktop screenshots
- **Format**: PNG for UI screenshots (preserves sharp edges)
- **Compression**: Optimize with tools like TinyPNG
- **Consistency**: Use same Minecraft version and settings

### Image Specifications
- **UI Screenshots**: PNG format for crisp text and interfaces
- **Gameplay Images**: JPG format for complex scenes
- **Diagrams**: SVG format when possible for scalability
- **Icons**: SVG or PNG with transparency

### Naming Convention
```
feature-name-description-size.format

Examples:
- combat-killaura-demo-1920x1080.png
- movement-fly-showcase-1280x720.jpg
- interface-main-menu-800x600.png
```

## Usage Guidelines

### Web Implementation
```html
<!-- Feature showcase with lazy loading -->
<img src="assets/images/features/combat-modules.png" 
     alt="Combat modules demonstration"
     loading="lazy"
     width="800" 
     height="450">

<!-- Responsive feature image -->
<picture>
  <source media="(min-width: 1200px)" 
          srcset="assets/images/features/interface-large.png">
  <source media="(min-width: 768px)" 
          srcset="assets/images/features/interface-medium.png">
  <img src="assets/images/features/interface-small.png" 
       alt="cbot interface">
</picture>
```

### CSS Styling
```css
.feature-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.feature-image:hover {
  transform: scale(1.05);
}

/* Image gallery grid */
.feature-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
}
```

## Optimization Tips

### File Size Reduction
- Use appropriate compression levels
- Remove unnecessary metadata
- Consider WebP format for modern browsers
- Implement lazy loading for better performance

### Accessibility
- Always include descriptive alt text
- Ensure sufficient contrast for text overlays
- Provide captions for complex diagrams
- Use semantic HTML structure

### Performance
- Optimize images for web delivery
- Use responsive images for different screen sizes
- Implement progressive loading
- Consider using a CDN for faster delivery
