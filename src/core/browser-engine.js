import puppeteer from 'puppeteer-extra';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import chalk from 'chalk';

let isAdblockerRegistered = false;

/**
 * Browser Engine - Handles browser automation
 */
export class BrowserEngine {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      timeout: options.timeout || 120000,
      debug: options.debug || false,
      blockAds: !!options.blockAds,
      blockCookies: !!options.blockCookies,
      ...options,
    };
    this.browser = null;
    this.page = null;

    // Use adblocker plugin if enabled
    if (this.options.blockAds && !isAdblockerRegistered) {
      puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
      isAdblockerRegistered = true;
    }
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
    } catch { }

    await this.page.setViewport({ width: 1366, height: 768 });
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    );

    await this.page.setDefaultTimeout(this.options.timeout);
    await this.page.setDefaultNavigationTimeout(this.options.timeout);

    // If adblocker is NOT enabled, we still use request interception for basic logic
    // If it IS enabled, puppeteer-extra-plugin-adblocker handles much of this.
    await this.page.setRequestInterception(true);

    this.page.on('request', (request) => {
      request.continue().catch(() => { });
    });

    this.page.on('requestfailed', (request) => {
      if (this.options.debug) {
        console.log(
          chalk.yellow(
            `⚠️ Failed request: ${request.url()} - ${request.failure()?.errorText || ''
            }`,
          ),
        );
      }
    });

    return this.page;
  }

  /**
   * Automatically detect and remove/click-through cookie consent banners
   */
  async handleCookieConsent(page) {
    if (!this.options.blockCookies) return;

    if (this.options.debug) {
      console.log(chalk.gray('  🍪 Attempting to remove cookie consent banners...'));
    }

    try {
      await page.evaluate(() => {
        // 1. Common selectors for cookie banners and modals
        const cookieSelectors = [
          '[id*="cookie" i]', '[class*="cookie" i]',
          '[id*="consent" i]', '[class*="consent" i]',
          '[id*="privacy" i]', '[class*="privacy" i]',
          '[id*="banner" i]', '[class*="banner" i]',
          '[id*="notice" i]', '[class*="notice" i]',
          '[id*="modal" i]', '[class*="modal" i]',
          '.optanon-alert-box-wrapper', '#onetrust-consent-sdk',
          '.cc_banner', '.cc_container',
          '#didomi-host'
        ];

        // 2. Common button text for "Accept"
        const acceptButtonTexts = [
          // Core accept
          'Accept',
          'Accept All',
          'Accept all cookies',
          'Accept Cookies',
          'Accept all',
          'Accept & Continue',
          'Accept and Continue',
          'Accept and Close',
          'Accept All Cookies',
          'Accept all and continue',

          // Agree
          'Agree',
          'I Agree',
          'I agree',
          'Agree & Continue',
          'Agree and Continue',

          // Allow
          'Allow',
          'Allow All',
          'Allow all cookies',
          'Allow Cookies',
          'Allow all',
          'Allow & Continue',

          // Consent
          'Consent',
          'Give Consent',
          'Provide Consent',
          'Yes I Consent',

          // Confirm / continue
          'Confirm',
          'Confirm choices',
          'Confirm selection',
          'Confirm and continue',
          'Continue',
          'Continue to site',
          'Continue without changes',

          // OK style
          'OK',
          'Okay',
          'Ok',
          'Got it',
          'Understood',
          'I understand',
          'Sounds good',

          // Close style (many banners accept on close)
          'Close',
          'Close and accept',
          'Dismiss',
          'Done',

          // Save / approve
          'Save',
          'Save and accept',
          'Save preferences',
          'Approve',
          'Approve all',

          // Misc common wording
          'Yes',
          'Yes, I agree',
          'Yes, accept',
          'Yes, allow',
          'Enable all',
          'Enable cookies',
          'Accept recommended',
          'Accept suggested',

          // GDPR CMP wording
          'Accept all purposes',
          'Accept all cookies and continue',
          'Agree to all',
          'Allow all and continue'
        ];

        // Remove identified banners
        cookieSelectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => {
              // Only remove if it looks like a popup (likely fixed or absolute)
              const style = window.getComputedStyle(el);
              if (style.position === 'fixed' || style.position === 'absolute') {
                el.style.display = 'none';
                el.setAttribute('aria-hidden', 'true');
              }
            });
          } catch (e) { }
        });

        // Click "Accept" buttons if found (case-insensitive partial match)
        const buttons = Array.from(document.querySelectorAll('button, a, span, div[role="button"]'));
        for (const btn of buttons) {
          const text = (btn.innerText || btn.textContent || '').trim();
          if (!text || text.length > 50) continue; // Skip empty or too long text (unlikely to be a simple button)

          const lowerText = text.toLowerCase();
          const isMatch = acceptButtonTexts.some(t => lowerText.includes(t.toLowerCase()));

          if (isMatch) {
            try {
              // Safety: If it's a link with an href, it might navigate.
              // We prefer clicking buttons or elements that don't look like external links.
              const isLinkWithHref = btn.tagName === 'A' && btn.getAttribute('href') && !btn.getAttribute('href').startsWith('#');
              const isStrongAccept = /accept all|allow all|agree to all|accept and continue/i.test(lowerText);

              // If it's a link that navigates, only click if it's a VERY strong "Accept All" signal.
              // Otherwise, we might be clicking a "Cookie Policy" link by mistake.
              if (isLinkWithHref && !isStrongAccept) {
                continue;
              }

              btn.click();
              // One click is often enough for most banners; let's break if we found a strong match
              if (isStrongAccept) break;
            } catch (e) { }
          }
        }

        // 3. Remove overlay/backdrop if present
        const overlays = [
          '.modal-backdrop', '.fade', '.in',
          '[class*="backdrop" i]', '[id*="backdrop" i]',
          '[class*="overlay" i]', '[id*="overlay" i]'
        ];
        overlays.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => {
              const style = window.getComputedStyle(el);
              if (style.position === 'fixed' || style.zIndex > 100) {
                el.style.display = 'none';
              }
            });
          } catch (e) { }
        });

        // 4. Restore scrolling if it was disabled by a modal
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
      });
    } catch (error) {
      if (this.options.debug) {
        console.log(chalk.gray(`  ⚠️ Cookie removal error: ${error.message}`));
      }
    }
  }

  async close() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch { }
      this.browser = null;
      this.page = null;
    }
  }
}
