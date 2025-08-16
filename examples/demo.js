#!/usr/bin/env node

import chalk from 'chalk';
import { execSync } from 'child_process';

async function runDemo() {
  console.log(chalk.cyan('🪞 Mirror Web CLI - Demo\n'));

  console.log(chalk.blue('📋 HTML/CSS/JS Clone:'));
  console.log(chalk.gray('mirror-web-cli https://piyushgarg.dev'));
  console.log(chalk.green('→ Clean HTML project\n'));

  console.log(chalk.blue('📋 React Project:'));
  console.log(chalk.gray('mirror-web-cli https://hitesh.ai -t react'));
  console.log(chalk.green('→ Full React app\n'));

  console.log(chalk.blue('📋 AI Enhanced:'));
  console.log(chalk.gray('mirror-web-cli https://google.com --ai'));
  console.log(chalk.green('→ Optimized with Chain of Thought\n'));

  console.log(chalk.yellow('HTML Output:'));
  console.log('├── index.html');
  console.log('├── styles.css');
  console.log('└── script.js');

  console.log(chalk.yellow('\nReact Output:'));
  console.log('├── package.json');
  console.log('├── public/index.html');
  console.log('└── src/App.js');

  console.log(chalk.green('\n🎉 Production ready!'));
}

runDemo();
