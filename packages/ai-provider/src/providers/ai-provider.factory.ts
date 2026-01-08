import { IAIProvider } from '../interfaces/ai-provider.interface';
import { BedrockProvider } from './bedrock.provider';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { MockProvider } from './mock.provider';

export type ProviderType = 'bedrock' | 'openai' | 'gemini' | 'grok' | 'deepseek' | 'openrouter' | 'mock';

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  region?: string;
  baseURL?: string;
}

export class AIProviderFactory {
  static create(config: ProviderConfig): IAIProvider {
    switch (config.type) {
      case 'bedrock':
        return new BedrockProvider(config.region || 'us-east-1');
      
      case 'openai':
        if (!config.apiKey) throw new Error('OpenAI API key required');
        return new OpenAIProvider(config.apiKey);
      
      case 'gemini':
        if (!config.apiKey) throw new Error('Gemini API key required');
        return new GeminiProvider(config.apiKey);
      
      case 'grok':
        // Grok uses OpenAI-compatible API
        if (!config.apiKey) throw new Error('Grok API key required');
        return new OpenAIProvider(config.apiKey); // Can extend for Grok-specific if needed
      
      case 'deepseek':
        // DeepSeek also OpenAI-compatible
        if (!config.apiKey) throw new Error('DeepSeek API key required');
        return new OpenAIProvider(config.apiKey);
      
      case 'openrouter':
        // OpenRouter proxy
        if (!config.apiKey) throw new Error('OpenRouter API key required');
        return new OpenAIProvider(config.apiKey);
      
      case 'mock':
        return new MockProvider();
      
      default:
        throw new Error(`Unsupported provider: ${config.type}`);
    }
  }
}
