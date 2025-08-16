# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mirror Web CLI is an AI-enhanced website cloning tool that extracts websites and outputs them as clean HTML/CSS/JS or React projects. The tool uses Puppeteer for web scraping, Cheerio for DOM manipulation, and OpenAI for intelligent analysis and optimization.

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
# Basic HTML clone
node src/cli.js https://example.com

# React project generation
node src/cli.js https://example.com -t react -o my-react-app

# AI-enhanced cloning (requires OPENAI_API_KEY)
node src/cli.js https://example.com --ai --clean
```

## Core Architecture

### Main Components

- **`src/cli.js`**: CLI entry point using Commander.js for argument parsing
- **`src/cloner.js`**: Core cloning logic with `TechStackCloner` class
- **`src/aiAnalyzer.js`**: AI-powered website analysis using OpenAI API
- **`src/assetOptimizer.js`**: AI-driven asset download optimization
- **`src/utils.js`**: Utility functions for URL handling and file operations

### Key Classes

1. **TechStackCloner**: Main cloning engine
   - Handles both HTML and React output generation
   - Extracts and processes assets (CSS, JS, images)
   - Removes tracking scripts and analytics code
   - Generates clean, production-ready code

2. **AIWebsiteAnalyzer**: Chain-of-thought AI analysis
   - Detects frameworks (React, Vue, Angular, vanilla)
   - Analyzes website complexity and structure
   - Recommends optimal output tech stack
   - Uses START → THINK → EVALUATE → OUTPUT pattern

3. **AssetOptimizer**: AI-powered asset optimization
   - Prioritizes critical vs non-critical assets
   - Creates parallel download strategies
   - Optimizes for performance

### Output Formats

**HTML Output Structure:**
```
output-dir/
├── index.html    # Clean HTML with responsive meta tags
├── styles.css    # Extracted + responsive CSS framework
└── script.js     # Functional JS with smooth scrolling & lazy loading
```

**React Output Structure:**
```
output-dir/
├── package.json              # React dependencies and scripts
├── public/index.html         # React app shell
└── src/
    ├── App.js               # Main app component
    ├── App.css              # Extracted styles
    ├── index.js             # React DOM render
    ├── index.css            # Base styles
    └── components/          # Auto-generated components
        ├── Header.js
        └── Footer.js
```

## AI Integration

### Environment Setup
The AI features require an OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

### AI Analysis Flow
1. **Website Content Extraction**: Puppeteer captures full page content
2. **Framework Detection**: Analyzes for React/Vue/Angular patterns
3. **Chain-of-Thought Analysis**: AI reasoning process with visible steps
4. **Asset Optimization**: Intelligent download prioritization
5. **Output Recommendation**: Suggests optimal tech stack

### AI Models Used
- **gpt-4o-mini**: For website analysis and asset optimization
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