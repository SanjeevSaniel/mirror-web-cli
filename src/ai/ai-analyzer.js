import OpenAI from 'openai';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * AI-Powered Website Analysis using OpenAI GPT-4o
 */
export class AIAnalyzer {
  constructor() {
    this.openai = null;
    this.isEnabled = false;
    this.initializeOpenAI();
  }

  initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.log(
        chalk.yellow(
          '⚠️ OpenAI API key not found. AI analysis will be disabled.',
        ),
      );
      console.log(
        chalk.gray(
          '   Set OPENAI_API_KEY environment variable to enable AI features.',
        ),
      );
      return;
    }

    try {
      this.openai = new OpenAI({ apiKey });
      this.isEnabled = true;
      console.log(chalk.green('✅ AI analysis enabled with OpenAI GPT-4o'));
    } catch (error) {
      console.log(chalk.red('❌ Failed to initialize OpenAI:'), error.message);
    }
  }

  async analyzeWebsite(url, html, frameworkAnalysis, assets) {
    if (!this.isEnabled) {
      return this.getFallbackAnalysis(frameworkAnalysis);
    }

    try {
      console.log(
        chalk.blue('🤖 AI analyzing website for perfect replica generation...'),
      );
      const analysis = await this.performChainOfThoughtAnalysis(
        url,
        html,
        frameworkAnalysis,
        assets,
      );
      return analysis;
    } catch (error) {
      console.log(chalk.yellow(`⚠️ AI analysis failed: ${error.message}`));
      return this.getFallbackAnalysis(frameworkAnalysis);
    }
  }

  async performChainOfThoughtAnalysis(url, html, frameworkAnalysis, assets) {
    const prompt = this.buildAnalysisPrompt(
      url,
      html,
      frameworkAnalysis,
      assets,
    );

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert web developer specializing in website mirroring and exact replica generation. Analyze websites and provide actionable insights for creating perfect offline replicas.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    return this.parseAIResponse(
      response.choices[0].message.content,
      frameworkAnalysis,
    );
  }

  buildAnalysisPrompt(url, html, frameworkAnalysis, assets) {
    const htmlSnippet = html.substring(0, 5000);
    const framework = frameworkAnalysis.primaryFramework?.name || 'Unknown';
    const assetCount = Object.values(assets).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );

    return `
WEBSITE MIRRORING ANALYSIS

URL: ${url}
Detected Framework: ${framework}
Assets Extracted: ${assetCount}

HTML STRUCTURE (First 5KB):
${htmlSnippet}

CHAIN-OF-THOUGHT ANALYSIS REQUEST:

1. FRAMEWORK ANALYSIS:
   - Confirm framework detection accuracy
   - Identify framework-specific patterns that need special handling
   - Assess complexity level (Simple, Medium, Complex)

2. ASSET OPTIMIZATION:
   - Analyze critical assets for offline functionality
   - Identify assets that can be optimized or combined
   - Recommend asset loading strategies

3. REPLICATION STRATEGY:
   - Provide specific steps for creating an exact replica
   - Identify potential issues with offline functionality
   - Recommend solutions for dynamic content handling

4. QUALITY IMPROVEMENTS:
   - Suggest enhancements for better user experience
   - Identify missing accessibility features
   - Recommend performance optimizations

Please provide your analysis in the following JSON format:
{
  "framework": {
    "detected": "framework_name",
    "confidence": 0.95,
    "complexity": "Medium"
  },
  "assets": {
    "critical": ["list", "of", "critical", "assets"],
    "optimizable": ["assets", "that", "can", "be", "optimized"],
    "strategy": "asset loading strategy"
  },
  "replication": {
    "approach": "recommended approach",
    "challenges": ["potential", "challenges"],
    "solutions": ["recommended", "solutions"]
  },
  "improvements": {
    "performance": ["performance", "suggestions"],
    "accessibility": ["accessibility", "improvements"],
    "offline": ["offline", "enhancements"]
  },
  "reasoning": "Detailed explanation of analysis and recommendations"
}`;
  }

  parseAIResponse(response, fallbackAnalysis) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const aiAnalysis = JSON.parse(jsonMatch[0]);

      return {
        ...fallbackAnalysis,
        aiInsights: {
          framework: aiAnalysis.framework || {},
          assets: aiAnalysis.assets || {},
          replication: aiAnalysis.replication || {},
          improvements: aiAnalysis.improvements || {},
          reasoning: aiAnalysis.reasoning || 'AI analysis completed',
        },
        enhanced: true,
      };
    } catch (error) {
      console.log(
        chalk.yellow(`⚠️ Failed to parse AI response: ${error.message}`),
      );
      return {
        ...fallbackAnalysis,
        aiInsights: {
          reasoning: 'AI analysis was performed but response parsing failed',
        },
        enhanced: false,
      };
    }
  }

  getFallbackAnalysis(frameworkAnalysis) {
    return {
      ...frameworkAnalysis,
      aiInsights: {
        reasoning: 'AI analysis not available - using framework detection only',
      },
      enhanced: false,
    };
  }

  async generateOptimizationRecommendations(analysis, assets) {
    if (!this.isEnabled) {
      return this.getBasicOptimizations(assets);
    }

    try {
      const prompt = `
Based on the website analysis, provide specific optimization recommendations:

Framework: ${analysis.primaryFramework?.name || 'Unknown'}
Total Assets: ${Object.values(assets).reduce((sum, arr) => sum + arr.length, 0)}
Images: ${assets.images?.length || 0}
Scripts: ${assets.scripts?.length || 0}
Styles: ${assets.styles?.length || 0}

Provide actionable optimization steps in JSON format:
{
  "critical_optimizations": ["high priority optimizations"],
  "performance_improvements": ["speed and loading optimizations"],
  "offline_enhancements": ["offline functionality improvements"],
  "asset_optimizations": ["asset-specific optimizations"]
}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a web performance expert. Provide specific, actionable optimization recommendations.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 1000,
      });

      const jsonMatch =
        response.choices[0].message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠️ AI optimization failed: ${error.message}`));
    }

    return this.getBasicOptimizations(assets);
  }

  getBasicOptimizations(assets) {
    return {
      critical_optimizations: [
        'Ensure all assets are downloaded for offline use',
        'Optimize image loading and compression',
        'Minify CSS and JavaScript files',
      ],
      performance_improvements: [
        'Implement lazy loading for images',
        'Combine CSS files to reduce requests',
        'Optimize font loading',
      ],
      offline_enhancements: [
        'Add service worker for offline functionality',
        'Cache critical resources',
        'Provide fallbacks for external dependencies',
      ],
      asset_optimizations: [
        `Optimize ${assets.images?.length || 0} images for web`,
        `Bundle ${assets.scripts?.length || 0} JavaScript files`,
        `Combine ${assets.styles?.length || 0} CSS files`,
      ],
    };
  }

  displayAnalysis(analysis) {
    if (!analysis.enhanced) return;

    console.log('');
    console.log(chalk.blue.bold('🤖 AI Analysis Results:'));
    console.log('');

    const insights = analysis.aiInsights;

    if (insights.framework) {
      console.log(chalk.cyan('Framework Insights:'));
      console.log(
        chalk.gray(`  Detected: ${insights.framework.detected || 'Unknown'}`),
      );
      console.log(
        chalk.gray(
          `  Confidence: ${Math.round(
            (insights.framework.confidence || 0) * 100,
          )}%`,
        ),
      );
      console.log(
        chalk.gray(
          `  Complexity: ${insights.framework.complexity || 'Unknown'}`,
        ),
      );
      console.log('');
    }

    if (insights.replication) {
      console.log(chalk.cyan('Replication Strategy:'));
      console.log(
        chalk.gray(
          `  Approach: ${
            insights.replication.approach || 'Standard mirroring'
          }`,
        ),
      );
      if (insights.replication.challenges?.length) {
        console.log(chalk.yellow('  Challenges:'));
        insights.replication.challenges.forEach((ch) =>
          console.log(chalk.gray(`    • ${ch}`)),
        );
      }
      if (insights.replication.solutions?.length) {
        console.log(chalk.green('  Solutions:'));
        insights.replication.solutions.forEach((sol) =>
          console.log(chalk.gray(`    • ${sol}`)),
        );
      }
      console.log('');
    }

    if (insights.reasoning) {
      console.log(chalk.cyan('AI Reasoning:'));
      console.log(chalk.gray(`  ${insights.reasoning}`));
      console.log('');
    }
  }
}
