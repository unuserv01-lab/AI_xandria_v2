import axios from 'axios';
import { IAIProvider, PromptScore, PersonaGenerationResult, BattleArgument, JudgeResult, ImageGenerationResult, TokenUsage } from '../interfaces/ai-provider.interface';

export class OpenAIProvider extends IAIProvider {
  private apiKey: string;
  private readonly baseURL = 'https://api.openai.com/v1';
  private readonly pricing = {
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
    'dall-e-3': 0.04
  };

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  private async callGPT(prompt: string, model: string = 'gpt-4-turbo', maxTokens: number = 2000): Promise<{ content: string; usage: TokenUsage }> {
    const res = await axios.post(`${this.baseURL}/chat/completions`, {
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    }, {
      headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }
    });

    const { usage, choices } = res.data;
    const pricing = this.pricing[model as keyof typeof this.pricing] as any;
    const cost = (usage.prompt_tokens / 1000 * pricing.input) + (usage.completion_tokens / 1000 * pricing.output);

    return {
      content: choices[0].message.content,
      usage: { inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens, totalCost: cost }
    };
  }

  async evaluatePrompt(prompt: string): Promise<{ score: PromptScore; usage: TokenUsage }> {
    const { content, usage } = await this.callGPT(
      `Evaluate this AI persona prompt (score 0-25 each for specificity, creativity, coherence, complexity). Return JSON only:\n"${prompt}"`,
      'gpt-3.5-turbo', 500
    );
    const score = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as PromptScore;
    if (score.total >= 86) score.tier = 'exceptional';
    else if (score.total >= 71) score.tier = 'high';
    else if (score.total >= 41) score.tier = 'medium';
    else score.tier = 'low';
    return { score, usage };
  }

  async generatePersona(prompt: string, tier: string): Promise<{ persona: PersonaGenerationResult; usage: TokenUsage }> {
    const { content, usage } = await this.callGPT(
      `Generate a ${tier}-tier AI persona from: "${prompt}". Return JSON with name, description, traits{intelligence,creativity,persuasion,empathy,technical}, skills[], personality.`,
      'gpt-4-turbo', 3000
    );
    const persona = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as PersonaGenerationResult;
    return { persona, usage };
  }

  async generateBattleArgument(personaData: any, topic: string, opponentArgument?: string): Promise<{ argument: BattleArgument; usage: TokenUsage }> {
    const { content, usage } = await this.callGPT(
      `You are ${personaData.name}. Argue on "${topic}". ${opponentArgument ? `Counter: ${opponentArgument}` : ''}. Return JSON: {argument, keyPoints[], estimatedStrength}.`,
      'gpt-4-turbo', 1500
    );
    const argument = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as BattleArgument;
    return { argument, usage };
  }

  async judgeBattle(topic: string, persona1: any, argument1: string, persona2: any, argument2: string): Promise<{ result: JudgeResult; usage: TokenUsage }> {
    const { content, usage } = await this.callGPT(
      `Judge debate on "${topic}". Persona1: ${persona1.name} - ${argument1}. Persona2: ${persona2.name} - ${argument2}. Return JSON with winner, scores, reasoning, highlights.`,
      'gpt-4-turbo', 2000
    );
    const result = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as JudgeResult;
    return { result, usage };
  }

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    const res = await axios.post(`${this.baseURL}/images/generations`, {
      model: 'dall-e-3',
      prompt: `Portrait of ${prompt}, high quality`,
      size: '1024x1024',
      quality: 'standard',
      n: 1
    }, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    return {
      imageUrl: res.data.data[0].url,
      prompt,
      cost: this.pricing['dall-e-3']
    };
  }

  estimateCost(operation: 'evaluate' | 'generate' | 'battle' | 'judge' | 'image', inputSize: number): number {
    return { evaluate: 0.001, generate: 0.04, battle: 0.025, judge: 0.05, image: 0.04 }[operation];
  }
}
