export interface PromptScore {
  specificity: number;    // 0-25
  creativity: number;     // 0-25
  coherence: number;      // 0-25
  complexity: number;     // 0-25
  total: number;          // 0-100
  reasoning: string;
  tier: 'low' | 'medium' | 'high' | 'exceptional';
}

export interface TierProbabilities {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface PersonaGenerationResult {
  name: string;
  description: string;
  traits: {
    intelligence: number;
    creativity: number;
    persuasion: number;
    empathy: number;
    technical: number;
  };
  skills: string[];
  personality: string;
}

export interface BattleArgument {
  argument: string;
  keyPoints: string[];
  estimatedStrength: number; // 0-100
}

export interface JudgeResult {
  winner: 'persona1' | 'persona2';
  scores: {
    persona1: {
      logicalCoherence: number;
      creativity: number;
      persuasiveness: number;
      topicRelevance: number;
      total: number;
    };
    persona2: {
      logicalCoherence: number;
      creativity: number;
      persuasiveness: number;
      topicRelevance: number;
      total: number;
    };
  };
  reasoning: string;
  highlights: {
    persona1Best: string;
    persona2Best: string;
  };
}

export interface ImageGenerationResult {
  imageUrl: string;
  imageBase64?: string;
  prompt: string;
  cost: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalCost: number; // USD
}

export abstract class IAIProvider {
  abstract evaluatePrompt(prompt: string): Promise<{ score: PromptScore; usage: TokenUsage }>;
  
  abstract generatePersona(
    prompt: string,
    tier: string,
    additionalContext?: string
  ): Promise<{ persona: PersonaGenerationResult; usage: TokenUsage }>;
  
  abstract generateBattleArgument(
    personaData: any,
    topic: string,
    opponentArgument?: string
  ): Promise<{ argument: BattleArgument; usage: TokenUsage }>;
  
  abstract judgeBattle(
    topic: string,
    persona1: any,
    argument1: string,
    persona2: any,
    argument2: string
  ): Promise<{ result: JudgeResult; usage: TokenUsage }>;
  
  abstract generateImage(
    prompt: string,
    style?: string
  ): Promise<ImageGenerationResult>;
  
  abstract estimateCost(operation: 'evaluate' | 'generate' | 'battle' | 'judge' | 'image', inputSize: number): number;
}
