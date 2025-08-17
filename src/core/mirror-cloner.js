/**
 * @fileoverview MirrorCloner - Core Website Mirroring Engine
 * @description Orchestrates mirroring: browser automation, framework detection, asset extraction, output.
 * @version 1.0.1
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

export class MirrorCloner {
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

    // Microlink capture helpers
    this._microlinkHandlers = { response: null };
    this._microlinkCaptured = new Set();
  }

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

      // Attach Microlink sniffer BEFORE navigation to capture preview assets as they load
      this.attachMicrolinkSniffer(page);

      // Step 2: Load and process target website
      this.display.step(
        2,
        7,
        'Page Loading',
        'Loading website content and waiting for completion...',
      );
      await this.loadPage(page);

      // Simulate link preview hovers (e.g., "Teachyst") so previews render in DOM and network calls are made
      await this.simulateLinkPreviews(page).catch(() => {});
      await this.waitForNetworkIdle(page, 1200).catch(() => {});
      await this.waitForImagesSettled(page, 4000).catch(() => {});

      // Harvest computed-style assets (background images, pseudo-elements) into the DOM
      await this.collectComputedAssets(page).catch(() => {});
      await this.waitForNetworkIdle(page, 1000).catch(() => {});

      // Detach sniffer now that previews have had a chance to load
      this.detachMicrolinkSniffer(page);

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
      this.display.step(
        4,
        7,
        'Asset Extraction',
        'Downloading and processing assets...',
      );
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

  // Network sniffer for Microlink assets (images and JSON to discover screenshot URLs)
  attachMicrolinkSniffer(page) {
    const isMicrolink = (u) => {
      try {
        const host = new URL(u).hostname.toLowerCase();
        return host.endsWith('microlink.io');
      } catch {
        return /microlink\.io/i.test(String(u));
      }
    };
    const handler = async (response) => {
      try {
        const u = response.url();
        if (!isMicrolink(u)) return;

        const status = response.status();
        const headers = response.headers() || {};
        const ctype = String(headers['content-type'] || '').toLowerCase();
        if (status < 200 || status >= 300) return;

        if (this._microlinkCaptured.has(u)) return;
        this._microlinkCaptured.add(u);

        if (ctype.startsWith('image/')) {
          // Direct image payload; store as buffer now
          const buf = await response.buffer().catch(() => null);
          if (!buf || !buf.length) return;
          const filename = this.generateFilename(u, 'images');
          this.assets.images.push({
            url: u,
            filename,
            buffer: buf,
            local: true,
          });
          if (this.options.debug) {
            console.log(chalk.gray(`    ⤵︎ Captured Microlink image: ${u}`));
          }
          return;
        }

        // JSON payload: try to extract the actual screenshot/image url
        if (ctype.includes('application/json')) {
          const text = await response.text().catch(() => '');
          if (!text) return;
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            return;
          }
          const target =
            data?.data?.image?.url ||
            data?.data?.screenshot?.url ||
            data?.data?.thumbnail?.url ||
            data?.image?.url ||
            data?.screenshot?.url ||
            null;

          if (target) {
            // Queue this target image for normal download later
            const abs = this.resolveUrl(target);
            const filename = this.generateFilename(abs, 'images');
            if (!this.assets.images.find((x) => x.url === abs)) {
              this.assets.images.push({
                url: abs,
                filename,
                local: false,
              });
              if (this.options.debug) {
                console.log(
                  chalk.gray(
                    `    ⤵︎ Discovered Microlink target image: ${abs}`,
                  ),
                );
              }
            }
          }
        }
      } catch {
        // ignore errors
      }
    };
    page.on('response', handler);
    this._microlinkHandlers.response = handler;
  }

  detachMicrolinkSniffer(page) {
    if (this._microlinkHandlers.response) {
      page.off('response', this._microlinkHandlers.response);
      this._microlinkHandlers.response = null;
    }
  }

  // Hover/link-preview simulator to surface dynamic hovercards/popovers into the DOM
  async simulateLinkPreviews(page) {
    try {
      await page.evaluate(() => window.scrollTo(0, 0));

      // Specifically target "Teachyst" anchors if present
      const teachystHandles = await page.$x(
        "//a[contains(., 'Teachyst') or contains(@href, 'teachyst')]",
      );
      for (const h of teachystHandles) {
        try {
          await h.evaluate((el) =>
            el.scrollIntoView({ block: 'center', inline: 'center' }),
          );
          await page.evaluate((el) => {
            const r = el.getBoundingClientRect();
            const opts = {
              bubbles: true,
              cancelable: true,
              clientX: r.left + 4,
              clientY: r.top + 4,
            };
            el.dispatchEvent(new MouseEvent('pointerenter', opts));
            el.dispatchEvent(new MouseEvent('mouseover', opts));
            el.dispatchEvent(new MouseEvent('mouseenter', opts));
          }, h);
          await h.hover();
          await page.waitForTimeout(700);
        } catch {}
      }

      // Generic hover triggers (limited count)
      const selectors = [
        '[data-hovercard]',
        '[data-popover]',
        '[data-tooltip]',
        '[data-trigger="hover"]',
        '[role="tooltip"]',
        'a',
      ];
      const handles = await page.$$(selectors.join(','));
      let count = 0;
      for (const h of handles) {
        if (count++ >= 30) break;
        try {
          await h.evaluate((el) => {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0)
              el.scrollIntoView({ block: 'center', inline: 'center' });
          });
          await h.hover();
          await page.evaluate((el) => {
            const r = el.getBoundingClientRect();
            const opts = {
              bubbles: true,
              cancelable: true,
              clientX: r.left + 2,
              clientY: r.top + 2,
            };
            el.dispatchEvent(new MouseEvent('pointerenter', opts));
            el.dispatchEvent(new MouseEvent('mouseover', opts));
            el.dispatchEvent(new MouseEvent('mouseenter', opts));
          }, h);
          await Promise.race([
            page
              .waitForResponse((r) => /microlink\.io/.test(r.url()), {
                timeout: 1200,
              })
              .catch(() => {}),
            page.waitForTimeout(180),
          ]);
        } catch {}
      }
    } catch {
      // ignore failures
    }
  }

  // Collect computed-style url(...) assets and inject hidden <img> so the snapshot includes them
  async collectComputedAssets(page) {
    await page.evaluate(() => {
      function extractUrls(val) {
        if (!val || typeof val !== 'string') return [];
        const urls = [];
        const re = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
        let m;
        while ((m = re.exec(val)) !== null) urls.push(m[1]);
        return urls;
      }
      function collect(el, out) {
        const cs = window.getComputedStyle(el);
        [
          'backgroundImage',
          'background',
          'maskImage',
          'WebkitMaskImage',
          'borderImageSource',
          'listStyleImage',
        ].forEach((p) => extractUrls(cs[p]).forEach((u) => out.add(u)));
        const before = window.getComputedStyle(el, '::before');
        const after = window.getComputedStyle(el, '::after');
        [before, after].forEach((ps) => {
          extractUrls(ps.content).forEach((u) => out.add(u));
          extractUrls(ps.backgroundImage).forEach((u) => out.add(u));
        });
        if (el.shadowRoot) {
          el.shadowRoot.querySelectorAll('img[src]').forEach((img) => {
            const s = img.getAttribute('src');
            if (s) out.add(s);
          });
        }
      }
      const urls = new Set();
      document.querySelectorAll('*').forEach((el) => collect(el, urls));
      urls.forEach((u) => {
        if (!u || String(u).startsWith('data:')) return;
        const img = document.createElement('img');
        img.setAttribute('data-mw-computed', '1');
        img.decoding = 'async';
        img.loading = 'eager';
        img.alt = '';
        img.src = u;
        img.style.cssText =
          'display:none !important;width:0;height:0;opacity:0;';
        document.body.appendChild(img);
      });
    });
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
