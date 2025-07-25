# 🎮 Cbot Website

[![Build and Deploy](https://github.com/therealsnopphin/cbot/actions/workflows/build.yml/badge.svg)](https://github.com/therealsnopphin/cbot/actions/workflows/build.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://therealsnopphin.github.io/cbot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Advanced Geometry Dash Mod Website** - Professional, modern, and feature-rich website for the Cbot Geometry Dash automation tool.

## 🌟 Features

### ✨ **Modern Design**
- **Responsive Layout** - Perfect on all devices
- **Dark/Light Themes** - Multiple theme options including Anime Aura
- **Smooth Animations** - Advanced typing effects and transitions
- **Professional UI** - Clean, modern interface design

### 🚀 **Advanced Functionality**
- **Direct Downloads** - Automatic file downloads from GitHub releases
- **Real-time Updates** - Live release information fetching
- **Performance Optimized** - Fast loading and smooth interactions
- **Cross-browser Compatible** - Works on all modern browsers

### 🎨 **Interactive Elements**
- **Typing Animations** - Matrix, glitch, and typewriter effects
- **Particle Systems** - Dynamic background animations
- **Theme Switching** - Instant theme changes with animations
- **Loading Screens** - Beautiful loading animations with progress

### 📱 **Mobile Experience**
- **Touch Optimized** - Perfect mobile navigation
- **Responsive Design** - Adapts to any screen size
- **Fast Performance** - Optimized for mobile devices

## 🛠️ Technology Stack

- **Frontend**: Pure JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Package Manager**: npm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/therealsnopphin/cbot.git
cd cbot

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📁 Project Structure

```
cbot/
├── src/
│   ├── app/                 # Core application logic
│   │   ├── Application.js   # Main application class
│   │   └── CbotManager.js   # Download management
│   ├── utils/               # Utility classes
│   │   ├── EventEmitter.js  # Event system
│   │   ├── LoadingManager.js # Loading screens
│   │   ├── ThemeManager.js  # Theme switching
│   │   ├── TypingAnimation.js # Text animations
│   │   └── ...              # Other utilities
│   ├── styles/              # CSS styles
│   │   └── main.css         # Main stylesheet
│   └── main.js              # Application entry point
├── .github/                 # GitHub configuration
│   ├── workflows/           # GitHub Actions
│   ├── ISSUE_TEMPLATE/      # Issue templates
│   └── ...                  # Other GitHub files
├── dist/                    # Production build output
├── public/                  # Static assets
├── index.html               # Main HTML file
├── package.json             # Dependencies and scripts
└── vite.config.js           # Build configuration
```

## 🎯 Key Components

### **Application Core**
- `Application.js` - Main application initialization and management
- `CbotManager.js` - GitHub release fetching and download handling
- `main.js` - Entry point and component orchestration

### **User Interface**
- `ThemeManager.js` - Dynamic theme switching system
- `TypingAnimation.js` - Advanced text animation effects
- `LoadingManager.js` - Loading screens and progress tracking

### **Performance**
- `PerformanceMonitor.js` - Real-time performance tracking
- `EventEmitter.js` - Efficient event management system

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality.

### Build Configuration
- `vite.config.js` - Vite build settings
- `package.json` - Dependencies and scripts
- `.github/workflows/build.yml` - CI/CD pipeline

## 🚀 Deployment

### Automatic Deployment
The website automatically deploys to GitHub Pages when you push to the main branch.

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting service
```

### GitHub Pages Setup
1. Enable GitHub Pages in repository settings
2. Set source to "GitHub Actions"
3. Push to main branch to trigger deployment

## 🧪 Testing

### Local Testing
```bash
# Start development server
npm run dev

# Build and preview
npm run build
npm run preview
```

### Automated Testing
- **GitHub Actions** - Automatic testing on push/PR
- **Multi-browser Testing** - Chrome, Firefox, Safari, Edge
- **Performance Testing** - Bundle size and Lighthouse audits
- **Security Scanning** - Dependency vulnerability checks

## 🎨 Customization

### Adding New Themes
1. Edit `src/utils/ThemeManager.js`
2. Add theme colors and configuration
3. Update CSS variables in `src/styles/main.css`

### Modifying Animations
1. Edit `src/utils/TypingAnimation.js` for text effects
2. Update `src/utils/AnimeAuraBackground.js` for background animations
3. Modify CSS animations in `src/styles/main.css`

### Adding New Pages
1. Create new HTML files in the root directory
2. Update navigation in `index.html`
3. Add routing logic in `src/utils/PageManager.js`

## 📊 Performance

- **Bundle Size**: ~63KB (modern) / ~127KB (legacy)
- **Load Time**: <2 seconds on 3G
- **Lighthouse Score**: 95+ Performance
- **Mobile Optimized**: Perfect mobile experience

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Test on multiple browsers
- Ensure mobile compatibility
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vite** - Fast build tool
- **GitHub Pages** - Free hosting
- **GitHub Actions** - CI/CD pipeline
- **Modern Web APIs** - For advanced functionality

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/therealsnopphin/cbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/therealsnopphin/cbot/discussions)
- **Discord**: [Join our Discord](https://discord.gg/cpZpH75ajv)

## 🔗 Links

- **Live Website**: [https://therealsnopphin.github.io/cbot](https://therealsnopphin.github.io/cbot)
- **GitHub Repository**: [https://github.com/therealsnopphin/cbot](https://github.com/therealsnopphin/cbot)
- **Cbot Releases**: [https://github.com/therealsnopphin/CBot/releases](https://github.com/therealsnopphin/CBot/releases)

---

**Made with ❤️ for the Geometry Dash community**
