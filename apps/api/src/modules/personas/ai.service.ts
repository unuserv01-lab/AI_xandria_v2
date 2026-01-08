import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProviderFactory, IAIProvider, ProviderType } from '@ai-xandria/ai-provider';

@Injectable()
export class AIService {
  private provider: IAIProvider;

  constructor(private config: ConfigService) {
    const providerType = this.config.get<ProviderType>('AI_PROVIDER') || 'mock';
    
    this.provider = AIProviderFactory.create({
      type: providerType,
      apiKey: this.getApiKey(providerType),
      region: this.config.get('AWS_REGION'),
    });
  }

  private getApiKey(type: ProviderType): string | undefined {
    const keyMap: Record<ProviderType, string> = {
      bedrock: '',
      openai: this.config.get('OPENAI_API_KEY')!,
      gemini: this.config.get('GEMINI_API_KEY')!,
      grok: this.config.get('GROK_API_KEY')!,
      deepseek: this.config.get('DEEPSEEK_API_KEY')!,
      openrouter: this.config.get('OPENROUTER_API_KEY')!,
      mock: '',
    };
    return keyMap[type];
  }

  async evaluatePrompt(prompt: string) {
    return this.provider.evaluatePrompt(prompt);
  }

  async generatePersona(prompt: string, tier: string) {
    return this.provider.generatePersona(prompt, tier);
  }

  async generateBattleArgument(personaData: any, topic: string, opponentArgument?: string) {
    return this.provider.generateBattleArgument(personaData, topic, opponentArgument);
  }

  async judgeBattle(topic: string, persona1: any, arg1: string, persona2: any, arg2: string) {
    return this.provider.judgeBattle(topic, persona1, arg1, persona2, arg2);
  }

  async generateImage(prompt: string) {
    return this.provider.generateImage(prompt);
  }

  estimateCost(operation: 'evaluate' | 'generate' | 'battle' | 'judge' | 'image', inputSize: number) {
    return this.provider.estimateCost(operation, inputSize);
  }
}
