'use client';

import { motion } from 'framer-motion';
import { Trophy, Zap, Quote, RefreshCw } from 'lucide-react';
import type { Battle } from '@/lib/types';

interface JudgeResultsProps {
  battle: Battle;
  results: any;
  onReset: () => void;
}

export default function JudgeResults({ battle, results, onReset }: JudgeResultsProps) {
  const winner = results.winner === battle.persona1.id ? battle.persona1 : battle.persona2;
  const loser = results.winner === battle.persona1.id ? battle.persona2 : battle.persona1;
  const winnerScores = results.result.scores.persona1;
  const loserScores = results.result.scores.persona2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Winner Announcement */}
      <div className="card text-center bg-gradient-to-br from-purple-primary/20 to-cyan-accent/20 border-2 border-purple-primary">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
        </motion.div>

        <h2 className="text-4xl font-display font-bold mb-2">
          <span className="text-yellow-400">{winner.name}</span> Wins!
        </h2>
        <p className="text-gray-400">
          Score: <span className="text-purple-primary font-bold">{winnerScores.total}</span> vs{' '}
          <span className="text-gray-500">{loserScores.total}</span>
        </p>

        {results.rewards && results.rewards.winner > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full">
            <Zap className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-bold">
              +{results.rewards.winner.toFixed(2)} SOL
            </span>
          </div>
        )}
      </div>

      {/* Detailed Scores */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Winner Scores */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card border-2 border-green-500/50"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src={winner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.name}`}
              alt={winner.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-bold">{winner.name}</h3>
              <span className="text-sm text-green-400">Winner</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Logical Coherence', value: winnerScores.logicalCoherence, max: 30 },
              { label: 'Creativity', value: winnerScores.creativity, max: 25 },
              { label: 'Persuasiveness', value: winnerScores.persuasiveness, max: 25 },
              { label: 'Topic Relevance', value: winnerScores.topicRelevance, max: 20 },
            ].map((score) => (
              <div key={score.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{score.label}</span>
                  <span className="font-semibold text-green-400">{score.value}/{score.max}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score.value / score.max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Score</span>
              <span className="text-2xl font-bold text-green-400">{winnerScores.total}</span>
            </div>
          </div>
        </motion.div>

        {/* Loser Scores */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card border-2 border-gray-700"
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src={loser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${loser.name}`}
              alt={loser.name}
              className="w-12 h-12 rounded-full opacity-70"
            />
            <div>
              <h3 className="font-bold text-gray-400">{loser.name}</h3>
              <span className="text-sm text-gray-500">Runner-up</span>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Logical Coherence', value: loserScores.logicalCoherence, max: 30 },
              { label: 'Creativity', value: loserScores.creativity, max: 25 },
              { label: 'Persuasiveness', value: loserScores.persuasiveness, max: 25 },
              { label: 'Topic Relevance', value: loserScores.topicRelevance, max: 20 },
            ].map((score) => (
              <div key={score.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">{score.label}</span>
                  <span className="font-semibold text-gray-500">{score.value}/{score.max}</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score.value / score.max) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="h-full bg-gray-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Score</span>
              <span className="text-2xl font-bold text-gray-500">{loserScores.total}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Judge Reasoning */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-xl font-bold mb-3">Judge's Reasoning</h3>
        <p className="text-gray-300">{results.result.reasoning}</p>
      </motion.div>

      {/* Best Arguments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="card bg-purple-primary/5 border border-purple-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="w-5 h-5 text-purple-primary" />
            <h4 className="font-bold">Best from {winner.name}</h4>
          </div>
          <p className="text-sm text-gray-300 italic">"{results.result.highlights.persona1Best}"</p>
        </div>

        <div className="card bg-cyan-accent/5 border border-cyan-accent/30">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="w-5 h-5 text-cyan-accent" />
            <h4 className="font-bold">Best from {loser.name}</h4>
          </div>
          <p className="text-sm text-gray-300 italic">"{results.result.highlights.persona2Best}"</p>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={onReset} className="flex-1 btn-primary py-3 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5" />
          New Battle
        </button>
        <button className="flex-1 btn-secondary py-3">
          View Full Transcript
        </button>
      </div>
    </motion.div>
  );
}
