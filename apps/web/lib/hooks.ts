import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { apiClient } from './api';
import { useAppStore } from './store';
import type { Persona, Battle, WalletInfo } from './types';
import * as bs58 from 'bs58';

// Hook for fetching persona
export function usePersona(id: string | undefined) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    apiClient
      .getPersona(id)
      .then(setPersona)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { persona, loading, error };
}

// Hook for wallet authentication
export function useWalletAuth() {
  const wallet = useWallet();
  const { setUser } = useAppStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    if (!wallet.publicKey || !wallet.signMessage) {
      throw new Error('Wallet not connected');
    }

    setIsAuthenticating(true);
    try {
      const message = `Sign in to AI_xandria\nTimestamp: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await wallet.signMessage(encodedMessage);

      const { user, token } = await apiClient.authenticateWallet(
        wallet.publicKey.toString(),
        bs58.encode(signature),
        message
      );

      localStorage.setItem('auth_token', token);
      setUser(user);
      
      return user;
    } finally {
      setIsAuthenticating(false);
    }
  };

  return { authenticate, isAuthenticating };
}

// Hook for persona wallet
export function usePersonaWallet(personaId: string | undefined) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personaId) return;

    setLoading(true);
    apiClient
      .getPersonaWallet(personaId)
      .then(setWallet)
      .finally(() => setLoading(false));
  }, [personaId]);

  const refresh = () => {
    if (personaId) {
      apiClient.getPersonaWallet(personaId).then(setWallet);
    }
  };

  return { wallet, loading, refresh };
}

// Hook for battle history
export function useBattleHistory(personaId: string | undefined, limit: number = 10) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!personaId) return;

    setLoading(true);
    apiClient
      .getPersonaBattleHistory(personaId, limit)
      .then(setBattles)
      .finally(() => setLoading(false));
  }, [personaId, limit]);

  return { battles, loading };
}
