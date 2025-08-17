# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mirror Web CLI v1.0 is a **professional website mirroring tool** with intelligent framework preservation capabilities. The tool features **comprehensive framework detection**, **beautiful modern terminal UI**, and **advanced asset optimization** for creating offline-ready websites.

### ✨ **Version 1.0 - Production Ready Release**

- **🎯 Comprehensive JSDoc Documentation**: All modules fully documented with detailed API documentation, examples, and usage patterns
- **🎨 Modern Terminal UI**: Professional gradient-based interface with progress tracking, animated spinners, and status cards
- **⚡ Enhanced Framework Detection**: Supports 14+ frameworks with intelligent pattern matching and confidence scoring
- **🔧 Professional Code Organization**: Well-structured modular architecture with clear separation of concerns
- **📦 Complete Package Metadata**: Version 1.0.0 with comprehensive npm package configuration and platform support
- **🛡️ Security & Privacy**: Advanced tracking removal with comprehensive database of analytics and monitoring scripts
- **🎥 Advanced Video Support**: Comprehensive video and audio handling with 14+ formats, extended timeouts, and proper URL rewriting

## Common Commands

```bash
# Run the CLI tool (Production Usage)
npm start <url> [options]

# Quick testing and validation
npm test

# Development commands
npm run dev -- <url> [options]

# Build verification
npm run build-check

# Syntax validation
npm run lint

# Demo command
npm run demo
```

### CLI Usage Examples

```bash
# Mirror any website with framework preservation
node src/cli.js https://example.com

# Clean mirror without tracking scripts
node src/cli.js https://react-site.com --clean

# Custom output directory with debug logging
node src/cli.js https://nextjs-app.com -o ./my-project --debug

# AI-powered analysis (requires OPENAI_API_KEY)
node src/cli.js https://vue-app.com --ai --clean

# Complex site with extended timeout
node src/cli.js https://complex-site.com --timeout 180000 --debug

# Video-rich websites (VS Code, Apple, etc.)
node src/cli.js https://code.visualstudio.com --clean
```

## Core Architecture

### Main Components

- **`src/cli.js`**: Professional CLI entry point with comprehensive argument parsing and enhanced help system
- **`src/core/mirror-cloner.js`**: Main orchestrator class managing the complete mirroring workflow
- **`src/core/browser-engine.js`**: Puppeteer browser automation with optimized settings
- **`src/core/framework-analyzer.js`**: Advanced framework detection engine supporting 14+ frameworks
- **`src/core/asset-manager.js`**: Comprehensive asset extraction and processing system
- **`src/core/framework-writer.js`**: Output generation with framework-preserving structure
- **`src/core/display.js`**: Modern terminal UI system with gradients, animations, and progress tracking
- **`src/core/logger.js`**: Professional logging system with warning suppression and debug modes
- **`src/ai/ai-analyzer.js`**: Optional AI-powered website analysis using OpenAI GPT-4o API

### Key Classes

1. **MirrorCloner**: Main orchestrator for the mirroring process
   - Coordinates all aspects of website mirroring workflow
   - Manages browser automation, framework detection, and asset processing
   - Provides comprehensive error handling and progress tracking
   - Generates professional project structure with framework preservation

2. **FrameworkAnalyzer**: Advanced framework detection system
   - **14+ Framework Support**: React, Next.js, Gatsby, Vue, Nuxt, Angular, Svelte, WordPress, Shopify, jQuery, Bootstrap
   - **7 Detection Methods**: Script analysis, DOM inspection, meta tags, content patterns, CSS classes, attributes, links
   - **Confidence Scoring**: HIGH (90%+), MEDIUM (60%+), LOW (30%+)
   - **Extensible Architecture**: Pattern-based system for easy framework additions

3. **AssetManager**: Comprehensive asset extraction and processing
   - Handles all asset types: images, stylesheets, scripts, fonts, icons, **videos, audio**
   - **Advanced Video Support**: 14+ formats (.mp4, .webm, .ogg, .avi, .mov, .wmv, .flv, .mkv, .m4v, .3gp, .ogv)
   - **Audio Support**: 9+ formats (.mp3, .wav, .ogg, .aac, .flac, .m4a, .wma, .opus, .oga)
   - **Smart URL rewriting** for offline functionality including video sources
   - **Intelligent filename generation** with hashing and proper extensions
   - **Configurable tracking script removal** with extensive database
   - **Video-specific processing**: Poster image extraction, source element handling, extended timeouts

4. **Display**: Modern terminal UI system
   - **Professional Design**: Modern gradients and typography inspired by shadcn/ui
   - **Rich Components**: Headers, progress bars, status cards, and animated spinners
   - **Responsive Layout**: Adapts to terminal width with optimal spacing
   - **Animation System**: Smooth transitions and visual feedback
   - **Brand Consistency**: Professional color scheme and visual hierarchy

### Universal Output Format

**All websites are converted to standard HTML/CSS/JS regardless of source framework:**

```Plaintext
output-dir/
├── index.html    # Universal HTML converted from any framework
├── styles.css    # CSS extracted and converted from React/Vue/Angular/etc.
└── script.js     # Vanilla JS with modern features and framework functionality
```

**Key Benefits:**

- ✅ **Framework Independence**: Works with any hosting provider
- ✅ **Maximum Compatibility**: Runs on any web server without dependencies
- ✅ **Lightning Performance**: No framework overhead or runtime bundles
- ✅ **Easy Maintenance**: Standard web technologies that any developer can modify
- ✅ **Universal Deployment**: Deploy anywhere without build processes

## AI Integration

### Environment Setup

The AI features require an OpenAI API key:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

### AI Analysis Flow

1. **Website Content Extraction**: Puppeteer captures full page content from any framework
2. **Framework Detection**: Analyzes for React/Vue/Angular/Next.js/Nuxt patterns
3. **Chain-of-Thought Analysis**: AI reasoning process for optimal conversion strategy
4. **Framework Conversion**: Intelligent conversion of framework-specific code to vanilla HTML/CSS/JS
5. **Asset Optimization**: Smart asset bundling and optimization for universal output

### AI Models Used

- **gpt-4o**: For website analysis and asset optimization
- Temperature: 0.1 for consistent, logical reasoning

## Video & Media Handling Implementation

### Video Asset Extraction (AssetManager)

The video handling system is implemented in `src/core/asset-manager.js` with comprehensive support:

**Video Extraction Process:**

1. **Direct Video Sources**: Extracts `src` attributes from `<video>` elements
2. **Source Elements**: Processes `<source>` children within `<video>` tags
3. **Poster Images**: Automatically extracts and links video poster images
4. **Audio Support**: Similar processing for `<audio>` elements and sources
5. **Format Detection**: Intelligent detection of 14+ video and 9+ audio formats

**Supported Video Formats:**

```javascript
const videoExtensions = [
  '.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', 
  '.flv', '.mkv', '.m4v', '.3gp', '.ogv'
];
```

**Supported Audio Formats:**

```javascript
const audioExtensions = [
  '.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', 
  '.wma', '.opus', '.oga'
];
```

### Video Download & Processing (FrameworkWriter)

**Enhanced Download System:**

- **Extended Timeouts**: 2 minutes for videos, 1 minute for audio (vs 45 seconds for other assets)
- **Progress Tracking**: Individual video download progress with file sizes
- **Format-Specific Headers**: Optimized accept headers for video/audio content
- **Error Handling**: Graceful fallbacks for failed video downloads
- **Organized Output**: Separate processing for videos, audio, and other media

**Download Configuration:**

```javascript
const timeout = mediaType === 'video' ? 120000 : 60000; // Extended timeouts
const headers = {
  'Accept': mediaType === 'video' 
    ? 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
    : 'audio/webm,audio/ogg,audio/wav,audio/*;q=0.9,application/ogg;q=0.7,*/*;q=0.5'
};
```

### Video URL Rewriting

**Critical Fix Implemented:**

The framework-writer now properly rewrites video source URLs:

```javascript
// Video and Audio sources
$('video[src], audio[src], source[src]').each((_, el) => {
  const $el = $(el);
  const src = $el.attr('src');
  if (!src || src.startsWith('data:')) return;
  
  const abs = this.cloner.resolveUrl(src);
  if (this.assetMappings.has(abs)) {
    const local = this.assetMappings.get(abs);
    $el.attr('src', local); // Rewrites to ./assets/media/filename
  }
});
```

**Before Fix:**
```html
<source src="/assets/home/hero-dark-lg.webm" type="video/webm">
```

**After Fix:**
```html
<source src="./assets/media/hero-dark-lg_229cf5f509.webm" type="video/webm">
```

### Real-World Test Case: VS Code Website

**Successfully handles:**
- 8 video files (113MB total)
- Multiple formats (.mp4, .webm) 
- Responsive video sources with media queries
- Poster images automatically extracted
- Complex video controls and JavaScript preserved

**Example Output Structure:**
```
assets/media/
├── hero-dark-lg_074ae2ca66.mp4     (23.7MB)
├── hero-dark-lg_229cf5f509.webm    (6.1MB)
├── hero-dark-sm_a61b580e1f.mp4     (21.8MB)
├── hero-dark-sm_2add821906.webm    (2.7MB)
├── hero-light-lg_8ffb5fcc0e.mp4    (26.0MB)
├── hero-light-lg_ba3e75ac69.webm   (7.0MB)
├── hero-light-sm_e674932e7a.mp4    (23.7MB)
└── hero-light-sm_569a5d92c0.webm   (3.0MB)
```

## Code Patterns

### ES6 Module Structure

The project uses ES6 modules (`"type": "module"` in package.json):

- Use `import/export` syntax
- File extensions required in imports: `'./cloner.js'`
- No CommonJS `require()` statements

### Error Handling

- Graceful degradation when AI features fail
- Non-AI fallback for all core functionality
- Clear error messages with colored output (chalk)

### Asset Processing

- Filters out tracking scripts (gtag, analytics, facebook, etc.)
- Extracts inline CSS and JavaScript
- Processes images with alt text and classes
- Generates responsive CSS framework

### Clean Code Generation

- Removes analytics and tracking code
- Strips data attributes (data-gtm, data-ga, data-fb)
- Adds responsive design patterns
- Implements modern JavaScript features (smooth scrolling, lazy loading)

## Dependencies

### Core Dependencies

- **puppeteer**: Headless browser automation
- **cheerio**: Server-side jQuery-like DOM manipulation
- **commander**: CLI argument parsing
- **chalk**: Terminal colors and formatting
- **fs-extra**: Enhanced file system operations

### AI Dependencies

- **openai**: OpenAI API client
- **dotenv**: Environment variable management

## Development Guidelines

### Testing

- Use `npm test` to run the test suite
- Tests cover HTML output, React output, and AI analysis
- Includes cleanup of test directories
- AI tests require OPENAI_API_KEY environment variable

### Adding New Features

1. Maintain ES6 module patterns
2. Add AI fallback for any AI-enhanced features
3. Update test suite for new functionality
4. Follow existing error handling patterns
5. Use chalk for consistent terminal output

### Security Considerations

- Never commit API keys or secrets
- Validate URLs before processing
- Sanitize extracted content
- Remove all tracking and analytics code from outputs

## File Structure Conventions

- **Source files**: `src/` directory with ES6 modules
- **Examples**: `examples/` for demo scripts
- **Tests**: `test/` directory with comprehensive coverage
- **Documentation**: `docs/` for implementation guides
- **Environment**: `.env.example` template for configuration

## Performance Notes

- Puppeteer launches in headless mode for speed
- AI analysis is optional and can be disabled
- Asset optimization reduces download time by ~60%
- Generated code includes performance optimizations (lazy loading, smooth scrolling)

## Claude Code-Style Animations

### Available Animation Methods

```javascript
import { ClaudeDisplay } from './src/display.js';
const display = new ClaudeDisplay();

// Core Claude Code animations
display.mustering("Mustering", 3000);           // Exact "Mustering..." animation from Claude Code
display.thinking("Thinking", 2000);             // "Thinking..." with brain animations
display.preparing("Preparing", 2500);           // "Preparing..." with progress bars
display.retrying(1, 10, "Connection error");    // API retry messages
display.fileOperation("Update", "src/file.js", "success"); // File operations

// Progress and status
display.stepProgress(3, 5, "Processing", "Details");
display.success("Success message", "Additional details");
display.errorMessage("Error", "Error details");
```

### Demo Script

Run the complete Claude Code animation demo:

```bash
node demo-claude-style.js
```

This showcases all available animations with exact Claude Code styling and timing.

## Troubleshooting

### Common Issues

1. **"Cannot read properties of undefined (reading 'replace')" Error**
   - **Fixed in v2.2**: This error has been resolved through comprehensive constructor fixes
   - **Root Cause**: Was caused by undefined outputDir in filesystem operations
   - **Solution**: Enhanced parameter handling in `TechStackCloner` constructor

2. **API Connection Errors**
   - **Description**: "API Error (Connection error.) · Retrying in 1 seconds…"
   - **Cause**: Network connectivity issues or OpenAI API rate limits
   - **Solution**: These are temporary and will auto-retry; ensure stable internet connection

3. **Framework Detection Issues**
   - **Solution**: Use `--debug` flag to see detailed detection process
   - **Alternative**: Disable detection with `--no-detect` flag

4. **Memory Issues with Large Sites**
   - **Solution**: Use `--clean` flag to reduce memory usage
   - **Alternative**: Process specific sections rather than entire sites

### Debug Mode

Enable comprehensive logging:

```bash
node src/cli.js <url> --debug
```

This provides detailed information about:
- Framework detection results
- Asset extraction process
- File system operations
- Error stack traces
