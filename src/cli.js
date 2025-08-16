#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { cloneToTechStack } from './cloner.js';
import { isAIAvailable } from './aiAnalyzer.js';
import { formatTitleToFolderName } from './utils.js';
import { display } from './display.js';
import { frameworkDetector } from './frameworkDetector.js';
import { chromium } from 'playwright';
import { load } from 'cheerio';

const program = new Command();

// Enhanced function to extract website metadata and detect frameworks
async function analyzeWebsite(url) {
  try {
    display.step(1, 5, 'Connecting to Website', 'Launching Playwright browser and navigating to target URL');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    display.step(2, 5, 'Extracting Metadata', 'Reading page title and analyzing framework patterns');
    const html = await page.content();
    await browser.close();
    
    const $ = load(html);
    const title = $('title').text() || '';
    
    // Perform framework detection
    const frameworkResults = await frameworkDetector.detect(html, url);
    
    return {
      title,
      html,
      frameworks: frameworkResults
    };
  } catch (error) {
    display.warning('Could not extract metadata', error.message, ['Using URL-based defaults']);
    return {
      title: '',
      html: '',
      frameworks: { detected: [], recommendedOutput: 'html', complexity: 'low' }
    };
  }
}

program
  .name('mirror-web-cli')
  .description('Clone websites as clean HTML/CSS/JS or React projects')
  .version('1.0.0')
  .argument('<url>', 'Website URL to clone')
  .option('-o, --output <dir>', 'Output directory', './cloned-site')
  .option('-t, --tech <stack>', 'Output tech stack: html|react (auto-detected if not specified)', 'auto')
  .option('--ai', 'Enable AI-powered optimization', false)
  .option('--clean', 'Generate clean, minimal code', false)
  .option('--no-detect', 'Disable framework auto-detection', false)
  .action(async (url, options) => {
    // Start timing
    const startTime = Date.now();
    
    try {
      
      // Beautiful header with Claude Code styling
      display.header('🪞 MIRROR WEB CLI', 'AI-Enhanced Website Cloning Tool');
      
      // Initial configuration display
      display.info('Initial Configuration', '', [
        `Target URL: ${chalk.cyan(url)}`,
        `Technology Stack: ${chalk.magenta(options.tech === 'auto' ? 'AUTO-DETECT' : options.tech.toUpperCase())}`,
        `Clean Mode: ${options.clean ? chalk.green('ENABLED') : chalk.gray('DISABLED')}`
      ]);

      // Analyze website and detect frameworks (unless output is explicitly provided)
      let outputDir = options.output;
      let websiteAnalysis = { title: '', frameworks: { detected: [], recommendedOutput: 'html', complexity: 'low' } };
      
      if (options.output === './cloned-site' || options.tech === 'auto' || !options.noDetect) {
        display.section('🔍 ANALYZING WEBSITE STRUCTURE');
        websiteAnalysis = await analyzeWebsite(url);
        
        // Display framework detection results
        display.frameworkResults(websiteAnalysis.frameworks);
        
        // Generate output directory name if needed
        if (options.output === './cloned-site') {
          const folderName = formatTitleToFolderName(websiteAnalysis.title, url);
          outputDir = `./${folderName}`;
          
          display.success('Website Analysis Complete', '', [
            `Title: "${websiteAnalysis.title || 'No title found'}"`,
            `Folder: ${chalk.cyan(folderName)}`,
            `Recommended: ${chalk.magenta(websiteAnalysis.frameworks.recommendedOutput.toUpperCase())}`
          ]);
        }
      }

      // Determine final tech stack - ALWAYS HTML for offline compatibility
      let finalTechStack = 'html'; // Force HTML output for offline use
      if (options.tech !== 'auto') {
        finalTechStack = options.tech; // Only override if user explicitly specifies
      }
      
      display.info('Auto-Detection Result', 
        `Converting ${chalk.cyan(websiteAnalysis.frameworks.detected[0]?.name || 'website')} → ${chalk.green.bold('HTML/CSS/JS')} for offline compatibility`
      );

      // Check AI availability
      const aiRequested = options.ai;
      const aiAvailable = isAIAvailable();
      
      if (aiRequested) {
        display.section('🤖 AI OPTIMIZATION SETUP');
        if (aiAvailable) {
          display.success('AI Features Enabled', 'OpenAI API key detected and validated');
        } else {
          display.warning('AI Features Disabled', '', [
            'OPENAI_API_KEY not found',
            'Set your API key: export OPENAI_API_KEY="your-key"'
          ]);
        }
      }

      // Configuration summary
      const config = {
        outputDir: outputDir,
        techStack: finalTechStack,
        clean: options.clean,
        aiEnabled: aiRequested && aiAvailable,
        startTime: startTime,
        frameworkAnalysis: websiteAnalysis.frameworks,
      };

      display.section('⚙️ CLONING PROCESS');

      const result = await cloneToTechStack(url, config);

      // Calculate total elapsed time
      const totalElapsedTime = Date.now() - startTime;

      // Beautiful success display with timing
      display.completion(true, outputDir, finalTechStack, totalElapsedTime);

    } catch (error) {
      const totalElapsedTime = Date.now() - startTime;
      display.error('Cloning Process Failed', error.message);
      display.completion(false, '', '', totalElapsedTime);
      process.exit(1);
    }
  });

program.parse(process.argv);
