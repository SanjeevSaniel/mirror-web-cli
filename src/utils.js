import path from 'path';
import chalk from 'chalk';

export function validateUrl(url) {
  try {
    new URL(url);
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
}

export function formatTitleToFolderName(title, fallbackUrl) {
  if (!title || title.trim() === '') {
    // Extract domain name as fallback
    try {
      const domain = new URL(fallbackUrl).hostname.replace('www.', '');
      return domain.replace(/\./g, '-');
    } catch {
      return 'cloned-site';
    }
  }

  return title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Limit length to 50 characters
    || 'cloned-site'; // Fallback if title becomes empty after processing
}

export function extractAssets($, baseUrl) {
  const assets = new Set();

  // CSS files
  $('link[rel="stylesheet"]').each((_, element) => {
    const href = $(element).attr('href');
    if (href) {
      assets.add({
        url: resolveUrl(href, baseUrl),
        type: 'css',
        localPath: generateLocalPath(href, baseUrl, 'css'),
      });
    }
  });

  // JavaScript files
  $('script[src]').each((_, element) => {
    const src = $(element).attr('src');
    if (src) {
      assets.add({
        url: resolveUrl(src, baseUrl),
        type: 'js',
        localPath: generateLocalPath(src, baseUrl, 'js'),
      });
    }
  });

  // Images
  $('img[src]').each((_, element) => {
    const src = $(element).attr('src');
    if (src && !src.startsWith('data:')) {
      assets.add({
        url: resolveUrl(src, baseUrl),
        type: 'images',
        localPath: generateLocalPath(src, baseUrl, 'images'),
      });
    }
  });

  return Array.from(assets);
}

export function resolveUrl(relativeUrl, baseUrl) {
  if (relativeUrl.startsWith('http')) {
    return relativeUrl;
  }

  if (relativeUrl.startsWith('//')) {
    return new URL(baseUrl).protocol + relativeUrl;
  }

  if (relativeUrl.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.protocol}//${base.host}${relativeUrl}`;
  }

  return new URL(relativeUrl, baseUrl).href;
}

export function generateLocalPath(url, baseUrl, type) {
  const absoluteUrl = resolveUrl(url, baseUrl);
  const urlObj = new URL(absoluteUrl);
  let pathname = urlObj.pathname;

  if (pathname.startsWith('/')) {
    pathname = pathname.slice(1);
  }

  if (!pathname || pathname.endsWith('/')) {
    pathname = `asset-${Date.now()}.${getExtensionForType(type)}`;
  }

  if (!path.extname(pathname)) {
    pathname += `.${getExtensionForType(type)}`;
  }

  return `assets/${type}/${pathname}`;
}

export function getExtensionForType(type) {
  const extensions = {
    css: 'css',
    js: 'js',
    images: 'png',
    fonts: 'woff2',
  };
  return extensions[type] || 'txt';
}

// Enhanced terminal display utilities with modern design
export class ProgressDisplay {
  static currentProgress = null;
  
  static header(title, subtitle = '') {
    const gradient = this.createGradientBorder();
    console.log('\n' + gradient);
    console.log(chalk.bold.cyan(`${' '.repeat(Math.floor((60 - title.length) / 2))}${title}`));
    if (subtitle) {
      console.log(chalk.gray(`${' '.repeat(Math.floor((60 - subtitle.length) / 2))}${subtitle}`));
    }
    console.log(gradient + '\n');
  }

  static createGradientBorder() {
    const colors = [chalk.cyan, chalk.blue, chalk.magenta, chalk.red, chalk.yellow, chalk.green];
    let border = '';
    for (let i = 0; i < 60; i++) {
      const colorIndex = Math.floor((i / 60) * colors.length);
      border += colors[colorIndex]('═');
    }
    return border;
  }

  static section(title) {
    const icon = this.getSectionIcon(title);
    console.log('\n' + chalk.cyan('─'.repeat(60)));
    console.log(chalk.bold.white(`${icon} ${title}`));
    console.log(chalk.cyan('─'.repeat(60)));
  }

  static getSectionIcon(title) {
    if (title.includes('METADATA')) return '🔍';
    if (title.includes('AI')) return '🤖';
    if (title.includes('CLONING')) return '⚙️';
    if (title.includes('PROCESS')) return '🚀';
    return '📋';
  }

  static step(step, description, details = '', isCompleted = false) {
    const stepIcon = isCompleted ? '✓' : this.getStepNumber(step);
    const stepColor = isCompleted ? chalk.green : chalk.cyan;
    const descColor = isCompleted ? chalk.green : chalk.white;
    
    console.log(`\n${stepColor.bold(`[${stepIcon}]`)} ${descColor(description)}`);
    if (details) {
      console.log(chalk.gray(`     ${details}`));
    }
  }

  static getStepNumber(step) {
    return step.split('/')[0] || step;
  }

  static progress(current, total, description, details = '', isCompleted = null) {
    const percentage = Math.round((current / total) * 100);
    const shouldComplete = isCompleted === false || current === total;
    
    if (!shouldComplete) {
      // Show progress bar while in progress
      const progressBar = this.createModernProgressBar(percentage);
      const spinner = this.getSpinner();
      console.log(`\n${spinner} ${chalk.bold.white(description)} ${chalk.cyan(`(${current}/${total})`)}`);
      console.log(`   ${progressBar} ${chalk.bold.yellow(`${percentage}%`)}`);
      if (details) {
        console.log(chalk.gray(`   ${details}`));
      }
      this.currentProgress = { current, total, description };
    } else {
      // Show completion step
      this.step(`${current}/${total}`, description, details, true);
      this.currentProgress = null;
    }
  }

  static createModernProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    // Create gradient effect
    let filledBar = '';
    for (let i = 0; i < filled; i++) {
      if (percentage < 25) filledBar += chalk.red('█');
      else if (percentage < 50) filledBar += chalk.yellow('█');
      else if (percentage < 75) filledBar += chalk.blue('█');
      else filledBar += chalk.green('█');
    }
    
    const emptyBar = chalk.gray('░'.repeat(empty));
    return `[${filledBar}${emptyBar}]`;
  }

  static getSpinner() {
    const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    return chalk.cyan(spinners[Math.floor(Math.random() * spinners.length)]);
  }

  static success(message, details = '') {
    console.log(`\n${chalk.green.bold('✅')} ${chalk.green.bold(message)}`);
    if (details) {
      console.log(chalk.gray(`   ${details}`));
    }
  }

  static warning(message, details = '') {
    console.log(`\n${chalk.yellow.bold('⚠️')} ${chalk.yellow.bold(message)}`);
    if (details) {
      console.log(chalk.gray(`   ${details}`));
    }
  }

  static info(message, details = '') {
    console.log(`\n${chalk.blue.bold('💡')} ${chalk.blue.bold(message)}`);
    if (details) {
      console.log(chalk.gray(`   ${details}`));
    }
  }

  static error(message, details = '') {
    console.log(`\n${chalk.red.bold('❌')} ${chalk.red.bold(message)}`);
    if (details) {
      console.log(chalk.gray(`   ${details}`));
    }
  }

  static summary(items) {
    console.log('\n' + chalk.magenta('╭' + '─'.repeat(58) + '╮'));
    console.log(chalk.magenta('│') + chalk.bold.white(' 📊 PROJECT SUMMARY'.padEnd(57)) + chalk.magenta('│'));
    console.log(chalk.magenta('├' + '─'.repeat(58) + '┤'));
    
    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const value = String(item.value);
      const truncatedValue = value.length > 35 ? value.substring(0, 32) + '...' : value;
      const line = `${item.icon} ${item.label}: ${chalk.cyan(truncatedValue)}`;
      const padding = ' '.repeat(Math.max(0, 57 - this.stripAnsi(line).length));
      console.log(chalk.magenta('│') + ` ${line}${padding}` + chalk.magenta('│'));
    });
    
    console.log(chalk.magenta('╰' + '─'.repeat(58) + '╯') + '\n');
  }

  static stripAnsi(str) {
    return str.replace(/\u001b\[[0-9;]*m/g, '');
  }

  static finalResult(success, outputPath, techStack) {
    if (success) {
      // Celebration animation
      console.log('\n' + this.createCelebrationBorder());
      console.log(chalk.bold.green(`${' '.repeat(15)}🎉 CLONING COMPLETE! 🎉`));
      console.log(this.createCelebrationBorder());
      
      // Modern info cards
      this.createInfoCard('📁 Output Location', outputPath, 'cyan');
      this.createInfoCard('⚡ Technology Stack', techStack.toUpperCase(), 'magenta');
      
      // Next steps with modern styling
      console.log('\n' + chalk.bgGreen.black.bold(' 🚀 NEXT STEPS ') + chalk.green(' ▶ Get started immediately!'));
      console.log(chalk.green('┌─────────────────────────────────────────────────────┐'));
      
      if (techStack === 'react') {
        console.log(chalk.green('│') + chalk.yellow(' 1. ') + chalk.white(`cd ${outputPath}`.padEnd(45)) + chalk.green('│'));
        console.log(chalk.green('│') + chalk.yellow(' 2. ') + chalk.white('npm install'.padEnd(45)) + chalk.green('│'));
        console.log(chalk.green('│') + chalk.yellow(' 3. ') + chalk.white('npm start'.padEnd(47)) + chalk.green('│'));
      } else {
        console.log(chalk.green('│') + chalk.yellow(' 1. ') + chalk.white(`cd ${outputPath}`.padEnd(45)) + chalk.green('│'));
        console.log(chalk.green('│') + chalk.yellow(' 2. ') + chalk.white('Open index.html in your browser'.padEnd(37)) + chalk.green('│'));
      }
      
      console.log(chalk.green('└─────────────────────────────────────────────────────┘'));
    } else {
      console.log('\n' + chalk.red('═'.repeat(60)));
      console.log(chalk.red.bold(`${' '.repeat(22)}❌ CLONING FAILED`));
      console.log(chalk.red('═'.repeat(60)));
    }
    console.log('\n');
  }

  static createCelebrationBorder() {
    const chars = ['🎉', '✨', '🌟', '⭐', '💫'];
    let border = '';
    for (let i = 0; i < 60; i++) {
      if (i % 8 === 0) {
        border += chalk.yellow(chars[Math.floor(Math.random() * chars.length)]);
      } else {
        border += chalk.yellow('═');
      }
    }
    return border;
  }

  static createInfoCard(title, value, color) {
    const colorFn = chalk[color] || chalk.white;
    console.log(`\n${colorFn('╭')}${colorFn('─'.repeat(48))}${colorFn('╮')}`);
    console.log(`${colorFn('│')} ${chalk.bold.white(title.padEnd(46))} ${colorFn('│')}`);
    console.log(`${colorFn('│')} ${colorFn.bold(value.padEnd(46))} ${colorFn('│')}`);
    console.log(`${colorFn('╰')}${colorFn('─'.repeat(48))}${colorFn('╯')}`);
  }

  // Animation helper - could be expanded for real-time animations
  static async animateText(text, delay = 50) {
    for (let i = 0; i <= text.length; i++) {
      process.stdout.write('\r' + text.substring(0, i));
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    console.log();
  }
}

export function createServerFile() {
  return `import { createServer } from 'http';
import { readFile } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = createServer((req, res) => {
  let filePath = join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const htmlPath = filePath + '.html';
        readFile(htmlPath, (htmlErr, htmlData) => {
          if (htmlErr) {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(htmlData);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    const ext = extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(\`🌐 Server running at http://localhost:\${port}\`);
  console.log('Press Ctrl+C to stop the server');
});

export default server;`;
}
