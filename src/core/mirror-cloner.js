/**
 * @fileoverview MirrorCloner - Core Website Mirroring Engine
 * @description The main class responsible for orchestrating the complete website mirroring process.
 * This includes browser automation, framework detection, asset extraction, and output generation.
 * 
 * The MirrorCloner preserves the original framework structure while creating a complete
 * offline-ready version of any website with comprehensive asset optimization.
 * 
 * @version 1.0.0
 * @author Sanjeev Saniel Kujur
 * @license MIT
 */

import { BrowserEngine } from './browser-engine.js';
import { AssetManager } from './asset-manager.js';
import { FrameworkAnalyzer } from './framework-analyzer.js';
import { FrameworkWriter } from './framework-writer.js';
import { Display } from './display.js';
import { Logger } from './logger.js';
import chalk from 'chalk';
import { load } from 'cheerio';
import { makeAssetFilename } from './filename-utils.js';

/**
 * @class MirrorCloner
 * @description Main orchestrator class for website mirroring operations.
 * 
 * This class coordinates all aspects of the mirroring process:
 * - Browser automation and page loading
 * - Framework detection and analysis
 * - Asset extraction and optimization
 * - Content processing and cleaning
 * - Output generation with proper structure
 * 
 * @example
 * ```javascript
 * const cloner = new MirrorCloner('https://example.com', {
 *   outputDir: './output',
 *   clean: true,
 *   debug: false
 * });
 * const success = await cloner.clone();
 * ```
 */
export class MirrorCloner {
  /**
   * @constructor
   * @param {string} url - The target website URL to mirror
   * @param {Object} options - Configuration options for the mirroring process
   * @param {string} [options.outputDir] - Output directory path (defaults to domain name)
   * @param {boolean} [options.debug=false] - Enable debug logging
   * @param {boolean} [options.clean=false] - Remove tracking scripts and analytics
   * @param {number} [options.timeout=120000] - Page load timeout in milliseconds
   * @param {boolean} [options.headless=true] - Run browser in headless mode
   * @param {boolean} [options.quiet=false] - Suppress non-essential output
   * @param {boolean} [options.suppressWarnings=true] - Suppress warning messages
   * @param {boolean} [options.ai=false] - Enable AI-powered analysis
   */
  constructor(url, options = {}) {
    this.url = url;
    this.baseUrl = new URL(url);
    this.domain = this.baseUrl.hostname.replace(/^www\./, '');

    this.options = {
      outputDir: options.outputDir || options.output || `./${this.domain}`,
      debug: options.debug || false,
      clean: options.clean || false,
      timeout: options.timeout || 120000,
      headless: options.headless !== false,
      // Logging controls
      quiet: options.quiet || false,
      suppressWarnings: options.suppressWarnings !== false, // default true
      ...options,
    };

    if (!this.options.outputDir) {
      this.options.outputDir = `./${this.domain}`;
    }

    // Initialize core components
    this.browserEngine = new BrowserEngine(this.options);
    this.assetManager = new AssetManager(this);
    this.frameworkAnalyzer = new FrameworkAnalyzer();
    this.frameworkWriter = new FrameworkWriter(this);
    this.display = new Display();
    this.logger = new Logger(this.options);

    // Initialize data containers
    this.$ = null; // Cheerio DOM instance
    this.analysis = null; // Framework analysis results
    this.assets = {
      images: [],
      styles: [],
      scripts: [],
      fonts: [],
      icons: [],
      media: [],
    };

    this.frameworkData = {}; // Framework-specific data storage
  }

  /**
   * @method clone
   * @description Main entry point for the website mirroring process.
   * Orchestrates all steps from initial page load to final output generation.
   * 
   * The process follows these key steps:
   * 1. Browser setup and page loading
   * 2. Framework detection and analysis
   * 3. Comprehensive asset extraction
   * 4. Content processing and optimization
   * 5. Output generation with proper structure
   * 
   * @returns {Promise<boolean>} - Returns true if mirroring succeeded, false otherwise
   * @throws {Error} - Throws on critical failures like network issues or invalid URLs
   */
  async clone() {
    const startTime = Date.now();

    try {
      // Display header and configuration info
      this.display.header(
        'Mirror Web CLI v1.0',
        'Advanced Website Mirroring Tool',
      );
      this.display.info(`🌐 Source: ${this.url}`);
      this.display.info(`📁 Output: ${this.options.outputDir}`);

      // Step 1: Initialize browser environment
      this.display.step(1, 7, 'Browser Setup', 'Launching headless browser...');
      const page = await this.browserEngine.createPage();

      // Step 2: Load and process target website
      this.display.step(
        2,
        7,
        'Page Loading',
        'Loading website content and waiting for completion...',
      );
      await this.loadPage(page);

      // Handle URL redirects and update internal references
      const finalUrl = page.url();
      if (finalUrl && finalUrl !== this.url) {
        this.url = finalUrl;
        this.baseUrl = new URL(finalUrl);
        this.domain = this.baseUrl.hostname.replace(/^www\./, '');
        if (this.options.debug) {
          this.display.info(`🔁 Final URL detected: ${finalUrl}`);
        }
      }

      // Step 3: Analyze website framework and technology stack
      this.display.step(
        3,
        7,
        'Framework Analysis',
        'Detecting technology stack and framework patterns...',
      );
      const html = await page.content();
      this.analysis = await this.frameworkAnalyzer.analyze(html, this.url);
      this.displayFrameworkResults();

      // Step 4: Extract all website assets
      this.display.step(4, 7, 'Asset Extraction', 'Downloading and processing assets...');
      this.$ = load(html);
      await this.assetManager.extractAllAssets();

      // Step 5: AI-powered analysis (optional)
      this.display.step(
        5,
        7,
        'AI Analysis',
        'Skipping AI analysis for core functionality...',
      );

      // Step 6: Process framework-specific elements
      this.display.step(
        6,
        7,
        'Framework Processing',
        'Processing framework-specific code structures...',
      );
      await this.processFrameworkSpecific(html);

      // Step 7: Generate final offline-ready output
      this.display.step(
        7,
        7,
        'Output Generation',
        'Creating offline-ready website structure...',
      );
      await this.frameworkWriter.generateOfflineProject();

      // Cleanup and finalization
      await this.browserEngine.close();

      // Display success summary
      this.display.success('Website mirroring completed successfully!');
      this.display.summary({
        outputDir: this.options.outputDir,
        framework: this.analysis?.primaryFramework?.name || 'Vanilla HTML',
        outputType: this.getOutputType(),
        assets: this.getAssetStats(),
        duration: Date.now() - startTime,
      });

      // Show any suppressed warning summary
      this.logger.printSuppressedSummary();

      return true;
    } catch (error) {
      await this.browserEngine.close();
      this.display.error('Mirroring failed', error.message);
      if (this.options.debug) {
        console.log(chalk.red('Debug details:'), error.stack);
      }
      return false;
    }
  }

  async loadPage(page) {
    await page.goto(this.url, {
      waitUntil: 'domcontentloaded',
      timeout: this.options.timeout,
    });

    await this.waitForRootReady(page);
    await this.scrollToBottomAndLoad(page);
    await this.waitForImagesSettled(page, 8000);
    await this.waitForNetworkIdle(page, 1500).catch(() => {});
  }

  async waitForRootReady(page) {
    try {
      await page.waitForFunction(
        () => {
          const roots = ['#__next', '#root', '#app'];
          for (const sel of roots) {
            const el = document.querySelector(sel);
            if (el && el.children && el.children.length > 0) return true;
          }
          return document.readyState === 'complete';
        },
        { timeout: 20000 },
      );
    } catch {
      this.display.warning('Framework/app root readiness timeout');
    }
  }

  async scrollToBottomAndLoad(page) {
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let lastHeight = 0;
        let sameCount = 0;

        const tick = () => {
          window.scrollTo(0, document.body.scrollHeight);
          const h = document.body.scrollHeight;
          if (h > lastHeight) {
            lastHeight = h;
            sameCount = 0;
            setTimeout(tick, 300);
          } else {
            sameCount++;
            if (sameCount < 5) {
              setTimeout(tick, 300);
            } else {
              window.scrollTo(0, 0);
              resolve();
            }
          }
        };
        tick();
      });
    });
  }

  async waitForImagesSettled(page, maxWait = 8000) {
    try {
      await page.waitForFunction(
        () => {
          const imgs = Array.from(document.images || []);
          if (imgs.length === 0) return true;
          return imgs.every((img) => {
            const ok = img.complete && img.naturalWidth > 0;
            const chosen = !!img.currentSrc || !!img.getAttribute('src');
            return ok || chosen;
          });
        },
        { timeout: maxWait },
      );
    } catch {
      // proceed anyway
    }
  }

  async waitForNetworkIdle(page, idleTime = 2000, maxInflight = 2) {
    let inflight = 0;
    let fulfill;
    let timeoutId;

    const cleanup = () => {
      page.off('request', onRequest);
      page.off('requestfinished', onDone);
      page.off('requestfailed', onDone);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const onRequest = (req) => {
      const url = req.url();
      if (url.startsWith('ws:') || url.startsWith('wss:')) return;
      inflight++;
    };

    const onDone = (req) => {
      const url = req.url();
      if (url.startsWith('ws:') || url.startsWith('wss:')) return;
      inflight = Math.max(0, inflight - 1);
      tick();
    };

    const tick = () => {
      if (inflight <= maxInflight) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          cleanup();
          fulfill();
        }, idleTime);
      } else if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    return new Promise((x) => {
      fulfill = x;
      page.on('request', onRequest);
      page.on('requestfinished', onDone);
      page.on('requestfailed', onDone);
      tick();
    });
  }

  displayFrameworkResults() {
    if (this.analysis?.detected?.length > 0) {
      const primary = this.analysis.detected[0];
      this.display.frameworkCard({
        name: primary.name,
        confidence: Math.round(primary.confidence * 100),
        complexity: this.analysis.complexity,
        strategy: this.getMirroringStrategy(primary.key),
      });
    }
  }

  async processFrameworkSpecific(_html) {
    // no-op (handled by generic pipeline)
  }

  getMirroringStrategy(framework) {
    const strategies = {
      nextjs: 'Preserve DOM; localize assets for exact Next.js look',
      gatsby: 'Gatsby static DOM with localized assets',
      react: 'Preserve DOM; localize assets for exact UI',
      vue: 'Preserve DOM; localize assets for exact UI',
      angular: 'Preserve DOM; localize assets for exact UI',
    };
    return strategies[framework] || 'HTML/CSS/JS static files';
  }

  getOutputType() {
    return 'HTML/CSS/JS (Offline-Ready)';
  }

  getAssetStats() {
    return {
      images: this.assets.images.length,
      styles: this.assets.styles.length,
      scripts: this.assets.scripts.length,
      fonts: this.assets.fonts.length,
      icons: this.assets.icons.length,
      media: this.assets.media.length,
      total: Object.values(this.assets).reduce(
        (sum, arr) => sum + arr.length,
        0,
      ),
    };
  }

  resolveUrl(url) {
    if (!url) return '';
    try {
      if (url.startsWith('http') || url.startsWith('data:')) return url;
      if (url.startsWith('//')) return this.baseUrl.protocol + url;
      if (url.startsWith('/'))
        return `${this.baseUrl.protocol}//${this.baseUrl.host}${url}`;
      return new URL(url, this.url).href;
    } catch {
      return url;
    }
  }

  generateFilename(url, category = 'bin') {
    return makeAssetFilename(this.resolveUrl(url), category);
  }
}
