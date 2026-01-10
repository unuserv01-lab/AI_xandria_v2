'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Persona } from '@/lib/types';

interface TierRevealProps {
  persona: Persona;
  tier: string;
}

export default function TierRevealAnimation({ persona, tier }: TierRevealProps) {
  const router = useRouter();
  const [stage, setStage] = useState<'rolling' | 'reveal' | 'complete'>('rolling');

  useEffect(() => {
    const timer1 = setTimeout(() => setStage('reveal'), 2000);
    const timer2 = setTimeout(() => setStage('complete'), 4000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const tierColors = {
    COMMON: 'from-gray-600 to-gray-800',
    RARE: 'from-blue-500 to-cyan-500',
    EPIC: 'from-purple-500 to-pink-500',
    LEGENDARY: 'from-yellow-400 via-orange-500 to-red-500',
  };

  const tierGlow = {
    COMMON: 'shadow-gray-500/50',
    RARE: 'shadow-blue-500/50',
    EPIC: 'shadow-purple-500/50',
    LEGENDARY: 'shadow-yellow-500/80',
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <div className="relative">
        {/* Rolling Stage */}
        {stage === 'rolling' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="text-center"
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 20px rgba(147, 51, 234, 0.5)',
                  '0 0 60px rgba(147, 51, 234, 1)',
                  '0 0 20px rgba(147, 51, 234, 0.5)',
                ],
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-primary to-cyan-accent flex items-center justify-center"
            >
              <Sparkles className="w-32 h-32 text-white" />
            </motion.div>
            <p className="text-2xl font-bold mt-8 text-white">Rolling your tier...</p>
          </motion.div>
        )}

        {/* Reveal Stage */}
        {stage === 'reveal' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 30px ${tierGlow[tier as keyof typeof tierGlow]}`,
                  `0 0 80px ${tierGlow[tier as keyof typeof tierGlow]}`,
                  `0 0 30px ${tierGlow[tier as keyof typeof tierGlow]}`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`inline-block px-12 py-6 rounded-2xl bg-gradient-to-r ${
                tierColors[tier as keyof typeof tierColors]
              }`}
            >
              <h2 className="text-6xl font-black text-white tracking-wider">{tier}</h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white"
            >
              You got a {tier} tier persona!
            </motion.p>
          </motion.div>
        )}

        {/* Complete Stage */}
        {stage === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8 max-w-2xl"
          >
            <div className="card p-8 space-y-6">
              <div className="relative">
                <motion.img
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                  src={persona.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`}
                  alt={persona.name}
                  className="w-48 h-48 mx-auto rounded-full border-4 border-purple-primary"
                />
                <div className="absolute -top-4 -right-4">
                  <span className={`stat-badge text-lg px-4 py-2 ${
                    tier === 'LEGENDARY' ? 'animate-pulse-gold' : 'animate-pulse-purple'
                  }`}>
                    {tier}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold mb-2">{persona.name}</h3>
                <p className="text-gray-400">{persona.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Intelligence</p>
                  <p className="text-2xl font-bold text-purple-primary">{persona.intelligence}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Creativity</p>
                  <p className="text-2xl font-bold text-cyan-accent">{persona.creativity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Persuasion</p>
                  <p className="text-2xl font-bold text-pink-500">{persona.persuasion}</p>
                </div>
              </div>

              <button
                onClick={() => router.push(`/persona/${persona.id}`)}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
              >
                View Your Persona
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              className="btn-secondary px-6 py-3"
            >
              Back to Dashboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
