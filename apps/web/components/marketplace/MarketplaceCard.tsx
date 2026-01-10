'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { MarketplaceListing } from '@/lib/types';

interface MarketplaceCardProps {
  listing: MarketplaceListing;
  onBuy: () => void;
}

export default function MarketplaceCard({ listing, onBuy }: MarketplaceCardProps) {
  const { persona } = listing;
  const tierClass = `tier-${persona.tier.toLowerCase()}`;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`card ${tierClass} relative overflow-hidden group`}
    >
      {/* Tier Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="stat-badge text-xs uppercase font-bold">
          {persona.tier}
        </span>
      </div>

      {/* Price Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-green-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <p className="text-sm font-bold text-white">{Number(listing.price).toFixed(2)} SOL</p>
        </div>
      </div>

      {/* Avatar */}
      <Link href={`/persona/${persona.id}`}>
        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-primary/20 to-cyan-accent/20 mb-4 mt-8">
          <img
            src={persona.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`}
            alt={persona.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="space-y-3">
        <div>
          <Link href={`/persona/${persona.id}`}>
            <h3 className="text-xl font-bold hover:text-purple-primary transition-colors truncate">
              {persona.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-400 font-mono">#{persona.mintAddress.slice(0, 8)}...</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-purple-primary/10 rounded p-2">
            <p className="text-purple-primary font-bold">⭐ {persona.eloRating}</p>
            <p className="text-gray-500">Rating</p>
          </div>
          <div className="bg-cyan-accent/10 rounded p-2">
            <p className="text-cyan-accent font-bold">{persona.battlesWon}W/{persona.battlesLost}L</p>
            <p className="text-gray-500">Record</p>
          </div>
        </div>

        {/* Traits Preview */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Intelligence</span>
            <span className="font-semibold">{persona.intelligence}</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${persona.intelligence}%` }}
            />
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={onBuy}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Buy Now
        </button>
      </div>
    </motion.div>
  );
}
