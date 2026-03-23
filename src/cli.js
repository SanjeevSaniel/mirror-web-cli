#!/usr/bin/env node

/**
 * Mirror Web CLI - Command Line Interface
 * v1.1.3
 *
 * Simple usage: mirror-web-cli <url>
 * JS mode is chosen automatically (JS ON vs OFF) by the engine.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { MirrorCloner } from './core/mirror-cloner.js';

/**
 * Load environment variables with priority:
 * 1) CLI flag (--openai-key) sets process.env later, highest precedence
 * 2) Existing shell environment (preexisting process.env) is preserved
 * 3) .env.local overrides values loaded from .env (but does NOT override shell)
 * 4) .env (base)
 */
function loadEnvWithPriority() {
  const cwd = process.cwd();
  const preexisting = new Set(Object.keys(process.env));

  // Load base .env (lowest priority)
  dotenv.config({ path: path.resolve(cwd, '.env'), override: false });

  // Load .env.local, overriding only values that didn't come from the shell
  const localPath = path.resolve(cwd, '.env.local');
  if (fs.existsSync(localPath)) {
    try {
      const parsed = dotenv.parse(fs.readFileSync(localPath));
      for (const [k, v] of Object.entries(parsed)) {
        if (preexisting.has(k)) continue; // don't override shell-provided vars
        process.env[k] = v; // override values from .env if present
      }
    } catch {
      // ignore parse errors
    }
  }
}

// Load env files before reading options
loadEnvWithPriority();

/**
 * Validate and configure AI API key for AI features.
 * Priority: 
 * 1. CLI flag (--openai-key)
 * 2. GEMINI_API_KEY (if model is gemini-*)
 * 3. OPENAI_API_KEY
 */
function validateAISetup(aiEnabled, openaiApiKey, aiModel) {
  if (!aiEnabled) return false;

  const isGemini = aiModel.toLowerCase().includes('gemini');
  
  // CLI flag has highest priority (for OpenAI)
  let finalApiKey = openaiApiKey;
  
  if (!finalApiKey) {
    if (isGemini) {
      finalApiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    } else {
      finalApiKey = process.env.OPENAI_API_KEY;
    }
  }

  if (!finalApiKey) {
    const keyName = isGemini ? 'GEMINI_API_KEY or OPENAI_API_KEY' : 'OPENAI_API_KEY';
    console.log('');
    console.log(
      chalk.yellow(
        `⚠️  AI features requested but no ${keyName} found (checked env, .env.local, and .env).`,
      ),
    );
    console.log(
      chalk.white(
        'Add the API key to your .env.local or .env file, export it in your shell, or pass --openai-key "sk-..."',
      ),
    );
    console.log(chalk.dim('Continuing without AI features...'));
    console.log('');
    return false;
  }

  // Basic format check (OpenAI starts with sk-, Gemini often doesn't but we'll be flexible)
  if (!isGemini && !finalApiKey.startsWith('sk-')) {
    console.log('');
    console.log(
      chalk.yellow('⚠️  Invalid OpenAI API key format (must start with "sk-")'),
    );
    console.log(chalk.dim('Continuing without AI features...'));
    console.log('');
    return false;
  }

  // Ensure key is in process.env for downstream code if provided via flag or specific var
  if (openaiApiKey) {
    process.env.OPENAI_API_KEY = openaiApiKey;
  } else if (isGemini && process.env.GEMINI_API_KEY) {
    // Already in env
  }

  return true;
}

const program = new Command();

program
  .name('mirror-web-cli')
  .description(
    'Mirror Web CLI v1.1 - Professional website mirroring with automatic JS mode selection',
  )
  .version('1.1.3')
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
    'Enable AI-powered website analysis (reads OPENAI_API_KEY or GEMINI_API_KEY from env)',
    false,
  )
  .option(
    '--ai-model <model>',
    'AI model to use for analysis',
    'gemini-3-flash-preview',
  )
  .option(
    '--openai-key <key>',
    'OpenAI API key for AI features (overrides env for this run)',
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

      const aiEnabled = validateAISetup(options.ai, options.openaiKey, options.aiModel);

      const config = {
        outputDir: options.output,
        clean: options.clean,
        ai: aiEnabled,
        aiModel: options.aiModel,
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

AI setup:
  • The CLI looks for OPENAI_API_KEY in this order:
    1) --openai-key flag
    2) Existing shell environment
    3) .env.local (overrides .env)
    4) .env

Examples:
  mirror-web-cli https://hitesh.ai --ai
  mirror-web-cli https://piyushgarg.dev --ai --openai-key "sk-..."
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
