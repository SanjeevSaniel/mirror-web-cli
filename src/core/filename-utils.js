import crypto from 'crypto';

/**
 * Build a short, stable filename for a URL with the right extension per category.
 * Avoids path-length issues and wrong extensions.
 *
 * category: one of 'images' | 'styles' | 'scripts' | 'fonts' | 'icons' | 'media' | 'bin'
 */
export function makeAssetFilename(url, category = 'bin') {
  const u = safeUrl(url);
  const last = (u?.pathname || '/').split('/').filter(Boolean).pop() || 'asset';
  const { base, extFromUrl } = splitNameAndExt(last);

  const ext = pickExtension(extFromUrl, category);
  const hash = shortHash(url);
  const safeBase = sanitize(base).slice(0, 40) || 'asset';

  return `${safeBase}_${hash}.${ext}`;
}

function safeUrl(url) {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function splitNameAndExt(name) {
  const idx = name.lastIndexOf('.');
  if (idx > 0 && idx < name.length - 1) {
    const base = name.slice(0, idx);
    const ext = name.slice(idx + 1).toLowerCase();
    return { base, extFromUrl: ext };
  }
  return { base: name, extFromUrl: '' };
}

function pickExtension(extFromUrl, category) {
  // If URL has a plausible extension, keep it (unless category overrides)
  if (extFromUrl && /^[a-z0-9]{1,6}$/i.test(extFromUrl)) {
    if (category === 'scripts' && extFromUrl !== 'js' && extFromUrl !== 'mjs')
      return 'js';
    if (category === 'styles' && extFromUrl !== 'css') return 'css';
    return extFromUrl;
  }

  // No extension in URL => pick by category
  switch (category) {
    case 'scripts':
      return 'js';
    case 'styles':
      return 'css';
    case 'images':
      return 'png'; // safe default when unknown
    case 'fonts':
      return 'woff2';
    case 'icons':
      return 'ico';
    case 'media':
      return 'bin';
    default:
      return 'bin';
  }
}

function shortHash(input) {
  return crypto
    .createHash('sha1')
    .update(String(input))
    .digest('hex')
    .slice(0, 10);
}

function sanitize(s) {
  return s.replace(/[^a-zA-Z0-9._-]/g, '_');
}
