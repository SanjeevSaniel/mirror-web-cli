#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { cloneToTechStack } from './cloner.js';
import { isAIAvailable } from './aiAnalyzer.js';
import { formatTitleToFolderName, ProgressDisplay } from './utils.js';
import puppeteer from 'puppeteer';
import { load } from 'cheerio';

const program = new Command();

// Helper function to extract website title quickly
async function extractWebsiteTitle(url) {
  try {
    ProgressDisplay.step('1/5', 'Connecting to website...', 'Launching browser and navigating to target URL');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    ProgressDisplay.step('2/5', 'Extracting page metadata...', 'Reading page title and basic information');
    const html = await page.content();
    await browser.close();
    
    const $ = load(html);
    return $('title').text() || '';
  } catch (error) {
    ProgressDisplay.warning('Could not extract title, using URL-based name', error.message);
    return '';
  }
}

program
  .name('mirror-web-cli')
  .description('Clone websites as clean HTML/CSS/JS or React projects')
  .version('1.0.0')
  .argument('<url>', 'Website URL to clone')
  .option('-o, --output <dir>', 'Output directory', './cloned-site')
  .option('-t, --tech <stack>', 'Output tech stack: html|react', 'html')
  .option('--ai', 'Enable AI-powered optimization', false)
  .option('--clean', 'Generate clean, minimal code', false)
  .action(async (url, options) => {
    try {
      // Beautiful header
      ProgressDisplay.header('🪞 MIRROR WEB CLI', 'Professional Website Cloning Tool');
      
      // Display configuration
      ProgressDisplay.info('Configuration Details', 
        `Target URL: ${chalk.cyan(url)}\n   Technology Stack: ${chalk.magenta(options.tech.toUpperCase())}\n   Clean Mode: ${options.clean ? chalk.green('ENABLED') : chalk.gray('DISABLED')}`
      );

      // Extract website title for folder naming (unless output is explicitly provided)
      let outputDir = options.output;
      let siteTitle = '';
      
      if (options.output === './cloned-site') {
        ProgressDisplay.section('🔍 EXTRACTING WEBSITE METADATA');
        siteTitle = await extractWebsiteTitle(url);
        const folderName = formatTitleToFolderName(siteTitle, url);
        outputDir = `./${folderName}`;
        
        ProgressDisplay.success('Website title extracted successfully', 
          `Title: "${siteTitle || 'No title found'}"\n   Folder: ${chalk.cyan(folderName)}`
        );
      }

      // Check AI availability
      const aiRequested = options.ai;
      const aiAvailable = isAIAvailable();
      
      if (aiRequested) {
        ProgressDisplay.section('🤖 AI OPTIMIZATION SETUP');
        if (aiAvailable) {
          ProgressDisplay.success('AI features enabled', 'OpenAI API key detected and validated');
        } else {
          ProgressDisplay.warning('AI features disabled', 
            'OPENAI_API_KEY not found\n   Set your API key: export OPENAI_API_KEY="your-key"'
          );
        }
      }

      // Configuration summary
      const config = {
        outputDir: outputDir,
        techStack: options.tech,
        clean: options.clean,
        aiEnabled: aiRequested && aiAvailable,
      };

      ProgressDisplay.section('⚙️  CLONING PROCESS');

      const result = await cloneToTechStack(url, config);

      // Beautiful success display
      ProgressDisplay.finalResult(true, outputDir, options.tech);

    } catch (error) {
      ProgressDisplay.error('Cloning process failed', error.message);
      ProgressDisplay.finalResult(false, '', '');
      process.exit(1);
    }
  });

program.parse(process.argv);
