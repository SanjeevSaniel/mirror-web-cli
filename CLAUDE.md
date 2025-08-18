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

## CLI Syntax & Usage Patterns

### Complete CLI Syntax
```bash
node src/cli.js <url> [options]
```

### Command Line Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `<url>` | string | **Required** - Website URL to mirror | - |
| `-o, --output` | string | Output directory for mirrored files | `./domain-standard` or `./domain-ai-enhanced` |
| `--clean` | boolean | Remove tracking scripts and analytics | `false` |
| `--ai` | boolean | Enable AI-powered analysis (requires OpenAI API key) | `false` |
| `--debug` | boolean | Enable detailed logging and debug information | `false` |
| `--timeout` | number | Timeout in milliseconds for page loading | `120000` (2 min) |
| `--help` | boolean | Display help information | - |
| `--version` | boolean | Display version information | - |

### Output Directory Naming

Mirror Web CLI automatically differentiates output directories based on whether AI analysis is used:

- **Standard Mirroring**: `./domain-standard` (e.g., `./example.com-standard`)
- **AI-Enhanced Mirroring**: `./domain-ai-enhanced` (e.g., `./example.com-ai-enhanced`)
- **Custom Output**: Uses your specified directory path (overrides automatic naming)

This allows you to easily compare standard vs AI-enhanced outputs and organize your projects.

### Usage Examples by Category

#### **Basic Mirroring**
```bash
# Simple website mirror (outputs to example.com-standard)
node src/cli.js https://example.com

# Mirror to specific directory
node src/cli.js https://company-site.com -o ./company-mirror

# Mirror with debug logging (outputs to portfolio.dev-standard)
node src/cli.js https://portfolio.dev --debug
```

#### **Clean Mirroring (Recommended)**
```bash
# Remove tracking scripts and analytics (outputs to blog-site.com-standard)
node src/cli.js https://blog-site.com --clean

# Clean mirror with custom output
node src/cli.js https://news-site.com --clean -o ./news-clean

# Clean mirror with debug info (outputs to e-commerce.com-standard)
node src/cli.js https://e-commerce.com --clean --debug
```

#### **AI-Enhanced Mirroring**

**Windows PowerShell:**
```powershell
# Set OpenAI API key first
$env:OPENAI_API_KEY="sk-your-api-key-here"

# AI analysis for optimal conversion (outputs to react-app.com-ai-enhanced)
node src/cli.js https://react-app.com --ai
```

**macOS/Linux (Bash/Zsh):**
```bash
# Set OpenAI API key first
export OPENAI_API_KEY="sk-your-api-key-here"

# AI analysis for optimal conversion (outputs to react-app.com-ai-enhanced)
node src/cli.js https://react-app.com --ai
```

**Cross-platform examples:**
```bash
# AI + clean + custom output
node src/cli.js https://vue-app.dev --ai --clean -o ./ai-optimized

# AI with debugging (outputs to complex-spa.com-ai-enhanced)
node src/cli.js https://complex-spa.com --ai --debug
```

#### **Framework-Specific Examples**
```bash
# React applications
node src/cli.js https://react-site.com --clean

# Next.js applications (JavaScript disabled for compatibility)
node src/cli.js https://nextjs-app.com --clean --debug

# Vue.js applications
node src/cli.js https://vue-app.dev --clean

# Angular applications
node src/cli.js https://angular-site.io --clean

# Static sites with interactive elements
node src/cli.js https://jquery-site.com --clean
```

#### **Complex Sites & Media**
```bash
# Video-rich websites (extended timeout)
node src/cli.js https://code.visualstudio.com --clean --timeout 300000

# Large e-commerce sites
node src/cli.js https://shop-site.com --clean --timeout 180000 --debug

# Media-heavy portfolios
node src/cli.js https://photographer.com --clean -o ./portfolio
```

#### **Production & Development**
```bash
# Production mirroring
npm start https://production-site.com --clean

# Development testing
npm run dev -- https://test-site.dev --debug

# Quick validation
npm test

# Lint checking
npm run lint
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

## AI Integration & Features

### AI Usage Overview

The Mirror Web CLI includes **optional AI-powered analysis** using OpenAI's GPT-4o model. **AI features are completely optional** and the tool works fully without them.

#### **Core vs AI Functionality**

| Feature | Core (No AI) | AI-Enhanced |
|---------|-------------|-------------|
| Website Mirroring | ✅ Full functionality | ✅ Enhanced optimization |
| Framework Detection | ✅ 14+ frameworks | ✅ + AI validation |
| Asset Processing | ✅ Complete | ✅ + Smart optimization |
| Offline Compatibility | ✅ Yes | ✅ Yes |
| API Key Required | ❌ No | ✅ OpenAI API key |
| Cost | 🆓 Free | 💰 OpenAI API usage |

### When to Use AI Features

#### **Use AI When:**
- Complex SPA applications with intricate state management
- Unusual or custom framework implementations
- Sites with complex asset dependencies
- Need optimization recommendations
- Working with experimental frameworks

#### **Skip AI For:**
- Simple static websites
- Standard React/Vue/Angular applications
- Quick testing and prototyping
- Bandwidth-limited environments
- Cost-sensitive projects

### Environment Setup

**Step 1: Get OpenAI API Key**
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create an account and generate an API key
3. Add billing information (usage-based pricing)

**Step 2: Set Environment Variable**
```bash
# Linux/macOS
export OPENAI_API_KEY="sk-your-api-key-here"

# Windows CMD
set OPENAI_API_KEY=sk-your-api-key-here

# Windows PowerShell
$env:OPENAI_API_KEY="sk-your-api-key-here"

# .env file (create in project root)
OPENAI_API_KEY=sk-your-api-key-here
```

**Step 3: Verify Setup**
```bash
# Test with AI analysis
node src/cli.js https://example.com --ai --debug
```

### AI Analysis Process

When `--ai` flag is used, the tool follows this enhanced workflow:

```
1. Standard Mirroring → 2. AI Analysis → 3. Optimization → 4. Enhanced Output
```

#### **Detailed AI Flow:**

1. **Website Content Extraction**: Puppeteer captures full page content from any framework
2. **Framework Detection**: Standard detection + AI validation and confidence scoring
3. **Chain-of-Thought Analysis**: AI reasoning process for optimal conversion strategy
4. **Asset Dependencies**: AI identifies complex asset relationships and dependencies
5. **Framework Conversion**: Intelligent conversion strategies for framework-specific code
6. **Performance Optimization**: AI suggests and applies performance improvements
7. **Compatibility Enhancement**: AI ensures cross-browser and offline compatibility

### AI Models & Configuration

- **Model**: OpenAI GPT-4o
- **Temperature**: 0.1 (consistent, logical reasoning)
- **Max Tokens**: Dynamically adjusted based on content complexity
- **Timeout**: 30 seconds per analysis request
- **Fallback**: Automatic fallback to core functionality if AI fails

### AI Cost Estimation

Typical costs for different website types:

| Website Type | Avg Tokens | Est Cost |
|-------------|------------|----------|
| Simple Static | 1,000-2,000 | ~$0.01-0.02 |
| SPA (React/Vue) | 3,000-5,000 | ~$0.03-0.05 |
| Complex App | 5,000-10,000 | ~$0.05-0.10 |
| E-commerce | 8,000-15,000 | ~$0.08-0.15 |

*Costs based on GPT-4o pricing as of 2024. Check OpenAI pricing for current rates.*

### AI Error Handling

The system gracefully handles AI failures:

```bash
# AI request fails → Automatic fallback to core functionality
⚠️ AI analysis failed, continuing with standard mirroring...
✅ Website mirroring completed successfully (without AI optimization)
```

**Common AI Issues:**
- **Network connectivity**: Auto-retry with exponential backoff
- **API key invalid**: Clear error message with setup instructions
- **Rate limits**: Automatic retry with appropriate delays
- **Token limits**: Content chunking for large websites

## React/Next.js Compatibility System

### Problem Solved

**Issue**: React/Next.js applications were showing "Application error: a client-side exception has occurred" due to hydration mismatches between server-rendered content and client-side expectations.

**Solution**: Intelligent framework detection with automatic JavaScript handling strategies.

### Framework Detection & Handling

The system automatically detects React/Next.js applications and applies appropriate strategies:

#### **Detection Methods:**
1. **Framework Analysis**: Checks for Next.js-specific patterns
2. **DOM Inspection**: Looks for `#__next`, `[data-reactroot]` elements
3. **Script Analysis**: Identifies React/Next.js runtime scripts

#### **Handling Strategies:**

| Framework Type | Strategy | JavaScript | Enhancements |
|---------------|----------|------------|-------------|
| **React/Next.js** | JavaScript Disabled | ❌ Removed | ❌ Minimal |
| **Vue/Nuxt** | JavaScript Disabled | ❌ Removed | ❌ Minimal |
| **Angular** | JavaScript Disabled | ❌ Removed | ❌ Minimal |
| **Static/jQuery** | Full Enhancement | ✅ Preserved | ✅ Full Suite |
| **WordPress** | Full Enhancement | ✅ Preserved | ✅ Full Suite |

### React/Next.js Processing Details

#### **What Gets Removed:**
- All `<script>` tags with React/Next.js runtime
- Script preload links (`<link rel="preload" as="script">`)
- Hydration data and state management scripts
- Dynamic import statements and code splitting

#### **What Gets Preserved:**
- All CSS styling and layout
- HTML structure and content
- Images, videos, and media assets
- Static functionality (forms, links)
- Essential meta tags and SEO data

#### **Indicators Added:**
```html
<!-- Added to <head> for identification -->
<meta name="js-disabled" content="true">
<script>
// JavaScript disabled for offline compatibility with Next.js
console.log('[Mirror Web CLI] JavaScript disabled to ensure offline compatibility');
</script>
```

### Benefits of JavaScript Disabling

#### **For React/Next.js Sites:**
- ✅ **Zero Client-Side Exceptions**: No hydration mismatches possible
- ✅ **Faster Loading**: No large JavaScript bundles to download
- ✅ **Better SEO**: Pure HTML content is more crawlable
- ✅ **Universal Compatibility**: Works in any browser without JavaScript
- ✅ **Offline First**: No dependency on JavaScript runtime

#### **Trade-offs:**
- ❌ **No Interactivity**: Buttons, forms, and dynamic features won't work
- ❌ **No Client-Side Routing**: Single page only (no navigation)
- ❌ **No State Management**: Redux, Context, etc. won't function
- ❌ **No Real-time Features**: WebSockets, live updates disabled

### When This Strategy Works Best

#### **Ideal Use Cases:**
- **Documentation Sites**: Static content with great styling
- **Portfolios**: Visual presentation without complex interactions
- **Marketing Pages**: Landing pages and promotional content
- **Archive/Backup**: Preserving visual design and content
- **Offline Reference**: Company information, product catalogs

#### **Not Recommended For:**
- **Web Applications**: Complex user interactions required
- **E-commerce**: Shopping carts, checkout processes
- **Dashboards**: Real-time data and interactive charts
- **Social Platforms**: User-generated content and interactions

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

#### **1. React/Next.js Client-Side Exceptions**
- **Error**: "Application error: a client-side exception has occurred (see the browser console for more information)"
- **Cause**: Hydration mismatches between server-rendered content and client-side expectations
- **Solution**: ✅ **FIXED** - Automatic JavaScript disabling for React/Next.js applications
- **How it works**: System detects React/Next.js and removes all JavaScript to prevent hydration conflicts
- **Verification**: Look for `<meta name="js-disabled" content="true">` in output HTML

#### **2. OpenAI API Issues**
- **Error**: "API Error (Connection error.) · Retrying in 1 seconds…"
- **Causes**:
  - Invalid API key: `Error: Invalid API key provided`
  - Rate limits: `Error: Rate limit exceeded`
  - Network issues: `Error: Failed to fetch`
- **Solutions**:
  ```bash
  # Check API key setup
  echo $OPENAI_API_KEY
  
  # Test without AI first
  node src/cli.js <url> --clean --debug
  
  # Then try with AI
  node src/cli.js <url> --ai --clean --debug
  ```

#### **3. Framework Detection Issues**
- **Problem**: Incorrect framework detection or confidence scores
- **Debug**: Use `--debug` flag to see detailed detection process
- **Example output**:
  ```bash
  ✓ Detected: Next.js (Confidence: 85%)
  ✓ Strategy: JavaScript disabled for React compatibility
  ```

#### **4. Memory Issues with Large Sites**
- **Symptoms**: Process crashes or extremely slow performance
- **Solutions**:
  ```bash
  # Use clean flag to reduce memory usage
  node src/cli.js <url> --clean
  
  # Increase timeout for large sites
  node src/cli.js <url> --timeout 300000 --clean
  
  # Enable debug to monitor progress
  node src/cli.js <url> --debug --clean
  ```

#### **5. Asset Download Failures**
- **Warning**: "Non-critical asset skipped: Request failed with status code 404"
- **Cause**: Missing assets (404), CORS issues, or network problems
- **Impact**: Usually non-critical; site functionality preserved
- **Debug**: Check `--debug` output for specific asset URLs

#### **6. Video/Media Processing Issues**
- **Symptoms**: Missing videos or audio files in output
- **Solutions**:
  ```bash
  # Increase timeout for media-heavy sites
  node src/cli.js <url> --timeout 300000 --clean
  
  # Check debug output for media processing
  node src/cli.js <url> --debug --clean
  ```

### Framework-Specific Troubleshooting

#### **React/Next.js Applications**
```bash
# If you see client-side exceptions:
✅ Solution: Automatic (JavaScript disabled)
✅ Verification: Check for js-disabled meta tag
✅ Result: Static HTML with full styling preserved

# Manual verification:
grep "js-disabled" output-directory/index.html
```

#### **Vue/Nuxt Applications**
```bash
# Similar to React handling
✅ Automatic JavaScript disabling
✅ CSS and layout preserved
✅ No client-side exceptions
```

#### **WordPress Sites**
```bash
# Full enhancement with JavaScript preserved
✅ Interactive elements work
✅ Animations and effects preserved
✅ jQuery functionality maintained
```

#### **Static/Traditional Sites**
```bash
# Full enhancement suite applied
✅ Hover animations work (Google AI button, etc.)
✅ All interactive elements preserved
✅ Enhanced offline compatibility
```

### Debug Mode & Diagnostics

#### **Basic Debug Mode**
```bash
node src/cli.js <url> --debug
```

**Provides detailed information about:**
- Framework detection results and confidence scores
- Asset extraction process and download status
- JavaScript handling strategy applied
- File system operations and output generation
- Error stack traces and warning details

#### **Advanced Debugging**
```bash
# Test framework detection only
node src/cli.js <url> --debug | grep "Framework Analysis"

# Monitor asset processing
node src/cli.js <url> --debug | grep "Downloading"

# Check JavaScript handling
node src/cli.js <url> --debug | grep "JavaScript\|React\|Next.js"
```

#### **Verification Commands**
```bash
# Check if JavaScript was disabled (React/Next.js sites)
grep -q "js-disabled" output/index.html && echo "✅ JS Disabled" || echo "❌ JS Enabled"

# Count total assets processed
ls output/assets/*/* | wc -l

# Check for specific file types
find output -name "*.mp4" -o -name "*.webm" # Videos
find output -name "*.css" # Stylesheets
find output -name "*.js" # JavaScript files
```

### Performance Optimization

#### **For Large Websites**
```bash
# Recommended flags for large sites
node src/cli.js <url> --clean --timeout 300000 --debug

# Monitor memory usage (Linux/macOS)
top -p $(pgrep node)

# Windows Task Manager: Look for Node.js process
```

#### **For Media-Heavy Sites**
```bash
# Extended timeout for video processing
node src/cli.js <url> --clean --timeout 600000

# Check media processing in debug output
node src/cli.js <url> --debug | grep -E "(video|audio|media)"
```

### When to Contact Support

Create an issue with the following information:

1. **Command used**: Full command line with flags
2. **Website URL**: Target website (if publicly accessible)
3. **Error output**: Complete error message and stack trace
4. **Debug output**: Run with `--debug` flag and include relevant portions
5. **Environment**: OS, Node.js version, npm version
6. **Expected vs Actual**: What you expected vs what happened

```bash
# Gather environment info
node --version
npm --version
uname -a  # Linux/macOS
ver       # Windows
```
