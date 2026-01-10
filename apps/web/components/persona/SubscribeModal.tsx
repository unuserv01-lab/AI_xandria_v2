'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, TrendingUp, Shield, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import type { Persona } from '@/lib/types';

interface SubscribeModalProps {
  persona: Persona;
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (duration: number, price: number) => Promise<void>;
}

export default function SubscribeModal({ persona, isOpen, onClose, onSubscribe }: SubscribeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [isProcessing, setIsProcessing] = useState(false);

  // Pricing calculation
  // Base daily rate: 0.1 SOL
  // Weekly: 0.1 * 7 = 0.7 SOL (10% discount) = 0.63 SOL
  // Monthly: 0.1 * 30 = 3.0 SOL (20% discount) = 2.4 SOL
  
  const baseDailyRate = 0.1; // SOL
  
  const plans = {
    daily: {
      duration: 1,
      price: baseDailyRate,
      discount: 0,
      label: '1 Day',
      popular: false,
    },
    weekly: {
      duration: 7,
      price: baseDailyRate * 7 * 0.9, // 10% discount
      discount: 10,
      label: '7 Days',
      popular: false,
    },
    monthly: {
      duration: 30,
      price: baseDailyRate * 30 * 0.8, // 20% discount
      discount: 20,
      label: '30 Days',
      popular: true,
    },
  };

  const handleSubscribe = async () => {
    const plan = plans[selectedPlan];
    setIsProcessing(true);
    
    try {
      await onSubscribe(plan.duration, plan.price);
      toast.success(`Successfully subscribed to ${persona.name} for ${plan.duration} days!`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Subscription failed');
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
              className="bg-bg-card border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-bg-card border-b border-gray-700 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={persona.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`}
                    alt={persona.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-primary"
                  />
                  <div>
                    <h2 className="text-2xl font-bold">Subscribe to {persona.name}</h2>
                    <p className="text-sm text-gray-400">Get exclusive access & benefits</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Benefits */}
                <div className="bg-purple-primary/10 border border-purple-primary/30 rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-primary" />
                    Subscription Benefits
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      Unlimited battles with this persona
                    </li>
                    <li className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      Priority access to new features
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      24/7 persona availability
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-400" />
                      Exclusive subscriber badge
                    </li>
                  </ul>
                </div>

                {/* Plans */}
                <div>
                  <h3 className="font-bold mb-4">Choose Your Plan</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(Object.keys(plans) as Array<keyof typeof plans>).map((key) => {
                      const plan = plans[key];
                      const isSelected = selectedPlan === key;
                      
                      return (
                        <motion.button
                          key={key}
                          onClick={() => setSelectedPlan(key)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-purple-primary bg-purple-primary/10'
                              : 'border-gray-700 hover:border-gray-600'
                          }`}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <span className="stat-badge text-xs">POPULAR</span>
                            </div>
                          )}
                          
                          <div className="text-center space-y-2">
                            <p className="text-sm text-gray-400">{plan.label}</p>
                            <p className="text-2xl font-bold">{plan.price.toFixed(2)} SOL</p>
                            {plan.discount > 0 && (
                              <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                                Save {plan.discount}%
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              {(plan.price / plan.duration).toFixed(3)} SOL/day
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Details */}
                <div className="bg-blue-dark border border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Daily Rate</span>
                    <span className="font-semibold">{baseDailyRate.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Duration</span>
                    <span className="font-semibold">{plans[selectedPlan].duration} days</span>
                  </div>
                  {plans[selectedPlan].discount > 0 && (
                    <div className="flex justify-between items-center mb-2 text-green-400">
                      <span>Discount</span>
                      <span className="font-semibold">-{plans[selectedPlan].discount}%</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-gray-700 flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-bold text-2xl text-purple-primary">
                      {plans[selectedPlan].price.toFixed(2)} SOL
                    </span>
                  </div>
                </div>

                {/* Subscribe Button */}
                <button
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Subscribe Now
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-500">
                  By subscribing, you agree to our terms of service. Subscription auto-renews unless cancelled.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
