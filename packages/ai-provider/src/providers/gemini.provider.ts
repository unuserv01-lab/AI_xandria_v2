import axios from 'axios';
import { IAIProvider, PromptScore, PersonaGenerationResult, BattleArgument, JudgeResult, ImageGenerationResult, TokenUsage } from '../interfaces/ai-provider.interface';

export class GeminiProvider extends IAIProvider {
  private apiKey: string;
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly pricing = { input: 0.00025, output: 0.0005 }; // Gemini Pro pricing

  constructor(apiKey: string) {
    super();
    this.apiKey = apiKey;
  }

  private async callGemini(prompt: string, maxTokens: number = 2048): Promise<{ content: string; usage: TokenUsage }> {
    const res = await axios.post(
      `${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
      }
    );

    const content = res.data.candidates[0].content.parts[0].text;
    const inputTokens = res.data.usageMetadata?.promptTokenCount || 200;
    const outputTokens = res.data.usageMetadata?.candidatesTokenCount || 500;
    const cost = (inputTokens / 1000 * this.pricing.input) + (outputTokens / 1000 * this.pricing.output);

    return { content, usage: { inputTokens, outputTokens, totalCost: cost } };
  }

  async evaluatePrompt(prompt: string): Promise<{ score: PromptScore; usage: TokenUsage }> {
    const { content, usage } = await this.callGemini(`Evaluate prompt for AI persona (JSON only, score 0-25 each): "${prompt}"`, 500);
    const score = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as PromptScore;
    score.tier = score.total >= 86 ? 'exceptional' : score.total >= 71 ? 'high' : score.total >= 41 ? 'medium' : 'low';
    return { score, usage };
  }

  async generatePersona(prompt: string, tier: string): Promise<{ persona: PersonaGenerationResult; usage: TokenUsage }> {
    const { content, usage } = await this.callGemini(`Generate ${tier}-tier AI persona from: "${prompt}". JSON only.`, 3000);
    const persona = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as PersonaGenerationResult;
    return { persona, usage };
  }

  async generateBattleArgument(personaData: any, topic: string, opponentArgument?: string): Promise<{ argument: BattleArgument; usage: TokenUsage }> {
    const { content, usage } = await this.callGemini(`${personaData.name} argues on "${topic}". ${opponentArgument || ''} JSON only.`, 1500);
    const argument = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as BattleArgument;
    return { argument, usage };
  }

  async judgeBattle(topic: string, persona1: any, argument1: string, persona2: any, argument2: string): Promise<{ result: JudgeResult; usage: TokenUsage }> {
    const { content, usage } = await this.callGemini(`Judge "${topic}": ${persona1.name} vs ${persona2.name}. JSON only.`, 2000);
    const result = JSON.parse(content.match(/\{[\s\S]*\}/)![0]) as JudgeResult;
    return { result, usage };
  }

  async generateImage(prompt: string): Promise<ImageGenerationResult> {
    // Gemini doesn't have native image gen, use placeholder or integrate Imagen
    throw new Error('Gemini image generation not implemented. Use Imagen API separately.');
  }

  estimateCost(operation: string, inputSize: number): number {
    return { evaluate: 0.0003, generate: 0.002, battle: 0.001, judge: 0.002, image: 0 }[operation] || 0;
  }
}
