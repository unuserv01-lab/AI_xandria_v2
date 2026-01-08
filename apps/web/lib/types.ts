export type PersonaTier = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type BattleMode = 'CASUAL' | 'RANKED' | 'DEATHMATCH';
export type BattleStatus = 'PENDING' | 'ARGUING' | 'JUDGING' | 'COMPLETED' | 'CANCELLED';

export interface Persona {
  id: string;
  mintAddress: string;
  walletPda: string;
  name: string;
  tier: PersonaTier;
  avatarUrl: string;
  description: string;
  intelligence: number;
  creativity: number;
  persuasion: number;
  empathy: number;
  technical: number;
  ownerId: string;
  creatorId: string;
  battlesWon: number;
  battlesLost: number;
  eloRating: number;
  totalRevenue: string;
  isWounded: boolean;
  woundedUntil: string | null;
  createdAt: string;
  owner?: User;
  creator?: User;
}

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
}

export interface PromptScore {
  specificity: number;
  creativity: number;
  coherence: number;
  complexity: number;
  total: number;
  reasoning: string;
  tier: 'low' | 'medium' | 'high' | 'exceptional';
}

export interface TierProbabilities {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

export interface CostBreakdown {
  evaluation: number;
  generation: number;
  image: number;
  blockchain: number;
  platform: number;
  totalUsd: number;
  totalSol: number;
}

export interface Battle {
  id: string;
  battleMode: BattleMode;
  topic: string;
  status: BattleStatus;
  persona1: Persona;
  persona2: Persona;
  persona1Argument?: string;
  persona2Argument?: string;
  winner?: Persona;
  judgeResult?: JudgeResult;
  entryFee: string;
  winnerReward?: string;
  createdAt: string;
  completedAt?: string;
}

export interface JudgeResult {
  winner: 'persona1' | 'persona2';
  scores: {
    persona1: ScoreBreakdown;
    persona2: ScoreBreakdown;
  };
  reasoning: string;
  highlights: {
    persona1Best: string;
    persona2Best: string;
  };
}

export interface ScoreBreakdown {
  logicalCoherence: number;
  creativity: number;
  persuasiveness: number;
  topicRelevance: number;
  total: number;
}

export interface MarketplaceListing {
  id: string;
  personaId: string;
  persona: Persona;
  price: string;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: string;
  soldAt?: string;
}

export interface WalletInfo {
  personaId: string;
  walletPda: string;
  balance: number;
  earnings: {
    battle: number;
    marketplace: number;
    chat: number;
    tip: number;
    total: number;
  };
  totalWithdrawn: number;
  pendingBalance: number;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  earningType?: 'BATTLE' | 'MARKETPLACE' | 'CHAT' | 'TIP';
  amount: number;
  txSignature?: string;
  createdAt: string;
}
