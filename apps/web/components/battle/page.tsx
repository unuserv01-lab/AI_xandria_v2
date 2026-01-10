'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/layout/Header';
import BattleArena from '@/components/battle/BattleArena';

export default function BattlePage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to access the Battle Arena</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <BattleArena />
        </div>
      </div>
    </>
  );
}
