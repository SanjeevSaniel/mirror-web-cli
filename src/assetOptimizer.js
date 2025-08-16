import { OpenAI } from 'openai';
import chalk from 'chalk';

export class AssetOptimizer {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async optimizeAssets(assets, aiAnalysis) {
    console.log(chalk.blue('🧠 AI optimizing asset download strategy...'));

    const optimization = await this.chainOfThoughtOptimization(
      assets,
      aiAnalysis,
    );
    return optimization;
  }

  async chainOfThoughtOptimization(assets, analysis) {
    const SYSTEM_PROMPT = `
      You are an AI assistant that optimizes website asset downloading strategy.
      Follow START, THINK, EVALUATE, OUTPUT format for decision making.
      
      Your goal: Create optimal download strategy for web assets based on:
      - Asset importance (critical CSS vs optional images)
      - Download priorities (blocking vs non-blocking)
      - Framework requirements (React needs components first)
      - Performance optimization (parallel vs sequential)
      
      Output JSON Format:
      { "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }
      
      For OUTPUT, provide:
      {
        "step": "OUTPUT",
        "content": {
          "criticalAssets": ["url1", "url2"],
          "parallelBatches": [["batch1"], ["batch2"]],
          "skipAssets": ["analytics", "tracking"],
          "downloadOrder": ["css", "js", "images"],
          "optimizationReasoning": "detailed explanation"
        }
      }
    `;

    const assetSummary = {
      total: assets.length,
      byType: this.groupAssetsByType(assets),
      framework: analysis.detectedFramework,
      complexity: analysis.estimatedComplexity,
      strategy: analysis.strategy,
    };

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Optimize download strategy: ${JSON.stringify(assetSummary)}`,
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
            content: 'Optimization analysis proceeding correctly',
          }),
        });
        continue;
      }

      if (parsedContent.step === 'OUTPUT') {
        console.log(chalk.green(`✅ Asset optimization complete`));
        console.log(
          chalk.white(
            `   Critical: ${parsedContent.content.criticalAssets.length} assets`,
          ),
        );
        console.log(
          chalk.white(
            `   Batches: ${parsedContent.content.parallelBatches.length} groups`,
          ),
        );
        return parsedContent.content;
      }
    }
  }

  groupAssetsByType(assets) {
    return assets.reduce((groups, asset) => {
      const type = asset.type || 'unknown';
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {});
  }
}
