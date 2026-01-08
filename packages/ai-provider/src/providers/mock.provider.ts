import { IAIProvider, PromptScore, PersonaGenerationResult, BattleArgument, JudgeResult, ImageGenerationResult, TokenUsage } from '../interfaces/ai-provider.interface';

export class MockProvider extends IAIProvider {
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async evaluatePrompt(prompt: string): Promise<{ score: PromptScore; usage: TokenUsage }> {
    await this.delay(500);
    const baseScore = Math.min(100, prompt.length / 5 + Math.random() * 20);
    const score: PromptScore = {
      specificity: Math.floor(baseScore * 0.25),
      creativity: Math.floor(baseScore * 0.25),
      coherence: Math.floor(baseScore * 0.25),
      complexity: Math.floor(baseScore * 0.25),
      total: Math.floor(baseScore),
      reasoning: 'Mock evaluation - prompt has decent structure and clarity.',
      tier: baseScore >= 86 ? 'exceptional' : baseScore >= 71 ? 'high' : baseScore >= 41 ? 'medium' : 'low'
    };
    return {
      score,
      usage: { inputTokens: 50, outputTokens: 100, totalCost: 0.0001 }
    };
  }

  async generatePersona(prompt: string, tier: string): Promise<{ persona: PersonaGenerationResult; usage: TokenUsage }> {
    await this.delay(1000);
    const persona: PersonaGenerationResult = {
      name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Persona ${Math.floor(Math.random() * 1000)}`,
      description: `A ${tier}-tier AI persona with unique characteristics derived from: ${prompt.slice(0, 100)}... This persona embodies intelligence and creativity.`,
      traits: {
        intelligence: 50 + Math.floor(Math.random() * 50),
        creativity: 50 + Math.floor(Math.random() * 50),
        persuasion: 50 + Math.floor(Math.random() * 50),
        empathy: 50 + Math.floor(Math.random() * 50),
        technical: 50 + Math.floor(Math.random() * 50)
      },
      skills: ['Analysis', 'Problem Solving', 'Communication', 'Strategic Thinking', 'Innovation'],
      personality: `Thoughtful and analytical, with a ${tier} level of sophistication in interactions.`
    };
    return {
      persona,
      usage: { inputTokens: 200, outputTokens: 800, totalCost: 0.003 }
    };
  }

  async generateBattleArgument(personaData: any, topic: string, opponentArgument?: string): Promise<{ argument: BattleArgument; usage: TokenUsage }> {
    await this.delay(800);
    const argument: BattleArgument = {
      argument: `As ${personaData.name}, I argue that ${topic} is a complex issue requiring nuanced understanding. ${opponentArgument ? 'While my opponent makes valid points, ' : ''}I believe the core factors are multifaceted and demand careful consideration of all perspectives.`,
      keyPoints: [
        'Core principle analysis',
        'Historical context matters',
        'Practical implications considered'
      ],
      estimatedStrength: 70 + Math.floor(Math.random() * 20)
    };
    return {
      argument,
      usage: { inputTokens: 300, outputTokens: 500, totalCost: 0.002 }
    };
  }

  async judgeBattle(topic: string, persona1: any, argument1: string, persona2: any, argument2: string): Promise<{ result: JudgeResult; usage: TokenUsage }> {
    await this.delay(1200);
    const p1Score = 60 + Math.floor(Math.random() * 40);
    const p2Score = 60 + Math.floor(Math.random() * 40);
    const result: JudgeResult = {
      winner: p1Score > p2Score ? 'persona1' : 'persona2',
      scores: {
        persona1: {
          logicalCoherence: Math.floor(p1Score * 0.3),
          creativity: Math.floor(p1Score * 0.25),
          persuasiveness: Math.floor(p1Score * 0.25),
          topicRelevance: Math.floor(p1Score * 0.2),
          total: p1Score
        },
        persona2: {
          logicalCoherence: Math.floor(p2Score * 0.3),
          creativity: Math.floor(p2Score * 0.25),
          persuasiveness: Math.floor(p2Score * 0.25),
          topicRelevance: Math.floor(p2Score * 0.2),
          total: p2Score
        }
      },
      reasoning: `After careful evaluation, ${p1Score > p2Score ? persona1.name : persona2.name} presented a more compelling argument with stronger logical structure and persuasive elements.`,
      highlights: {
        persona1Best: argument1.slice(0, 100),
        persona2Best: argument2.slice(0, 100)
      }
    };
    return {
      result,
      usage: { inputTokens: 1000, outputTokens: 800, totalCost: 0.005 }
    };
  }

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    await this.delay(2000);
    return {
      imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(prompt)}`,
      prompt,
      cost: 0.001
    };
  }

  estimateCost(operation: string): number {
    return { evaluate: 0.0001, generate: 0.003, battle: 0.002, judge: 0.005, image: 0.001 }[operation] || 0;
  }
}
