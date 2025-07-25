# Professional Portfolio Website

A modern, responsive portfolio website built with vanilla HTML, CSS, and JavaScript. Features a sleek black theme, typing animations, and direct file download functionality.

## 🌟 Features

- **Modern Design**: Professional black-themed design with gradient accents
- **Typing Animations**: Smooth typewriter effects for text display
- **Responsive Layout**: Optimized for all device sizes
- **Direct Downloads**: File download functionality without GitHub redirects
- **Social Integration**: Links to Discord, YouTube, and GitHub
- **Smooth Animations**: CSS animations and transitions throughout
- **Accessibility**: Keyboard navigation and reduced motion support
- **Auto-deployment**: GitHub Actions workflow for automatic deployment

## 🚀 Live Demo

The website is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## 📁 Project Structure

```
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Main stylesheet
│   ├── animations.css     # Animation definitions
│   └── responsive.css     # Responsive design rules
├── js/
│   ├── main.js           # Core functionality
│   └── downloads.js      # Download management
├── assets/
│   └── downloads/        # Downloadable files directory
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions deployment
├── .gitignore           # Git ignore rules
└── README.md           # Project documentation
```

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with custom properties, flexbox, and grid
- **JavaScript (ES6+)**: Interactive functionality and animations
- **GitHub Actions**: Automated deployment pipeline
- **GitHub Pages**: Static site hosting

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
