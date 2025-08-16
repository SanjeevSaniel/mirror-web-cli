import { OpenAI } from 'openai';
import puppeteer from 'puppeteer';
import { load } from 'cheerio';
import chalk from 'chalk';
import { frameworkDetector } from './frameworkDetector.js';

export class AIWebsiteAnalyzer {
  constructor() {
    // Only check for API key when actually creating the instance
    this.client = null;
    this.isInitialized = false;
  }

  initializeClient() {
    if (!this.isInitialized) {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        throw new Error(
          'AI features require OPENAI_API_KEY environment variable. Set it with: export OPENAI_API_KEY="your-key"',
        );
      }

      if (apiKey.length < 10) {
        throw new Error(
          'Invalid OPENAI_API_KEY format. Please check your API key.',
        );
      }

      this.client = new OpenAI({
        apiKey: apiKey,
      });
      this.isInitialized = true;
    }
  }

  async analyze(url, existingFrameworkAnalysis = null) {
    // Initialize client only when analyze is called
    this.initializeClient();

    console.log(chalk.blue('🤖 AI analyzing website...'));

    const content = await this.fetchWebsiteContent(url);
    
    // Use existing framework analysis if provided, otherwise run our own
    let frameworkResults = existingFrameworkAnalysis;
    if (!frameworkResults) {
      frameworkResults = await frameworkDetector.detect(content.html, url);
    }
    
    // Enhance content with advanced framework detection
    content.frameworkAnalysis = frameworkResults;
    
    const analysis = await this.performChainOfThoughtAnalysis(content, url);

    return analysis;
  }

  async fetchWebsiteContent(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const html = await page.content();
    const $ = load(html);

    await browser.close();

    return {
      url,
      title: $('title').text(),
      html,
      pageInfo: this.extractPageInfo($),
    };
  }

  extractPageInfo($) {
    // Legacy method - kept for compatibility but enhanced with basic detection
    return {
      hasReact: !!$('script[src*="react"]').length || !!$('[data-reactroot], #__next').length,
      hasVue: !!$('script[src*="vue"]').length || !!$('[data-server-rendered="true"], #__nuxt').length,
      hasAngular: !!$('script[src*="angular"]').length || !!$('[ng-app], app-root').length,
      hasNextJS: !!$('#__next').length || !!$('script[src*="_next/static"]').length,
      hasGatsby: !!$('#___gatsby').length,
      cssFiles: $('link[rel="stylesheet"]').length,
      jsFiles: $('script[src]').length,
      images: $('img').length,
      complexity: this.assessComplexity($),
      framework: this.detectFramework($),
    };
  }

  assessComplexity($) {
    let score = 0;
    if ($('script').length > 10) score += 2;
    if ($('[data-react], [data-reactroot]').length) score += 3;
    if ($('.spa, [data-spa]').length) score += 3;
    if ($('canvas, svg').length > 5) score += 2;
    return score > 5 ? 'high' : score > 2 ? 'medium' : 'low';
  }

  detectFramework($) {
    // Enhanced detection with more patterns
    if ($('#__next').length || $('script[src*="_next/static"]').length) return 'nextjs';
    if ($('#___gatsby').length) return 'gatsby';
    if ($('script[src*="react"]').length || $('[data-reactroot], [data-react]').length) return 'react';
    if ($('#__nuxt').length || $('script[src*="nuxt"]').length) return 'vue';
    if ($('script[src*="vue"]').length || $('[data-server-rendered="true"]').length) return 'vue';
    if ($('script[src*="angular"]').length || $('[ng-app], app-root').length) return 'angular';
    if ($('script[src*="svelte"]').length) return 'svelte';
    return 'vanilla';
  }

  async performChainOfThoughtAnalysis(content, url) {
    const SYSTEM_PROMPT = `
      You are an AI assistant that analyzes websites for optimal cloning strategy.
      Follow START, THINK, EVALUATE, OUTPUT format for decision making.
      
      Your goal: Determine the best approach to clone a website based on its structure and advanced framework detection.
      
      Consider:
      - Advanced framework detection results (React, Next.js, Vue, Nuxt, Angular, Svelte, etc.)
      - Asset priorities (critical vs optional)
      - Content complexity and structure
      - Optimal tech stack for output
      - Performance characteristics
      - Component architecture patterns
      
      You will receive enhanced framework detection data including:
      - Detected frameworks with confidence scores
      - Matched patterns and detection methods
      - Complexity assessment
      - Recommended output format
      
      Output JSON Format:
      { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }
      
      For OUTPUT step, provide analysis in this format:
      {
        "step": "OUTPUT",
        "content": {
          "detectedFramework": "nextjs|gatsby|react|vue|nuxt|angular|svelte|vanilla",
          "recommendedOutput": "html|react",
          "strategy": "spa|static|hybrid|ssr",
          "assetPriorities": ["css", "js", "images", "fonts"],
          "estimatedComplexity": "low|medium|high",
          "reasoning": "detailed explanation including framework detection confidence"
        }
      }
    `;

    const analysisData = {
      basicInfo: content.pageInfo,
      frameworkDetection: content.frameworkAnalysis ? {
        detected: content.frameworkAnalysis.detected,
        primaryFramework: content.frameworkAnalysis.primaryFramework,
        recommendedOutput: content.frameworkAnalysis.recommendedOutput,
        complexity: content.frameworkAnalysis.complexity,
        metadata: content.frameworkAnalysis.metadata
      } : null,
      url: url
    };

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Analyze this website for cloning optimization with enhanced framework detection: ${JSON.stringify(analysisData, null, 2)}`,
      },
    ];

    while (true) {
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.1,
      });

      const rawContent = response.choices[0].message.content;
      const parsedContent = JSON.parse(rawContent);

      messages.push({
        role: 'assistant',
        content: JSON.stringify(parsedContent),
      });

      if (parsedContent.step === 'START') {
        console.log(chalk.cyan(`🔥 ${parsedContent.content}`));
        continue;
      }

      if (parsedContent.step === 'THINK') {
        console.log(chalk.gray(`   🧠 ${parsedContent.content}`));

        messages.push({
          role: 'system',
          content: JSON.stringify({
            step: 'EVALUATE',
            content: 'Analysis proceeding correctly, continue thinking',
          }),
        });
        continue;
      }

      if (parsedContent.step === 'OUTPUT') {
        console.log(chalk.green(`✅ AI Analysis Complete`));
        console.log(
          chalk.white(
            `   Framework: ${parsedContent.content.detectedFramework}`,
          ),
        );
        console.log(
          chalk.white(
            `   Recommended: ${parsedContent.content.recommendedOutput}`,
          ),
        );
        console.log(
          chalk.white(`   Strategy: ${parsedContent.content.strategy}`),
        );
        return parsedContent.content;
      }
    }
  }
}

// Helper function to check if AI is available without throwing
export function isAIAvailable() {
  const apiKey = process.env.OPENAI_API_KEY;
  return apiKey && apiKey.length > 10;
}
