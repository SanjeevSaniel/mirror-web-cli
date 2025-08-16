import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { AIWebsiteAnalyzer } from './aiAnalyzer.js';
import { ProgressDisplay } from './utils.js';
import { extractAssets, resolveUrl } from './utils.js';
import https from 'https';
import http from 'http';

class TechStackCloner {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.assets = { css: [], js: [], images: [] };
    this.analyzer = null; // Initialize only when needed
  }

  async clone() {
    ProgressDisplay.step('3/5', 'Launching headless browser...', 'Initializing Puppeteer for content extraction');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    ProgressDisplay.step('4/5', 'Loading website content...', `Navigating to ${this.url} and waiting for content`);
    await page.goto(this.url, { waitUntil: 'networkidle0' });

    const html = await page.content();
    await browser.close();

    ProgressDisplay.step('5/5', 'Parsing website structure...', 'Analyzing HTML content and extracting assets');
    const $ = load(html);
    
    // Extract website title for folder naming
    const siteTitle = $('title').text() || '';
    this.siteTitle = siteTitle;
    
    await this.extractAssets($);

    // AI optimization if enabled
    let aiAnalysis = null;
    if (this.options.aiEnabled) {
      try {
        ProgressDisplay.info('AI Analysis Starting', 'Running Chain-of-Thought website analysis...');
        // Initialize analyzer only when AI is enabled
        if (!this.analyzer) {
          this.analyzer = new AIWebsiteAnalyzer();
        }
        aiAnalysis = await this.analyzer.analyze(this.url);
        ProgressDisplay.success('AI Analysis Complete', 
          `Strategy: ${chalk.magenta(aiAnalysis.strategy)}\n   Framework: ${chalk.cyan(aiAnalysis.detectedFramework)}\n   Complexity: ${chalk.yellow(aiAnalysis.estimatedComplexity)}`
        );
      } catch (error) {
        ProgressDisplay.warning('AI analysis failed, using basic mode', error.message);
      }
    }

    // Generate project files
    ProgressDisplay.info('Generating Project Files', 
      `Creating ${this.options.techStack.toUpperCase()} project structure...`
    );

    const assetStats = {
      cssCount: this.assets.css.length,
      jsCount: this.assets.js.length,
      imageCount: this.assets.images.length
    };

    switch (this.options.techStack) {
      case 'react':
        await this.generateReactProject($, assetStats);
        break;
      case 'html':
      default:
        await this.generateHTMLProject($, assetStats);
        break;
    }
    
    // Display summary
    ProgressDisplay.summary([
      { icon: '📄', label: 'Website Title', value: this.siteTitle || 'No title found' },
      { icon: '🎨', label: 'CSS Assets Extracted', value: assetStats.cssCount },
      { icon: '⚡', label: 'JavaScript Assets', value: assetStats.jsCount },
      { icon: '🖼️', label: 'Images Found', value: assetStats.imageCount },
      { icon: '📂', label: 'Output Directory', value: this.options.outputDir },
      { icon: '⚙️', label: 'Technology Stack', value: this.options.techStack.toUpperCase() }
    ]);
    
    return {
      title: this.siteTitle,
      outputDir: this.options.outputDir,
      stats: assetStats
    };
  }

  async extractAssets($) {
    // Extract inline CSS
    $('style').each((_, el) => {
      const content = $(el).html();
      if (content && !content.includes('analytics')) {
        this.assets.css.push(content);
      }
    });

    // Extract inline JS (filter out tracking)
    $('script:not([src])').each((_, el) => {
      const content = $(el).html();
      if (content && !this.isTrackingScript(content)) {
        this.assets.js.push(content);
      }
    });

    // Extract images with full URL resolution
    $('img').each((_, el) => {
      const src = $(el).attr('src');
      if (src && !src.startsWith('data:')) {
        const fullUrl = resolveUrl(src, this.url);
        this.assets.images.push({
          src,
          fullUrl,
          alt: $(el).attr('alt') || '',
          className: $(el).attr('class') || '',
          element: el
        });
      }
    });

    // Download images and update URLs
    await this.downloadImages($);
    
    // Fix links for better offline experience
    this.fixLinks($);
  }

  async downloadImages($) {
    if (this.assets.images.length === 0) return;

    ProgressDisplay.info('Downloading Images', `Found ${this.assets.images.length} images to download`);
    
    // Create assets directory
    const assetsDir = path.join(this.options.outputDir, 'assets', 'images');
    await fs.ensureDir(assetsDir);

    for (let i = 0; i < this.assets.images.length; i++) {
      const image = this.assets.images[i];
      try {
        ProgressDisplay.progress(i + 1, this.assets.images.length, 'Downloading image assets', 
          `Processing: ${image.fullUrl.substring(0, 50)}...`);

        const filename = this.generateImageFilename(image.fullUrl, i);
        const localPath = path.join(assetsDir, filename);
        const relativePath = `assets/images/${filename}`;

        await this.downloadFile(image.fullUrl, localPath);
        
        // Update the image src in the DOM
        $(image.element).attr('src', relativePath);
        
        ProgressDisplay.progress(i + 1, this.assets.images.length, 'Downloading image assets', 
          `Downloaded: ${filename}`, false);
      } catch (error) {
        ProgressDisplay.warning(`Failed to download image: ${image.fullUrl}`, error.message);
        // Keep original URL if download fails
      }
    }
  }

  generateImageFilename(url, index) {
    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;
      
      // Extract file extension
      const ext = path.extname(pathname) || '.png';
      let basename = path.basename(pathname, ext) || `image-${index}`;
      
      // Clean filename
      basename = basename.replace(/[^a-zA-Z0-9-_]/g, '-').substring(0, 50);
      
      return `${basename}${ext}`;
    } catch {
      return `image-${index}.png`;
    }
  }

  async downloadFile(url, localPath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      
      const request = client.get(url, (response) => {
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(localPath);
          response.pipe(fileStream);
          
          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
          
          fileStream.on('error', reject);
        } else if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.downloadFile(redirectUrl, localPath).then(resolve).catch(reject);
          } else {
            reject(new Error(`Redirect without location: ${response.statusCode}`));
          }
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      });
      
      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Download timeout'));
      });
    });
  }

  fixLinks($) {
    // Fix relative links and convert problematic external links
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      // Skip data: and javascript: links
      if (href.startsWith('data:') || href.startsWith('javascript:')) return;

      // Convert relative links to absolute URLs
      if (href.startsWith('/') || (!href.startsWith('http') && !href.startsWith('#'))) {
        const absoluteUrl = resolveUrl(href, this.url);
        $(el).attr('href', absoluteUrl);
        $(el).attr('target', '_blank'); // Open external links in new tab
      }
      
      // Add target="_blank" to external links for better UX
      else if (href.startsWith('http') && !href.includes(new URL(this.url).hostname)) {
        $(el).attr('target', '_blank');
      }
    });

    // Fix form actions
    $('form[action]').each((_, el) => {
      const action = $(el).attr('action');
      if (action && !action.startsWith('http') && !action.startsWith('#')) {
        const absoluteUrl = resolveUrl(action, this.url);
        $(el).attr('action', absoluteUrl);
      }
    });

    // Update picture source elements (for Google logo and other responsive images)
    $('picture source[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (srcset && !srcset.startsWith('data:')) {
        const absoluteUrl = resolveUrl(srcset, this.url);
        $(el).attr('srcset', absoluteUrl);
      }
    });
  }

  isTrackingScript(content) {
    const trackingPatterns = [
      'gtag',
      'analytics',
      'facebook',
      'twitter',
      'linkedin',
      'pixel',
      'track',
      'ga(',
      'dataLayer',
    ];
    return trackingPatterns.some((pattern) => content.includes(pattern));
  }

  async generateHTMLProject($, assetStats) {
    ProgressDisplay.progress(1, 4, 'Creating HTML project structure', 'Setting up output directory');
    await fs.ensureDir(this.options.outputDir);
    const cleanHtml = this.cleanHTML($);
    ProgressDisplay.progress(1, 4, 'Creating HTML project structure', 'Setting up output directory', false);

    ProgressDisplay.progress(2, 4, 'Generating HTML file', 'Creating index.html with clean structure');
    await this.createHTMLFile(cleanHtml);
    ProgressDisplay.progress(2, 4, 'Generating HTML file', 'Creating index.html with clean structure', false);
    
    ProgressDisplay.progress(3, 4, 'Generating CSS file', `Processing ${assetStats.cssCount} CSS assets`);
    await this.createCSSFile();
    ProgressDisplay.progress(3, 4, 'Generating CSS file', `Processing ${assetStats.cssCount} CSS assets`, false);
    
    ProgressDisplay.progress(4, 4, 'Generating JavaScript file', `Processing ${assetStats.jsCount} JS assets`);
    await this.createJSFile();
    ProgressDisplay.progress(4, 4, 'Generating JavaScript file', `Processing ${assetStats.jsCount} JS assets`, false);

    ProgressDisplay.success('HTML project generated successfully', 
      'Clean HTML/CSS/JS project ready for use'
    );
  }

  async generateReactProject($, assetStats) {
    ProgressDisplay.progress(1, 6, 'Creating React project structure', 'Setting up output directory and src folder');
    await fs.ensureDir(this.options.outputDir);
    ProgressDisplay.progress(1, 6, 'Creating React project structure', 'Setting up output directory and src folder', false);

    ProgressDisplay.progress(2, 6, 'Extracting React components', 'Analyzing page structure for component generation');
    const components = this.extractReactComponents($);
    ProgressDisplay.progress(2, 6, 'Extracting React components', 'Analyzing page structure for component generation', false);

    ProgressDisplay.progress(3, 6, 'Generating React components', `Creating ${components.length} components`);
    await this.createReactApp(components);
    ProgressDisplay.progress(3, 6, 'Generating React components', `Creating ${components.length} components`, false);
    
    ProgressDisplay.progress(4, 6, 'Creating package.json', 'Setting up React dependencies and scripts');
    await this.createReactPackageJson();
    ProgressDisplay.progress(4, 6, 'Creating package.json', 'Setting up React dependencies and scripts', false);
    
    ProgressDisplay.progress(5, 6, 'Processing styles', `Integrating ${assetStats.cssCount} CSS assets`);
    // Additional styling work happens in createReactApp
    ProgressDisplay.progress(5, 6, 'Processing styles', `Integrating ${assetStats.cssCount} CSS assets`, false);
    
    ProgressDisplay.progress(6, 6, 'Finalizing React structure', 'Adding public folder and index.html');
    // This is also done in createReactApp
    ProgressDisplay.progress(6, 6, 'Finalizing React structure', 'Adding public folder and index.html', false);

    ProgressDisplay.success('React project generated successfully', 
      `⚛️  React app with ${components.length} components ready for development`
    );
  }

  cleanHTML($) {
    // Remove tracking and scripts
    $(
      'script[src*="analytics"], script[src*="gtag"], script[src*="facebook"]',
    ).remove();
    $('noscript, meta[name*="google"], link[href*="analytics"]').remove();

    // Clean attributes
    $('*').each((_, el) => {
      const trackingAttrs = ['data-gtm', 'data-ga', 'data-fb'];
      trackingAttrs.forEach((attr) => $(el).removeAttr(attr));
    });

    return $.html();
  }

  extractReactComponents($) {
    const components = [];

    // Extract semantic sections
    $('header, nav, main, section, article, aside, footer').each((_, el) => {
      const $el = $(el);
      const tagName = el.tagName.toLowerCase();

      components.push({
        name: this.capitalize(tagName),
        content: $el.html(),
        className: $el.attr('class') || '',
      });
    });

    return components.length
      ? components
      : [
          {
            name: 'MainContent',
            content: $('body').html(),
            className: '',
          },
        ];
  }

  async createHTMLFile(html) {
    const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloned Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    ${this.cleanBodyContent(html)}
    <script src="script.js"></script>
</body>
</html>`;

    await fs.writeFile(
      path.join(this.options.outputDir, 'index.html'),
      template,
    );
  }

  async createCSSFile() {
    let css = `/* Cloned Website Styles */\n`;

    // Add extracted CSS
    css += this.assets.css.join('\n\n');

    // Add responsive framework
    css += `\n\n/* Responsive Framework */
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 0;
    line-height: 1.6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

img {
    max-width: 100%;
    height: auto;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

@media (max-width: 768px) {
    .container {
        padding: 0 16px;
    }
}`;

    await fs.writeFile(path.join(this.options.outputDir, 'styles.css'), css);
  }

  async createJSFile() {
    let js = `// Cloned Website JavaScript\n`;

    // Add extracted JS
    js += this.assets.js.join('\n\n');

    // Add functionality
    js += `\n\n// Enhanced Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website cloned successfully!');
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});`;

    await fs.writeFile(path.join(this.options.outputDir, 'script.js'), js);
  }

  async createReactApp(components) {
    await fs.ensureDir(path.join(this.options.outputDir, 'src'));

    // App.js
    const appJs = `import React from 'react';
import './App.css';
${components
  .map((c) => `import ${c.name} from './components/${c.name}';`)
  .join('\n')}

function App() {
  return (
    <div className="App">
      ${components.map((c) => `<${c.name} />`).join('\n      ')}
    </div>
  );
}

export default App;`;

    await fs.writeFile(
      path.join(this.options.outputDir, 'src', 'App.js'),
      appJs,
    );

    // Create components directory
    await fs.ensureDir(path.join(this.options.outputDir, 'src', 'components'));

    for (const component of components) {
      const componentJs = `import React from 'react';

const ${component.name} = () => {
  return (
    <div className="${component.className}">
      <h2>${component.name}</h2>
      <p>Component extracted from original website</p>
      {/* Add your ${component.name.toLowerCase()} content here */}
    </div>
  );
};

export default ${component.name};`;

      await fs.writeFile(
        path.join(
          this.options.outputDir,
          'src',
          'components',
          `${component.name}.js`,
        ),
        componentJs,
      );
    }

    // index.js
    const indexJs = `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    await fs.writeFile(
      path.join(this.options.outputDir, 'src', 'index.js'),
      indexJs,
    );

    // App.css with extracted styles
    const appCss = `/* Cloned Website Styles */
${this.assets.css.join('\n\n')}

.App {
  text-align: center;
}

/* Component Styles */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}`;

    await fs.writeFile(
      path.join(this.options.outputDir, 'src', 'App.css'),
      appCss,
    );

    // index.css
    const indexCss = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
}`;

    await fs.writeFile(
      path.join(this.options.outputDir, 'src', 'index.css'),
      indexCss,
    );
  }

  async createReactPackageJson() {
    const packageJson = {
      name: 'cloned-website',
      version: '1.0.0',
      private: true,
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        'react-scripts': '5.0.1',
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
      },
      eslintConfig: {
        extends: ['react-app', 'react-app/jest'],
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: [
          'last 1 chrome version',
          'last 1 firefox version',
          'last 1 safari version',
        ],
      },
    };

    await fs.writeFile(
      path.join(this.options.outputDir, 'package.json'),
      JSON.stringify(packageJson, null, 2),
    );

    // public/index.html
    await fs.ensureDir(path.join(this.options.outputDir, 'public'));
    const publicHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Cloned website using Mirror Web CLI" />
    <title>Cloned Website</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>`;

    await fs.writeFile(
      path.join(this.options.outputDir, 'public', 'index.html'),
      publicHtml,
    );
  }

  cleanBodyContent(html) {
    const $ = load(html);
    return $('body').html() || '';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export async function cloneToTechStack(url, options) {
  const cloner = new TechStackCloner(url, options);
  return await cloner.clone();
}

export { TechStackCloner };
