'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import PersonaCard from '@/components/persona/PersonaCard';
import SubscribeModal from '@/components/persona/SubscribeModal';
import { apiClient } from '@/lib/api';
import type { Persona } from '@/lib/types';

export default function DashboardPage() {
  const { connected } = useWallet();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('all');
  const [search, setSearch] = useState('');
  const [subscribePersona, setSubscribePersona] = useState<Persona | null>(null);

  useEffect(() => {
    fetchPersonas();
  }, [filter]);

  const fetchPersonas = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listPersonas({
        tier: filter === 'all' ? undefined : filter,
        limit: 50,
      });
      setPersonas(data);
    } catch (error) {
      toast.error('Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (duration: number, price: number) => {
    // This will be integrated with smart contract
    toast.success(`Subscribed for ${duration} days at ${price} SOL`);
    // TODO: Call smart contract subscription function
  };

  const filteredPersonas = personas.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  if (!connected) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Connect Your Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to view the dashboard</p>
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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">Dashboard</h1>
              <p className="text-gray-400">Explore all AI personas on the platform</p>
            </div>
            
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                Create Persona
              </motion.button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search personas..."
                className="input pl-12"
              />
            </div>

            {/* Tier Filter */}
            <div className="flex gap-2">
              {['all', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setFilter(tier as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === tier
                      ? 'bg-purple-primary text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {tier.charAt(0) + tier.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="w-full aspect-square bg-gray-800 rounded-lg mb-4" />
                  <div className="h-6 bg-gray-800 rounded mb-2" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredPersonas.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredPersonas.map((persona, i) => (
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
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No personas found</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscribe Modal */}
      {subscribePersona && (
        <SubscribeModal
          persona={subscribePersona}
          isOpen={!!subscribePersona}
          onClose={() => setSubscribePersona(null)}
          onSubscribe={handleSubscribe}
        />
      )}
    </>
  );
}
