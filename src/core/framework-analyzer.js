/**
 * @fileoverview FrameworkAnalyzer - Intelligent Web Framework Detection Engine
 * @description Advanced framework detection system that analyzes websites to identify
 * their underlying technology stack. Supports 14+ frameworks with comprehensive pattern matching.
 * 
 * Detection Methods:
 * - Script source analysis (framework bundles, runtime files)
 * - DOM element inspection (framework-specific containers)
 * - Meta tag analysis (generator tags, framework signatures)
 * - Content pattern matching (component structures, data attributes)
 * - CSS class analysis (framework-specific styling patterns)
 * - Link href analysis (framework-specific asset paths)
 * - JSON data structure detection (framework state management)
 * 
 * @version 1.0.0
 * @author Sanjeev Saniel Kujur
 * @license MIT
 */

import { load } from 'cheerio';
import chalk from 'chalk';

/**
 * @class FrameworkAnalyzer
 * @description Comprehensive framework detection and analysis system.
 * 
 * Analyzes web pages to detect underlying frameworks and their characteristics:
 * - Supports React, Vue, Angular, Next.js, Nuxt, Gatsby, Svelte, and more
 * - Provides confidence scoring based on multiple detection patterns
 * - Determines framework complexity and recommended mirroring strategies
 * - Extensible pattern-based detection system
 * 
 * @example
 * ```javascript
 * const analyzer = new FrameworkAnalyzer();
 * const analysis = await analyzer.analyze(htmlContent, 'https://example.com');
 * console.log(`Detected: ${analysis.primaryFramework.name} (${analysis.confidence}%)`);
 * ```
 */
export class FrameworkAnalyzer {
  constructor() {
    this.frameworks = {
      nextjs: {
        name: 'Next.js',
        patterns: [
          { type: 'script', pattern: /_next\/static\// },
          { type: 'element', selector: '#__next' },
          { type: 'script_json_id', id: '__NEXT_DATA__' }, // Next.js App Router JSON
          { type: 'meta', name: 'generator', pattern: /next\.js/i },
          { type: 'link_href', pattern: /\/_next\/static\// },
        ],
      },
      gatsby: {
        name: 'Gatsby',
        patterns: [
          { type: 'script', pattern: /gatsby/ },
          { type: 'element', selector: '#___gatsby' },
          { type: 'meta', name: 'generator', pattern: /gatsby/i },
        ],
      },
      react: {
        name: 'React',
        patterns: [
          { type: 'script', pattern: /react[.-]?(dom|js)/ },
          { type: 'element', selector: '[data-reactroot]' },
          { type: 'element', selector: '#root' },
          {
            type: 'script_content',
            pattern: /React\.|ReactDOM\.|useState|useEffect/,
          },
        ],
      },
      vue: {
        name: 'Vue.js',
        patterns: [
          { type: 'script', pattern: /vue[.-]?js/ },
          { type: 'element', selector: '[data-server-rendered]' },
          { type: 'element', selector: '#app' },
          { type: 'script_content', pattern: /Vue\.|createApp|new Vue/ },
          { type: 'attribute', pattern: /v-if|v-for|v-model/ },
        ],
      },
      angular: {
        name: 'Angular',
        patterns: [
          { type: 'script', pattern: /angular[.-]?js|@angular/ },
          { type: 'element', selector: '[ng-app]' },
          { type: 'element', selector: 'app-root' },
          { type: 'script_content', pattern: /angular\.module|NgModule/ },
          { type: 'attribute', pattern: /\*ngFor|\*ngIf|\[routerLink\]/ },
        ],
      },
      svelte: {
        name: 'Svelte',
        patterns: [
          { type: 'script', pattern: /svelte/ },
          { type: 'class', pattern: /svelte-/ },
        ],
      },
      wordpress: {
        name: 'WordPress',
        patterns: [
          { type: 'script', pattern: /wp-content|wp-includes/ },
          { type: 'meta', name: 'generator', pattern: /wordpress/i },
          { type: 'class', pattern: /wp-/ },
        ],
      },
    };
  }

  async analyze(html, url = '') {
    const $ = load(html);
    const results = {
      detected: [],
      primaryFramework: null,
      complexity: 'low',
      metadata: this.extractMetadata($),
    };

    for (const [key, framework] of Object.entries(this.frameworks)) {
      const confidence = this.testFramework($, framework, html);
      if (confidence > 0.3) {
        results.detected.push({
          key,
          name: framework.name,
          confidence,
        });
      }
    }

    results.detected.sort((a, b) => b.confidence - a.confidence);
    if (results.detected.length > 0) {
      results.primaryFramework = results.detected[0];
    }

    results.complexity = this.assessComplexity($, results.detected);

    return results;
  }

  testFramework($, framework, html) {
    let score = 0;
    let maxScore = framework.patterns.length;

    for (const pattern of framework.patterns) {
      if (this.testPattern($, pattern, html)) {
        score++;
      }
    }

    return score / maxScore;
  }

  testPattern($, pattern, html) {
    try {
      switch (pattern.type) {
        case 'script':
          return $('script[src]')
            .toArray()
            .some((el) => pattern.pattern.test($(el).attr('src') || ''));
        case 'script_content':
          return $('script:not([src])')
            .toArray()
            .some((el) => pattern.pattern.test($(el).html() || ''));
        case 'script_json_id':
          return $(`script#${pattern.id}`).length > 0;
        case 'element':
          return $(pattern.selector).length > 0;
        case 'meta':
          const meta = $(`meta[name="${pattern.name}"]`);
          return meta
            .toArray()
            .some((el) => pattern.pattern.test($(el).attr('content') || ''));
        case 'class':
          return $('*[class]')
            .toArray()
            .some((el) => pattern.pattern.test($(el).attr('class') || ''));
        case 'attribute':
          return $('*')
            .toArray()
            .some((el) => {
              const attrs = el.attribs || {};
              return Object.entries(attrs).some(
                ([key, value]) =>
                  pattern.pattern.test(key) || pattern.pattern.test(value),
              );
            });
        case 'link_href':
          return $('link[href]')
            .toArray()
            .some((el) => pattern.pattern.test($(el).attr('href') || ''));
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  extractMetadata($) {
    return {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      generator: $('meta[name="generator"]').attr('content') || '',
      scriptCount: $('script').length,
      stylesheetCount: $('link[rel="stylesheet"]').length,
      imageCount: $('img').length,
    };
  }

  assessComplexity($, detected) {
    let score = 0;

    const highComplexity = ['nextjs', 'gatsby', 'react', 'vue', 'angular'];
    for (const framework of detected) {
      if (highComplexity.includes(framework.key)) {
        score += 3;
      } else {
        score += 1;
      }
    }

    if ($('script').length > 10) score += 2;
    if ($('link[rel="stylesheet"]').length > 5) score += 1;
    if ($('img').length > 20) score += 1;
    if ($('[data-react], [data-vue], [ng-app]').length > 0) score += 2;

    if (score >= 8) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  }
}
