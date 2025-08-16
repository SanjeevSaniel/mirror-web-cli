#!/usr/bin/env node

import { cloneToTechStack } from '../src/cloner.js';
import { AIWebsiteAnalyzer } from '../src/aiAnalyzer.js';
import fs from 'fs-extra';
import chalk from 'chalk';

class TestSuite {
  async runAllTests() {
    console.log(chalk.cyan('🧪 Mirror Web CLI Test Suite\n'));

    await this.testHTMLOutput();
    await this.testReactOutput();
    await this.testAIAnalysis();

    console.log(chalk.green('\n✅ All tests completed!'));
  }

  async testHTMLOutput() {
    console.log(chalk.blue('📋 Testing HTML Output'));

    const testDir = 'test-html-output';

    try {
      await cloneToTechStack('https://httpbin.org/html', {
        outputDir: testDir,
        techStack: 'html',
        clean: true,
      });

      const indexExists = await fs.pathExists(`${testDir}/index.html`);
      const cssExists = await fs.pathExists(`${testDir}/styles.css`);
      const jsExists = await fs.pathExists(`${testDir}/script.js`);

      if (indexExists && cssExists && jsExists) {
        console.log(chalk.green('✅ HTML output test passed'));
      } else {
        console.log(chalk.red('❌ HTML output test failed'));
      }
    } finally {
      if (await fs.pathExists(testDir)) {
        await fs.remove(testDir);
      }
    }
  }

  async testReactOutput() {
    console.log(chalk.blue('📋 Testing React Output'));

    const testDir = 'test-react-output';

    try {
      await cloneToTechStack('https://httpbin.org/html', {
        outputDir: testDir,
        techStack: 'react',
        clean: true,
      });

      const packageExists = await fs.pathExists(`${testDir}/package.json`);
      const appExists = await fs.pathExists(`${testDir}/src/App.js`);
      const indexExists = await fs.pathExists(`${testDir}/src/index.js`);

      if (packageExists && appExists && indexExists) {
        console.log(chalk.green('✅ React output test passed'));
      } else {
        console.log(chalk.red('❌ React output test failed'));
      }
    } finally {
      if (await fs.pathExists(testDir)) {
        await fs.remove(testDir);
      }
    }
  }

  async testAIAnalysis() {
    console.log(chalk.blue('📋 Testing AI Analysis'));

    if (!process.env.OPENAI_API_KEY) {
      console.log(chalk.yellow('⏭️  Skipping AI test (no API key)'));
      return;
    }

    try {
      const analyzer = new AIWebsiteAnalyzer();
      const analysis = await analyzer.analyze('https://httpbin.org/html');

      if (analysis.detectedFramework && analysis.recommendedOutput) {
        console.log(chalk.green('✅ AI analysis test passed'));
      } else {
        console.log(chalk.red('❌ AI analysis test failed'));
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠️  AI test error: ${error.message}`));
    }
  }
}

const testSuite = new TestSuite();
testSuite.runAllTests();
