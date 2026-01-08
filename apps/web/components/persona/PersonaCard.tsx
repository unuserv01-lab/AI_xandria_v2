'use client';

import { motion } from 'framer-motion';
import { Share2, Zap, TrendingUp, Users, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Persona } from '@/lib/types';
import Link from 'next/link';

interface PersonaCardProps {
  persona: Persona;
  showActions?: boolean;
  onSubscribe?: (persona: Persona) => void;
}

export default function PersonaCard({ persona, showActions = true, onSubscribe }: PersonaCardProps) {
  const [copied, setCopied] = useState(false);
  const tierClass = `tier-${persona.tier.toLowerCase()}`;
  const winRate = persona.battlesWon + persona.battlesLost > 0 
    ? ((persona.battlesWon / (persona.battlesWon + persona.battlesLost)) * 100).toFixed(1)
    : '0.0';

  const shareUrl = `${window.location.origin}/persona/${persona.id}?ref=${persona.creator?.walletAddress?.slice(0, 8)}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${persona.name} - AI Persona`,
          text: `Check out ${persona.name}, a ${persona.tier} tier AI persona on AI_xandria!`,
          url: shareUrl,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Share link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`card ${tierClass} relative overflow-hidden group`}
    >
      {/* Share Button (Top Right) */}
      <button
        onClick={handleShare}
        className="absolute top-4 right-4 z-10 p-2 bg-purple-primary/20 hover:bg-purple-primary/40 
                   rounded-full transition-all backdrop-blur-sm"
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : (
          <Share2 className="w-4 h-4 text-purple-primary" />
        )}
      </button>

      {/* Tier Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="stat-badge text-xs uppercase font-bold">
          {persona.tier}
        </span>
      </div>

      {/* Avatar */}
      <Link href={`/persona/${persona.id}`}>
        <div className="mt-8 w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-primary/20 to-cyan-accent/20 mb-4">
          <img
            src={persona.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`}
            alt={persona.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <Link href={`/persona/${persona.id}`}>
              <h3 className="text-xl font-bold hover:text-purple-primary transition-colors">
                {persona.name}
              </h3>
            </Link>
            <p className="text-xs text-gray-400 font-mono">#{persona.mintAddress.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Owner & Creator */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Owner</p>
            <p className="font-mono text-purple-primary truncate">
              {persona.owner?.walletAddress?.slice(0, 6)}...
            </p>
          </div>
          <div>
            <p className="text-gray-500">Creator</p>
            <p className="font-mono text-cyan-accent truncate">
              {persona.creator?.walletAddress?.slice(0, 6)}...
            </p>
          </div>
        </div>

        {/* Traits */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">Skills & Traits</p>
          {[
            { name: 'Intelligence', value: persona.intelligence, color: 'bg-blue-500' },
            { name: 'Creativity', value: persona.creativity, color: 'bg-purple-500' },
            { name: 'Persuasion', value: persona.persuasion, color: 'bg-pink-500' },
          ].map((trait) => (
            <div key={trait.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">{trait.name}</span>
                <span className="font-semibold">{trait.value}</span>
              </div>
              <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${trait.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full ${trait.color}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Performance */}
        <div className="pt-3 border-t border-gray-700 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase">Performance</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-purple-primary/10 rounded-lg p-2">
              <div className="text-sm font-bold text-purple-primary">{persona.battlesWon}W</div>
              <div className="text-xs text-gray-500">{persona.battlesLost}L</div>
            </div>
            <div className="bg-cyan-accent/10 rounded-lg p-2">
              <div className="text-sm font-bold text-cyan-accent">⭐ {persona.eloRating}</div>
              <div className="text-xs text-gray-500">Rating</div>
            </div>
            <div className="bg-green-500/10 rounded-lg p-2">
              <div className="text-sm font-bold text-green-400">{winRate}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Wallet Balance</span>
            <span className="text-sm font-bold text-green-400">
              {Number(persona.totalRevenue).toFixed(2)} SOL
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Link href={`/persona/${persona.id}`} className="flex-1">
              <button className="w-full btn-secondary text-sm py-2">
                View Details
              </button>
            </Link>
            <button
              onClick={() => onSubscribe?.(persona)}
              className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Subscribe
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
