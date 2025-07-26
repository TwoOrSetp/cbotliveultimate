# YouTube Video Integration Guide

## 🎥 How to Update the YouTube Video

The home page now features a professional YouTube video embed that showcases cbot in action. Here's how to customize it:

### Quick Setup

1. **Get Your YouTube Video ID**
   - Go to your YouTube video: `https://youtube.com/watch?v=YOUR_VIDEO_ID`
   - Copy the video ID (the part after `v=`)
   - Example: For `https://youtube.com/watch?v=V63UTu4bZspr3frz`, the ID is `V63UTu4bZspr3frz`

2. **Update the HTML**
   - Open `index.html`
   - Find line with `data-video-id="V63UTu4bZspr3frz"`
   - Replace with your video ID: `data-video-id="YOUR_VIDEO_ID"`

3. **Update Video Information**
   - Find the `.youtube-title` element
   - Update the title: `<div class="youtube-title">Your Video Title</div>`
   - Update the channel: `<div class="youtube-channel">@yourchannel</div>`

### Example Configuration

```html
<div class="youtube-placeholder" data-video-id="YOUR_VIDEO_ID">
    <img src="assets/video/cbot-demo-poster.svg" alt="cbot demo preview" class="youtube-thumbnail">
    <div class="youtube-play-button">
        <!-- YouTube play button SVG -->
    </div>
    <div class="youtube-info">
        <div class="youtube-title">cbot v3.1 - Advanced Features Demo</div>
        <div class="youtube-channel">@snopphin</div>
    </div>
</div>
```

## 🎨 Customization Options

### Video Information
- **Title**: Update the video title shown on the thumbnail
- **Channel**: Update the channel name displayed
- **Thumbnail**: Replace the poster image if desired

### Styling
- **Colors**: Modify CSS variables for theme colors
- **Size**: Adjust the aspect ratio or container size
- **Effects**: Customize hover animations and transitions

### Advanced Options

#### Multiple Videos
You can create a playlist or multiple video options by duplicating the video section and changing the video IDs.

#### Custom Thumbnails
Replace `assets/video/cbot-demo-poster.svg` with your own thumbnail image:
- **Format**: JPG, PNG, or SVG
- **Resolution**: 1920x1080 (16:9 aspect ratio)
- **Size**: Under 500KB for optimal loading

#### YouTube Parameters
The embed URL includes these parameters:
- `autoplay=1`: Starts playing when clicked
- `rel=0`: Reduces related videos from other channels
- `modestbranding=1`: Minimizes YouTube branding
- `playsinline=1`: Plays inline on mobile devices

## 🚀 Features

### Lazy Loading
- Video only loads when user scrolls to it
- Improves page performance
- Reduces bandwidth usage

### Professional Styling
- Glass-morphism effects
- Smooth animations
- Responsive design
- Mobile-optimized

### User Experience
- Click to play functionality
- Loading states
- Error handling
- Fullscreen support

## 📱 Mobile Optimization

The YouTube embed is fully responsive and includes:
- Touch-friendly play button
- Mobile-optimized sizing
- Reduced data usage
- iOS/Android compatibility

## 🔧 Technical Details

### File Structure
```
assets/video/
├── cbot-demo-poster.svg    # Thumbnail image
└── README.md              # Video assets documentation

js/
└── video-player.js        # YouTube integration logic

css/
└── style.css             # YouTube embed styling
```

### JavaScript API
```javascript
// Access the YouTube player
window.youtubePlayer.changeYouTubeVideo('NEW_VIDEO_ID');
window.youtubePlayer.updateYouTubeInfo('New Title', '@newchannel');
```

## 🎯 Best Practices

### Video Content
- **Duration**: 30-90 seconds for optimal engagement
- **Quality**: 1080p minimum resolution
- **Content**: Show key cbot features clearly
- **Audio**: Include clear narration or captions

### SEO Optimization
- Use descriptive video titles
- Include relevant keywords
- Add proper video descriptions
- Use custom thumbnails

### Performance
- Keep video file sizes reasonable
- Use YouTube's compression
- Test on mobile devices
- Monitor loading times

## 🔄 Updates

To update the video:
1. Upload new video to YouTube
2. Copy the new video ID
3. Update `data-video-id` in `index.html`
4. Update title and description
5. Test the integration

## 📊 Analytics

YouTube provides built-in analytics for:
- View counts
- Watch time
- Engagement metrics
- Traffic sources
- Audience demographics

Access these through YouTube Studio for your channel.

## 🛠️ Troubleshooting

### Common Issues
- **Video not loading**: Check video ID and privacy settings
- **Autoplay not working**: Some browsers block autoplay
- **Mobile issues**: Ensure `playsinline` parameter is set

### Privacy Settings
- Video must be public or unlisted
- Private videos won't embed
- Age-restricted content may have limitations

## 🎬 Example Video Ideas

For cbot demonstrations:
- Combat module showcase
- Movement enhancements demo
- Visual overlay features
- Installation walkthrough
- Configuration tutorial
- Before/after comparisons

The YouTube integration provides a professional way to showcase cbot's capabilities directly on the home page!
