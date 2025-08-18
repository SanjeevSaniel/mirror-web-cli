#!/usr/bin/env node

/**
 * Mirror Web CLI - Command Line Interface
 * v1.1.0
 *
 * Simple usage: mirror-web-cli <url>
 * JS mode is chosen automatically (JS ON vs OFF) by the engine.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { MirrorCloner } from './core/mirror-cloner.js';

// Load .env so OPENAI_API_KEY is available without exporting it in the shell
dotenv.config();

/**
 * Validate and configure OpenAI API key for AI features.
 * Uses OPENAI_API_KEY from .env or --openai-key if provided.
 */
function validateAISetup(aiEnabled, openaiApiKey) {
  if (!aiEnabled) return false;

  const finalApiKey = openaiApiKey || process.env.OPENAI_API_KEY;

  if (!finalApiKey) {
    console.log('');
    console.log(
      chalk.yellow(
        '⚠️  AI features requested but no OPENAI_API_KEY found (checked .env and env).',
      ),
    );
    console.log(
      chalk.white(
        'Add OPENAI_API_KEY to your .env file or pass --openai-key "sk-..."',
      ),
    );
    console.log(chalk.dim('Continuing without AI features...'));
    console.log('');
    return false;
  }

  if (!finalApiKey.startsWith('sk-')) {
    console.log('');
    console.log(
      chalk.yellow('⚠️  Invalid OpenAI API key format (must start with "sk-")'),
    );
    console.log(chalk.dim('Continuing without AI features...'));
    console.log('');
    return false;
  }

  if (openaiApiKey && !process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = openaiApiKey;
  }

  return true;
}

const program = new Command();

program
  .name('mirror-web-cli')
  .description(
    'Mirror Web CLI v1.1 - Professional website mirroring with automatic JS mode selection',
  )
  .version('1.1.0')
  .argument('<url>', 'Target website URL to mirror (supports http/https)')
  .option(
    '-o, --output <dir>',
    'Custom output directory path (defaults to domain-standard or domain-ai-enhanced)',
  )
  .option(
    '--clean',
    'Remove tracking scripts, analytics, and third-party code',
    false,
  )
  .option(
    '--ai',
    'Enable AI-powered website analysis (reads OPENAI_API_KEY from .env or env)',
    false,
  )
  .option(
    '--openai-key <key>',
    'OpenAI API key for AI features (overrides .env for this run)',
  )
  .option('--debug', 'Enable detailed debug logging and error traces', false)
  .option(
    '--timeout <ms>',
    'Browser page load timeout in milliseconds',
    '120000',
  )
  .option(
    '--headless <bool>',
    'Run browser in headless mode (true/false)',
    'true',
  )
  .action(async (url, options) => {
    try {
      if (!url.startsWith('http')) url = 'https://' + url;
      new URL(url); // validate

      const aiEnabled = validateAISetup(options.ai, options.openaiKey);

      const config = {
        outputDir: options.output,
        clean: options.clean,
        ai: aiEnabled,
        debug: options.debug,
        timeout: parseInt(options.timeout),
        headless: options.headless !== 'false',
      };

      const cloner = new MirrorCloner(url, config);
      const success = await cloner.clone();
      process.exit(success ? 0 : 1);
    } catch (error) {
      console.log('');
      console.log(chalk.red('❌ Error: ' + error.message));
      if (error.message.includes('Invalid URL')) {
        console.log(
          chalk.gray(
            '   Please provide a valid URL (e.g., https://example.com)',
          ),
        );
      }
      process.exit(1);
    }
  });

program.addHelpText(
  'after',
  `

Automatic JS mode:
  • You only provide the URL. The tool preflights the site and decides whether to keep JS ON or use a static snapshot (JS OFF).
  • This avoids blank pages on frameworks like Next.js (e.g., hitesh.ai), while keeping rich sites looking great (e.g., piyushgarg.dev).

Examples:
  mirror-web-cli https://hitesh.ai
  mirror-web-cli https://piyushgarg.dev
`,
);

if (process.argv.length <= 2) {
  console.log('');
  console.log(chalk.white('Mirror any website while preserving its look.'));
  console.log(chalk.cyan('Example:'));
  console.log('  mirror-web-cli https://example.com');
  console.log('');
  process.exit(0);
}

program.parse(process.argv);
