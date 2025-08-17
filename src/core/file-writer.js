import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

/**
 * File Writer - Generates output HTML/CSS/JS files
 */
export class FileWriter {
  constructor(cloner) {
    this.cloner = cloner;
  }

  /**
   * Generate all output files
   */
  async generateFiles() {
    await fs.ensureDir(this.cloner.options.outputDir);
    
    console.log(chalk.gray('    Generating HTML file...'));
    await this.generateHTML();
    
    console.log(chalk.gray('    Generating CSS file...'));
    await this.generateCSS();
    
    console.log(chalk.gray('    Generating JavaScript file...'));
    await this.generateJS();
    
    console.log(chalk.gray('    Creating package files...'));
    await this.generatePackageFiles();
  }

  /**
   * Generate optimized HTML file
   */
  async generateHTML() {
    const $ = this.cloner.$;
    
    // Clean up the HTML
    this.cleanHTML($);
    
    // Add our CSS and JS references
    $('head').append('<link rel="stylesheet" href="./styles.css">');
    $('body').append('<script src="./script.js"></script>');
    
    // Add meta tags
    this.addMetaTags($);
    
    const html = $.html();
    const htmlPath = path.join(this.cloner.options.outputDir, 'index.html');
    await fs.writeFile(htmlPath, this.prettifyHTML(html), 'utf8');
  }

  /**
   * Clean HTML content
   */
  cleanHTML($) {
    // Remove script tags if cleaning is enabled
    if (this.cloner.options.clean) {
      $('script').each((_, el) => {
        const src = $(el).attr('src');
        const content = $(el).html();
        
        if (src && this.cloner.assetManager.isTrackingScript(src)) {
          $(el).remove();
        } else if (content && this.cloner.assetManager.isTrackingScript(content)) {
          $(el).remove();
        }
      });
      
      // Remove tracking attributes
      $('[data-gtm], [data-ga], [data-fb]').removeAttr('data-gtm data-ga data-fb');
      
      // Remove noscript tags
      $('noscript').remove();
    }
    
    // Remove empty elements
    $('script:empty, style:empty, link[href=""]').remove();
    
    // Clean up inline styles that reference removed assets
    $('[style]').each((_, el) => {
      let style = $(el).attr('style');
      if (style) {
        // Remove broken background images
        style = style.replace(/background-image:\s*url\([^\)]*\);?/g, '');
        if (style.trim()) {
          $(el).attr('style', style);
        } else {
          $(el).removeAttr('style');
        }
      }
    });
  }

  /**
   * Add essential meta tags
   */
  addMetaTags($) {
    const head = $('head');
    
    // Add viewport if missing
    if (!$('meta[name="viewport"]').length) {
      head.prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }
    
    // Add charset if missing
    if (!$('meta[charset]').length) {
      head.prepend('<meta charset="UTF-8">');
    }
    
    // Add generator tag
    head.append(`<meta name="generator" content="Website Cloner v3.0">`);
    head.append(`<meta name="cloned-from" content="${this.cloner.url}">`);
    head.append(`<meta name="cloned-date" content="${new Date().toISOString()}">`);
  }

  /**
   * Generate consolidated CSS file
   */
  async generateCSS() {
    let css = '/* Website Cloner v3.0 - Generated CSS */\n\n';
    
    // Add reset/normalize styles
    css += this.getResetCSS();
    
    // Add responsive base styles
    css += this.getBaseCSS();
    
    // Combine all extracted CSS
    for (const style of this.cloner.assets.styles) {
      if (style.content) {
        css += `\n/* ${style.type} - ${style.filename} */\n`;
        css += style.content;
        css += '\n\n';
      }
    }
    
    // Optimize CSS
    css = this.optimizeCSS(css);
    
    const cssPath = path.join(this.cloner.options.outputDir, 'styles.css');
    await fs.writeFile(cssPath, css, 'utf8');
  }

  /**
   * Generate consolidated JavaScript file
   */
  async generateJS() {
    let js = '/* Website Cloner v3.0 - Generated JavaScript */\n\n';
    
    // Add utility functions
    js += this.getUtilityJS();
    
    // Add extracted JavaScript (if not cleaning)
    if (!this.cloner.options.clean) {
      for (const script of this.cloner.assets.scripts) {
        if (script.content && !this.cloner.assetManager.isTrackingScript(script.content)) {
          js += `\n/* ${script.type} - ${script.filename} */\n`;
          js += script.content;
          js += '\n\n';
        }
      }
    }
    
    // Add initialization script
    js += this.getInitializationJS();
    
    const jsPath = path.join(this.cloner.options.outputDir, 'script.js');
    await fs.writeFile(jsPath, js, 'utf8');
  }

  /**
   * Generate package.json and README
   */
  async generatePackageFiles() {
    // package.json
    const packageJson = {
      name: this.cloner.domain.replace(/\./g, '-'),
      version: '1.0.0',
      description: `Cloned website from ${this.cloner.url}`,
      main: 'index.html',
      scripts: {
        start: 'python -m http.server 8000',
        serve: 'npx serve .'
      },
      keywords: ['cloned-website', 'static-site'],
      clonedFrom: this.cloner.url,
      clonedDate: new Date().toISOString(),
      generator: 'Website Cloner v3.0'
    };
    
    await fs.writeFile(
      path.join(this.cloner.options.outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
      'utf8'
    );
    
    // README.md
    const readme = this.generateReadme();
    await fs.writeFile(
      path.join(this.cloner.options.outputDir, 'README.md'),
      readme,
      'utf8'
    );
  }

  /**
   * Get CSS reset styles
   */
  getResetCSS() {
    return `/* CSS Reset */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  line-height: 1.6;
}

img {
  max-width: 100%;
  height: auto;
}

a {
  text-decoration: none;
}

ul, ol {
  margin: 0;
  padding: 0;
}

`;
  }

  /**
   * Get base responsive CSS
   */
  getBaseCSS() {
    return `/* Base Responsive Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }
  
  img {
    width: 100% !important;
    height: auto !important;
  }
}

/* Utility Classes */
.responsive-img {
  width: 100%;
  height: auto;
}

.hidden {
  display: none;
}

.text-center {
  text-align: center;
}

`;
  }

  /**
   * Get utility JavaScript functions
   */
  getUtilityJS() {
    return `// Utility Functions
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

function $(selector) {
  return document.querySelectorAll(selector);
}

function fadeIn(element, duration = 300) {
  element.style.opacity = 0;
  element.style.display = 'block';
  
  const start = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - start;
    const progress = elapsed / duration;
    
    if (progress < 1) {
      element.style.opacity = progress;
      requestAnimationFrame(animate);
    } else {
      element.style.opacity = 1;
    }
  }
  
  requestAnimationFrame(animate);
}

`;
  }

  /**
   * Get initialization JavaScript
   */
  getInitializationJS() {
    const framework = this.cloner.analysis?.primaryFramework?.name || 'Unknown';
    
    return `// Initialization
ready(function() {
  console.log('Website loaded successfully!');
  console.log('Original framework: ${framework}');
  console.log('Converted to: Universal HTML/CSS/JS');
  
  // Lazy loading for images
  const images = $('img[data-src]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
  
  // Smooth scrolling for anchor links
  const anchorLinks = $('a[href^="#"]');
  anchorLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
`;
  }

  /**
   * Optimize CSS content
   */
  optimizeCSS(css) {
    // Remove comments
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove extra whitespace
    css = css.replace(/\s+/g, ' ');
    
    // Remove empty rules
    css = css.replace(/[^{}]*{\s*}/g, '');
    
    return css.trim();
  }

  /**
   * Prettify HTML
   */
  prettifyHTML(html) {
    // Basic HTML formatting
    return html
      .replace(/></g, '>\n<')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Generate README content
   */
  generateReadme() {
    const framework = this.cloner.analysis?.primaryFramework?.name || 'Unknown';
    const stats = this.cloner.getAssetStats();
    
    return `# ${this.cloner.domain}

Cloned website converted to universal HTML/CSS/JS format.

## Original Information

- **Source URL**: ${this.cloner.url}
- **Original Framework**: ${framework}
- **Cloned Date**: ${new Date().toLocaleDateString()}
- **Generator**: Website Cloner v3.0

## Asset Statistics

- Images: ${stats.images}
- Stylesheets: ${stats.styles}
- Scripts: ${stats.scripts}
- Fonts: ${stats.fonts}
- Icons: ${stats.icons}
- Media Files: ${stats.media}
- **Total Assets**: ${stats.total}

## How to Run

### Option 1: Python HTTP Server
\`\`\`bash
python -m http.server 8000
\`\`\`

Then open http://localhost:8000

### Option 2: Node.js Serve
\`\`\`bash
npx serve .
\`\`\`

### Option 3: Any Web Server
Serve the files using any web server (Apache, Nginx, etc.)

## File Structure

\`\`\`
.
├── index.html          # Main HTML file
├── styles.css          # Consolidated CSS
├── script.js           # Consolidated JavaScript
├── assets/
│   ├── images/         # All images
│   ├── styles/         # External stylesheets
│   ├── scripts/        # External scripts
│   ├── fonts/          # Font files
│   ├── icons/          # Icon files
│   └── media/          # Video/audio files
├── package.json        # Project metadata
└── README.md           # This file
\`\`\`

## Notes

- This is a static conversion of the original dynamic website
- All assets have been downloaded and made local
- Interactive features may have limited functionality
- The design should closely match the original

---

*Generated by Website Cloner v3.0*
`;
  }
}
