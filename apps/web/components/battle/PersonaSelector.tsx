'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { Persona } from '@/lib/types';

interface PersonaSelectorProps {
  label: string;
  selected: Persona | null;
  onSelect: (persona: Persona) => void;
  exclude?: string;
}

export default function PersonaSelector({ label, selected, onSelect, exclude }: PersonaSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const fetchPersonas = async () => {
    try {
      const data = await apiClient.listPersonas({ limit: 100 });
      setPersonas(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonas = personas
    .filter((p) => p.id !== exclude)
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card">
      <h3 className="font-bold mb-4">{label}</h3>

      {selected ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="relative"
        >
          <div className="flex items-center gap-3 p-3 bg-purple-primary/10 border border-purple-primary rounded-lg">
            <img
              src={selected.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.name}`}
              alt={selected.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <p className="font-semibold">{selected.name}</p>
              <p className="text-xs text-gray-400">{selected.tier} • {selected.eloRating} ELO</p>
            </div>
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <button
            onClick={() => onSelect(null as any)}
            className="mt-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Change Selection
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search personas..."
              className="input pl-10 py-2 text-sm"
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading...</p>
            ) : filteredPersonas.length > 0 ? (
              filteredPersonas.slice(0, 10).map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => onSelect(persona)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg transition-colors text-left"
                >
                  <img
                    src={persona.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${persona.name}`}
                    alt={persona.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{persona.name}</p>
                    <p className="text-xs text-gray-400">{persona.tier} • {persona.eloRating} ELO</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No personas found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
