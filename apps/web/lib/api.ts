import axios from 'axios';
import type { Persona, PromptScore, TierProbabilities, CostBreakdown, Battle, MarketplaceListing, WalletInfo } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiClient = {
  // Auth
  async authenticateWallet(walletAddress: string, signature: string, message: string) {
    const { data } = await api.post('/api/auth/wallet', { walletAddress, signature, message });
    return data;
  },

  // Personas
  async evaluatePrompt(prompt: string): Promise<{
    score: PromptScore;
    tierProbabilities: TierProbabilities;
    estimatedCost: CostBreakdown;
  }> {
    const { data } = await api.post('/api/personas/evaluate-prompt', { prompt });
    return data;
  },

  async createPersona(prompt: string, userId: string, walletAddress: string): Promise<{
    persona: Persona;
    tier: string;
    cost: number;
  }> {
    const { data } = await api.post('/api/personas/create', { prompt, userId, walletAddress });
    return data;
  },

  async getPersona(id: string): Promise<Persona> {
    const { data } = await api.get(`/api/personas/${id}`);
    return data;
  },

  async listPersonas(filters?: { tier?: string; limit?: number }): Promise<Persona[]> {
    const { data } = await api.get('/api/personas', { params: filters });
    return data;
  },

  // Battles
  async createBattle(
    persona1Id: string,
    persona2Id: string,
    topic: string,
    mode: 'CASUAL' | 'RANKED' | 'DEATHMATCH',
    initiatorId: string
  ): Promise<Battle> {
    const { data } = await api.post('/api/battles/create', {
      persona1Id,
      persona2Id,
      topic,
      mode,
      initiatorId,
    });
    return data;
  },

  async startBattle(battleId: string) {
    const { data } = await api.post(`/api/battles/${battleId}/start`);
    return data;
  },

  async judgeBattle(battleId: string) {
    const { data } = await api.post(`/api/battles/${battleId}/judge`);
    return data;
  },

  async getBattle(battleId: string): Promise<Battle> {
    const { data } = await api.get(`/api/battles/${battleId}`);
    return data;
  },

  async getLeaderboard(limit: number = 50): Promise<Persona[]> {
    const { data } = await api.get('/api/battles/leaderboard', { params: { limit } });
    return data;
  },

  async getPersonaBattleHistory(personaId: string, limit: number = 20): Promise<Battle[]> {
    const { data } = await api.get(`/api/battles/persona/${personaId}/history`, { params: { limit } });
    return data;
  },

  // Wallet
  async getPersonaWallet(personaId: string): Promise<WalletInfo> {
    const { data } = await api.get(`/api/wallet/persona/${personaId}`);
    return data;
  },

  async withdrawEarnings(personaId: string, amount: number, userId: string, destinationWallet: string) {
    const { data } = await api.post(`/api/wallet/persona/${personaId}/withdraw`, {
      amount,
      userId,
      destinationWallet,
    });
    return data;
  },

  // Marketplace
  async listPersonaForSale(personaId: string, price: number, userId: string): Promise<MarketplaceListing> {
    const { data } = await api.post('/api/marketplace/list', { personaId, price, userId });
    return data;
  },

  async buyPersona(listingId: string, buyerId: string, buyerWallet: string) {
    const { data } = await api.post(`/api/marketplace/listing/${listingId}/buy`, { buyerId, buyerWallet });
    return data;
  },

  async getMarketplaceListings(filters?: {
    tier?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    limit?: number;
  }): Promise<MarketplaceListing[]> {
    const { data } = await api.get('/api/marketplace/listings', { params: filters });
    return data;
  },

  async cancelListing(listingId: string, userId: string) {
    const { data } = await api.delete(`/api/marketplace/listing/${listingId}`, { data: { userId } });
    return data;
  },

  async getMarketplaceStats() {
    const { data } = await api.get('/api/marketplace/stats');
    return data;
  },

  // Cost
  async calculateCost(prompt: string): Promise<CostBreakdown> {
    const { data } = await api.post('/api/cost/calculate', { prompt });
    return data;
  },
};

export default apiClient;
