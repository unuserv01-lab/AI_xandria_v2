'use client';

import { motion } from 'framer-motion';
import { Loader2, Swords, MessageSquare, Scale } from 'lucide-react';
import type { Persona } from '@/lib/types';

interface BattleProgressProps {
  stage: 'selecting' | 'arguing' | 'judging';
  persona1: Persona;
  persona2: Persona;
  topic: string;
}

export default function BattleProgress({ stage, persona1, persona2, topic }: BattleProgressProps) {
  const stages = [
    { key: 'selecting', label: 'Preparing', icon: Loader2 },
    { key: 'arguing', label: 'Generating Arguments', icon: MessageSquare },
    { key: 'judging', label: 'Judging', icon: Scale },
  ];

  const currentStageIndex = stages.findIndex((s) => s.key === stage);

  return (
    <div className="card max-w-3xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === currentStageIndex;
          const isCompleted = i < currentStageIndex;

          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1,
                    backgroundColor: isActive || isCompleted ? '#9333EA' : '#374151',
                  }}
                  transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 text-white" />
                </motion.div>
                <p className="text-xs mt-2 text-gray-400">{s.label}</p>
              </div>
              
              {i < stages.length - 1 && (
                <div className="flex-1 h-1 mx-2 bg-gray-700 rounded">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: i < currentStageIndex ? '100%' : '0%' }}
                    className="h-full bg-purple-primary rounded"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Battle Info */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <img
              src={persona1.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona1.name}`}
              alt={persona1.name}
              className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-purple-primary"
            />
            <p className="font-semibold">{persona1.name}</p>
          </div>

          <Swords className="w-8 h-8 text-purple-primary animate-pulse" />

          <div className="text-center">
            <img
              src={persona2.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona2.name}`}
              alt={persona2.name}
              className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-cyan-accent"
            />
            <p className="font-semibold">{persona2.name}</p>
          </div>
        </div>

        <div className="bg-blue-dark rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Topic:</p>
          <p className="font-medium">{topic}</p>
        </div>

        <motion.p
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-gray-400"
        >
          {stage === 'selecting' && 'Preparing battle arena...'}
          {stage === 'arguing' && 'AI personas are crafting their arguments...'}
          {stage === 'judging' && 'AI judge is evaluating the debate...'}
        </motion.p>
      </div>
    </div>
  );
}
