import chalk from 'chalk';

/**
 * Asset Manager - Collects all assets without mutating the DOM.
 * URL rewrites happen later in FrameworkWriter.
 */
export class AssetManager {
  constructor(cloner) {
    this.cloner = cloner;
    this.processedUrls = new Set();
  }

  async extractAllAssets() {
    const $ = this.cloner.$;

    console.log(chalk.gray('  📁 Extracting images...'));
    await this.extractImages($);

    console.log(chalk.gray('  🎨 Extracting stylesheets...'));
    await this.extractStylesheets($);

    console.log(chalk.gray('  ⚙️ Extracting scripts...'));
    await this.extractScripts($);

    console.log(chalk.gray('  🔠 Extracting fonts...'));
    await this.extractFonts($);

    console.log(chalk.gray('  🎨 Extracting icons...'));
    await this.extractIcons($);

    console.log(chalk.gray('  🎥 Extracting media...'));
    await this.extractMedia($);
  }

  async extractImages($) {
    // img src + lazy variants
    $('img[src], img[data-src], img[data-lazy-src], img[data-original]').each(
      (_, el) => {
        const $el = $(el);
        const attrs = ['src', 'data-src', 'data-lazy-src', 'data-original'];
        for (const attr of attrs) {
          const val = $el.attr(attr);
          if (!val) continue;

          if (val.startsWith('data:image/')) {
            this.processDataURLImage(val, 'img', attr);
            continue;
          }

          if (this.isValidImageUrl(val)) {
            if (val.includes('/_next/image')) {
              const originalUrl = this.extractNextImageOriginalUrl(val);
              if (originalUrl) this.addImageAsset(originalUrl);
              this.addImageAsset(val); // track optimized too
            } else {
              this.addImageAsset(val);
            }
          }
        }
      },
    );

    // srcset on img/source
    $('[srcset]').each((_, el) => {
      const srcset = $(el).attr('srcset');
      if (!srcset) return;

      const entries = srcset
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      for (const entry of entries) {
        const url = entry.split(/\s+/)[0];
        if (!url) continue;

        if (url.startsWith('data:image/')) {
          this.processDataURLImage(url, 'source', 'srcset');
          continue;
        }

        if (this.isValidImageUrl(url)) {
          if (url.includes('/_next/image')) {
            const originalUrl = this.extractNextImageOriginalUrl(url);
            if (originalUrl) this.addImageAsset(originalUrl);
            this.addImageAsset(url);
          } else {
            this.addImageAsset(url);
          }
        }
      }
    });

    // Background images in inline styles
    $('[style]').each((_, el) => {
      const style = $(el).attr('style');
      if (!style) return;

      const matches = style.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi);
      if (!matches) return;

      for (const m of matches) {
        const u = m.match(/url\(\s*(['"]?)([^'")]+)\1\s*\)/i);
        const raw = u && u[2];
        if (!raw) continue;

        if (raw.startsWith('data:image/')) {
          this.processDataURLImage(raw, 'style', 'background');
          continue;
        }
        if (this.isValidImageUrl(raw)) this.addImageAsset(raw);
      }
    });

    // SVG image/use hrefs
    $(
      'svg image[href], svg image[xlink\\:href], svg use[href], svg use[xlink\\:href]',
    ).each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || $el.attr('xlink:href');
      if (!href) return;

      if (href.startsWith('data:image/')) {
        this.processDataURLImage(href, 'svg', 'href');
        return;
      }
      if (this.isValidImageUrl(href)) this.addImageAsset(href);
    });
  }

  addImageAsset(url) {
    const abs = this.cloner.resolveUrl(url);
    if (!abs) return;
    if (this.processedUrls.has(abs)) return;
    this.processedUrls.add(abs);

    const filename = this.cloner.generateFilename(abs, 'images');
    this.cloner.assets.images.push({
      url: abs,
      filename,
      local: false,
    });
  }

  processDataURLImage(dataUrl, elementTag = 'img', attribute = 'src') {
    try {
      const m = dataUrl.match(/^data:image\/([^;]+);base64,(.+)$/i);
      if (!m) return;

      const ext = m[1].toLowerCase() || 'png';
      const buffer = Buffer.from(m[2], 'base64');

      const base = `dataimg_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;
      const filename = `${base}.${ext}`;

      this.cloner.assets.images.push({
        url: dataUrl, // keep for mapping; will be local
        filename,
        buffer,
        local: true,
        element: elementTag,
        attribute,
      });
    } catch {
      // ignore
    }
  }

  extractNextImageOriginalUrl(nextUrl) {
    try {
      const urlObj = nextUrl.startsWith('http')
        ? new URL(nextUrl)
        : new URL(nextUrl, this.cloner.url);
      const originalUrl = urlObj.searchParams.get('url');
      return originalUrl ? decodeURIComponent(originalUrl) : null;
    } catch {
      return null;
    }
  }

  async extractStylesheets($) {
    $(
      'link[rel="stylesheet"][href], link[rel="preload"][as="style"][href]',
    ).each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href.startsWith('data:')) return;

      const abs = this.cloner.resolveUrl(href);
      const filename = this.cloner.generateFilename(abs, 'styles');
      this.cloner.assets.styles.push({
        url: abs,
        filename,
        type: 'external',
      });
    });

    $('style').each((_, el) => {
      const content = $(el).html();
      if (content && content.trim()) {
        const filename = `inline-${Date.now()}.css`;
        this.cloner.assets.styles.push({
          content,
          filename,
          type: 'inline',
        });
      }
    });
  }

  async extractScripts($) {
    $('script[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (!src || src.startsWith('data:')) return;
      if (this.isTrackingScript(src)) return;

      const abs = this.cloner.resolveUrl(src);
      const filename = this.cloner.generateFilename(abs, 'scripts');
      this.cloner.assets.scripts.push({
        url: abs,
        filename,
        type: 'external',
      });
    });

    if (!this.cloner.options.clean) {
      $('script:not([src])').each((_, el) => {
        const content = $(el).html();
        if (content && !this.isTrackingScript(content)) {
          const filename = `inline-${Date.now()}.js`;
          this.cloner.assets.scripts.push({
            content,
            filename,
            type: 'inline',
          });
        }
      });
    }
  }

  async extractFonts($) {
    $(
      'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]',
    ).each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;

      const abs = this.cloner.resolveUrl(href);
      const filename = this.cloner.generateFilename(abs, 'fonts');
      this.cloner.assets.fonts.push({
        url: abs,
        filename,
        type: 'google-fonts',
      });
    });
  }

  async extractIcons($) {
    const selectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]',
      'link[rel="mask-icon"]',
    ];
    selectors.forEach((sel) => {
      $(sel).each((_, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('data:')) return;

        const abs = this.cloner.resolveUrl(href);
        const filename = this.cloner.generateFilename(abs, 'icons');
        this.cloner.assets.icons.push({
          url: abs,
          filename,
          rel: $(el).attr('rel'),
        });
      });
    });
  }

  async extractMedia($) {
    $('video[src], audio[src], source[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (!src || src.startsWith('data:')) return;

      const abs = this.cloner.resolveUrl(src);
      const filename = this.cloner.generateFilename(abs, 'media');
      const tag = (el.tagName || '').toLowerCase();
      const type =
        tag === 'audio' ? 'audio' : tag === 'video' ? 'video' : 'media';

      this.cloner.assets.media.push({
        url: abs,
        filename,
        type,
      });
    });

    $('video[poster]').each((_, el) => {
      const poster = $(el).attr('poster');
      if (!poster || poster.startsWith('data:')) return;

      const abs = this.cloner.resolveUrl(poster);
      const filename = this.cloner.generateFilename(abs, 'images');
      this.cloner.assets.images.push({
        url: abs,
        filename,
        element: 'video',
        attribute: 'poster',
        local: false,
      });
    });
  }

  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('data:image/')) return true;
    if (url.includes('/_next/image')) return true;

    const imageExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
      '.bmp',
      '.ico',
      '.avif',
    ];
    const clean = url.split('?')[0].split('#')[0].toLowerCase();

    return (
      imageExtensions.some((ext) => clean.endsWith(ext)) ||
      clean.includes('/_next/static/media/') ||
      clean.includes('/image/') ||
      clean.includes('/img/') ||
      clean.includes('/photo/')
    );
  }

  isTrackingScript(content) {
    if (!content) return false;
    const patterns = [
      /google-analytics/i,
      /googletagmanager/i,
      /gtag/i,
      /facebook\.net/i,
      /fbq/i,
      /hotjar/i,
      /mixpanel/i,
      /segment\.com/i,
      /\banalytics\b/i,
      /\btracking\b/i,
    ];
    return patterns.some((p) => p.test(content));
  }
}
