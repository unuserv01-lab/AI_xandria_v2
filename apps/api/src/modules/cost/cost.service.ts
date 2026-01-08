import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SolanaService } from '../wallet/solana.service';

interface CostBreakdown {
  promptEvaluation: number;
  textGeneration: number;
  imageGeneration: number;
  blockchain: number;
  platformFee: number;
  subtotal: number;
  totalUsd: number;
  totalSol: number;
  solPriceUsd: number;
}

@Injectable()
export class CostService {
  private readonly pricing = {
    bedrock: {
      evaluation: { input: 0.00025, output: 0.00125 }, // Haiku
      text: { input: 0.003, output: 0.015 }, // Sonnet 3.5
      image: 0.008, // Titan
    },
    openai: {
      evaluation: { input: 0.0005, output: 0.0015 }, // GPT-3.5
      text: { input: 0.01, output: 0.03 }, // GPT-4 Turbo
      image: 0.04, // DALL-E 3
    },
    gemini: {
      evaluation: { input: 0.00025, output: 0.0005 },
      text: { input: 0.00025, output: 0.0005 },
      image: 0, // Not supported
    },
    mock: {
      evaluation: { input: 0.0001, output: 0.0001 },
      text: { input: 0.001, output: 0.001 },
      image: 0.001,
    },
  };

  constructor(
    private config: ConfigService,
    private solana: SolanaService,
  ) {}

  async calculatePersonaCreationCost(promptLength: number): Promise<CostBreakdown> {
    const provider = this.config.get('AI_PROVIDER') || 'mock';
    const costs = this.pricing[provider as keyof typeof this.pricing] || this.pricing.mock;

    // Estimate token counts
    const evalInputTokens = Math.ceil(promptLength / 4) + 100; // Prompt + system
    const evalOutputTokens = 100;
    const genInputTokens = Math.ceil(promptLength / 4) + 200;
    const genOutputTokens = 800;

    const promptEvaluation = 
      (evalInputTokens / 1000 * costs.evaluation.input) +
      (evalOutputTokens / 1000 * costs.evaluation.output);

    const textGeneration = 
      (genInputTokens / 1000 * costs.text.input) +
      (genOutputTokens / 1000 * costs.text.output);

    const imageGeneration = costs.image;
    const blockchain = 0.002; // Solana rent + TX fees
    const subtotal = promptEvaluation + textGeneration + imageGeneration + blockchain;
    const platformFee = subtotal * 0.1;
    const totalUsd = subtotal + platformFee;

    const solPrice = await this.solana.getSolPrice();
    const totalSol = totalUsd / solPrice;

    return {
      promptEvaluation,
      textGeneration,
      imageGeneration,
      blockchain,
      platformFee,
      subtotal,
      totalUsd,
      totalSol,
      solPriceUsd: solPrice,
    };
  }

  async calculateBattleCost(battleMode: 'CASUAL' | 'RANKED' | 'DEATHMATCH'): Promise<{
    entryFee: number;
    aiCost: number;
    totalCost: number;
  }> {
    const provider = this.config.get('AI_PROVIDER') || 'mock';
    const costs = this.pricing[provider as keyof typeof this.pricing] || this.pricing.mock;

    // Estimate: 2 arguments + 1 judgment
    const argInputTokens = 500;
    const argOutputTokens = 400;
    const judgeInputTokens = 1000;
    const judgeOutputTokens = 600;

    const aiCost = 
      2 * ((argInputTokens / 1000 * costs.text.input) + (argOutputTokens / 1000 * costs.text.output)) +
      ((judgeInputTokens / 1000 * costs.text.input) + (judgeOutputTokens / 1000 * costs.text.output));

    const entryFees = {
      CASUAL: 0,
      RANKED: 0.5,
      DEATHMATCH: 2,
    };

    return {
      entryFee: entryFees[battleMode],
      aiCost,
      totalCost: entryFees[battleMode] + aiCost,
    };
  }

  async getAverageCosts() {
    // In production, calculate from actual database records
    return {
      personaCreation: {
        common: 0.03,
        rare: 0.035,
        epic: 0.04,
        legendary: 0.05,
      },
      battle: {
        casual: 0.015,
        ranked: 0.52,
        deathmatch: 2.02,
      },
    };
  }

  getPricingTable() {
    const provider = this.config.get('AI_PROVIDER') || 'mock';
    return {
      provider,
      pricing: this.pricing[provider as keyof typeof this.pricing],
      operations: {
        promptEvaluation: '~200 tokens',
        personaGeneration: '~1000 tokens',
        battleArgument: '~900 tokens',
        battleJudgment: '~1600 tokens',
        imageGeneration: '1 image (512x512)',
      },
    };
  }
}
