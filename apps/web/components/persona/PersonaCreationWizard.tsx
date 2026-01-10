'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, DollarSign, Dice5 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { PromptScore, TierProbabilities, CostBreakdown } from '@/lib/types';
import TierRevealAnimation from './TierRevealAnimation';

export default function PersonaCreationWizard() {
  const { user } = useAppStore();
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  
  const [evaluation, setEvaluation] = useState<{
    score: PromptScore;
    probabilities: TierProbabilities;
    cost: CostBreakdown;
  } | null>(null);

  const [createdPersona, setCreatedPersona] = useState<any>(null);

  useEffect(() => {
    if (prompt.length >= 50) {
      const timer = setTimeout(() => {
        evaluatePrompt();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [prompt]);

  const evaluatePrompt = async () => {
    if (prompt.length < 10) return;
    
    setIsEvaluating(true);
    try {
      const result = await apiClient.evaluatePrompt(prompt);
      setEvaluation({
        score: result.score,
        probabilities: result.tierProbabilities,
        cost: result.estimatedCost,
      });
    } catch (error) {
      toast.error('Failed to evaluate prompt');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCreate = async () => {
    if (!user || !evaluation) return;

    setIsCreating(true);
    try {
      const result = await apiClient.createPersona(prompt, user.id, user.walletAddress);
      setCreatedPersona(result);
      setShowReveal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create persona');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {!showReveal ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-primary to-cyan-accent bg-clip-text text-transparent">
                Create Your AI Persona
              </h1>
              <p className="text-gray-400">
                Describe your ideal AI persona. The better your prompt, the higher your chances!
              </p>
            </div>

            {/* Prompt Input */}
            <div className="card space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-gray-300 mb-2 block">
                  Describe Your Persona
                </span>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A philosophical AI that combines Socratic wisdom with modern data science, capable of deep reasoning and creative problem-solving..."
                  className="input min-h-[200px] resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{prompt.length}/1000 characters</span>
                  {prompt.length >= 50 && (
                    <span className="text-green-400">✓ Good length!</span>
                  )}
                </div>
              </label>

              {/* Tips */}
              <div className="bg-purple-primary/10 border border-purple-primary/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-primary mb-2">💡 Tips for better results:</p>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Be specific about personality traits and expertise</li>
                  <li>• Describe unique characteristics and capabilities</li>
                  <li>• Include multi-dimensional aspects (technical, creative, empathetic)</li>
                  <li>• Aim for 100-300 words for best scoring</li>
                </ul>
              </div>
            </div>

            {/* Live Evaluation */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-6"
              >
                {/* Prompt Score */}
                <div className="card space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-primary" />
                    <h3 className="font-bold">Prompt Quality Score</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Specificity', value: evaluation.score.specificity, max: 25 },
                      { name: 'Creativity', value: evaluation.score.creativity, max: 25 },
                      { name: 'Coherence', value: evaluation.score.coherence, max: 25 },
                      { name: 'Complexity', value: evaluation.score.complexity, max: 25 },
                    ].map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{item.name}</span>
                          <span className="font-semibold">{item.value}/{item.max}</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / item.max) * 100}%` }}
                            className="h-full bg-gradient-to-r from-purple-primary to-cyan-accent"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Total Score</span>
                      <span className="text-2xl font-bold text-purple-primary">
                        {evaluation.score.total}/100
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{evaluation.score.reasoning}</p>
                  </div>
                </div>

                {/* Tier Odds */}
                <div className="card space-y-4">
                  <div className="flex items-center gap-2">
                    <Dice5 className="w-5 h-5 text-cyan-accent" />
                    <h3 className="font-bold">Your Tier Odds</h3>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(evaluation.probabilities).map(([tier, prob]) => (
                      <div key={tier}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400 capitalize">{tier}</span>
                          <span className="font-semibold text-purple-primary">{prob}%</span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${prob}%` }}
                            className={`h-full ${
                              tier === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                              tier === 'epic' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                              tier === 'rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                              'bg-gray-600'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-cyan-accent/10 border border-cyan-accent/30 rounded-lg p-3">
                    <p className="text-xs text-cyan-accent">
                      ℹ️ Higher quality prompts increase odds for rare tiers!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Cost Preview */}
            {evaluation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <h3 className="font-bold">Cost Breakdown</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Evaluation</p>
                    <p className="text-sm font-semibold">${evaluation.cost.evaluation.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Generation</p>
                    <p className="text-sm font-semibold">${evaluation.cost.generation.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Image</p>
                    <p className="text-sm font-semibold">${evaluation.cost.image.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Blockchain</p>
                    <p className="text-sm font-semibold">${evaluation.cost.blockchain.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Platform Fee</p>
                    <p className="text-sm font-semibold">${evaluation.cost.platform.toFixed(4)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                  <span className="text-gray-400">Total Cost</span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">
                      {evaluation.cost.totalSol.toFixed(4)} SOL
                    </p>
                    <p className="text-xs text-gray-500">≈ ${evaluation.cost.totalUsd.toFixed(2)} USD</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Create Button */}
            <button
              onClick={handleCreate}
              disabled={!evaluation || isCreating || !user}
              className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Creating Your Persona...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Create Persona ({evaluation?.cost.totalSol.toFixed(4)} SOL)
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <TierRevealAnimation persona={createdPersona.persona} tier={createdPersona.tier} />
        )}
      </AnimatePresence>
    </div>
  );
}
