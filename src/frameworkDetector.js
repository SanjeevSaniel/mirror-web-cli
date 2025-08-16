import { load } from 'cheerio';
import chalk from 'chalk';
import { display } from './display.js';

/**
 * Comprehensive Framework Detection Engine
 * Dynamically extensible and highly accurate tech stack detection
 */
export class FrameworkDetector {
  constructor() {
    this.detectionRules = this.initializeDetectionRules();
    this.confidence = {
      HIGH: 0.9,
      MEDIUM: 0.6,
      LOW: 0.3
    };
  }

  /**
   * Initialize extensible detection rules for various frameworks
   */
  initializeDetectionRules() {
    return {
      // Next.js (should be detected before generic React)
      nextjs: {
        name: 'Next.js',
        category: 'ssg',
        patterns: [
          { type: 'script_src', pattern: /_next\/static\//, confidence: 'HIGH' },
          { type: 'element', selector: '#__next', confidence: 'HIGH' },
          { type: 'script_content', pattern: /__NEXT_DATA__/, confidence: 'HIGH' },
          { type: 'meta', name: 'generator', pattern: /next\.js/i, confidence: 'HIGH' }
        ],
        outputRecommendation: 'react'
      },

      // Gatsby (should be detected before generic React)
      gatsby: {
        name: 'Gatsby',
        category: 'ssg',
        patterns: [
          { type: 'script_src', pattern: /gatsby/, confidence: 'HIGH' },
          { type: 'element', selector: '#___gatsby', confidence: 'HIGH' },
          { type: 'meta', name: 'generator', pattern: /gatsby/i, confidence: 'HIGH' }
        ],
        outputRecommendation: 'react'
      },

      // React Ecosystem (generic React patterns)
      react: {
        name: 'React',
        category: 'frontend',
        patterns: [
          // Script and bundle patterns (excluding Next.js and Gatsby specific patterns)
          { type: 'script_src', pattern: /react[.-]?dom|react[.-]?\.js/, confidence: 'HIGH' },
          
          // DOM patterns (excluding Next.js and Gatsby specific patterns)
          { type: 'element', selector: '[data-reactroot]', confidence: 'HIGH' },
          { type: 'element', selector: '[data-react-helmet]', confidence: 'HIGH' },
          
          // Meta and data patterns (excluding Next.js and Gatsby)
          { type: 'meta', name: 'generator', pattern: /react/i, confidence: 'HIGH' },
          { type: 'script_content', pattern: /React\.createElement|ReactDOM\.render/, confidence: 'MEDIUM' },
          
          // CSS and class patterns
          { type: 'class', pattern: /react-|jsx-/, confidence: 'MEDIUM' },
          { type: 'attribute', pattern: /data-react|_jsx/, confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'react'
      },

      // Vue.js Ecosystem
      vue: {
        name: 'Vue.js',
        category: 'frontend',
        patterns: [
          { type: 'script_src', pattern: /vue[.-]?js|vue[.-]?\d/, confidence: 'HIGH' },
          { type: 'script_src', pattern: /nuxt[.-]/, confidence: 'HIGH' }, // Nuxt.js
          { type: 'script_src', pattern: /quasar[.-]/, confidence: 'HIGH' }, // Quasar
          
          { type: 'element', selector: '[data-server-rendered="true"]', confidence: 'HIGH' },
          { type: 'element', selector: '#__nuxt', confidence: 'HIGH' }, // Nuxt.js
          { type: 'element', selector: '[v-cloak]', confidence: 'MEDIUM' },
          
          { type: 'meta', name: 'generator', pattern: /nuxt\.js|vue/i, confidence: 'HIGH' },
          { type: 'script_content', pattern: /__NUXT__/, confidence: 'HIGH' }, // Nuxt.js
          { type: 'script_content', pattern: /Vue\.component|new Vue/, confidence: 'MEDIUM' },
          
          { type: 'attribute', pattern: /v-if|v-for|v-model|v-show/, confidence: 'HIGH' },
          { type: 'class', pattern: /vue-/, confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'react' // Can be mapped to React for consistent output
      },

      // Angular Ecosystem
      angular: {
        name: 'Angular',
        category: 'frontend',
        patterns: [
          { type: 'script_src', pattern: /angular[.-]?js|@angular/, confidence: 'HIGH' },
          { type: 'script_src', pattern: /zone\.js/, confidence: 'MEDIUM' },
          
          { type: 'element', selector: '[ng-app]', confidence: 'HIGH' },
          { type: 'element', selector: '[ng-controller]', confidence: 'HIGH' },
          { type: 'element', selector: 'app-root', confidence: 'HIGH' },
          
          { type: 'script_content', pattern: /angular\.module|ng-app/, confidence: 'HIGH' },
          { type: 'script_content', pattern: /platformBrowserDynamic/, confidence: 'HIGH' },
          
          { type: 'attribute', pattern: /ng-if|ng-for|\*ngFor|\*ngIf/, confidence: 'HIGH' },
          { type: 'class', pattern: /ng-/, confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'react'
      },

      // Svelte Ecosystem
      svelte: {
        name: 'Svelte',
        category: 'frontend',
        patterns: [
          { type: 'script_src', pattern: /svelte/, confidence: 'HIGH' },
          { type: 'script_src', pattern: /sveltekit/, confidence: 'HIGH' },
          
          { type: 'meta', name: 'generator', pattern: /svelte|sveltekit/i, confidence: 'HIGH' },
          { type: 'script_content', pattern: /svelte|SvelteComponent/, confidence: 'MEDIUM' },
          
          { type: 'class', pattern: /svelte-/, confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'react'
      },

      // WordPress
      wordpress: {
        name: 'WordPress',
        category: 'cms',
        patterns: [
          { type: 'script_src', pattern: /wp-content|wp-includes/, confidence: 'HIGH' },
          { type: 'link_href', pattern: /wp-content/, confidence: 'HIGH' },
          
          { type: 'meta', name: 'generator', pattern: /wordpress/i, confidence: 'HIGH' },
          { type: 'script_content', pattern: /wp-admin|wp_localize_script/, confidence: 'MEDIUM' },
          
          { type: 'class', pattern: /wp-|wordpress/, confidence: 'MEDIUM' },
          { type: 'element', selector: '.wp-block-', confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'html'
      },

      // Shopify
      shopify: {
        name: 'Shopify',
        category: 'ecommerce',
        patterns: [
          { type: 'script_src', pattern: /shopify|myshopify/, confidence: 'HIGH' },
          { type: 'link_href', pattern: /shopify|myshopify/, confidence: 'HIGH' },
          
          { type: 'meta', name: 'generator', pattern: /shopify/i, confidence: 'HIGH' },
          { type: 'script_content', pattern: /Shopify\.theme|ShopifyAPI/, confidence: 'HIGH' },
          
          { type: 'element', selector: '[data-shopify]', confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'html'
      },


      // jQuery (legacy detection)
      jquery: {
        name: 'jQuery',
        category: 'library',
        patterns: [
          { type: 'script_src', pattern: /jquery[.-]?\d|jquery[.-]?min/, confidence: 'HIGH' },
          { type: 'script_content', pattern: /\$\(document\)\.ready|\$\(function/, confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'html'
      },

      // Bootstrap
      bootstrap: {
        name: 'Bootstrap',
        category: 'css',
        patterns: [
          { type: 'link_href', pattern: /bootstrap/, confidence: 'HIGH' },
          { type: 'script_src', pattern: /bootstrap/, confidence: 'HIGH' },
          { type: 'class', pattern: /\bbtn\b|\bcol-\w+|\brow\b|\bcontainer\b/, confidence: 'MEDIUM' }
        ],
        outputRecommendation: 'html'
      }
    };
  }

  /**
   * Main detection method that analyzes a webpage
   */
  async detect(html, url = '') {
    const $ = load(html);
    const results = {
      detected: [],
      confidence: {},
      primaryFramework: null,
      recommendedOutput: 'html',
      complexity: 'low',
      metadata: this.extractMetadata($, url)
    };

    // Run detection for each framework
    for (const [frameworkKey, framework] of Object.entries(this.detectionRules)) {
      const detection = this.detectFramework($, framework, html);
      
      if (detection.confidence > 0) {
        results.detected.push({
          name: framework.name,
          key: frameworkKey,
          category: framework.category,
          confidence: detection.confidence,
          matchedPatterns: detection.matchedPatterns,
          outputRecommendation: framework.outputRecommendation
        });
        
        results.confidence[frameworkKey] = detection.confidence;
      }
    }

    // Sort by confidence and determine primary framework
    results.detected.sort((a, b) => b.confidence - a.confidence);
    
    if (results.detected.length > 0) {
      results.primaryFramework = results.detected[0];
      results.recommendedOutput = this.determineOptimalOutput(results.detected);
      results.complexity = this.assessComplexity($, results.detected);
    }

    return results;
  }

  /**
   * Detect a specific framework using its patterns
   */
  detectFramework($, framework, html) {
    let totalConfidence = 0;
    let matchedPatterns = [];
    let maxSingleConfidence = 0;

    for (const pattern of framework.patterns) {
      const match = this.testPattern($, pattern, html);
      
      if (match.found) {
        const confidenceValue = this.confidence[pattern.confidence];
        totalConfidence += confidenceValue;
        maxSingleConfidence = Math.max(maxSingleConfidence, confidenceValue);
        
        matchedPatterns.push({
          type: pattern.type,
          pattern: pattern.pattern,
          confidence: pattern.confidence,
          details: match.details
        });
      }
    }

    // Normalize confidence (prevent over-scoring)
    const normalizedConfidence = Math.min(
      maxSingleConfidence + (totalConfidence - maxSingleConfidence) * 0.1,
      1.0
    );

    return {
      confidence: normalizedConfidence,
      matchedPatterns
    };
  }

  /**
   * Test a specific detection pattern
   */
  testPattern($, pattern, html) {
    try {
      switch (pattern.type) {
        case 'script_src':
          return this.testScriptSrc($, pattern.pattern);
        
        case 'script_content':
          return this.testScriptContent($, pattern.pattern);
        
        case 'link_href':
          return this.testLinkHref($, pattern.pattern);
        
        case 'element':
          return this.testElement($, pattern.selector);
        
        case 'meta':
          return this.testMeta($, pattern.name, pattern.pattern);
        
        case 'class':
          return this.testClass($, pattern.pattern);
        
        case 'attribute':
          return this.testAttribute($, pattern.pattern);
        
        default:
          return { found: false, details: 'Unknown pattern type' };
      }
    } catch (error) {
      return { found: false, details: `Error: ${error.message}` };
    }
  }

  testScriptSrc($, pattern) {
    const scripts = $('script[src]');
    for (let i = 0; i < scripts.length; i++) {
      const src = $(scripts[i]).attr('src');
      if (src && pattern.test(src)) {
        return { found: true, details: `Found in script: ${src}` };
      }
    }
    return { found: false, details: 'No matching script src found' };
  }

  testScriptContent($, pattern) {
    const scripts = $('script:not([src])');
    for (let i = 0; i < scripts.length; i++) {
      const content = $(scripts[i]).html();
      if (content && pattern.test(content)) {
        return { found: true, details: 'Found in inline script content' };
      }
    }
    return { found: false, details: 'No matching script content found' };
  }

  testLinkHref($, pattern) {
    const links = $('link[href]');
    for (let i = 0; i < links.length; i++) {
      const href = $(links[i]).attr('href');
      if (href && pattern.test(href)) {
        return { found: true, details: `Found in link: ${href}` };
      }
    }
    return { found: false, details: 'No matching link href found' };
  }

  testElement($, selector) {
    const elements = $(selector);
    if (elements.length > 0) {
      return { found: true, details: `Found ${elements.length} elements matching: ${selector}` };
    }
    return { found: false, details: `No elements found for: ${selector}` };
  }

  testMeta($, name, pattern) {
    const meta = $(`meta[name="${name}"]`);
    for (let i = 0; i < meta.length; i++) {
      const content = $(meta[i]).attr('content');
      if (content && pattern.test(content)) {
        return { found: true, details: `Found in meta ${name}: ${content}` };
      }
    }
    return { found: false, details: `No matching meta ${name} found` };
  }

  testClass($, pattern) {
    const elements = $('*[class]');
    for (let i = 0; i < elements.length; i++) {
      const className = $(elements[i]).attr('class');
      if (className && pattern.test(className)) {
        return { found: true, details: `Found in class: ${className}` };
      }
    }
    return { found: false, details: 'No matching classes found' };
  }

  testAttribute($, pattern) {
    const elements = $('*');
    for (let i = 0; i < elements.length; i++) {
      const attrs = elements[i].attribs || {};
      for (const [key, value] of Object.entries(attrs)) {
        if (pattern.test(key) || pattern.test(value)) {
          return { found: true, details: `Found in attribute: ${key}="${value}"` };
        }
      }
    }
    return { found: false, details: 'No matching attributes found' };
  }

  /**
   * Determine optimal output format based on detected frameworks
   */
  determineOptimalOutput(detectedFrameworks) {
    // ALWAYS return HTML for offline-ready, universal compatibility
    // regardless of source framework complexity
    return 'html';
  }

  /**
   * Assess website complexity based on detected frameworks and DOM structure
   */
  assessComplexity($, detectedFrameworks) {
    let score = 0;

    // Framework complexity scoring
    const complexFrameworks = ['react', 'vue', 'angular', 'nextjs', 'gatsby'];
    const moderateFrameworks = ['svelte', 'wordpress'];

    for (const framework of detectedFrameworks) {
      if (complexFrameworks.includes(framework.key)) score += 3;
      else if (moderateFrameworks.includes(framework.key)) score += 2;
      else score += 1;
    }

    // DOM complexity indicators
    if ($('script').length > 10) score += 2;
    if ($('link[rel="stylesheet"]').length > 5) score += 1;
    if ($('[data-react], [data-vue], [ng-app]').length > 0) score += 2;
    if ($('canvas, svg').length > 3) score += 1;

    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }

  /**
   * Extract useful metadata from the page
   */
  extractMetadata($, url) {
    return {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      generator: $('meta[name="generator"]').attr('content') || '',
      viewport: $('meta[name="viewport"]').attr('content') || '',
      charset: $('meta[charset]').attr('charset') || '',
      scriptCount: $('script').length,
      stylesheetCount: $('link[rel="stylesheet"]').length,
      imageCount: $('img').length,
      hasServiceWorker: /service-?worker/i.test($.html()),
      hasWebComponents: $('[is]').length > 0 || /customElements/i.test($.html())
    };
  }

  /**
   * Add new detection rule (for extensibility)
   */
  addDetectionRule(key, rule) {
    this.detectionRules[key] = rule;
  }

  /**
   * Get detailed detection report
   */
  getDetectionReport(results) {
    const report = {
      summary: `Detected ${results.detected.length} frameworks`,
      primary: results.primaryFramework ? results.primaryFramework.name : 'None',
      recommended: results.recommendedOutput,
      complexity: results.complexity,
      details: results.detected.map(framework => ({
        name: framework.name,
        confidence: Math.round(framework.confidence * 100),
        patterns: framework.matchedPatterns.length
      }))
    };

    return report;
  }

  /**
   * Display detection results with beautiful formatting
   */
  displayResults(results) {
    // Use the new display system
    display.frameworkResults(results);
  }
}

// Export singleton instance for easy use
export const frameworkDetector = new FrameworkDetector();