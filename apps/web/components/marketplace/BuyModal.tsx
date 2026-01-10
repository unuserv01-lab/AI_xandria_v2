'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { MarketplaceListing } from '@/lib/types';

interface BuyModalProps {
  listing: MarketplaceListing;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BuyModal({ listing, isOpen, onClose, onSuccess }: BuyModalProps) {
  const { publicKey } = useWallet();
  const { user } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const price = Number(listing.price);
  const platformFee = price * 0.025;
  const creatorRoyalty = price * 0.05;
  const total = price;

  const handleBuy = async () => {
    if (!user || !publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.buyPersona(listing.id, user.id, publicKey.toString());
      toast.success('Successfully purchased!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-gray-700 rounded-2xl max-w-lg w-full"
            >
              {/* Header */}
              <div className="border-b border-gray-700 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Confirm Purchase</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Persona Preview */}
                <div className="flex items-center gap-4">
                  <img
                    src={listing.persona.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.persona.name}`}
                    alt={listing.persona.name}
                    className="w-20 h-20 rounded-full border-2 border-purple-primary"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{listing.persona.name}</h3>
                    <p className="text-sm text-gray-400">{listing.persona.tier} Tier</p>
                    <p className="text-xs text-gray-500">⭐ {listing.persona.eloRating} ELO</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-blue-dark rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Listing Price</span>
                    <span className="font-semibold">{price.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fee (2.5%)</span>
                    <span>{platformFee.toFixed(4)} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Creator Royalty (5%)</span>
                    <span>{creatorRoyalty.toFixed(4)} SOL</span>
                  </div>
                  <div className="pt-2 border-t border-gray-700 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-2xl font-bold text-purple-primary">{total.toFixed(2)} SOL</span>
                  </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-500">
                    <p className="font-semibold mb-1">Important:</p>
                    <p>Once purchased, this persona will be transferred to your wallet. This action cannot be undone.</p>
                  </div>
                </div>

                {/* Buy Button */}
                <button
                  onClick={handleBuy}
                  disabled={isProcessing}
                  className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Confirm Purchase
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
