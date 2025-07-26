# cbot Official Website

A modern, responsive multi-page website for cbot - Advanced Minecraft client. Built with vanilla HTML, CSS, and JavaScript, featuring GitHub API integration for dynamic release downloads.

## 🌟 Features

- **Multi-Page Architecture**: Three distinct pages (Home, About, Download)
- **GitHub API Integration**: Dynamic release information and download links
- **Modern Design**: Professional black-themed design with gradient accents
- **Typing Animations**: Smooth typewriter effects for text display
- **Responsive Layout**: Optimized for all device sizes
- **Direct Downloads**: Real-time GitHub release file downloads
- **Social Integration**: Links to Discord, YouTube, and GitHub
- **Smooth Animations**: CSS animations and transitions throughout
- **Accessibility**: Keyboard navigation and reduced motion support
- **Auto-deployment**: GitHub Actions workflow for automatic deployment

## 🚀 Live Demo

The website is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## 📁 Project Structure

```
├── index.html              # Home page
├── about.html              # About cbot page
├── download.html           # Download page with GitHub API
├── css/
│   ├── style.css          # Main stylesheet
│   ├── animations.css     # Animation definitions
│   └── responsive.css     # Responsive design rules
├── js/
│   ├── main.js           # Core functionality
│   ├── downloads.js      # Download management (legacy)
│   └── github-api.js     # GitHub API integration
├── assets/
│   └── downloads/        # Static downloadable files
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions deployment
├── .gitignore           # Git ignore rules
└── README.md           # Project documentation
```

## 📄 Pages

### 🏠 Home Page (`index.html`)
- Hero section with cbot branding
- Feature highlights
- Call-to-action buttons
- Professional landing experience

### ℹ️ About Page (`about.html`)
- Detailed cbot information
- Feature explanations
- Benefits and capabilities
- Professional presentation

### 📥 Download Page (`download.html`)
- GitHub API integration
- Dynamic release information
- Real-time download links
- Installation guide
- Fallback content for API errors

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure across multiple pages
- **CSS3**: Modern styling with custom properties, flexbox, and grid
- **JavaScript (ES6+)**: Interactive functionality and GitHub API integration
- **GitHub API**: Dynamic release data fetching
- **GitHub Actions**: Automated deployment pipeline
- **GitHub Pages**: Static site hosting

## 🔗 GitHub API Integration

The download page dynamically fetches release information from the cbot repository:

- **Real-time Data**: Latest release version, description, and files
- **Direct Downloads**: Links to actual GitHub release assets
- **Error Handling**: Graceful fallback when API is unavailable
- **Caching**: Efficient API usage with proper error recovery
- **File Information**: File sizes, download counts, and metadata

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## ⚡ Performance Features

- Optimized CSS with custom properties
- Efficient JavaScript with event delegation
- Lazy loading for animations
- Minimal external dependencies
- Compressed assets

## 🎨 Customization

### Colors
Edit CSS custom properties in `css/style.css`:
```css
:root {
    --primary-color: #6366f1;
    --background-primary: #000000;
    --text-primary: #ffffff;
    /* ... more variables */
}
```

### Content
- Update social links in `index.html`
- Modify download items in `js/downloads.js`
- Add new sections by following existing patterns

### Animations
- Typing speed: Modify `typeText()` function in `js/main.js`
- Animation delays: Update `data-delay` attributes in HTML
- Custom animations: Add to `css/animations.css`

## 📦 Adding Downloads

1. Place files in `assets/downloads/` directory
2. Update the downloads map in `js/downloads.js`:
```javascript
this.downloads.set('filename.ext', {
    name: 'Display Name',
    size: 'File Size',
    description: 'Description',
    url: 'assets/downloads/filename.ext',
    type: 'mime/type'
});
```
3. Add corresponding HTML card in `index.html`

## 🚀 Deployment

### Automatic Deployment
The site automatically deploys to GitHub Pages when you:
1. Push changes to the main branch
2. The GitHub Actions workflow runs
3. Site updates within minutes

### Manual Deployment
1. Enable GitHub Pages in repository settings
2. Select "GitHub Actions" as the source
3. Push changes to trigger deployment

## 🔧 Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Open `index.html` in a web browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. Navigate to `http://localhost:8000`

## 🌐 Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support:
- Discord: [Join Server](https://discord.gg/cpZpH75ajv)
- YouTube: [Visit Channel](https://youtube.com/@snopphin?si=V63UTu4bZspr3frz)
- GitHub: [View Profile](https://github.com/therealsnopphin)

## 🔄 Updates

The website includes:
- Automatic dependency updates
- Security patches
- Performance improvements
- New feature additions

Check the repository for the latest updates and releases.
