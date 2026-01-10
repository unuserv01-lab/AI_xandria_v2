'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Trophy, TrendingUp, PlusCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import PersonaCard from '@/components/persona/PersonaCard';
import SubscribeModal from '@/components/persona/SubscribeModal';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { Persona } from '@/lib/types';

export default function ProfilePage() {
  const { publicKey, connected } = useWallet();
  const { user } = useAppStore();
  const [ownedPersonas, setOwnedPersonas] = useState<Persona[]>([]);
  const [createdPersonas, setCreatedPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'owned' | 'created'>('owned');
  const [subscribePersona, setSubscribePersona] = useState<Persona | null>(null);
  
  const [stats, setStats] = useState({
    totalPersonas: 0,
    totalValue: 0,
    totalEarnings: 0,
    avgElo: 0,
  });

  useEffect(() => {
    if (connected && user) {
      fetchPersonas();
    }
  }, [connected, user]);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const allPersonas = await apiClient.listPersonas({ limit: 100 });
      
      const owned = allPersonas.filter((p) => p.ownerId === user?.id);
      const created = allPersonas.filter((p) => p.creatorId === user?.id);
      
      setOwnedPersonas(owned);
      setCreatedPersonas(created);

      // Calculate stats
      const totalValue = owned.reduce((sum, p) => sum + Number(p.totalRevenue || 0), 0);
      const totalEarnings = created.reduce((sum, p) => sum + Number(p.totalRevenue || 0) * 0.2, 0);
      const avgElo = owned.length > 0 
        ? owned.reduce((sum, p) => sum + p.eloRating, 0) / owned.length 
        : 0;

      setStats({
        totalPersonas: owned.length,
        totalValue,
        totalEarnings,
        avgElo: Math.round(avgElo),
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to view your profile</p>
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
          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-primary to-cyan-accent rounded-full flex items-center justify-center text-4xl font-bold">
                {publicKey?.toString().slice(0, 2).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {user?.username || 'Anonymous'}
                </h1>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Personas</p>
                    <p className="text-2xl font-bold text-purple-primary">{stats.totalPersonas}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Portfolio Value</p>
                    <p className="text-2xl font-bold text-green-400">{stats.totalValue.toFixed(2)} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Creator Earnings</p>
                    <p className="text-2xl font-bold text-cyan-accent">{stats.totalEarnings.toFixed(2)} SOL</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg ELO</p>
                    <p className="text-2xl font-bold text-yellow-400">⭐ {stats.avgElo}</p>
                  </div>
                </div>
              </div>

              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Create New
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('owned')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                tab === 'owned'
                  ? 'bg-purple-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Owned ({ownedPersonas.length})
            </button>
            <button
              onClick={() => setTab('created')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                tab === 'created'
                  ? 'bg-purple-primary text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Created ({createdPersonas.length})
            </button>
          </div>

          {/* Personas Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full aspect-square bg-gray-800 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-800 rounded mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {(tab === 'owned' ? ownedPersonas : createdPersonas).length > 0 ? (
                (tab === 'owned' ? ownedPersonas : createdPersonas).map((persona, i) => (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PersonaCard
                      persona={persona}
                      showActions
                      onSubscribe={(p) => setSubscribePersona(p)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-xl text-gray-400 mb-4">
                    No {tab} personas yet
                  </p>
                  {tab === 'owned' && (
                    <Link href="/marketplace">
                      <button className="btn-primary">Browse Marketplace</button>
                    </Link>
                  )}
                  {tab === 'created' && (
                    <Link href="/create">
                      <button className="btn-primary">Create Your First Persona</button>
                    </Link>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Subscribe Modal */}
      {subscribePersona && (
        <SubscribeModal
          persona={subscribePersona}
          isOpen={!!subscribePersona}
          onClose={() => setSubscribePersona(null)}
          onSubscribe={async (duration, price) => {
            toast.success(`Subscribed for ${duration} days!`);
          }}
        />
      )}
    </>
  );
}
