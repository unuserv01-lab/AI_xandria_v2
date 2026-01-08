import { Injectable } from '@nestjs/common';

type Tier = 'common' | 'rare' | 'epic' | 'legendary';
type ScoreTier = 'low' | 'medium' | 'high' | 'exceptional';

@Injectable()
export class GachaService {
  private readonly TIER_PROBABILITIES = {
    exceptional: { common: 5, rare: 30, epic: 45, legendary: 20 },
    high: { common: 25, rare: 40, epic: 28, legendary: 7 },
    medium: { common: 50, rare: 35, epic: 12, legendary: 3 },
    low: { common: 80, rare: 15, epic: 4, legendary: 1 },
  };

  getTierProbabilities(scoreTier: ScoreTier): Record<Tier, number> {
    return this.TIER_PROBABILITIES[scoreTier];
  }

  rollTier(probabilities: Record<Tier, number>): Tier {
    const roll = Math.random() * 100;
    let cumulative = 0;

    for (const [tier, prob] of Object.entries(probabilities)) {
      cumulative += prob;
      if (roll < cumulative) return tier as Tier;
    }

    return 'common'; // Fallback
  }

  calculateProbabilitiesFromScore(score: number): { scoreTier: ScoreTier; probabilities: Record<Tier, number> } {
    let scoreTier: ScoreTier;
    if (score >= 86) scoreTier = 'exceptional';
    else if (score >= 71) scoreTier = 'high';
    else if (score >= 41) scoreTier = 'medium';
    else scoreTier = 'low';

    return {
      scoreTier,
      probabilities: this.getTierProbabilities(scoreTier),
    };
  }
}
