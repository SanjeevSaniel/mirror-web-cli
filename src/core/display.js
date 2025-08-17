/**
 * @fileoverview Display - Terminal UI System for Mirror Web CLI
 * @description Advanced terminal user interface with modern design principles.
 * Features beautiful gradients, smooth animations, progress tracking, and 
 * professional status cards. Inspired by modern design systems like shadcn/ui.
 * 
 * Key Features:
 * - Gradient text effects and modern typography
 * - Animated spinners with smooth transitions
 * - Professional status cards and progress indicators
 * - Responsive layout that adapts to terminal width
 * - TTY detection for optimal fallbacks
 * - Zero dependencies beyond chalk for colors
 * 
 * @version 1.0.2
 * @author Sanjeev Saniel Kujur
 * @license MIT
 */

import chalk from 'chalk';

const isTTY = process.stdout.isTTY;

// Brand and theme tokens
const Theme = {
  // Accent gradient (cyan -> violet) like modern design systems
  grad: { from: { h: 190, s: 90, l: 60 }, to: { h: 270, s: 90, l: 60 } },
  // Surfaces
  surface: chalk.bgHex('#0b0f16'),
  muted: chalk.hex('#8b93a7'),
  text: chalk.hex('#e6e9f2'),
  // Accents
  accent: chalk.hex('#7c3aed'), // shadcn-esque accent
  accent2: chalk.hex('#06b6d4'), // cyan accent
  // Status
  ok: chalk.hex('#10b981'),
  warn: chalk.hex('#f59e0b'),
  err: chalk.hex('#ef4444'),
  info: chalk.hex('#60a5fa'),
  // Borders
  border: chalk.hex('#243041'),
};

// Icons with fallback to ASCII on non-TTY
const Icons = {
  logo: '◈',
  step: '●',
  play: '▶',
  success: '✔',
  warn: '⚠',
  error: '✖',
  info: 'ℹ',
  rocket: '🚀',
  globe: '🌐',
  pkg: '📦',
  gear: '⚙',
  bolt: '⚡',
  check: '✅',
  star: '★',
};

/**
 * @class Display
 * @description Advanced terminal UI system with modern design aesthetics.
 * 
 * Provides a comprehensive set of UI components for terminal applications:
 * - Beautiful headers with gradient effects
 * - Animated progress indicators and spinners
 * - Professional status cards and summaries
 * - Responsive layout system
 * - Color-coded message types (info, success, warning, error)
 * 
 * @example
 * ```javascript
 * const display = new Display({ version: 'v1.0' });
 * display.header('My App', 'Doing amazing things');
 * display.step(1, 3, 'Processing', 'Loading data...');
 * display.success('Operation completed successfully!');
 * ```
 */
export class Display {
  /**
   * @constructor
   * @param {Object} options - Configuration options for the display system
   * @param {string} [options.version='v1.0.2'] - Version string to display in headers
   * @param {boolean} [options.animations=true] - Enable/disable animations (auto-detected for TTY)
   * @param {number} [options.width] - Terminal width (auto-detected from process.stdout.columns)
   * @param {boolean} [options.compact=false] - Use compact layout mode
   */
  constructor(options = {}) {
    this.options = {
      version: options.version || 'v1.0.2',
      animations: options.animations !== false, // animations on by default for TTY
      width: clamp(process.stdout.columns || 100, 60, 120),
      compact: !!options.compact,
      ...options,
    };

    // Internal state for animation management
    this._spinnerTimer = null;
    this._spinnerFrame = 0;
    this._activeSpinnerText = '';
    this._inStep = false;
    this._printedHeader = false;
  }

  // Header with soft gradient and metadata
  header(
    title = 'Mirror Web CLI',
    subtitle = 'Advanced Website Mirroring Tool',
  ) {
    this._stopSpinner();

    const w = this.options.width;
    const pad = ' '.repeat(2);
    const top = borderTop(w);
    const bottom = borderBottom(w);

    // Keep gradient on plain text only (no ANSI inside), to avoid leaking escape codes
    const headMain = `${Icons.logo} ${title}`;
    const sub = `${subtitle} ${chalk.dim(`[${this.options.version}]`)}`;

    const headLine = this._gradientLine(centerLine(headMain, w - 4));
    const subLine = Theme.muted(centerLine(sub, w - 4));

    console.log(Theme.border(top));
    console.log(pad + headLine);
    console.log(pad + subLine);
    console.log(Theme.border(bottom));

    // Tiny pulse animation for header (quick, tasteful)
    if (this.options.animations && isTTY) {
      this._pulseOnce(headLine, subLine, w);
    }

    this._printedHeader = true;
  }

  info(msg) {
    this._stopSpinner();
    console.log(`${Theme.info(Icons.info)} ${Theme.text(msg)}`);
  }

  success(msg) {
    this._stopSpinner();
    console.log(`${Theme.ok(Icons.success)} ${Theme.text(msg)}`);
  }

  warning(msg) {
    this._stopSpinner();
    console.log(`${Theme.warn(Icons.warn)} ${Theme.text(msg)}`);
  }

  error(title, detail = '') {
    this._stopSpinner();
    const w = this.options.width;
    const top = borderTop(w);
    const bottom = borderBottom(w);

    console.log(Theme.border(top));
    console.log('  ' + Theme.err(`${Icons.error} ${title}`));
    if (detail) {
      console.log('  ' + Theme.muted(detail));
    }
    console.log(Theme.border(bottom));
  }

  // Step card with spinner and subtitle
  step(index, total, title, subtitle = '') {
    // End previous spinner, start a new one tied to this step
    this._stopSpinner();

    const w = this.options.width;
    const line = `${Theme.accent(Icons.step)} ${Theme.text(
      `Step ${index}/${total}`,
    )}  ${Theme.muted('•')}  ${Theme.text(title)}`;
    const sub = subtitle ? `${Theme.muted(subtitle)}` : '';

    // Card
    const top = borderTop(w);
    const bottom = borderBottom(w);
    console.log(Theme.border(top));
    console.log('  ' + line);
    if (subtitle) console.log('  ' + sub);
    console.log(Theme.border(bottom));

    // Start spinner for this step (compact subtle pulse)
    if (this.options.animations && isTTY) {
      const spinText = `${Icons.play} ${subtitle || title}`;
      this._startSpinner(spinText);
    }

    this._inStep = true;
  }

  // Next.js/Framework card
  frameworkCard({
    name = 'Unknown',
    confidence = 0,
    complexity = 'UNKNOWN',
    strategy = '',
  } = {}) {
    this._stopSpinner();
    const w = this.options.width;

    const title = `${Icons.pkg} Framework Analysis`;
    const bar = renderBar(confidence, w - 20);
    const cText = `${Math.max(0, Math.min(100, confidence))}%`;
    const lines = [
      `${Theme.text('Framework:')} ${Theme.accent2(name)}`,
      `${Theme.text('Confidence:')} ${Theme.accent(cText)} ${bar}`,
      `${Theme.text('Complexity:')} ${Theme.muted(complexity)}`,
      `${Theme.text('Strategy:')} ${Theme.muted(strategy)}`,
    ];

    printCard(title, lines, w);
  }

  // End summary block
  summary({ outputDir, framework, outputType, assets, duration }) {
    this._stopSpinner();
    const w = this.options.width;
    const title = `${Icons.check} Mirroring Summary`;

    // Rows
    const rows = [
      [Theme.muted('Output'), Theme.text(outputDir || '-')],
      [Theme.muted('Source'), Theme.text(framework || '-')],
      [Theme.muted('Target'), Theme.text(outputType || '-')],
      [Theme.muted('Assets'), Theme.text(String(assets?.total ?? '-'))],
      [Theme.muted('Duration'), Theme.text(formatDuration(duration || 0))],
    ];

    const widthLeft = 14;
    const lines = rows.map(([l, r]) => `${padRight(l, widthLeft)} ${r}`);

    printCard(title, lines, w);
  }

  // Decorative line
  divider(label = '') {
    this._stopSpinner();
    const w = this.options.width;
    if (!label) {
      console.log(Theme.border('─'.repeat(w)));
      return;
    }
    const text = ` ${label} `;
    const left = '─'.repeat(Math.max(0, Math.floor((w - text.length) / 2)));
    const right = '─'.repeat(Math.max(0, w - text.length - left.length));
    console.log(Theme.border(left + Theme.muted(text) + right));
  }

  // Internal: one-off gradient pulse on header
  _pulseOnce(_headLine, _subLine, _width) {
    let frames = 10;
    const interval = 18;
    const timer = setInterval(() => {
      if (frames-- <= 0) {
        clearInterval(timer);
        return;
      }
      // Optional shimmer line (kept disabled to avoid extra lines)
      // const shimmer = this._gradientLine(centerLine(' '.repeat(16), width - 4), frames);
      // console.log('  ' + shimmer);
    }, interval);
  }

  // Spinner lifecycle
  _startSpinner(text) {
    this._activeSpinnerText = text;
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const render = () => {
      const f = frames[this._spinnerFrame % frames.length];
      this._spinnerFrame++;
      const line = `${Theme.accent(f)} ${Theme.muted(this._activeSpinnerText)}`;
      // Render spinner on a single line
      if (isTTY) {
        process.stdout.write(
          '\r' + padRight(stripAnsi(line), this.options.width),
        );
      }
    };
    render();
    this._spinnerTimer = setInterval(render, 80);
  }

  _stopSpinner() {
    if (this._spinnerTimer) {
      clearInterval(this._spinnerTimer);
      this._spinnerTimer = null;
      if (isTTY)
        process.stdout.write('\r' + ' '.repeat(this.options.width) + '\r');
    }
    this._inStep = false;
  }

  // Gradient across characters using HSL -> HEX conversion (works on all Chalk versions)
  _gradientLine(text, offset = 0) {
    const plain = stripAnsi(String(text)); // ensure no ANSI is inside gradient
    const chars = [...plain];
    const n = Math.max(1, chars.length);
    return chars
      .map((ch, i) => {
        const t = (i + offset) / (n - 1 || 1);
        const col = lerpHSL(Theme.grad.from, Theme.grad.to, t);
        const hex = hslToHex(col.h, col.s, col.l);
        return chalk.hex(hex)(ch);
      })
      .join('');
  }
}

/* ---------- helpers ---------- */

function printCard(title, lines, width) {
  const top = borderTop(width);
  const bottom = borderBottom(width);

  console.log(Theme.border(top));
  console.log('  ' + Theme.accent2(title));
  for (const ln of lines) console.log('  ' + ln);
  console.log(Theme.border(bottom));
}

function renderBar(percent, maxWidth) {
  const p = clamp(percent, 0, 100);
  const width = clamp(maxWidth, 10, 40);
  const filled = Math.round((p / 100) * width);
  const empty = width - filled;
  const fill = '█'.repeat(filled);
  const rest = '░'.repeat(empty);

  return Theme.accent(fill) + Theme.border(rest);
}

function borderTop(width) {
  return '╭' + '─'.repeat(width - 2) + '╮';
}
function borderBottom(width) {
  return '╰' + '─'.repeat(width - 2) + '╯';
}

function centerLine(text, width) {
  const len = visibleLength(text);
  if (len >= width) return text;
  const pad = Math.floor((width - len) / 2);
  return ' '.repeat(pad) + text + ' '.repeat(width - len - pad);
}

function padRight(s, n) {
  const len = visibleLength(s);
  if (len >= n) return s;
  return s + ' '.repeat(n - len);
}

function visibleLength(s) {
  return stripAnsi(String(s)).length;
}

function stripAnsi(s) {
  // Minimal ANSI stripper
  return String(s).replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    '',
  );
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
function lerpHSL(a, b, t) {
  return {
    h: lerp(a.h, b.h, t),
    s: lerp(a.s, b.s, t),
    l: lerp(a.l, b.l, t),
  };
}

// Convert HSL (h in [0..360], s/l in [0..100]) to hex string "#RRGGBB"
function hslToHex(h, s, l) {
  const H = (((h % 360) + 360) % 360) / 360;
  const S = clamp(s, 0, 100) / 100;
  const L = clamp(l, 0, 100) / 100;

  if (S === 0) {
    const g = toHex(Math.round(L * 255));
    return `#${g}${g}${g}`;
  }

  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;

  const r = hue2rgb(p, q, H + 1 / 3);
  const g = hue2rgb(p, q, H);
  const b = hue2rgb(p, q, H - 1 / 3);

  return `#${toHex(Math.round(r * 255))}${toHex(Math.round(g * 255))}${toHex(
    Math.round(b * 255),
  )}`;
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function toHex(x) {
  return x.toString(16).padStart(2, '0');
}

// Format duration with sensible units
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${Math.round(s * 10) / 10}s`;
  const m = Math.floor(s / 60);
  const rem = Math.round((s % 60) * 10) / 10;
  return `${m}m ${rem}s`;
}
