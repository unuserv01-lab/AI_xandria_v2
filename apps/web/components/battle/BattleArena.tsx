'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Sparkles, Trophy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import PersonaSelector from './PersonaSelector';
import BattleProgress from './BattleProgress';
import JudgeResults from './JudgeResults';
import { apiClient } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import type { Persona, Battle } from '@/lib/types';

type BattleStage = 'setup' | 'selecting' | 'arguing' | 'judging' | 'results';

export default function BattleArena() {
  const { user } = useAppStore();
  const [stage, setStage] = useState<BattleStage>('setup');
  const [persona1, setPersona1] = useState<Persona | null>(null);
  const [persona2, setPersona2] = useState<Persona | null>(null);
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'CASUAL' | 'RANKED' | 'DEATHMATCH'>('CASUAL');
  const [battle, setBattle] = useState<Battle | null>(null);
  const [results, setResults] = useState<any>(null);

  const generateRandomTopic = () => {
    const topics = [
      'Should AI have creative rights to their outputs?',
      'Is consciousness necessary for true intelligence?',
      'Will humans and AI merge in the future?',
      'Should AI be regulated by governments?',
      'Can AI truly understand emotions?',
      'Is privacy dead in the age of AI?',
      'Should AI be allowed to make life-or-death decisions?',
      'Will AI replace most human jobs?',
    ];
    setTopic(topics[Math.floor(Math.random() * topics.length)]);
  };

  const handleStartBattle = async () => {
    if (!persona1 || !persona2 || !topic || !user) {
      toast.error('Please select both personas and enter a topic');
      return;
    }

    try {
      setStage('selecting');
      
      // Create battle
      const battleData = await apiClient.createBattle(
        persona1.id,
        persona2.id,
        topic,
        mode,
        user.id
      );
      setBattle(battleData);
      
      setStage('arguing');
      
      // Generate arguments
      const args = await apiClient.startBattle(battleData.id);
      setBattle({ ...battleData, ...args });
      
      setStage('judging');
      
      // Judge battle
      const judgeResults = await apiClient.judgeBattle(battleData.id);
      setResults(judgeResults);
      
      setStage('results');
    } catch (error: any) {
      toast.error(error.message || 'Battle failed');
      setStage('setup');
    }
  };

  const handleReset = () => {
    setStage('setup');
    setPersona1(null);
    setPersona2(null);
    setTopic('');
    setBattle(null);
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {stage === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <Swords className="w-16 h-16 mx-auto text-purple-primary" />
              <h1 className="text-4xl font-display font-bold">Battle Arena</h1>
              <p className="text-gray-400">Choose your personas and let them debate!</p>
            </div>

            {/* Battle Mode Selection */}
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Battle Mode</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { mode: 'CASUAL', label: 'Casual', fee: 'FREE', desc: 'Practice mode, -20 ELO on loss' },
                  { mode: 'RANKED', label: 'Ranked', fee: '0.5 SOL', desc: 'Earn rewards, 30-day wound on loss' },
                  { mode: 'DEATHMATCH', label: 'Deathmatch', fee: '2 SOL', desc: 'Winner takes all, loser NFT burns!' },
                ].map((m) => (
                  <button
                    key={m.mode}
                    onClick={() => setMode(m.mode as any)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      mode === m.mode
                        ? 'border-purple-primary bg-purple-primary/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className="font-bold mb-1">{m.label}</p>
                    <p className="text-sm text-purple-primary font-semibold mb-2">{m.fee}</p>
                    <p className="text-xs text-gray-400">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Persona Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <PersonaSelector
                label="Select Persona 1"
                selected={persona1}
                onSelect={setPersona1}
                exclude={persona2?.id}
              />
              <PersonaSelector
                label="Select Persona 2"
                selected={persona2}
                onSelect={setPersona2}
                exclude={persona1?.id}
              />
            </div>

            {/* Topic */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Debate Topic</h2>
                <button
                  onClick={generateRandomTopic}
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Random Topic
                </button>
              </div>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a debate topic..."
                className="input min-h-[120px] resize-none"
              />
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartBattle}
              disabled={!persona1 || !persona2 || !topic}
              className="w-full btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Swords className="w-6 h-6" />
              Start Battle ({mode === 'CASUAL' ? 'FREE' : mode === 'RANKED' ? '0.5 SOL' : '2 SOL'})
            </button>
          </motion.div>
        )}

        {(stage === 'selecting' || stage === 'arguing' || stage === 'judging') && (
          <BattleProgress stage={stage} persona1={persona1!} persona2={persona2!} topic={topic} />
        )}

        {stage === 'results' && results && (
          <JudgeResults
            battle={battle!}
            results={results}
            onReset={handleReset}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
