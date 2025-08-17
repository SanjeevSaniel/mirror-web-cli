#!/usr/bin/env node

/**
 * @fileoverview Mirror Web CLI - Command Line Interface
 * @description Main entry point for the Mirror Web CLI tool that provides an advanced
 * website mirroring solution with framework preservation capabilities.
 * 
 * Features:
 * - Universal framework detection (React, Vue, Angular, Next.js, etc.)
 * - Framework-preserving mirroring that maintains original structure
 * - AI-powered analysis for optimal conversion strategies
 * - Beautiful terminal UI with progress tracking and animations
 * - Comprehensive asset extraction and optimization
 * 
 * @version 1.0.0
 * @author Sanjeev Saniel Kujur
 * @license MIT
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { MirrorCloner } from './core/mirror-cloner.js';

/**
 * Validates and handles OpenAI API key setup for AI features
 * @param {boolean} aiEnabled - Whether AI features are requested
 * @param {string} openaiApiKey - Optional OpenAI API key from command line
 * @returns {boolean} - Whether AI features should be enabled
 */
function validateAISetup(aiEnabled, openaiApiKey) {
  if (!aiEnabled) return false;
  
  // Check for OpenAI API key in environment or parameter
  const finalApiKey = openaiApiKey || process.env.OPENAI_API_KEY;
  
  if (!finalApiKey) {
    console.log('');
    console.log(chalk.yellow('⚠️  AI features requested but no OpenAI API key found'));
    console.log('');
    console.log(chalk.white('To use AI-powered analysis, you need an OpenAI API key:'));
    console.log('');
    console.log(chalk.blue('Option 1:') + chalk.gray(' Set environment variable'));
    console.log(chalk.gray('  export OPENAI_API_KEY="sk-your-openai-key-here"'));
    console.log('');
    console.log(chalk.blue('Option 2:') + chalk.gray(' Pass as parameter'));
    console.log(chalk.gray('  mirror-web-cli <url> --ai --openai-key "sk-your-openai-key-here"'));
    console.log('');
    console.log(chalk.blue('Get OpenAI API key:') + chalk.gray(' https://platform.openai.com/api-keys'));
    console.log('');
    console.log(chalk.dim('Note: Only OpenAI API keys are supported for AI analysis'));
    console.log(chalk.dim('Continuing without AI features...'));
    console.log('');
    return false;
  }
  
  // Validate it looks like an OpenAI API key
  if (!finalApiKey.startsWith('sk-')) {
    console.log('');
    console.log(chalk.yellow('⚠️  Invalid OpenAI API key format'));
    console.log('');
    console.log(chalk.white('OpenAI API keys must start with "sk-"'));
    console.log(chalk.gray('Example: sk-proj-abc123...'));
    console.log('');
    console.log(chalk.blue('Get a valid OpenAI API key:') + chalk.gray(' https://platform.openai.com/api-keys'));
    console.log('');
    console.log(chalk.dim('Continuing without AI features...'));
    console.log('');
    return false;
  }
  
  // Set the OpenAI API key for the session
  if (openaiApiKey && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = openaiApiKey;
  }
  
  return true;
}

const program = new Command();

program
  .name('mirror-web-cli')
  .description('Mirror Web CLI v1.0 - Professional website mirroring with intelligent framework preservation')
  .version('1.0.0')
  .argument('<url>', 'Target website URL to mirror (supports http/https)')
  .option('-o, --output <dir>', 'Custom output directory path (defaults to domain name)')
  .option('--clean', 'Remove tracking scripts, analytics, and third-party code', false)
  .option('--ai', 'Enable AI-powered website analysis (requires OpenAI API key)', false)
  .option('--openai-key <key>', 'OpenAI API key for AI features (or set OPENAI_API_KEY env var)')
  .option('--debug', 'Enable detailed debug logging and error traces', false)
  .option('--timeout <ms>', 'Browser page load timeout in milliseconds', '120000')
  .option('--headless <bool>', 'Run browser in headless mode (true/false)', 'true')
  .action(async (url, options) => {
    try {
      // Validate and normalize URL
      if (!url.startsWith('http')) {
        url = 'https://' + url;
      }
      
      new URL(url); // Validate URL format
      
      // Validate OpenAI API key setup and get final AI enabled status
      const aiEnabled = validateAISetup(options.ai, options.openaiKey);
      
      // Configure mirroring options
      const config = {
        outputDir: options.output,
        clean: options.clean,
        ai: aiEnabled,
        debug: options.debug,
        timeout: parseInt(options.timeout),
        headless: options.headless !== 'false'
      };
      
      // Initialize and execute mirroring process
      const cloner = new MirrorCloner(url, config);
      const success = await cloner.clone();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      console.log('');
      console.log(chalk.red('❌ Error: ' + error.message));
      
      if (error.message.includes('Invalid URL')) {
        console.log(chalk.gray('   Please provide a valid URL (e.g., https://example.com)'));
      }
      
      process.exit(1);
    }
  });

// Enhanced help documentation
program.addHelpText('after', `

${chalk.hex('#7c3aed').bold('USAGE EXAMPLES:')}

  ${chalk.gray('# Basic website mirroring')}
  ${chalk.cyan('mirror-web-cli https://example.com')}
  
  ${chalk.gray('# Mirror to custom directory')}
  ${chalk.cyan('mirror-web-cli https://react-app.com -o ./my-mirror')}
  
  ${chalk.gray('# Clean mirror without tracking scripts')}
  ${chalk.cyan('mirror-web-cli https://site.com --clean')}
  
  ${chalk.gray('# Debug mode with detailed logging')}
  ${chalk.cyan('mirror-web-cli https://complex-site.com --debug')}
  
  ${chalk.gray('# AI-powered analysis with OpenAI API key')}
  ${chalk.cyan('mirror-web-cli https://site.com --ai --openai-key "sk-..."')}

${chalk.hex('#7c3aed').bold('AI FEATURES (OpenAI):')}
  ${chalk.green('•')} Set ${chalk.white('OPENAI_API_KEY')} environment variable (recommended)
  ${chalk.green('•')} Or pass ${chalk.white('--openai-key')} parameter for one-time use
  ${chalk.green('•')} Get OpenAI API key at ${chalk.blue('https://platform.openai.com/api-keys')}
  ${chalk.green('•')} AI analysis uses OpenAI GPT-4o for enhanced framework detection
  ${chalk.green('•')} Only OpenAI API keys (starting with "sk-") are supported

${chalk.hex('#7c3aed').bold('FRAMEWORK SUPPORT:')}
  ${chalk.green('✓')} React/Next.js    ${chalk.gray('→ Preserves component structure')}
  ${chalk.green('✓')} Vue/Nuxt        ${chalk.gray('→ Maintains reactive patterns')}
  ${chalk.green('✓')} Angular         ${chalk.gray('→ Keeps module organization')}
  ${chalk.green('✓')} Svelte/SvelteKit ${chalk.gray('→ Preserves store patterns')}
  ${chalk.green('✓')} Static Sites    ${chalk.gray('→ Clean HTML/CSS/JS output')}

${chalk.hex('#7c3aed').bold('OUTPUT FEATURES:')}
  ${chalk.green('•')} Framework-preserving structure with intelligent asset optimization
  ${chalk.green('•')} Offline-ready websites with localized resources
  ${chalk.green('•')} Clean code generation with optional tracking removal
  ${chalk.green('•')} Professional project structure ready for development

${chalk.dim('Need help? Visit:')} ${chalk.blue('https://github.com/SanjeevSaniel/mirror-web-cli')}
`);

// Enhanced welcome screen when no arguments provided
if (process.argv.length <= 2) {
  const width = Math.min(process.stdout.columns || 80, 80);
  const line = '═'.repeat(width);
  const spacer = ' '.repeat(Math.floor((width - 32) / 2));
  
  console.log('');
  console.log(chalk.hex('#7c3aed')(line));
  console.log(chalk.hex('#7c3aed').bold(`${spacer}🪞 Mirror Web CLI v1.0`));
  console.log(chalk.hex('#06b6d4')(`${spacer}Professional Website Mirroring`));
  console.log(chalk.hex('#7c3aed')(line));
  console.log('');
  console.log(chalk.white('Mirror any website while preserving its framework structure and functionality.'));
  console.log('');
  console.log(chalk.hex('#10b981')('✨ Features:'));
  console.log(`   ${chalk.green('•')} ${chalk.white('Intelligent framework detection (React, Vue, Angular, Next.js, etc.)')}`);
  console.log(`   ${chalk.green('•')} ${chalk.white('Framework-preserving output with professional structure')}`);
  console.log(`   ${chalk.green('•')} ${chalk.white('Comprehensive asset extraction and optimization')}`);
  console.log(`   ${chalk.green('•')} ${chalk.white('Clean code generation with tracking script removal')}`);
  console.log('');
  console.log(chalk.hex('#f59e0b')('🚀 Quick Start:'));
  console.log(`   ${chalk.cyan('mirror-web-cli https://example.com')}`);
  console.log(`   ${chalk.cyan('mirror-web-cli https://react-app.com --clean -o ./my-project')}`);
  console.log('');
  console.log(chalk.gray('Run ') + chalk.white('mirror-web-cli --help') + chalk.gray(' for all available options and examples'));
  console.log('');
  process.exit(0);
}

program.parse(process.argv);
