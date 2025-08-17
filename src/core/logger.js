import chalk from 'chalk';

export class Logger {
  constructor(options = {}) {
    this.options = {
      debug: !!options.debug,
      quiet: !!options.quiet,
      suppressWarnings: options.suppressWarnings !== false, // default true
      suppressDomains: new Set(['www.google.com', 'google.com']),
      suppressPatterns: [
        /\/s2\/favicons/i, // Google favicon API
        /\/xjs\/_\/js\//i, // Google dynamic JS bundles
        /\/_next\/image\?/i, // Next.js optimized image URLs (rewritten later)
      ],
      suppressCategories: new Set([
        'icon',
        'css-asset',
        'analytics',
        'tracker',
      ]),
      ...options,
    };

    this.suppressedCounts = {}; // category => count
    this.warningsShown = 0;
  }

  info(msg) {
    if (!this.options.quiet) console.log(msg);
  }
  success(msg) {
    if (!this.options.quiet) console.log(chalk.green(msg));
  }
  error(msg) {
    console.log(chalk.red(msg));
  }

  warn(message, opts = {}) {
    const { category = 'general', url = '', error } = opts;
    const shouldHide = this.shouldSuppress(category, url, error);

    if (shouldHide && !this.options.debug) {
      this.suppressedCounts[category] =
        (this.suppressedCounts[category] || 0) + 1;
      return;
    }

    this.warningsShown += 1;
    const reason = error?.message ? `: ${error.message}` : '';
    console.log(
      chalk.yellow(`⚠️ ${message}${reason}${url ? ` -> ${url}` : ''}`),
    );
  }

  warnNonCritical(category, url, error) {
    this.warn(`Non-critical asset skipped`, { category, url, error });
  }

  shouldSuppress(category, rawUrl = '', _error) {
    if (!this.options.suppressWarnings) return false;
    const url = String(rawUrl || '');

    // Category-based suppression
    if (this.options.suppressCategories.has(category)) return true;

    // Domain suppression
    try {
      const u = new URL(url);
      if (this.options.suppressDomains.has(u.hostname)) return true;
    } catch {
      // ignore parse errors
    }

    // Pattern suppression
    if (this.options.suppressPatterns.some((re) => re.test(url))) return true;

    return false;
  }

  printSuppressedSummary() {
    const entries = Object.entries(this.suppressedCounts);
    if (!entries.length) return;
    const total = entries.reduce((s, [, n]) => s + n, 0);
    console.log(
      chalk.gray(
        `Note: ${total} non-critical warnings suppressed. Run with --debug to see details.`,
      ),
    );
  }
}
