# Video Assets Directory

This directory contains video files and related assets for the cbot website.

## Video Files

### Demo Video
- **cbot-demo.mp4** - Main demo video in MP4 format (H.264)
- **cbot-demo.webm** - Demo video in WebM format (VP9)
- **cbot-demo-poster.jpg** - Poster image/thumbnail for the video

## Video Specifications

### Recommended Settings
- **Resolution**: 1920x1080 (Full HD)
- **Aspect Ratio**: 16:9
- **Frame Rate**: 30 FPS
- **Duration**: 30-60 seconds for optimal engagement
- **Audio**: Optional (video is muted by default)

### Format Requirements
- **MP4**: H.264 codec, AAC audio (primary format)
- **WebM**: VP9 codec, Opus audio (fallback format)
- **Poster**: JPG format, same resolution as video

### File Size Guidelines
- **MP4**: Target 5-15 MB for good quality/performance balance
- **WebM**: Usually 20-30% smaller than MP4
- **Poster**: Under 500 KB, optimized for web

## Content Guidelines

### What to Show
- cbot interface and features
- Minecraft gameplay with cbot enhancements
- Key features like combat, movement, visual overlays
- Professional, clean demonstration
- Clear visual indicators of cbot's capabilities

### Technical Requirements
- High-quality screen recording
- Smooth 30 FPS gameplay
- Clear UI elements
- Good lighting/contrast in Minecraft
- No copyrighted music (if audio included)

## Implementation

The video is implemented with:
- Lazy loading for performance
- Multiple format support for compatibility
- Custom controls with glass-morphism styling
- Responsive design for all devices
- Fallback poster image
- Accessibility features

## Updating Videos

To update the demo video:
1. Record new footage following the guidelines above
2. Encode in both MP4 and WebM formats
3. Create a poster image from a key frame
4. Replace the files in this directory
5. Test on multiple browsers and devices
