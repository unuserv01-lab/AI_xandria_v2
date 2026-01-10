'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '@/components/layout/Header';
import MarketplaceCard from '@/components/marketplace/MarketplaceCard';
import BuyModal from '@/components/marketplace/BuyModal';
import { apiClient } from '@/lib/api';
import type { MarketplaceListing } from '@/lib/types';

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'rating'>('recent');
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [stats, setStats] = useState({ totalListings: 0, totalVolume: 0, avgPrice: 0 });

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, [filter, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMarketplaceListings({
        tier: filter === 'all' ? undefined : filter,
        sortBy,
        limit: 50,
      });
      setListings(data);
    } catch (error) {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiClient.getMarketplaceStats();
      setStats({
        totalListings: data.totalListings,
        totalVolume: data.totalVolume || 0,
        avgPrice: data.averagePrice || 0,
      });
    } catch (error) {
      // Silent fail
    }
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">Marketplace</h1>
            <p className="text-gray-400">Buy and sell AI personas</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-primary" />
              <p className="text-2xl font-bold">{stats.totalListings}</p>
              <p className="text-sm text-gray-500">Active Listings</p>
            </div>
            <div className="card text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold">{stats.totalVolume.toFixed(1)} SOL</p>
              <p className="text-sm text-gray-500">Total Volume</p>
            </div>
            <div className="card text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-cyan-accent" />
              <p className="text-2xl font-bold">{stats.avgPrice.toFixed(2)} SOL</p>
              <p className="text-sm text-gray-500">Avg Price</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
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

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input py-2"
            >
              <option value="recent">Recently Listed</option>
              <option value="price">Price: Low to High</option>
              <option value="rating">Highest Rating</option>
            </select>
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
          ) : listings.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {listings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <MarketplaceCard
                    listing={listing}
                    onBuy={() => setSelectedListing(listing)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No listings found</p>
            </div>
          )}
        </div>
      </div>

      {/* Buy Modal */}
      {selectedListing && (
        <BuyModal
          listing={selectedListing}
          isOpen={!!selectedListing}
          onClose={() => setSelectedListing(null)}
          onSuccess={fetchListings}
        />
      )}
    </>
  );
}
