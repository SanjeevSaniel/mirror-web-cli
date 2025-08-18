/**
 * @fileoverview MirrorCloner - Core Website Mirroring Engine
 * @version 1.1.2
 */

import { BrowserEngine } from './browser-engine.js';
import { AssetManager } from './asset-manager.js';
import { FrameworkAnalyzer } from './framework-analyzer.js';
import { FrameworkWriter } from './framework-writer.js';
import { Display } from './display.js';
import { Logger } from './logger.js';
import { AIAnalyzer } from '../ai/ai-analyzer.js';
import chalk from 'chalk';
import { load } from 'cheerio';
import { makeAssetFilename } from './filename-utils.js';
import http from 'http';
import fs from 'fs';
import path from 'path';

export class MirrorCloner {
  constructor(urlStr, options = {}) {
    this.url = urlStr;
    this.baseUrl = new URL(urlStr);
    this.domain = this.baseUrl.hostname.replace(/^www\./, '');

    // Always auto by default; engine will decide JS ON/OFF
    const jsMode = 'auto';

    this.options = {
      outputDir:
        options.outputDir ||
        options.output ||
        this.generateOutputDir(options.ai, this.domain),
      debug: !!options.debug,
      clean: !!options.clean,
      timeout: options.timeout || 120000,
      headless: options.headless !== false,
      quiet: !!options.quiet,
      suppressWarnings: options.suppressWarnings !== false,
      ai: !!options.ai,
      jsMode,
      // Working flag decided by preflight
      disableJs: false,
      ...options,
    };

    if (!this.options.outputDir) {
      this.options.outputDir = this.generateOutputDir(
        this.options.ai,
        this.domain,
      );
    }

    // Initialize core components
    this.browserEngine = new BrowserEngine(this.options);
    this.assetManager = new AssetManager(this);
    this.frameworkAnalyzer = new FrameworkAnalyzer();
    this.frameworkWriter = new FrameworkWriter(this);
    this.display = new Display();
    this.logger = new Logger(this.options);

    // Optional AI
    this.aiAnalyzer = this.options.ai ? new AIAnalyzer() : null;

    // Data
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

    // Keep track of active request interception handlers per page
    this._reqInterceptionHandlers = new WeakMap();
  }

  // Safe pause that works with Puppeteer, Playwright, or plain timers
  async pause(pageOrMs, maybeMs) {
    const hasPage = typeof pageOrMs === 'object' && pageOrMs !== null;
    const page = hasPage ? pageOrMs : null;
    const ms = hasPage ? maybeMs : pageOrMs;
    if (page && typeof page.waitForTimeout === 'function') {
      try {
        await page.waitForTimeout(ms);
        return;
      } catch {
        // fallthrough to timer
      }
    }
    await new Promise((res) => setTimeout(res, ms));
  }

  async clone() {
    const startTime = Date.now();

    try {
      // Display header and configuration info
      this.display.header(
        'Mirror Web CLI v1.1',
        'Advanced Website Mirroring Tool',
      );
      this.display.info(`🌐 Source: ${this.url}`);
      this.display.info(`📁 Output: ${this.options.outputDir}`);

      // Step 1: Preflight dual-render comparator to choose JS mode automatically
      this.display.step(
        1,
        9,
        'Preflight',
        'Evaluating site with JS ON vs OFF to decide optimal mode...',
      );
      const pre = await this.preflightDualRender();
      this.options.disableJs = pre.decision === 'off';
      const chosenHtml = this.options.disableJs ? pre.htmlOff : pre.htmlOn;

      if (this.options.debug) {
        console.log(
          chalk.gray(
            `    Preflight decision: ${pre.decision.toUpperCase()} (framework=${
              pre.frameworkHint
            }, shadowHosts=${pre.metricsOff.shadowHosts}, customEls=${
              pre.metricsOff.customEls
            })`,
          ),
        );
      }

      // Step 2: Analyze website framework and technology stack (on chosen HTML)
      this.display.step(
        2,
        9,
        'Framework Analysis',
        'Detecting technology stack and framework patterns...',
      );
      this.analysis = await this.frameworkAnalyzer.analyze(
        chosenHtml,
        this.url,
      );
      this.displayFrameworkResults();

      // Step 3: Initialize browser for asset collection (single pass for assets)
      this.display.step(3, 9, 'Browser Setup', 'Launching headless browser...');
      const page = await this.browserEngine.createPage();

      // Attach Microlink sniffer BEFORE navigation to capture preview assets as they load
      this.attachMicrolinkSniffer(page);

      // Step 4: Load and process target website for asset harvesting
      this.display.step(
        4,
        9,
        'Page Loading',
        'Loading website content and harvesting assets...',
      );
      await this.loadPage(page);

      // Simulate link preview hovers so previews render in DOM and network calls are made
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

      // Step 5: Shadow DOM serialization (improves static snapshots)
      await this.serializeShadowDOM(page).catch(() => {});

      // Step 6: Extract all website assets using chosen HTML as baseline
      this.display.step(
        5,
        9,
        'Asset Extraction',
        'Downloading and processing assets...',
      );
      const htmlForExtraction = await page.content().catch(() => chosenHtml);
      // Prefer current page DOM (richer with computed asset injections); fallback to chosen preflight HTML
      this.$ = load(htmlForExtraction || chosenHtml);
      await this.assetManager.extractAllAssets();

      // Step 7: AI-powered analysis (optional)
      this.display.step(
        6,
        9,
        'AI Analysis',
        this.options.ai
          ? 'Using OpenAI GPT-4o for insights...'
          : 'Skipping AI analysis...',
      );
      if (this.options.ai && this.aiAnalyzer?.isEnabled) {
        try {
          const ai = await this.aiAnalyzer.analyzeWebsite(
            this.url,
            htmlForExtraction || chosenHtml,
            this.analysis,
            this.assets,
          );
          this.analysis.aiInsights = ai.aiInsights;
          this.analysis.enhanced = ai.enhanced;
          this.aiAnalyzer.displayAnalysis({
            ...this.analysis,
            aiInsights: ai.aiInsights,
            enhanced: ai.enhanced,
          });
        } catch (e) {
          if (this.options.debug)
            console.log(chalk.yellow('⚠️ AI analysis error:'), e?.message || e);
        }
      }

      // Step 8: Generate output based on decided JS mode
      this.display.step(
        7,
        9,
        'Output Generation',
        this.options.disableJs
          ? 'Creating static snapshot (JS disabled)...'
          : 'Creating JS-enabled offline output...',
      );
      await this.frameworkWriter.generateOfflineProject();

      // Step 9: Offline validation and auto-fallback (safety net)
      let autoFallenBack = false;
      if (!this.options.disableJs) {
        this.display.step(
          8,
          9,
          'Offline Validation',
          'Verifying offline rendering (http and file protocols)...',
        );
        const validHttp = await this.validateOfflineOutputHttp();
        const validFile = await this.validateOfflineOutputFile();
        const valid = validHttp && validFile;

        if (!valid) {
          this.display.warning(
            `Offline validation detected a blank/empty root (${
              validHttp ? 'http OK' : 'http blank'
            }, ${
              validFile ? 'file OK' : 'file blank'
            }). Applying auto static snapshot fallback...`,
          );
          this.options.disableJs = true;
          await this.frameworkWriter.writeIndexHtmlOnly();
          autoFallenBack = true;
        }
      }

      // Finalize
      this.display.step(
        9,
        9,
        'Finalize',
        autoFallenBack
          ? 'Auto-fallback applied (static snapshot).'
          : 'Output ready.',
      );

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

  // --- Preflight: decide JS ON vs OFF automatically ---
  async preflightDualRender() {
    // Pass A: JS ON (normal)
    const pageOn = await this.browserEngine.createPage();
    const consoleOn = [];
    const collectConsole = (msg) => {
      try {
        const t = msg.type ? msg.type() : 'log';
        consoleOn.push(`[${t}] ${msg.text?.() || msg.text()}`);
      } catch {
        // ignore
      }
    };
    pageOn.on('console', collectConsole);

    await pageOn.goto(this.url, {
      waitUntil: 'domcontentloaded',
      timeout: this.options.timeout,
    });
    await this.waitForRootReady(pageOn);
    // Lightweight settle
    await this.pause(pageOn, 500);
    const metricsOn = await this._collectPreflightMetrics(pageOn);
    const htmlOn = await pageOn.content();
    await pageOn.close();

    // Pass B: JS "OFF" by blocking script requests
    const pageOff = await this.browserEngine.createPage();
    await this._blockScripts(pageOff, true);
    const consoleOff = [];
    const collectConsoleOff = (msg) => {
      try {
        const t = msg.type ? msg.type() : 'log';
        consoleOff.push(`[${t}] ${msg.text?.() || msg.text()}`);
      } catch {}
    };
    pageOff.on('console', collectConsoleOff);

    await pageOff.goto(this.url, {
      waitUntil: 'domcontentloaded',
      timeout: this.options.timeout,
    });
    await this.waitForRootReady(pageOff).catch(() => {});
    await this.pause(pageOff, 300);
    const metricsOff = await this._collectPreflightMetrics(pageOff);
    const htmlOff = await pageOff.content();
    await pageOff.close();

    // Framework hint: detect Next.js in htmlOn or htmlOff
    const frameworkHint =
      this._frameworkHint(htmlOn || '') || this._frameworkHint(htmlOff || '');

    // Decision rules
    const hydrationError =
      consoleOn
        .join('\n')
        .match(/Hydration failed|did not match|Minified React error/i) !=
        null ||
      metricsOn.overlayPresent ||
      (metricsOn.blank && frameworkHint === 'nextjs');

    let decision = 'on'; // default prefer JS ON for richer sites

    if (frameworkHint === 'nextjs' && hydrationError) {
      decision = 'off';
    } else if (!metricsOn.blank && metricsOff.blank) {
      // JS ON looks healthy, JS OFF is blank -> ON
      decision = 'on';
    } else if (metricsOn.blank && !metricsOff.blank) {
      // JS ON blanks (likely hydration wiping) -> OFF
      decision = 'off';
    } else if (!metricsOn.blank && !metricsOff.blank) {
      // Both render; bias using shadow/custom elements density (prefer ON if complex)
      if (
        metricsOff.shadowHosts > 25 ||
        metricsOff.customEls > 40 ||
        metricsOff.shadowHosts + metricsOff.customEls >
          Math.max(60, (metricsOn.nodeCount || 0) * 0.02)
      ) {
        decision = 'on';
      } else {
        decision = 'on'; // still prefer ON when both are fine
      }
    } else {
      // Both look blank; for safety choose OFF to preserve SSR if present
      decision = 'off';
    }

    if (this.options.debug) {
      console.log(
        chalk.gray(
          `    Preflight metrics: ON(blank=${metricsOn.blank}, text=${metricsOn.textLen}, overlay=${metricsOn.overlayPresent}) | OFF(blank=${metricsOff.blank}, text=${metricsOff.textLen}, shadow=${metricsOff.shadowHosts}, custom=${metricsOff.customEls})`,
        ),
      );
    }

    return { decision, htmlOn, htmlOff, metricsOn, metricsOff, frameworkHint };
  }

  _frameworkHint(html) {
    try {
      if (!html) return null;
      if (html.includes('id="__NEXT_DATA__"') || /\/_next\//i.test(html))
        return 'nextjs';
      if (/<div id="root">/.test(html)) return 'react';
      return null;
    } catch {
      return null;
    }
  }

  async _collectPreflightMetrics(page) {
    try {
      return await page.evaluate(() => {
        function getRoot() {
          return (
            document.querySelector('#__next, #root, [data-reactroot]') ||
            document.body
          );
        }
        function rectArea(el) {
          try {
            const r = el.getBoundingClientRect();
            return Math.max(0, r.width) * Math.max(0, r.height);
          } catch {
            return 0;
          }
        }
        function countCustomElements() {
          try {
            const all = Array.from(document.querySelectorAll('*'));
            return all.filter((el) => el.tagName.includes('-')).length;
          } catch {
            return 0;
          }
        }
        function countShadowHosts() {
          let n = 0;
          try {
            document.querySelectorAll('*').forEach((el) => {
              if (el.shadowRoot) n++;
            });
          } catch {}
          return n;
        }
        const root = getRoot();
        const htmlLen = (root?.innerHTML || '').trim().length;
        const textLen = (root?.innerText || '').replace(/\s+/g, '').length;
        const area = root ? rectArea(root) : 0;
        const style = root ? getComputedStyle(root) : null;
        const hidden =
          !root ||
          (style &&
            (style.display === 'none' || style.visibility === 'hidden'));
        const overlayPresent = !!document.querySelector(
          '[data-nextjs-dialog-overlay]',
        );
        const nodeCount = document.querySelectorAll('*').length;
        const blank = hidden || htmlLen < 100 || (textLen < 10 && area < 1500); // small/empty
        return {
          blank,
          htmlLen,
          textLen,
          area,
          hidden,
          overlayPresent,
          nodeCount,
          shadowHosts: countShadowHosts(),
          customEls: countCustomElements(),
        };
      });
    } catch {
      return {
        blank: false,
        htmlLen: 0,
        textLen: 0,
        area: 0,
        hidden: false,
        overlayPresent: false,
        nodeCount: 0,
        shadowHosts: 0,
        customEls: 0,
      };
    }
  }

  // Robust script blocking for Puppeteer (avoids "Request is already handled!" by ensuring one handler and single resolution)
  async _blockScripts(page, enabled) {
    try {
      // Puppeteer-style interception
      if (page.setRequestInterception) {
        // Remove any existing handler we attached earlier
        const existing = this._reqInterceptionHandlers.get(page);
        if (existing) {
          try {
            page.off('request', existing);
          } catch {}
          this._reqInterceptionHandlers.delete(page);
        }

        await page.setRequestInterception(enabled);

        if (enabled) {
          const handler = (req) => {
            try {
              const type =
                typeof req.resourceType === 'function'
                  ? req.resourceType()
                  : '';
              if (type === 'script') {
                // Abort script requests to simulate JS OFF
                // Never call continue() afterwards for this request
                return req.abort('blockedbyclient').catch(() => {});
              }
              // Allow other resource types
              return req.continue().catch(() => {});
            } catch {
              // Swallow any errors to avoid double-handling
            }
          };
          page.on('request', handler);
          this._reqInterceptionHandlers.set(page, handler);
        }
        return;
      }

      // Playwright-style routing (best-effort; noop if not available)
      if (page.route) {
        // Note: To avoid stacking routes we'd need unroute. Since our main env is Puppeteer,
        // we keep this light and avoid adding multiple routes.
        if (enabled) {
          await page.route('**/*', (route) => {
            try {
              const req = route.request();
              const type =
                req && typeof req.resourceType === 'function'
                  ? req.resourceType()
                  : '';
              if (type === 'script') return route.abort();
              return route.continue();
            } catch {
              try {
                return route.continue();
              } catch {}
            }
          });
        } else if (page.unroute) {
          try {
            await page.unroute('**/*');
          } catch {}
        }
      }
    } catch {
      // ignore
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

  // Serialize shadow DOM into Declarative Shadow DOM (<template shadowroot="open">)
  // so static snapshots include content of web components.
  async serializeShadowDOM(page) {
    await page.evaluate(() => {
      try {
        const hosts = [];
        document.querySelectorAll('*').forEach((el) => {
          if (el.shadowRoot) hosts.push(el);
        });

        hosts.forEach((host) => {
          if (host.querySelector(':scope > template[shadowroot]')) return;

          const tmpl = document.createElement('template');
          const mode =
            host.shadowRoot && host.shadowRoot.mode
              ? host.shadowRoot.mode
              : 'open';
          tmpl.setAttribute(
            'shadowroot',
            mode === 'closed' ? 'closed' : 'open',
          );

          let html = '';
          try {
            html = host.shadowRoot ? host.shadowRoot.innerHTML : '';
          } catch (e) {
            html = '';
          }
          tmpl.innerHTML = html;
          host.appendChild(tmpl);
        });
      } catch (e) {
        // ignore
      }
    });
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
          await Promise.race([
            page
              .waitForResponse((r) => /microlink\.io/.test(r.url()), {
                timeout: 800,
              })
              .catch(() => {}),
            this.pause(page, 150),
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
      const reqUrl = req.url();
      if (reqUrl.startsWith('ws:') || reqUrl.startsWith('wss:')) return;
      inflight++;
    };

    const onDone = (req) => {
      const reqUrl = req.url();
      if (reqUrl.startsWith('ws:') || reqUrl.startsWith('wss:')) return;
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
      nextjs: this.options.disableJs
        ? 'Static snapshot (JS removed) to avoid hydration/blank page'
        : 'Preserve DOM; localize assets for exact Next.js look',
      react: this.options.disableJs
        ? 'Static snapshot (JS removed) to preserve SSR DOM'
        : 'Preserve DOM; localize assets for exact UI',
      gatsby: 'Gatsby static DOM with localized assets',
      vue: 'Preserve DOM; localize assets for exact UI',
      angular: 'Preserve DOM; localize assets for exact UI',
    };
    return strategies[framework] || 'HTML/CSS/JS static files';
  }

  getOutputType() {
    const willStrip = this.options.disableJs;
    return willStrip
      ? 'Static HTML (JS removed) + CSS/Images'
      : 'HTML/CSS/JS (Offline-Ready)';
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

  resolveUrl(u) {
    if (!u) return '';
    try {
      if (u.startsWith('http') || u.startsWith('data:')) return u;
      if (u.startsWith('//')) return this.baseUrl.protocol + u;
      if (u.startsWith('/'))
        return `${this.baseUrl.protocol}//${this.baseUrl.host}${u}`;
      return new URL(u, this.url).href;
    } catch {
      return u;
    }
  }

  generateFilename(u, category = 'bin') {
    return makeAssetFilename(this.resolveUrl(u), category);
  }

  generateOutputDir(aiEnabled, domain) {
    const suffix = aiEnabled ? '-ai-enhanced' : '-standard';
    return `./${domain}${suffix}`;
  }

  // --- Offline validation helpers (safety net) ---
  async validateOfflineOutputHttp() {
    const { server, baseUrl } = await this._startStaticServer(
      this.options.outputDir,
    );
    try {
      const page = await this.browserEngine.createPage();
      await page.goto(baseUrl + '/index.html', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      const ok = await this._evaluateOfflineHealth(page);
      await page.close();
      return ok;
    } catch (e) {
      if (this.options.debug) {
        console.log(chalk.yellow('⚠️ HTTP validation error:'), e.message);
      }
      // On validation errors, prefer to accept output (don’t fallback aggressively)
      return true;
    } finally {
      await new Promise((res) => server.close(() => res()));
    }
  }

  async validateOfflineOutputFile() {
    try {
      const page = await this.browserEngine.createPage();
      const fileUrl =
        'file://' + path.resolve(this.options.outputDir, 'index.html');
      await page.goto(fileUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      const ok = await this._evaluateOfflineHealth(page);
      await page.close();
      return ok;
    } catch (e) {
      if (this.options.debug) {
        console.log(chalk.yellow('⚠️ file:// validation error:'), e.message);
      }
      // Treat file validation failures as a signal to fallback
      return false;
    }
  }

  async _evaluateOfflineHealth(page) {
    const delays = [120, 700, 2200, 3500];
    for (const d of delays) {
      await this.pause(page, d);
      /* eslint-disable no-await-in-loop */
      const status = await page.evaluate(() => {
        function getRoot() {
          return (
            document.querySelector('#__next, #root, [data-reactroot]') ||
            document.body
          );
        }
        function rectArea(el) {
          try {
            const r = el.getBoundingClientRect();
            return Math.max(0, r.width) * Math.max(0, r.height);
          } catch {
            return 0;
          }
        }
        const root = getRoot();
        const htmlLen = (root?.innerHTML || '').trim().length;
        const textLen = (root?.innerText || '').replace(/\s+/g, '').length;
        const area = root ? rectArea(root) : 0;
        const style = root ? getComputedStyle(root) : null;
        const hidden =
          !root ||
          (style &&
            (style.display === 'none' || style.visibility === 'hidden'));
        const blank = hidden || htmlLen < 100 || (textLen < 10 && area < 1500); // small/empty
        return { blank, htmlLen, textLen, area, hidden };
      });
      if (!status.blank) return true;
    }
    return false;
  }

  async _startStaticServer(rootDir) {
    const root = path.resolve(rootDir);

    const server = http.createServer((req, res) => {
      try {
        const reqUrl = new URL(req.url, 'http://localhost');
        let pathname = decodeURIComponent(reqUrl.pathname);
        if (pathname === '/') pathname = '/index.html';
        const filePath = this._safeJoin(root, '.' + pathname);

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          this._serveFile(res, filePath);
          return;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
          const indexInDir = path.join(filePath, 'index.html');
          if (fs.existsSync(indexInDir)) {
            this._serveFile(res, indexInDir);
            return;
          }
        }

        const fallback = path.join(root, 'index.html');
        if (fs.existsSync(fallback)) {
          this._serveFile(res, fallback);
          return;
        }

        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error\n' + (e?.message || ''));
      }
    });

    await new Promise((res) => server.listen(0, () => res()));
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;
    return { server, baseUrl };
  }

  _safeJoin(root, p) {
    const resolved = path.resolve(root, p);
    if (!resolved.startsWith(root)) return root;
    return resolved;
  }

  _serveFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mime =
      {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.avif': 'image/avif',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.m4a': 'audio/mp4',
        '.woff2': 'font/woff2',
        '.woff': 'font/woff',
        '.ttf': 'font/ttf',
        '.otf': 'font/otf',
        '.eot': 'application/vnd.ms-fontobject',
        '.txt': 'text/plain; charset=utf-8',
        '.map': 'application/json; charset=utf-8',
      }[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=60',
    });
    fs.createReadStream(filePath).pipe(res);
  }
}
