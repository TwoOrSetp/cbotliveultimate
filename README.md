# CBot Website

A modern, responsive website for the CBot Minecraft client built with Vite, vanilla JavaScript, and modern CSS.

## 🚀 Features

- **Modern Design**: Clean, professional interface with dark theme
- **Responsive Layout**: Optimized for all device sizes
- **Performance Optimized**: Built with Vite for fast loading
- **SEO Friendly**: Proper meta tags and semantic HTML
- **Accessibility**: WCAG compliant design
- **Smooth Animations**: CSS animations and JavaScript interactions
- **GitHub Actions**: Automated building and deployment

## 🛠️ Tech Stack

- **Build Tool**: Vite
- **Styling**: Modern CSS with CSS Grid and Flexbox
- **JavaScript**: Vanilla ES6+ modules
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📁 Project Structure

```
cbot/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions workflow
├── src/
│   ├── styles/
│   │   └── main.css          # Main stylesheet
│   ├── js/
│   │   └── main.js           # JavaScript functionality
│   └── index.html            # Main HTML file
├── .eslintrc.js              # ESLint configuration
├── .gitignore                # Git ignore rules
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cbot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🔧 Configuration

### Vite Configuration

The project uses Vite for building and development. Configuration is in `vite.config.js`:

- **Root**: `src/` directory
- **Output**: `dist/` directory
- **Base**: Relative paths for GitHub Pages compatibility
- **Legacy Support**: Included for older browsers

### ESLint Configuration

Code quality is maintained with ESLint. Rules are configured in `.eslintrc.js`:

- ES2021 syntax support
- Browser and Node.js environments
- Consistent code formatting
- Error prevention rules

## 🚀 Deployment

### GitHub Pages (Automatic)

The website automatically deploys to GitHub Pages when code is pushed to the main branch:

1. Push code to the main branch
2. GitHub Actions builds the site
3. Deploys to `https://username.github.io/repository-name`

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist/` folder to your hosting provider

## 🔄 GitHub Actions Workflow

The `.github/workflows/build.yml` file includes:

- **Multi-Node Testing**: Tests on Node.js 18.x and 20.x
- **Dependency Caching**: Faster builds with npm cache
- **Code Quality**: ESLint checking
- **Security Scanning**: npm audit for vulnerabilities
- **Lighthouse CI**: Performance testing on PRs
- **Automatic Deployment**: To GitHub Pages on main branch

### Workflow Triggers

- Push to main/master branch
- Pull requests to main/master branch
- Manual workflow dispatch

## 🎨 Customization

### Colors and Theming

Edit CSS custom properties in `src/styles/main.css`:

```css
:root {
  --primary-color: #00ff88;
  --secondary-color: #0066cc;
  --dark-bg: #0a0a0a;
  /* ... other variables */
}
```

### Content

- **HTML**: Edit `src/index.html`
- **Styles**: Modify `src/styles/main.css`
- **JavaScript**: Update `src/js/main.js`

### Adding New Pages

1. Create new HTML files in `src/`
2. Update `vite.config.js` input configuration
3. Add navigation links in the header

## 🔍 Performance

The website is optimized for performance:

- **Vite**: Fast build tool with HMR
- **CSS**: Optimized with modern features
- **JavaScript**: ES6+ modules with tree shaking
- **Images**: Optimized loading and formats
- **Caching**: Proper cache headers and strategies

## 🛡️ Security

Security measures included:

- **Dependency Scanning**: npm audit in CI/CD
- **ESLint**: Code quality and security rules
- **HTTPS**: Enforced on GitHub Pages
- **CSP**: Content Security Policy headers

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Legacy browser support is included via Vite's legacy plugin.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions
