# 🪞 Mirror Web CLI v1.0

## Professional Website Mirroring with Intelligent Framework Preservation

A powerful, universal website mirroring tool that intelligently detects and preserves framework structures while creating offline-ready websites. Works seamlessly with React, Next.js, Vue, Angular, Svelte, WordPress, and static sites.

## ✨ Key Features

🧠 **Intelligent Framework Detection**

- Automatically detects 14+ frameworks (React, Vue, Angular, Next.js, Nuxt, Gatsby, Svelte, etc.)
- Comprehensive pattern matching with confidence scoring
- Framework-specific optimization strategies

🎨 **Beautiful Terminal Experience**

- Modern UI with gradient effects and smooth animations
- Professional progress tracking with step-by-step indicators
- Color-coded status messages and comprehensive feedback

⚡ **Advanced Asset Processing**

- Complete asset extraction and optimization (images, CSS, JS, fonts, icons, **videos**)
- Smart URL rewriting for offline functionality
- Framework-preserving structure generation
- **Comprehensive video support** with 14+ video formats (.mp4, .webm, .ogg, etc.)

🧹 **Clean Code Generation**

- Optional tracking script removal (analytics, GTM, Facebook Pixel)
- Professional project structure ready for development
- Offline-ready websites with localized resources
- **Next.js/React error handling** for graceful offline operation

## 🚀 Quick Start

### Installation

```bash
# Global installation (recommended)
npm install -g mirror-web-cli

# Or run directly with npx (no installation required)
npx mirror-web-cli https://example.com
```

### OpenAI API Setup (Optional)

For AI-powered website analysis, you'll need an **OpenAI API key**:

```bash
# Option 1: Set environment variable (recommended)
export OPENAI_API_KEY="sk-proj-your-openai-key-here"

# Option 2: Pass as parameter
mirror-web-cli https://example.com --ai --openai-key "sk-proj-your-key-here"
```

**Requirements:**

- Only **OpenAI API keys** are supported (must start with `sk-`)
- Uses OpenAI GPT-4o model for intelligent analysis
- **Get your API key**: [OpenAI Platform](https://platform.openai.com/api-keys)

### Basic Usage

```bash
# Mirror any website with framework preservation
mirror-web-cli https://example.com

# Clean mirror without tracking scripts
mirror-web-cli https://react-site.com --clean

# Custom output directory
mirror-web-cli https://vue-app.com -o ./my-project

# Debug mode with detailed logging
mirror-web-cli https://complex-site.com --debug
```

### Serving the Output

```bash
# The tool generates a complete project structure
cd ./example.com

# Use the built-in server (if available)
npm start

# Or use any static server
python -m http.server 8000
# Open http://localhost:8000
```

## 🎯 How It Works

### 1. **Intelligent Page Loading**

- Launches headless browser with optimized settings
- Waits for framework-specific elements (#__next, #root, #app)
- Performs scroll-to-bottom for lazy-loaded content
- Waits for images and network idle state

### 2. **Framework Analysis Engine**

```Plaintext
📊 Detection Methods:
├── Script Source Analysis    → Framework bundles & runtime files
├── DOM Element Inspection   → Framework-specific containers  
├── Meta Tag Analysis        → Generator tags & signatures
├── Content Pattern Matching → Component structures
├── CSS Class Analysis       → Framework styling patterns
├── JSON Data Detection      → State management structures
└── Link Href Analysis       → Framework asset paths
```

### 3. **Comprehensive Asset Extraction**

```Plaintext
🎯 Asset Categories:
├── 🖼️  Images     → src, srcset, lazy attributes, backgrounds
├── 🎨 Stylesheets → External CSS + inline styles with url() rewriting
├── ⚙️  Scripts    → External JS + inline scripts (with optional cleaning)
├── 🔠 Fonts      → Web fonts and icon fonts
├── 🎭 Icons      → Favicons and app icons
└── 🎥 Media      → Videos (.mp4, .webm, .ogg, .avi, .mov, etc.), audio files
```

### 4. **Smart URL Rewriting**

- Converts all absolute URLs to relative paths
- Creates organized asset directory structure
- Generates short, stable, hashed filenames
- Maintains proper file extensions and MIME types

### 5. **Framework-Preserving Output**

```Plaintext
📁 Output Structure:
website.com/
├── index.html           # Main page with framework intact
├── package.json         # Project metadata & serve scripts
├── README.md           # Usage instructions
├── server.js           # Optional Node.js static server
└── assets/
    ├── images/         # All images with optimized names
    ├── css/           # Stylesheets with localized assets
    ├── js/            # JavaScript files (cleaned if --clean)
    ├── fonts/         # Web fonts and typography
    ├── icons/         # Favicons and app icons
    └── media/         # Videos (.mp4, .webm, .ogg), audio files, and other media
```

## Next.js + Microlink offline support (v1.0.2)

Modern sites often use:

- Next.js Image Optimizer: `/_next/image?url=<original>&w=<size>&q=<quality>`
- Microlink-based previews: `https://api.microlink.io/?url=...` returning either JSON or direct images

This tool:

- Skips downloading `/_next/image` directly (avoids 402s)
- Extracts the original image URL from the `url=` param and downloads that
- Aliases `/_next/image?...` to the same local file as the original
- Injects a runtime MutationObserver rewriter that:
  - Rewrites `src`, `href`, `poster`, inline `style` background-image
  - Rewrites `srcset` and `imagesrcset` (browsers prefer srcset over src)
  - Handles dynamically added DOM (hover cards, popovers, etc.)
- Captures Microlink responses; if JSON, follows to the actual screenshot URL and downloads bytes

Verification

- Run with `--debug` and open DevTools Console
- Interact with the page (e.g., hover “Preview” links)
- Look for lines like:

  ```Plaintext
  [MW rewrite] imagesrcset: /_next/image?url=... -> ./assets/images/asset_dc814d3448.png 1x, ...
  ```
- Open the local asset path (e.g., [http://localhost:8000/assets/images/asset_dc814d3448.png](http://localhost:8000/assets/images/asset_dc814d3448.png))

### Troubleshooting (quick)

- Blank hover/popover preview
  - Serve over HTTP (not file://)
  - Ensure `srcset`/`imagesrcset` are being rewritten (use `--debug`)
  - Open the local asset URL from logs; if 404, rebuild the mirror

- HTTP 402 from Next.js `/_next/image`
  - Expected; the tool avoids these endpoints and downloads the original target from `url=`

- Helpful snippet to locate candidates:

  ```js
  document.querySelectorAll('img, [style]').forEach(n => {
    const src = n.currentSrc || n.getAttribute('src') || '';
    const styleAttr = n.getAttribute('style') || '';
    const bg = getComputedStyle(n).backgroundImage || '';
    const hay = [src, styleAttr, bg].join(' ');
    if (/(microlink|_next\/image|og|twitter|card)/i.test(hay)) {
      console.log('el:', n, { src, styleAttr, bg });
    }
  });
  ```

## 🔧 CLI Reference

```bash
Usage: mirror-web-cli <url> [options]

Arguments:
  url                     Target website URL to mirror

Options:
  -o, --output <dir>      Custom output directory (default: domain name)
  --clean                 Remove tracking scripts and analytics
  --ai                    Enable AI-powered analysis (requires OpenAI API key)
  --openai-key <key>      OpenAI API key for AI features (or set OPENAI_API_KEY env var)
  --debug                 Enable detailed debug logging
  --timeout <ms>          Page load timeout in milliseconds (default: 120000)
  --headless <bool>       Run browser in headless mode (default: true)
  -h, --help              Show help information
  -V, --version           Show version number
```

### OpenAI API Key Priority

The tool checks for OpenAI API keys in this order:

1. `--openai-key` command line parameter
2. `OPENAI_API_KEY` environment variable
3. If neither is found, AI features are disabled with a helpful message
4. Keys must start with `sk-` (validated automatically)

## 🏗️ Framework Support

| Framework | Detection | Preservation | Output Quality |
|-----------|-----------|--------------|----------------|
| **React** | ✅ High confidence | ✅ Component structure | ⭐⭐⭐⭐⭐ |
| **Next.js** | ✅ Advanced patterns | ✅ SSR/SSG structure | ⭐⭐⭐⭐⭐ |
| **Vue.js** | ✅ Reactive patterns | ✅ Template structure | ⭐⭐⭐⭐⭐ |
| **Nuxt** | ✅ SSR detection | ✅ Module organization | ⭐⭐⭐⭐⭐ |
| **Angular** | ✅ Component analysis | ✅ Module structure | ⭐⭐⭐⭐⭐ |
| **Svelte** | ✅ Store patterns | ✅ Component logic | ⭐⭐⭐⭐⭐ |
| **Gatsby** | ✅ GraphQL detection | ✅ Static generation | ⭐⭐⭐⭐⭐ |
| **WordPress** | ✅ Theme detection | ✅ Content structure | ⭐⭐⭐⭐ |
| **Static Sites** | ✅ Always works | ✅ Clean HTML/CSS/JS | ⭐⭐⭐⭐⭐ |

## 🧪 Usage Examples

### Basic Website Mirroring

```bash
# Simple static site
mirror-web-cli https://example.com
# → Creates: ./example.com/ with complete offline functionality
```

### React Application

```bash
# React SPA with complex routing
mirror-web-cli https://react-app.com --clean
# → Preserves React structure, removes tracking, offline-ready
```

### Next.js Website

```bash
# Next.js with image optimization
mirror-web-cli https://nextjs-site.com -o ./my-nextjs-mirror
# → Handles /_next/image URLs, preserves SSR structure
```

### E-commerce Site

```bash
# Complex site with lots of assets
mirror-web-cli https://shop.example.com --debug --clean
# → Detailed logging, removes analytics, preserves functionality
```

### AI-Powered Analysis (OpenAI)

```bash
# Using environment variable (recommended)
export OPENAI_API_KEY="sk-proj-your-openai-key-here"
mirror-web-cli https://complex-app.com --ai --clean
# → OpenAI GPT-4o analyzes framework patterns and optimizes conversion strategy

# Using command line parameter
mirror-web-cli https://react-app.com --ai --openai-key "sk-proj-..." --clean
# → One-time OpenAI API key usage for enhanced analysis
```

### Development Workflow

```bash
# Mirror for development reference
mirror-web-cli https://design-system.com -o ./reference
cd ./reference
npm start  # Built-in development server
```

### Video-Rich Websites

```bash
# Websites with hero videos (like VS Code, Apple, etc.)
mirror-web-cli https://code.visualstudio.com --clean
# → Downloads all video formats (.mp4, .webm), preserves video posters
# → Handles responsive video sources with media queries
# → Supports autoplay, muted, and poster attributes

# Complex video embedding
mirror-web-cli https://video-heavy-site.com --timeout 180000
# → Extended timeout for large video downloads
# → Maintains video element structure and JavaScript controls
```

## 🎨 Terminal UI Showcase

```Plaintext
════════════════════════════════════════════════════════════════════════════════
                        🪞 Mirror Web CLI v1.0
                     Professional Website Mirroring
════════════════════════════════════════════════════════════════════════════════

✨ Features:
   • Intelligent framework detection (React, Vue, Angular, Next.js, etc.)
   • Framework-preserving output with professional structure
   • Comprehensive asset extraction and optimization
   • Clean code generation with tracking script removal

🚀 Quick Start:
   mirror-web-cli https://example.com
   mirror-web-cli https://react-app.com --clean -o ./my-project
```

### Progress Tracking

```Plaintext
╭──────────────────────────────────────────────────────────────────────────────╮
  ● Step 3/7  •  Framework Analysis
  Detecting technology stack and framework patterns...
╰──────────────────────────────────────────────────────────────────────────────╯

╭──────────────────────────────────────────────────────────────────────────────╮
  📦 Framework Analysis
  Framework:    Next.js
  Confidence:   95% ████████████████████░
  Complexity:   HIGH
  Strategy:     Preserve DOM; localize assets for exact Next.js look
╰──────────────────────────────────────────────────────────────────────────────╯
```

## 🛡️ Privacy & Security

### Tracking Removal (--clean flag)

- **Google Analytics** (gtag, ga, analytics.js)
- **Google Tag Manager** (gtm, dataLayer)
- **Facebook Pixel** (fbevents, facebook.com/tr)
- **Service Workers** (registration scripts)
- **Third-party trackers** (extensive database)

### Safety Considerations

- Always respect robots.txt and terms of service
- Ensure you have permission to mirror content
- Use responsibly and ethically
- Consider rate limiting for large sites

## 🏗️ Architecture Overview

```Plaintext
src/
├── cli.js                    # Command-line interface & argument parsing
├── core/                     # Core functionality modules
│   ├── mirror-cloner.js      # Main orchestrator class
│   ├── browser-engine.js     # Puppeteer browser management
│   ├── framework-analyzer.js # Intelligent framework detection
│   ├── asset-manager.js      # Comprehensive asset extraction
│   ├── framework-writer.js   # Output generation & structure
│   ├── display.js           # Beautiful terminal UI system
│   ├── logger.js            # Logging & warning management
│   ├── file-writer.js       # File system operations
│   ├── filename-utils.js    # Smart filename generation
│   └── server.js            # Optional static server
└── ai/                      # AI-powered analysis (optional)
    └── ai-analyzer.js       # OpenAI integration for analysis
```

## 🧩 Extending the Tool

### Adding New Framework Detection

```javascript
// In src/core/framework-analyzer.js
this.frameworks.myframework = {
  name: 'My Framework',
  patterns: [
    { type: 'script', pattern: /myframework\.js/ },
    { type: 'element', selector: '#my-app' },
    { type: 'meta', name: 'generator', pattern: /myframework/i }
  ]
};
```

### Custom Asset Processing

```javascript
// In src/core/asset-manager.js
async extractCustomAssets() {
  // Add your custom asset extraction logic
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Development setup
git clone https://github.com/SanjeevSaniel/mirror-web-cli.git
cd mirror-web-cli
npm install

# Run tests
npm test

# Development with debugging
npm run dev -- https://example.com --debug
```

### Key Areas for Contribution

- **Framework Detection**: Add support for new frameworks
- **Asset Processing**: Improve extraction algorithms
- **Output Optimization**: Enhance generated code quality
- **Terminal UI**: Improve user experience
- **Documentation**: Help others understand the tool

## 🐛 Troubleshooting

### Common Issues

#### "Cannot read properties of undefined" Error

- Fixed in v1.0 - update to latest version
- Use `--debug` flag for detailed error information

#### Incomplete Asset Loading

- Increase timeout: `--timeout 180000` (3 minutes)
- Check network connectivity
- Some dynamic content may require JavaScript enabled

#### Framework Not Detected

- Use `--debug` to see detection process
- Framework patterns may need updating for newer versions
- Manual inspection may be needed for custom frameworks

### Getting Help

- Check the [GitHub Issues](https://github.com/SanjeevSaniel/mirror-web-cli/issues)
- Use `--debug` flag for detailed logging
- Include error output when reporting bugs

## 📊 Performance Stats

- **Average Processing Time**: 15-45 seconds per site
- **Asset Extraction Rate**: 95%+ success rate
- **Framework Detection Accuracy**: 90%+ for supported frameworks
- **Memory Usage**: Optimized for large sites (>1000 assets)

## 🙏 Acknowledgments

Special thanks to the amazing open-source community:

- **[Puppeteer](https://pptr.dev/)** - Headless browser automation
- **[Cheerio](https://cheerio.js.org/)** - Server-side HTML parsing
- **[Chalk](https://github.com/chalk/chalk)** - Terminal styling
- **[Commander](https://github.com/tj/commander.js)** - CLI framework
- **[Sharp](https://sharp.pixelplumbing.com/)** - Image processing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by [Sanjeev Saniel Kujur](https://github.com/SanjeevSaniel)**

*Convert any website to universal HTML/CSS/JS with intelligent framework preservation!*
