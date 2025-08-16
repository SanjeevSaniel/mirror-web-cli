# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mirror Web CLI is an **advanced AI-enhanced website conversion tool** that extracts websites from any framework and converts them to universal HTML/CSS/JS. The tool features **comprehensive framework detection**, **authentic Claude Code-inspired UI**, and **GPT-4o-powered analysis** for optimal conversion strategies.

### ✨ **Recent Major Updates (v2.1)**
- **Universal Framework Conversion**: Converts any framework (React, Vue, Angular, etc.) to vanilla HTML/CSS/JS
- **Authentic Claude Code UI**: Exact color scheme, gradients, and animations matching Claude Code
- **Framework-Agnostic Output**: All websites converted to universal HTML/CSS/JS regardless of source
- **Enhanced Visual Experience**: Claude orange gradients, signature animations, and celebration effects

## Common Commands

```bash
# Run the CLI tool
npm start <url> [options]

# Run tests
npm test

# Run demo scripts
npm run demo
npm run ai-demo

# Development commands
node src/cli.js <url> [options]
```

### CLI Usage Examples

```bash
# Convert any website to universal HTML/CSS/JS (Recommended)
node src/cli.js https://www.piyushgarg.dev/

# Convert React/Vue/Angular apps to vanilla HTML/CSS/JS with AI
node src/cli.js https://nextjs-app.com --ai --clean

# Convert frameworks without detection analysis
node src/cli.js https://example.com --no-detect

# Full AI-powered framework conversion
node src/cli.js https://vue-app.com --ai --clean -o ./converted-site
```

## Core Architecture

### Main Components

- **`src/cli.js`**: Enhanced CLI entry point with auto-detection and beautiful progress tracking
- **`src/cloner.js`**: Core cloning logic with `TechStackCloner` class and modern UI integration
- **`src/aiAnalyzer.js`**: AI-powered website analysis using OpenAI GPT-4o API
- **`src/frameworkDetector.js`**: **NEW: Comprehensive framework detection engine with 14+ framework support**
- **`src/display.js`**: **NEW: Claude Code-inspired beautiful UI system with gradients and animations**
- **`src/utils.js`**: Enhanced utility functions with legacy ProgressDisplay compatibility

### Key Classes

1. **TechStackCloner**: Universal conversion engine
   - Converts any framework (React, Vue, Angular, etc.) to vanilla HTML/CSS/JS
   - Extracts and processes assets with intelligent framework conversion
   - Removes tracking scripts, analytics code, and framework dependencies (90%+ reduction)
   - Generates clean, framework-agnostic code deployable anywhere

2. **FrameworkDetector**: **NEW: Comprehensive detection system**
   - **14+ Framework Support**: React, Next.js, Gatsby, Vue, Nuxt, Angular, Svelte, WordPress, Shopify, jQuery, Bootstrap
   - **7 Detection Methods**: Script src, DOM elements, meta tags, content analysis, CSS classes, attributes, links
   - **Confidence Scoring**: HIGH (90%+), MEDIUM (60%+), LOW (30%+)
   - **Extensible Architecture**: Easy to add new frameworks with custom rules

3. **AIWebsiteAnalyzer**: Enhanced AI-powered conversion analysis
   - Integrates with FrameworkDetector for comprehensive framework conversion planning
   - Analyzes website complexity and optimal conversion strategies to HTML/CSS/JS
   - Intelligent asset prioritization for framework-agnostic output
   - Uses START → THINK → EVALUATE → OUTPUT pattern with visible reasoning

4. **ClaudeDisplay**: **NEW: Authentic Claude Code UI system**
   - **Claude Code Design**: Authentic Claude orange gradients and color scheme
   - **Signature Animations**: Claude Code-style progress bars, spinners, and celebrations
   - **Professional Cards**: Information displays with Claude Code aesthetics
   - **Brand Consistency**: Exact match to Claude Code interface design language

### Universal Output Format

**All websites are converted to standard HTML/CSS/JS regardless of source framework:**

```
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