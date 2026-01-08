import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { IAIProvider, PromptScore, PersonaGenerationResult, BattleArgument, JudgeResult, ImageGenerationResult, TokenUsage } from '../interfaces/ai-provider.interface';

export class BedrockProvider extends IAIProvider {
  private client: BedrockRuntimeClient;
  private readonly modelText = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
  private readonly modelEval = 'anthropic.claude-3-haiku-20240307-v1:0';
  private readonly modelImage = 'amazon.titan-image-generator-v1';
  
  private readonly pricing = {
    text: { input: 0.003, output: 0.015 },
    eval: { input: 0.00025, output: 0.00125 },
    image: 0.008
  };

  constructor(region: string = 'us-east-1') {
    super();
    this.client = new BedrockRuntimeClient({ region });
  }

  private async invokeClaude(modelId: string, prompt: string, maxTokens: number = 2000): Promise<{ content: string; usage: TokenUsage }> {
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await this.client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    const inputTokens = result.usage.input_tokens;
    const outputTokens = result.usage.output_tokens;
    const isEval = modelId.includes('haiku');
    const pricing = isEval ? this.pricing.eval : this.pricing.text;
    const totalCost = (inputTokens / 1000 * pricing.input) + (outputTokens / 1000 * pricing.output);

    return {
      content: result.content[0].text,
      usage: { inputTokens, outputTokens, totalCost }
    };
  }

  async evaluatePrompt(prompt: string): Promise<{ score: PromptScore; usage: TokenUsage }> {
    const evaluationPrompt = `You are an expert prompt evaluator for AI persona generation.

Evaluate this user prompt for creating an AI persona:
"${prompt}"

Score each criterion from 0-25:
1. SPECIFICITY (0-25): How detailed and specific is the description?
   - 0-6: Vague, generic
   - 7-12: Basic details
   - 13-18: Good detail
   - 19-25: Highly specific

2. CREATIVITY (0-25): How unique and original is the concept?
   - 0-6: Common/cliché
   - 7-12: Somewhat unique
   - 13-18: Creative
   - 19-25: Highly original

3. COHERENCE (0-25): How logically consistent is the description?
   - 0-6: Contradictory
   - 7-12: Mostly consistent
   - 13-18: Coherent
   - 19-25: Perfectly logical

4. COMPLEXITY (0-25): How multi-dimensional is the persona?
   - 0-6: One-dimensional
   - 7-12: Few dimensions
   - 13-18: Multi-faceted
   - 19-25: Highly complex

Respond ONLY with valid JSON:
{
  "specificity": <number 0-25>,
  "creativity": <number 0-25>,
  "coherence": <number 0-25>,
  "complexity": <number 0-25>,
  "total": <sum of above>,
  "reasoning": "<2-3 sentence explanation>",
  "tier": "<low|medium|high|exceptional>"
}`;

    const { content, usage } = await this.invokeClaude(this.modelEval, evaluationPrompt, 500);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');
    
    const score = JSON.parse(jsonMatch[0]) as PromptScore;
    
    // Determine tier based on total
    if (score.total >= 86) score.tier = 'exceptional';
    else if (score.total >= 71) score.tier = 'high';
    else if (score.total >= 41) score.tier = 'medium';
    else score.tier = 'low';
    
    return { score, usage };
  }

  async generatePersona(prompt: string, tier: string, additionalContext?: string): Promise<{ persona: PersonaGenerationResult; usage: TokenUsage }> {
    const generationPrompt = `You are a master AI persona creator.

Generate a ${tier.toUpperCase()}-tier AI persona based on this description:
"${prompt}"

${additionalContext || ''}

Create a rich, believable AI persona with:
- Unique name fitting their personality
- Detailed description (2-3 paragraphs)
- 5 core traits (0-100 scale): intelligence, creativity, persuasion, empathy, technical
- Key skills/expertise (5-7 items)
- Personality summary (1 paragraph)

Make the persona feel ALIVE and distinct. For ${tier} tier, ensure appropriate depth and uniqueness.

Respond ONLY with valid JSON:
{
  "name": "<persona name>",
  "description": "<detailed description>",
  "traits": {
    "intelligence": <0-100>,
    "creativity": <0-100>,
    "persuasion": <0-100>,
    "empathy": <0-100>,
    "technical": <0-100>
  },
  "skills": ["skill1", "skill2", ...],
  "personality": "<personality summary>"
}`;

    const { content, usage } = await this.invokeClaude(this.modelText, generationPrompt, 3000);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');
    
    const persona = JSON.parse(jsonMatch[0]) as PersonaGenerationResult;
    return { persona, usage };
  }

  async generateBattleArgument(personaData: any, topic: string, opponentArgument?: string): Promise<{ argument: BattleArgument; usage: TokenUsage }> {
    const contextPrompt = opponentArgument 
      ? `Your opponent argued: "${opponentArgument}"\n\nCounter their points while making your case.`
      : 'You are arguing first. Make a strong opening case.';

    const argumentPrompt = `You are ${personaData.name}, an AI persona with these traits:
- Intelligence: ${personaData.intelligence}/100
- Creativity: ${personaData.creativity}/100
- Persuasion: ${personaData.persuasion}/100
- Description: ${personaData.description}

DEBATE TOPIC: "${topic}"

${contextPrompt}

Generate a compelling argument (300-500 words) that reflects your personality and strengths.

Respond ONLY with valid JSON:
{
  "argument": "<your full argument>",
  "keyPoints": ["point1", "point2", "point3"],
  "estimatedStrength": <0-100>
}`;

    const { content, usage } = await this.invokeClaude(this.modelText, argumentPrompt, 1500);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');
    
    const argument = JSON.parse(jsonMatch[0]) as BattleArgument;
    return { argument, usage };
  }

  async judgeBattle(topic: string, persona1: any, argument1: string, persona2: any, argument2: string): Promise<{ result: JudgeResult; usage: TokenUsage }> {
    const judgePrompt = `You are an expert debate judge. Evaluate these arguments objectively.

TOPIC: "${topic}"

PERSONA 1: ${persona1.name}
Traits: Intelligence ${persona1.intelligence}, Creativity ${persona1.creativity}, Persuasion ${persona1.persuasion}
Argument: ${argument1}

PERSONA 2: ${persona2.name}
Traits: Intelligence ${persona2.intelligence}, Creativity ${persona2.creativity}, Persuasion ${persona2.persuasion}
Argument: ${argument2}

EVALUATION CRITERIA (score 0-100 each):
1. Logical Coherence (30%): Structure, reasoning quality
2. Creativity (25%): Originality, unique insights
3. Persuasiveness (25%): Compelling, convincing
4. Topic Relevance (20%): Stays on topic, addresses core issues

Respond ONLY with valid JSON:
{
  "winner": "persona1" or "persona2",
  "scores": {
    "persona1": {
      "logicalCoherence": <0-100>,
      "creativity": <0-100>,
      "persuasiveness": <0-100>,
      "topicRelevance": <0-100>,
      "total": <sum>
    },
    "persona2": { ... }
  },
  "reasoning": "<2-3 sentences explaining decision>",
  "highlights": {
    "persona1Best": "<best quote from persona1>",
    "persona2Best": "<best quote from persona2>"
  }
}`;

    const { content, usage } = await this.invokeClaude(this.modelText, judgePrompt, 2000);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');
    
    const result = JSON.parse(jsonMatch[0]) as JudgeResult;
    return { result, usage };
  }

  async generateImage(prompt: string, style: string = 'digital-art'): Promise<ImageGenerationResult> {
    const command = new InvokeModelCommand({
      modelId: this.modelImage,
      body: JSON.stringify({
        taskType: 'TEXT_IMAGE',
        textToImageParams: {
          text: `Portrait of ${prompt}, high quality, detailed, professional ${style}`
        },
        imageGenerationConfig: {
          numberOfImages: 1,
          quality: 'premium',
          height: 512,
          width: 512,
          cfgScale: 8.0
        }
      }),
      contentType: 'application/json',
      accept: 'application/json'
    });

    const response = await this.client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    return {
      imageUrl: '', // Store to S3 separately
      imageBase64: result.images[0],
      prompt: prompt,
      cost: this.pricing.image
    };
  }

  estimateCost(operation: 'evaluate' | 'generate' | 'battle' | 'judge' | 'image', inputSize: number): number {
    const estimates = {
      evaluate: 0.0005,  // ~200 tokens
      generate: 0.035,   // ~1000 tokens in+out
      battle: 0.02,      // ~500 tokens
      judge: 0.04,       // ~1000 tokens
      image: 0.008
    };
    return estimates[operation];
  }
}
