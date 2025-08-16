import chalk from 'chalk';

/**
 * Claude Code-Inspired Visual Display System
 * Beautiful, modern terminal UI with gradient effects and animations
 */
export class ClaudeDisplay {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 0;
    this.activeAnimations = new Map();
    this.theme = this.initializeTheme();
  }

  initializeTheme() {
    return {
      // Claude Code Brand Colors
      primary: chalk.hex('#FF6B35'),     // Claude Orange
      secondary: chalk.hex('#1E40AF'),   // Claude Blue  
      success: chalk.hex('#059669'),     // Success Green
      warning: chalk.hex('#D97706'),     // Warning Orange
      error: chalk.hex('#DC2626'),       // Error Red
      info: chalk.hex('#0EA5E9'),        // Info Blue
      muted: chalk.hex('#64748B'),       // Neutral Gray
      accent: chalk.hex('#7C3AED'),      // Purple Accent
      gold: chalk.hex('#F59E0B'),        // Gold
      highlight: chalk.hex('#06FFA5'),   // Bright Green
      gradient: {
        claude: [chalk.hex('#FF6B35'), chalk.hex('#F97316'), chalk.hex('#EA580C')], // Claude signature gradient
        primary: [chalk.hex('#1E40AF'), chalk.hex('#3B82F6'), chalk.hex('#60A5FA')],
        success: [chalk.hex('#059669'), chalk.hex('#10B981'), chalk.hex('#34D399')],
        warning: [chalk.hex('#D97706'), chalk.hex('#F59E0B'), chalk.hex('#FBBF24')],
        rainbow: [
          chalk.hex('#EF4444'), // Red
          chalk.hex('#F97316'), // Orange  
          chalk.hex('#F59E0B'), // Amber
          chalk.hex('#10B981'), // Emerald
          chalk.hex('#06B6D4'), // Cyan
          chalk.hex('#3B82F6'), // Blue
          chalk.hex('#8B5CF6'), // Violet
          chalk.hex('#EC4899')  // Pink
        ],
        aurora: [
          chalk.hex('#06FFA5'), // Bright Green
          chalk.hex('#06B6D4'), // Cyan
          chalk.hex('#3B82F6'), // Blue
          chalk.hex('#8B5CF6'), // Violet
          chalk.hex('#EC4899'), // Pink
          chalk.hex('#F97316')  // Orange
        ]
      }
    };
  }

  // ========================================
  // CORE DISPLAY METHODS
  // ========================================

  /**
   * Main application header with gradient branding
   */
  header(title, subtitle = '') {
    const width = 80;
    console.log('\n');
    
    // Animated gradient border
    console.log(this.createGradientBorder(width, 'rainbow'));
    
    // Main title with centered positioning
    const titlePadding = Math.floor((width - title.length) / 2);
    console.log(this.theme.primary.bold('█'.repeat(titlePadding)) + 
                chalk.white.bold(title) + 
                this.theme.primary.bold('█'.repeat(width - titlePadding - title.length)));
    
    // Subtitle if provided
    if (subtitle) {
      const subtitlePadding = Math.floor((width - subtitle.length) / 2);
      console.log(this.theme.muted(' '.repeat(subtitlePadding) + subtitle));
    }
    
    console.log(this.createGradientBorder(width, 'rainbow'));
    console.log('');
  }

  /**
   * Section headers with modern styling
   */
  section(title, icon = '▶', color = 'primary') {
    const decorativeLine = this.createGradientLine(60, color);
    console.log('\n' + decorativeLine);
    console.log(this.theme[color].bold(`${icon} ${title.toUpperCase()}`));
    console.log(decorativeLine);
  }

  /**
   * Enhanced step display with progress tracking
   */
  step(current, total, title, description = '', status = 'active') {
    this.currentStep = current;
    this.totalSteps = total;
    
    const percentage = Math.round((current / total) * 100);
    const statusIcon = this.getStatusIcon(status);
    const statusColor = this.getStatusColor(status);
    
    // Progress bar
    const progressBar = this.createModernProgressBar(percentage, 40);
    
    console.log('');
    console.log(statusColor.bold(`${statusIcon} [${current}/${total}] ${title}`));
    console.log(`   ${progressBar} ${this.theme.accent.bold(`${percentage}%`)}`);
    
    if (description) {
      console.log(this.theme.muted(`   ${description}`));
    }
  }

  /**
   * Live progress updates with smooth animations
   */
  progress(current, total, title, details = '', isComplete = false) {
    const percentage = Math.round((current / total) * 100);
    
    if (isComplete) {
      this.step(current, total, title, details, 'success');
      return;
    }
    
    // Dynamic spinner
    const spinner = this.getAnimatedSpinner();
    const progressBar = this.createModernProgressBar(percentage, 35);
    
    // Create animated line
    const line = `${spinner} ${title} ${this.theme.accent(`(${current}/${total})`)}\n` +
                 `   ${progressBar} ${this.theme.primary.bold(`${percentage}%`)}`;
    
    if (details) {
      console.log(line + `\n   ${this.theme.muted(details)}`);
    } else {
      console.log(line);
    }
  }

  /**
   * Beautiful status messages
   */
  success(title, message = '', details = []) {
    console.log('');
    console.log(this.theme.success.bold(`✅ ${title}`));
    if (message) {
      console.log(this.theme.muted(`   ${message}`));
    }
    this.displayDetails(details, 'success');
  }

  info(title, message = '', details = []) {
    console.log('');
    console.log(this.theme.info.bold(`💡 ${title}`));
    if (message) {
      console.log(this.theme.muted(`   ${message}`));
    }
    this.displayDetails(details, 'info');
  }

  warning(title, message = '', details = []) {
    console.log('');
    console.log(this.theme.warning.bold(`⚠️  ${title}`));
    if (message) {
      console.log(this.theme.muted(`   ${message}`));
    }
    this.displayDetails(details, 'warning');
  }

  error(title, message = '', details = []) {
    console.log('');
    console.log(this.theme.error.bold(`❌ ${title}`));
    if (message) {
      console.log(this.theme.muted(`   ${message}`));
    }
    this.displayDetails(details, 'error');
  }

  // ========================================
  // SPECIALIZED DISPLAYS
  // ========================================

  /**
   * Revolutionary framework detection results with source → target conversion display
   */
  frameworkResults(results) {
    if (!results.detected || results.detected.length === 0) {
      this.displayAdvancedConversionCard('No Framework Detected', 'Vanilla HTML/CSS/JS', 'HTML/CSS/JS', 'low');
      return;
    }

    // Beautiful header with Claude signature
    console.log('\n' + this.createClaudeSignatureBorder(80));
    console.log(this.theme.primary.bold('🔍 REVOLUTIONARY FRAMEWORK DETECTION & CONVERSION ANALYSIS'));
    console.log(this.createClaudeSignatureBorder(80));
    
    // Source framework analysis
    const primaryFramework = results.detected[0];
    const frameworkComplexity = this.getFrameworkComplexity(primaryFramework.name);
    const conversionMode = this.getConversionMode(primaryFramework.name, results.recommendedOutput);
    
    // Advanced conversion card
    this.displayAdvancedConversionCard(
      primaryFramework.name, 
      primaryFramework.name, 
      results.recommendedOutput.toUpperCase(), 
      results.complexity,
      primaryFramework.confidence
    );
    
    // Detailed framework breakdown
    console.log('\n' + this.theme.accent.bold('📊 DETECTED FRAMEWORKS & PATTERNS'));
    console.log(this.createGradientBorder(75, 'accent'));
    
    results.detected.forEach((framework, index) => {
      const confidence = Math.round(framework.confidence * 100);
      const confidenceColor = confidence >= 90 ? this.theme.success :
                               confidence >= 60 ? this.theme.warning : this.theme.muted;
      
      const isLast = index === results.detected.length - 1;
      const connector = isLast ? '└─' : '├─';
      
      console.log(
        this.theme.primary(`${connector} `) +
        this.theme.accent(`🎯 ${framework.name}`) +
        confidenceColor(` ${confidence}%`) +
        this.theme.muted(` (${framework.matchedPatterns.length} patterns)`)
      );
      
      // Show key patterns for primary framework
      if (index === 0 && framework.matchedPatterns.length > 0) {
        const topPatterns = framework.matchedPatterns.slice(0, 3);
        topPatterns.forEach((pattern, pIndex) => {
          const isPatternLast = pIndex === topPatterns.length - 1;
          const patternConnector = isPatternLast ? '    └─' : '    ├─';
          console.log(
            this.theme.muted(`${patternConnector} `) +
            this.theme.info(`${pattern.type}: `) +
            this.theme.muted(`${pattern.value}`)
          );
        });
      }
    });
    
    console.log(this.createGradientBorder(75, 'accent'));
    
    // Conversion strategy display
    this.displayConversionStrategy(primaryFramework.name, results.recommendedOutput, frameworkComplexity);
  }

  /**
   * Advanced conversion card showing source → target transformation
   */
  displayAdvancedConversionCard(detectedName, sourceFramework, targetStack, complexity, confidence = 1.0) {
    const confidencePercent = Math.round(confidence * 100);
    const complexityIcon = {
      'low': '🟢',
      'medium': '🟡', 
      'high': '🔴'
    }[complexity] || '🟢';
    
    console.log('\n' + this.theme.success.bold('🔄 CONVERSION PIPELINE ANALYSIS'));
    console.log(this.createGradientBorder(85, 'success'));
    
    // Source framework display
    console.log(
      this.theme.primary('│ ') +
      this.theme.info.bold('SOURCE FRAMEWORK: ') +
      this.theme.accent.bold(sourceFramework) +
      this.theme.muted(` (${confidencePercent}% confidence)`) +
      ' '.repeat(Math.max(0, 83 - this.stripAnsi(`│ SOURCE FRAMEWORK: ${sourceFramework} (${confidencePercent}% confidence)`).length)) +
      this.theme.primary('│')
    );
    
    // Conversion arrow with animation effect
    const arrow = '═'.repeat(15) + '🚀' + '═'.repeat(15);
    console.log(
      this.theme.primary('│ ') +
      this.theme.warning(arrow) +
      ' '.repeat(Math.max(0, 83 - this.stripAnsi(`│ ${arrow}`).length)) +
      this.theme.primary('│')
    );
    
    // Target output display - ALWAYS HTML/CSS/JS for offline use
    console.log(
      this.theme.primary('│ ') +
      this.theme.info.bold('TARGET OUTPUT: ') +
      this.theme.success.bold('HTML/CSS/JS') +
      this.theme.muted(' (Offline-Ready Universal)') +
      ' '.repeat(Math.max(0, 83 - this.stripAnsi(`│ TARGET OUTPUT: HTML/CSS/JS (Offline-Ready Universal)`).length)) +
      this.theme.primary('│')
    );
    
    // Complexity and strategy
    console.log(
      this.theme.primary('│ ') +
      this.theme.info.bold('COMPLEXITY: ') +
      complexityIcon + ' ' + this.theme.warning.bold(complexity.toUpperCase()) +
      ' '.repeat(Math.max(0, 83 - this.stripAnsi(`│ COMPLEXITY: ${complexityIcon} ${complexity.toUpperCase()}`).length)) +
      this.theme.primary('│')
    );
    
    console.log(this.createGradientBorder(85, 'success'));
  }

  /**
   * Display conversion strategy and techniques
   */
  displayConversionStrategy(sourceFramework, targetStack, complexity) {
    console.log('\n' + this.theme.warning.bold('⚙️ CONVERSION STRATEGY & TECHNIQUES'));
    console.log(this.createGradientBorder(75, 'warning'));
    
    const strategies = this.getConversionStrategies(sourceFramework, targetStack);
    
    strategies.forEach((strategy, index) => {
      const isLast = index === strategies.length - 1;
      const connector = isLast ? '└─' : '├─';
      
      console.log(
        this.theme.primary(`${connector} `) +
        this.theme.accent.bold(strategy.technique) + ': ' +
        this.theme.muted(strategy.description)
      );
    });
    
    console.log(this.createGradientBorder(75, 'warning'));
  }

  /**
   * Get framework complexity level
   */
  getFrameworkComplexity(framework) {
    const complexityMap = {
      'React': 'high',
      'Next.js': 'high', 
      'Vue.js': 'high',
      'Nuxt.js': 'high',
      'Angular': 'high',
      'Svelte': 'medium',
      'Gatsby': 'high',
      'WordPress': 'medium',
      'Shopify': 'medium',
      'jQuery': 'low',
      'Bootstrap': 'low'
    };
    return complexityMap[framework] || 'low';
  }

  /**
   * Get conversion mode based on frameworks
   */
  getConversionMode(source, target) {
    if (source.includes('React') || source.includes('Vue') || source.includes('Angular')) {
      return 'Framework → Vanilla';
    }
    return 'Enhancement';
  }

  /**
   * Get conversion strategies for specific framework combinations
   */
  getConversionStrategies(source, target) {
    const universalStrategies = [
      { technique: 'Framework Neutralization', description: 'Strip framework-specific code and convert to vanilla HTML' },
      { technique: 'CSS Consolidation', description: 'Extract and merge all styling into standalone CSS files' },
      { technique: 'JavaScript Modernization', description: 'Convert framework code to clean vanilla JavaScript' },
      { technique: 'Asset Optimization', description: 'Download and optimize all images, fonts, and resources' },
      { technique: 'Offline Compatibility', description: 'Ensure complete functionality without internet connection' }
    ];

    if (source.includes('React') || source.includes('Next.js')) {
      return [
        { technique: 'React → HTML', description: `Convert ${source} components to semantic HTML structure` },
        { technique: 'JSX Flattening', description: 'Transform JSX syntax to standard HTML elements' },
        { technique: 'Hook Elimination', description: 'Replace React hooks with vanilla JavaScript equivalents' },
        { technique: 'State Hardcoding', description: 'Convert dynamic state to static HTML representations' },
        ...universalStrategies
      ];
    }

    if (source.includes('Vue')) {
      return [
        { technique: 'Vue → HTML', description: `Convert ${source} templates to static HTML` },
        { technique: 'Directive Removal', description: 'Replace Vue directives with vanilla JavaScript' },
        { technique: 'Component Flattening', description: 'Merge Vue components into standard HTML structure' },
        ...universalStrategies
      ];
    }

    if (source.includes('Angular')) {
      return [
        { technique: 'Angular → HTML', description: `Convert ${source} components to standard HTML` },
        { technique: 'TypeScript Conversion', description: 'Transform TypeScript to vanilla JavaScript' },
        { technique: 'Service Elimination', description: 'Replace Angular services with static implementations' },
        ...universalStrategies
      ];
    }

    return universalStrategies;
  }

  /**
   * Asset processing with detailed breakdown
   */
  assetBreakdown(stats) {
    this.displayCard('Asset Processing Summary', [
      { label: 'CSS Files', value: stats.cssCount, icon: '🎨' },
      { label: 'JavaScript Files', value: stats.jsCount, icon: '⚡' },
      { label: 'Images', value: stats.imageCount, icon: '🖼️' },
      { label: 'Total Assets', value: stats.cssCount + stats.jsCount + stats.imageCount, icon: '📦' }
    ]);
  }

  /**
   * Project summary with metrics
   */
  projectSummary(data) {
    console.log('\n' + this.createGradientBorder(80, 'success'));
    console.log(this.theme.success.bold('📊 PROJECT GENERATION SUMMARY'));
    console.log(this.createGradientBorder(80, 'success'));
    
    const items = [
      { icon: '🌐', label: 'Website Title', value: data.title || 'Untitled' },
      { icon: '📁', label: 'Output Directory', value: data.outputDir },
      { icon: '⚙️', label: 'Technology Stack', value: data.techStack.toUpperCase() },
      { icon: '🎨', label: 'CSS Assets', value: data.stats.cssCount },
      { icon: '⚡', label: 'JS Assets', value: data.stats.jsCount },
      { icon: '🖼️', label: 'Images Processed', value: data.stats.imageCount }
    ];
    
    items.forEach(item => {
      const value = String(item.value);
      const truncatedValue = value.length > 45 ? value.substring(0, 42) + '...' : value;
      console.log(
        this.theme.primary(`│ ${item.icon} `) +
        chalk.white(item.label + ':') +
        ' '.repeat(Math.max(1, 25 - item.label.length)) +
        this.theme.accent.bold(truncatedValue) +
        ' '.repeat(Math.max(0, 77 - this.stripAnsi(`│ ${item.icon} ${item.label}: ${truncatedValue}`).length)) +
        this.theme.primary('│')
      );
    });
    
    console.log(this.createGradientBorder(80, 'success') + '\n');
  }

  /**
   * Final completion with celebration effects
   */
  completion(success, outputPath, techStack, elapsedTime = 0) {
    if (success) {
      // Celebration header
      console.log('\n' + this.createCelebrationBorder());
      console.log(this.theme.success.bold('    ✨ TRANSFORMATION COMPLETE! ✨'));
      console.log(this.createCelebrationBorder());
      
      // Time display with performance metrics
      const timeDisplay = this.formatElapsedTime(elapsedTime);
      const speed = this.calculateSpeedRating(elapsedTime);
      
      console.log('\n' + this.theme.accent.bold('⏱️  MISSION ACCOMPLISHED'));
      console.log(this.theme.muted(`   Completed in ${this.theme.success.bold(timeDisplay)} - ${speed}`));
      
      // Inspirational quote
      const quote = this.getRandomQuote();
      console.log('\n' + this.theme.muted.italic(`   "${quote}"`));
      
      // Key information cards
      this.displayCard('Project Details', [
        { label: 'Location', value: outputPath, icon: '📁', color: 'info' },
        { label: 'Tech Stack', value: techStack.toUpperCase(), icon: '⚡', color: 'accent' },
        { label: 'Build Time', value: timeDisplay, icon: '⏱️', color: 'success' }
      ]);
      
      // Performance metrics
      this.displayPerformanceMetrics(elapsedTime);
      
      // Next steps
      this.displayNextSteps(outputPath, techStack);
      
      // Final celebration
      console.log('\n' + this.createStarField());
      console.log(this.theme.accent.bold('    🌟 Website mirrored to perfection! 🌟'));
      console.log(this.createStarField());
      
    } else {
      const timeDisplay = this.formatElapsedTime(elapsedTime);
      console.log('\n' + this.theme.error('═'.repeat(60)));
      console.log(this.theme.error.bold('    ❌ CLONING FAILED'));
      console.log(this.theme.muted(`    Time elapsed: ${timeDisplay}`));
      console.log(this.theme.error('═'.repeat(60)));
    }
    
    console.log('\n');
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  displayCard(title, items, width = 60) {
    console.log('\n' + this.theme.primary('╭' + '─'.repeat(width - 2) + '╮'));
    console.log(this.theme.primary('│ ') + chalk.white.bold(title.padEnd(width - 3)) + this.theme.primary('│'));
    console.log(this.theme.primary('├' + '─'.repeat(width - 2) + '┤'));
    
    items.forEach(item => {
      const icon = item.icon || '•';
      const color = item.color ? this.theme[item.color] : this.theme.accent;
      const label = item.label;
      const value = String(item.value);
      
      const line = `${icon} ${label}: ${color.bold(value)}`;
      const padding = ' '.repeat(Math.max(0, width - 3 - this.stripAnsi(line).length));
      
      console.log(this.theme.primary('│ ') + line + padding + this.theme.primary('│'));
    });
    
    console.log(this.theme.primary('╰' + '─'.repeat(width - 2) + '╯'));
  }

  displayDetails(details, color = 'muted') {
    if (details.length === 0) return;
    
    details.forEach(detail => {
      console.log(this.theme[color](`   • ${detail}`));
    });
  }

  displayPerformanceMetrics(elapsedTime) {
    const speed = this.calculateSpeedRating(elapsedTime);
    const quality = 'Premium Grade';
    const status = 'Ready to Deploy';
    
    console.log('\n' + this.theme.info.bold('🚀 PERFORMANCE METRICS'));
    console.log(this.theme.info('┌' + '─'.repeat(50) + '┐'));
    console.log(this.theme.info('│ ') + 
      chalk.white('🔥 Speed: ') + this.theme.warning.bold(speed.padEnd(43)) + 
      this.theme.info('│'));
    console.log(this.theme.info('│ ') + 
      chalk.white('💎 Quality: ') + this.theme.success.bold(quality.padEnd(41)) + 
      this.theme.info('│'));
    console.log(this.theme.info('│ ') + 
      chalk.white('⚡ Status: ') + this.theme.accent.bold(status.padEnd(42)) + 
      this.theme.info('│'));
    console.log(this.theme.info('└' + '─'.repeat(50) + '┘'));
  }

  displayNextSteps(outputPath, techStack) {
    console.log('\n' + this.theme.success.bold('🚀 NEXT STEPS'));
    console.log(this.theme.success('┌' + '─'.repeat(50) + '┐'));
    
    if (techStack === 'react') {
      const steps = [
        `cd ${outputPath}`,
        'npm install',
        'npm start'
      ];
      
      steps.forEach((step, index) => {
        console.log(this.theme.success('│ ') + 
          this.theme.warning.bold(`${index + 1}. `) + 
          chalk.white(step.padEnd(45)) + 
          this.theme.success('│'));
      });
    } else {
      const steps = [
        `cd ${outputPath}`,
        'Open index.html in your browser'
      ];
      
      steps.forEach((step, index) => {
        const paddedStep = step.length > 42 ? step.substring(0, 39) + '...' : step;
        console.log(this.theme.success('│ ') + 
          this.theme.warning.bold(`${index + 1}. `) + 
          chalk.white(paddedStep.padEnd(45)) + 
          this.theme.success('│'));
      });
    }
    
    console.log(this.theme.success('└' + '─'.repeat(50) + '┘'));
  }

  // ========================================
  // VISUAL EFFECTS
  // ========================================

  createGradientBorder(width, gradientType = 'primary') {
    const colors = this.theme.gradient[gradientType] || this.theme.gradient.primary;
    let border = '';
    
    for (let i = 0; i < width; i++) {
      const colorIndex = Math.floor((i / width) * colors.length);
      const char = Math.random() > 0.8 ? '█' : '═';
      border += colors[colorIndex](char);
    }
    
    return border;
  }

  createGradientLine(width, colorType = 'primary') {
    const colors = this.theme.gradient[colorType] || this.theme.gradient.primary;
    let line = '';
    
    for (let i = 0; i < width; i++) {
      const colorIndex = Math.floor((i / width) * colors.length);
      line += colors[colorIndex]('─');
    }
    
    return line;
  }

  createModernProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    let filledBar = '';
    for (let i = 0; i < filled; i++) {
      if (percentage < 25) filledBar += this.theme.error('█');
      else if (percentage < 50) filledBar += this.theme.warning('█');
      else if (percentage < 75) filledBar += this.theme.info('█');
      else filledBar += this.theme.success('█');
    }
    
    const emptyBar = this.theme.muted('░'.repeat(empty));
    return `[${filledBar}${emptyBar}]`;
  }

  createCelebrationBorder() {
    const chars = ['🎉', '✨', '🌟', '⭐', '💫', '🔮', '💎'];
    const colors = this.theme.gradient.rainbow;
    let border = '';
    
    for (let i = 0; i < 60; i++) {
      if (i % 6 === 0) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        border += color(char);
      } else {
        const color = colors[Math.floor((i / 60) * colors.length)];
        border += color('═');
      }
    }
    
    return border;
  }

  createStarField() {
    const stars = ['✦', '✧', '⭐', '🌟', '✨', '💫', '⋆', '★', '☆'];
    const colors = [this.theme.warning, this.theme.info, this.theme.accent, chalk.white];
    let field = '';
    
    for (let i = 0; i < 60; i++) {
      if (Math.random() > 0.7) {
        const star = stars[Math.floor(Math.random() * stars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        field += color(star);
      } else {
        field += ' ';
      }
    }
    
    return field;
  }

  // ========================================
  // ANIMATIONS & DYNAMIC CONTENT
  // ========================================

  getAnimatedSpinner() {
    const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const spinner = spinners[Math.floor(Date.now() / 100) % spinners.length];
    return this.theme.primary(spinner);
  }

  getStatusIcon(status) {
    const icons = {
      active: '▶',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: '💡'
    };
    return icons[status] || icons.active;
  }

  getStatusColor(status) {
    const colors = {
      active: this.theme.primary,
      success: this.theme.success,
      warning: this.theme.warning,
      error: this.theme.error,
      info: this.theme.info
    };
    return colors[status] || colors.active;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  formatElapsedTime(milliseconds) {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    } else if (milliseconds < 60000) {
      const seconds = (milliseconds / 1000).toFixed(1);
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(milliseconds / 60000);
      const seconds = Math.floor((milliseconds % 60000) / 1000);
      return `${minutes}m ${seconds}s`;
    }
  }

  calculateSpeedRating(elapsedTime) {
    if (elapsedTime < 3000) return 'Lightning Fast ⚡';
    if (elapsedTime < 8000) return 'Blazing Speed 🔥';
    if (elapsedTime < 15000) return 'Rapid Execution 🚀';
    if (elapsedTime < 30000) return 'Swift Processing 💨';
    if (elapsedTime < 60000) return 'Steady Progress 🐌';
    return 'Patient Processing 🕐';
  }

  getRandomQuote() {
    const quotes = [
      "Every pixel tells a story, every line of code writes a dream",
      "From digital chaos to perfect harmony - one clone at a time",
      "Code is the language of the future, and you're fluent",
      "Where creativity meets technology, magic happens",
      "Innovation is the bridge between imagination and reality",
      "The web is your canvas, paint it beautifully",
      "Dreams become reality through lines of code",
      "Digital artistry at its absolute finest",
      "Technology is magic, and you're the wizard",
      "Crafting digital experiences, one component at a time"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  stripAnsi(str) {
    return str.replace(/\u001b\[[0-9;]*m/g, '');
  }

  // ========================================
  // CLAUDE CODE SIGNATURE METHODS
  // ========================================

  createClaudeSignatureBorder(width) {
    const chars = ['▀', '▄', '█', '▌', '▐', '░', '▒', '▓'];
    const colors = this.theme.gradient.claude;
    let border = '';
    
    for (let i = 0; i < width; i++) {
      const colorIndex = Math.floor((i / width) * colors.length);
      const char = chars[Math.floor(Math.random() * chars.length)];
      border += colors[colorIndex](char);
    }
    
    return border;
  }

  createAnimatedTitle(title, width) {
    const padding = Math.floor((width - title.length) / 2);
    const leftPadding = '█'.repeat(Math.max(0, padding - 2));
    const rightPadding = '█'.repeat(Math.max(0, width - padding - title.length - 2));
    
    return this.theme.primary.bold(leftPadding) + 
           ' ' + chalk.white.bold(title) + ' ' +
           this.theme.primary.bold(rightPadding);
  }

  createStyledSubtitle(subtitle, width) {
    const padding = Math.floor((width - subtitle.length) / 2);
    return ' '.repeat(padding) + this.theme.muted.italic(subtitle);
  }

  createClaudeGradientLine(width, colorType = 'claude') {
    const colors = this.theme.gradient[colorType] || this.theme.gradient.claude;
    let line = '';
    
    for (let i = 0; i < width; i++) {
      const colorIndex = Math.floor((i / width) * colors.length);
      const char = i % 3 === 0 ? '━' : '─';
      line += colors[colorIndex](char);
    }
    
    return line;
  }

  createSectionHeader(title, icon, color) {
    const gradient = this.theme.gradient[color] || this.theme.gradient.claude;
    const coloredIcon = gradient[0](icon);
    const coloredTitle = this.theme[color].bold(title.toUpperCase());
    const decorator = gradient[1]('◆');
    
    return `${coloredIcon} ${coloredTitle} ${decorator}`;
  }

  createStepIndicator(current, total, status) {
    const completed = '●';
    const pending = '○';
    const active = '◉';
    
    let indicator = '';
    for (let i = 1; i <= total; i++) {
      if (i < current) {
        indicator += this.theme.success(completed);
      } else if (i === current) {
        indicator += status === 'success' ? this.theme.success(completed) : this.theme.primary(active);
      } else {
        indicator += this.theme.muted(pending);
      }
      if (i < total) indicator += this.theme.muted('─');
    }
    
    return `   ${indicator} ${this.theme.muted(`(${current}/${total})`)}`;
  }

  createClaudeProgressBar(percentage, width = 40) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    let filledBar = '';
    const colors = percentage < 25 ? this.theme.gradient.warning :
                   percentage < 50 ? this.theme.gradient.primary :
                   percentage < 75 ? this.theme.gradient.success :
                   this.theme.gradient.aurora;
    
    for (let i = 0; i < filled; i++) {
      const colorIndex = Math.floor((i / filled) * colors.length);
      filledBar += colors[colorIndex]('█');
    }
    
    const emptyBar = this.theme.muted('░'.repeat(empty));
    return `[${filledBar}${emptyBar}]`;
  }

  getClaudeStatusIcon(status) {
    const icons = {
      active: '▶',
      success: '✓',
      warning: '!',
      error: '✗',
      info: 'i'
    };
    return icons[status] || icons.active;
  }

  getClaudeSpinner() {
    const spinners = ['◐', '◓', '◑', '◒'];
    const spinner = spinners[Math.floor(Date.now() / 200) % spinners.length];
    return this.theme.primary(spinner);
  }

  createPulsingDot(percentage) {
    const dots = ['·', '•', '●', '•'];
    const dot = dots[Math.floor(Date.now() / 300) % dots.length];
    const color = percentage > 75 ? this.theme.success :
                  percentage > 50 ? this.theme.info :
                  percentage > 25 ? this.theme.warning : this.theme.error;
    return color(dot);
  }

  createAnimatedIcon(char, type) {
    const colors = this.theme.gradient[type === 'success' ? 'success' : 
                                     type === 'warning' ? 'warning' :
                                     type === 'error' ? 'rainbow' : 'primary'];
    const colorIndex = Math.floor(Date.now() / 500) % colors.length;
    return colors[colorIndex](`[${char}]`);
  }

  displayClaudeDetails(details, color = 'muted') {
    if (details.length === 0) return;
    
    details.forEach((detail, index) => {
      const isLast = index === details.length - 1;
      const connector = isLast ? '└─' : '├─';
      console.log(this.theme.muted(`   ${connector} `) + this.theme[color](detail));
    });
  }

  createClaudeHeader(title) {
    const gradient = this.theme.gradient.claude;
    let coloredTitle = '';
    
    for (let i = 0; i < title.length; i++) {
      const colorIndex = Math.floor((i / title.length) * gradient.length);
      coloredTitle += gradient[colorIndex](title[i]);
    }
    
    return coloredTitle;
  }

  createClaudeGradientBorder(width, gradientType = 'claude') {
    const colors = this.theme.gradient[gradientType] || this.theme.gradient.claude;
    let border = '';
    
    for (let i = 0; i < width; i++) {
      const colorIndex = Math.floor((i / width) * colors.length);
      const chars = ['═', '━', '▬', '▭'];
      const char = chars[Math.floor(Math.random() * chars.length)];
      border += colors[colorIndex](char);
    }
    
    return border;
  }

  createConfidenceBadge(confidence) {
    let badge, color;
    if (confidence >= 90) {
      badge = 'HIGH';
      color = this.theme.success;
    } else if (confidence >= 60) {
      badge = 'MEDIUM';
      color = this.theme.warning;
    } else {
      badge = 'LOW';
      color = this.theme.muted;
    }
    
    return ` ${color.bold(`[${badge} ${confidence}%]`)}`;
  }

  getFrameworkIcon(frameworkName) {
    const icons = {
      'React': '⚛️',
      'Vue': '🟢',
      'Angular': '🔺',
      'Next.js': '▲',
      'Nuxt.js': '💚',
      'Gatsby': '🟣',
      'Svelte': '🧡',
      'WordPress': '📝',
      'Shopify': '🛍️',
      'jQuery': '💙',
      'Bootstrap': '🅱️'
    };
    return icons[frameworkName] || '🔧';
  }

  displayClaudeCard(title, items, width = 65) {
    const borderColor = this.theme.primary;
    console.log('\n' + borderColor('╭' + '─'.repeat(width - 2) + '╮'));
    
    // Title with Claude styling
    const titlePadding = Math.floor((width - 4 - this.stripAnsi(title).length) / 2);
    console.log(borderColor('│ ') + ' '.repeat(titlePadding) + 
                this.theme.gold.bold(title) + 
                ' '.repeat(width - 4 - titlePadding - this.stripAnsi(title).length) + 
                borderColor(' │'));
    console.log(borderColor('├' + '─'.repeat(width - 2) + '┤'));
    
    items.forEach(item => {
      const icon = item.icon || '•';
      const color = item.color ? this.theme[item.color] : this.theme.accent;
      const label = item.label;
      const value = String(item.value);
      
      const line = `${icon} ${label}: ${color.bold(value)}`;
      const padding = ' '.repeat(Math.max(0, width - 3 - this.stripAnsi(line).length));
      
      console.log(borderColor('│ ') + line + padding + borderColor('│'));
    });
    
    console.log(borderColor('╰' + '─'.repeat(width - 2) + '╯'));
  }

  createClaudeCelebrationBorder() {
    const chars = ['🎊', '✨', '🌟', '⭐', '💫', '🔥', '💎', '🎉'];
    const colors = this.theme.gradient.aurora;
    let border = '';
    
    for (let i = 0; i < 70; i++) {
      if (i % 8 === 0) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        border += color(char);
      } else {
        const color = colors[Math.floor((i / 70) * colors.length)];
        border += color('═');
      }
    }
    
    return border;
  }

  createCelebrationTitle(title) {
    const colors = this.theme.gradient.aurora;
    let coloredTitle = '';
    
    for (let i = 0; i < title.length; i++) {
      const colorIndex = Math.floor((i / title.length) * colors.length);
      coloredTitle += colors[colorIndex].bold(title[i]);
    }
    
    return '    ' + coloredTitle;
  }

  createSuccessBanner(text) {
    return this.theme.gold.bold(`🚀 ${text}`);
  }

  getClaudeQuote() {
    const quotes = [
      "Every website tells a story, every conversion writes a new chapter",
      "From framework complexity to universal simplicity - one conversion at a time",
      "Code is the universal language, and HTML/CSS/JS speaks to everyone",
      "Where innovation meets accessibility, magic happens",
      "Simplicity is the ultimate sophistication",
      "The web belongs to everyone, let's make it accessible",
      "Converting dreams into reality, one website at a time",
      "Digital transformation at its absolute finest",
      "Technology should unite, not divide",
      "Crafting universal experiences, one conversion at a time"
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  createQuoteDisplay(quote) {
    const quoteColor = this.theme.muted.italic;
    const decorativeChar = this.theme.gold('❝');
    return `   ${decorativeChar} ${quoteColor(quote)} ${decorativeChar}`;
  }

  displayClaudePerformanceMetrics(elapsedTime) {
    const speed = this.calculateSpeedRating(elapsedTime);
    const quality = 'Production Ready';
    const status = 'Deployment Ready';
    
    console.log('\n' + this.theme.info.bold('⚡ PERFORMANCE METRICS'));
    console.log(this.theme.primary('┌' + '─'.repeat(55) + '┐'));
    console.log(this.theme.primary('│ ') + 
      this.theme.gold('🔥 Speed: ') + this.theme.highlight.bold(speed.padEnd(43)) + 
      this.theme.primary(' │'));
    console.log(this.theme.primary('│ ') + 
      this.theme.gold('💎 Quality: ') + this.theme.success.bold(quality.padEnd(41)) + 
      this.theme.primary(' │'));
    console.log(this.theme.primary('│ ') + 
      this.theme.gold('🚀 Status: ') + this.theme.accent.bold(status.padEnd(42)) + 
      this.theme.primary(' │'));
    console.log(this.theme.primary('└' + '─'.repeat(55) + '┘'));
  }

  displayClaudeNextSteps(outputPath) {
    console.log('\n' + this.theme.success.bold('🎯 NEXT STEPS'));
    console.log(this.theme.primary('┌' + '─'.repeat(55) + '┐'));
    
    const steps = [
      `cd ${outputPath}`,
      'Open index.html in your browser',
      'Deploy to any web server'
    ];
    
    steps.forEach((step, index) => {
      const paddedStep = step.length > 48 ? step.substring(0, 45) + '...' : step;
      console.log(this.theme.primary('│ ') + 
        this.theme.gold.bold(`${index + 1}. `) + 
        chalk.white(paddedStep.padEnd(50)) + 
        this.theme.primary(' │'));
    });
    
    console.log(this.theme.primary('└' + '─'.repeat(55) + '┘'));
  }

  createClaudeStarField() {
    const stars = ['✦', '✧', '⭐', '🌟', '✨', '💫', '⋆', '★', '☆', '❋', '❆'];
    const colors = this.theme.gradient.aurora;
    let field = '';
    
    for (let i = 0; i < 70; i++) {
      if (Math.random() > 0.6) {
        const star = stars[Math.floor(Math.random() * stars.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        field += color(star);
      } else {
        field += ' ';
      }
    }
    
    return field;
  }

  createErrorBorder() {
    const colors = this.theme.gradient.warning;
    let border = '';
    
    for (let i = 0; i < 60; i++) {
      const colorIndex = Math.floor((i / 60) * colors.length);
      border += colors[colorIndex]('═');
    }
    
    return border;
  }

  // ========================================
  // ADVANCED DISPLAY METHODS
  // ========================================

  /**
   * Display a beautiful table with data
   */
  table(headers, rows, title = '') {
    if (title) {
      console.log('\n' + this.theme.primary.bold(title));
    }
    
    const colWidths = headers.map((header, i) => 
      Math.max(header.length, ...rows.map(row => String(row[i] || '').length)) + 2
    );
    
    const totalWidth = colWidths.reduce((sum, width) => sum + width, 0) + headers.length + 1;
    
    // Header
    console.log(this.theme.primary('┌' + colWidths.map(w => '─'.repeat(w)).join('┬') + '┐'));
    console.log(this.theme.primary('│') + 
      headers.map((header, i) => 
        this.theme.accent.bold(header.padEnd(colWidths[i]))
      ).join(this.theme.primary('│')) + this.theme.primary('│'));
    console.log(this.theme.primary('├' + colWidths.map(w => '─'.repeat(w)).join('┼') + '┤'));
    
    // Rows
    rows.forEach(row => {
      console.log(this.theme.primary('│') + 
        row.map((cell, i) => 
          chalk.white(String(cell || '').padEnd(colWidths[i]))
        ).join(this.theme.primary('│')) + this.theme.primary('│'));
    });
    
    console.log(this.theme.primary('└' + colWidths.map(w => '─'.repeat(w)).join('┴') + '┘'));
  }

  /**
   * Display loading animation
   */
  async loading(message, duration = 2000) {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const startTime = Date.now();
    
    return new Promise(resolve => {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const frame = frames[Math.floor(elapsed / 100) % frames.length];
        
        process.stdout.write(`\r${this.theme.primary(frame)} ${message}`);
        
        if (elapsed >= duration) {
          clearInterval(interval);
          process.stdout.write(`\r✅ ${message} - Complete\n`);
          resolve();
        }
      }, 100);
    });
  }

  /**
   * Clear current line and move cursor up
   */
  clearLine() {
    process.stdout.write('\r\x1b[K');
  }

  /**
   * Display a tree structure
   */
  tree(structure, indent = 0) {
    const prefix = '  '.repeat(indent);
    
    if (typeof structure === 'string') {
      console.log(prefix + this.theme.muted('├─ ') + chalk.white(structure));
    } else if (Array.isArray(structure)) {
      structure.forEach((item, index) => {
        const isLast = index === structure.length - 1;
        const connector = isLast ? '└─ ' : '├─ ';
        console.log(prefix + this.theme.muted(connector) + chalk.white(item));
      });
    } else if (typeof structure === 'object' && structure !== null) {
      Object.entries(structure).forEach(([key, value], index, entries) => {
        const isLast = index === entries.length - 1;
        const connector = isLast ? '└─ ' : '├─ ';
        console.log(prefix + this.theme.muted(connector) + this.theme.accent.bold(key));
        
        if (value !== null && typeof value === 'object') {
          this.tree(value, indent + 1);
        }
      });
    }
  }
}

// Export singleton instance
export const display = new ClaudeDisplay();

// Legacy compatibility - maintain existing ProgressDisplay interface
export class ProgressDisplay {
  static header = display.header.bind(display);
  static section = display.section.bind(display);
  static step = display.step.bind(display);
  static progress = display.progress.bind(display);
  static success = display.success.bind(display);
  static info = display.info.bind(display);
  static warning = display.warning.bind(display);
  static error = display.error.bind(display);
  static summary = display.projectSummary.bind(display);
  static finalResult = display.completion.bind(display);
  
  // Additional compatibility methods
  static stripAnsi = display.stripAnsi.bind(display);
  static createCelebrationBorder = display.createCelebrationBorder.bind(display);
  static createInfoCard = display.displayCard.bind(display);
  static createStarField = display.createStarField.bind(display);
  static formatElapsedTime = display.formatElapsedTime.bind(display);
  static calculateSpeed = display.calculateSpeedRating.bind(display);
  static getInspirationalQuote = display.getRandomQuote.bind(display);
}