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

          // Next.js optimizer: capture original (url=) and alias the _next/image to it.
          if (val.includes('/_next/image')) {
            this.captureNextImagePair(val);
            continue;
          }

          // Microlink endpoints should be treated as images (even if no extension)
          if (this.isMicrolinkUrl(val)) {
            this.addImageAsset(val);
            continue;
          }

          if (this.isValidImageUrl(val)) {
            this.addImageAsset(val);
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

        if (url.includes('/_next/image')) {
          this.captureNextImagePair(url);
          continue;
        }

        if (this.isMicrolinkUrl(url)) {
          this.addImageAsset(url);
          continue;
        }

        if (this.isValidImageUrl(url)) {
          this.addImageAsset(url);
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

        if (raw.includes('/_next/image')) {
          this.captureNextImagePair(raw);
          continue;
        }

        if (this.isMicrolinkUrl(raw) || this.isValidImageUrl(raw)) {
          this.addImageAsset(raw);
        }
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
      if (href.includes('/_next/image')) {
        this.captureNextImagePair(href);
        return;
      }
      if (this.isMicrolinkUrl(href) || this.isValidImageUrl(href)) {
        this.addImageAsset(href);
      }
    });
  }

  // Store a single image asset for the original URL and remember the Next.js optimized URL as an alias.
  captureNextImagePair(nextUrl) {
    const originalUrl = this.extractNextImageOriginalUrl(nextUrl);
    if (!originalUrl) {
      // fallback to tracking the _next/image if we cannot parse url=
      this.addImageAsset(nextUrl);
      return;
    }

    const absOriginal = this.cloner.resolveUrl(originalUrl);
    const absNext = this.cloner.resolveUrl(nextUrl);

    if (this.processedUrls.has(absOriginal)) {
      // attach alias if this original is already tracked
      const entry = this.cloner.assets.images.find(
        (x) => x.url === absOriginal,
      );
      if (entry && !entry.nextJsUrl) entry.nextJsUrl = absNext;
      return;
    }

    this.processedUrls.add(absOriginal);
    const filename = this.cloner.generateFilename(absOriginal, 'images');
    this.cloner.assets.images.push({
      url: absOriginal,
      filename,
      nextJsUrl: absNext,
      local: false,
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

  // Microlink endpoint check: api.microlink.io or image.microlink.io
  isMicrolinkUrl(url) {
    try {
      const abs = this.cloner.resolveUrl(url);
      const host = new URL(abs).hostname.toLowerCase();
      return (
        host.endsWith('api.microlink.io') || host.endsWith('image.microlink.io')
      );
    } catch {
      return /(?:^|\/)(?:api|image)\.microlink\.io/i.test(String(url));
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
    // Extract video sources from <video> and <source>
    $('video').each((_, videoEl) => {
      const $video = $(videoEl);
      const src = $video.attr('src');
      if (src && !src.startsWith('data:') && this.isValidVideoUrl(src)) {
        this.addMediaAsset(src, 'video');
      }
      const poster = $video.attr('poster');
      if (poster && !poster.startsWith('data:')) {
        const abs = this.cloner.resolveUrl(poster);
        const filename = this.cloner.generateFilename(abs, 'images');
        this.cloner.assets.images.push({
          url: abs,
          filename,
          element: 'video',
          attribute: 'poster',
          local: false,
        });
      }
      $video.find('source[src]').each((_, sourceEl) => {
        const sourceSrc = $(sourceEl).attr('src');
        if (
          sourceSrc &&
          !sourceSrc.startsWith('data:') &&
          this.isValidVideoUrl(sourceSrc)
        ) {
          this.addMediaAsset(sourceSrc, 'video');
        }
      });
    });

    $('audio').each((_, audioEl) => {
      const $audio = $(audioEl);
      const src = $audio.attr('src');
      if (src && !src.startsWith('data:') && this.isValidAudioUrl(src)) {
        this.addMediaAsset(src, 'audio');
      }
      $audio.find('source[src]').each((_, sourceEl) => {
        const sourceSrc = $(sourceEl).attr('src');
        if (
          sourceSrc &&
          !sourceSrc.startsWith('data:') &&
          this.isValidAudioUrl(sourceSrc)
        ) {
          this.addMediaAsset(sourceSrc, 'audio');
        }
      });
    });

    $('source[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (!src || src.startsWith('data:')) return;
      const type = $(el).attr('type') || '';
      let mediaType = 'media';
      if (type.startsWith('video/') || this.isValidVideoUrl(src))
        mediaType = 'video';
      else if (type.startsWith('audio/') || this.isValidAudioUrl(src))
        mediaType = 'audio';
      if (this.isValidVideoUrl(src) || this.isValidAudioUrl(src)) {
        this.addMediaAsset(src, mediaType);
      }
    });
  }

  addMediaAsset(url, type = 'media') {
    const abs = this.cloner.resolveUrl(url);
    if (!abs) return;
    if (this.processedUrls.has(abs)) return;
    this.processedUrls.add(abs);

    const filename = this.cloner.generateFilename(abs, 'media');
    this.cloner.assets.media.push({
      url: abs,
      filename,
      type,
    });
  }

  isValidVideoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const videoExtensions = [
      '.mp4',
      '.webm',
      '.ogg',
      '.avi',
      '.mov',
      '.wmv',
      '.flv',
      '.mkv',
      '.m4v',
      '.3gp',
      '.ogv',
    ];
    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    return (
      videoExtensions.some((ext) => clean.endsWith(ext)) ||
      clean.includes('/video/') ||
      clean.includes('/videos/') ||
      clean.includes('video=') ||
      clean.includes('.mp4') ||
      clean.includes('.webm')
    );
  }

  isValidAudioUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const audioExtensions = [
      '.mp3',
      '.wav',
      '.ogg',
      '.aac',
      '.flac',
      '.m4a',
      '.wma',
      '.opus',
      '.oga',
    ];
    const clean = url.split('?')[0].split('#')[0].toLowerCase();
    return (
      audioExtensions.some((ext) => clean.endsWith(ext)) ||
      clean.includes('/audio/') ||
      clean.includes('/sounds/') ||
      clean.includes('audio=')
    );
  }

  isValidImageUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('data:image/')) return true;
    if (this.isMicrolinkUrl(url)) return true; // Microlink preview endpoints
    // We no longer blanket-accept /_next/image here; it is handled by captureNextImagePair
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
