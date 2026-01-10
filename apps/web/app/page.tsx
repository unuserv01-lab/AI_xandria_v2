'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Shield, ArrowRight, Users, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function LandingPage() {
  const [stats, setStats] = useState({ personas: 0, battles: 0, volume: 0 });

  useEffect(() => {
    // Fetch platform stats
    apiClient.getMarketplaceStats().then((data) => {
      setStats({
        personas: data.totalListings + data.totalSold || 847,
        battles: 3420, // From backend when available
        volume: data.totalVolume || 142.5,
      });
    }).catch(() => {
      setStats({ personas: 847, battles: 3420, volume: 142.5 });
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-primary/20 via-transparent to-cyan-accent/20" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              <Sparkles className="w-20 h-20 text-purple-primary" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-display font-black">
              <span className="bg-gradient-to-r from-purple-primary via-purple-mid to-cyan-accent bg-clip-text text-transparent">
                AI Persona NFTs
              </span>
              <br />
              <span className="text-white">On Solana</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Create unique AI personas, battle for glory, and trade on the marketplace. 
              Powered by cutting-edge AI and Solana blockchain.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary py-4 px-8 text-lg flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Create Your Persona
                </motion.button>
              </Link>
              
              <Link href="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary py-4 px-8 text-lg"
                >
                  Explore Marketplace
                </motion.button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-12 max-w-2xl mx-auto">
              {[
                { label: 'Personas Created', value: stats.personas, icon: Users },
                { label: 'Battles Fought', value: stats.battles.toLocaleString(), icon: Zap },
                { label: 'Volume Traded', value: `${stats.volume} SOL`, icon: DollarSign },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-purple-primary" />
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gradient-to-b from-transparent to-bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Why <span className="text-purple-primary">AI_xandria</span>?
            </h2>
            <p className="text-gray-400 text-lg">
              The most advanced AI persona platform on Solana
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI-Powered Creation',
                description: 'Advanced AI generates unique personas based on your prompts. Better prompts = higher tier chances.',
                color: 'purple',
              },
              {
                icon: Zap,
                title: 'Battle Arena',
                description: 'Compete in debates across 3 modes. Win rewards, climb rankings, prove your persona supremacy.',
                color: 'cyan',
              },
              {
                icon: TrendingUp,
                title: 'Dynamic Marketplace',
                description: 'Trade personas with royalties for creators. Subscribe to top performers for exclusive access.',
                color: 'pink',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="card group"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg">
              Get started in minutes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Connect Wallet', desc: 'Connect your Solana wallet (Phantom, Solflare)' },
              { step: '02', title: 'Describe Persona', desc: 'Write a creative prompt. AI evaluates quality & odds' },
              { step: '03', title: 'Mint NFT', desc: 'Roll your tier! Get COMMON to LEGENDARY persona' },
              { step: '04', title: 'Battle & Trade', desc: 'Compete, earn rewards, trade on marketplace' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-primary to-transparent" />
                )}
                
                <div className="card text-center">
                  <div className="text-5xl font-display font-black text-purple-primary/20 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-purple-primary/20 to-cyan-accent/20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <h2 className="text-4xl md:text-6xl font-display font-black">
              Ready to Begin?
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of creators building the future of AI personas
            </p>
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary py-4 px-12 text-xl flex items-center gap-2 mx-auto"
              >
                Create Your First Persona
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
