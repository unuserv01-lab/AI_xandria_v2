'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/layout/Header';
import PersonaCreationWizard from '@/components/persona/PersonaCreationWizard';

export default function CreatePage() {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-gray-400">
              Please connect your Solana wallet to create AI personas
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <PersonaCreationWizard />
        </div>
      </div>
    </>
  );
}
