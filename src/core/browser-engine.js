import puppeteer from 'puppeteer';
import chalk from 'chalk';

/**
 * Browser Engine - Handles browser automation
 */
export class BrowserEngine {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 120000,
      debug: options.debug || false,
      ...options,
    };
    this.browser = null;
    this.page = null;
  }

  /**
   * Create a new page with optimized, more "real" browser settings for Next.js
   */
  async createPage() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: this.options.headless,
        ignoreHTTPSErrors: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--window-size=1366,768',
        ],
      });
    }

    this.page = await this.browser.newPage();

    try {
      await this.page.setBypassCSP(true);
    } catch {}

    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    );

    await this.page.setDefaultTimeout(this.options.timeout);
    await this.page.setDefaultNavigationTimeout(this.options.timeout);

    await this.page.setRequestInterception(true);

    this.page.on('request', (request) => {
      request.continue().catch(() => {});
    });

    this.page.on('requestfailed', (request) => {
      if (this.options.debug) {
        console.log(
          chalk.yellow(
            `⚠️ Failed request: ${request.url()} - ${
              request.failure()?.errorText || ''
            }`,
          ),
        );
      }
    });

    return this.page;
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch {}
      this.browser = null;
      this.page = null;
    }
  }
}
