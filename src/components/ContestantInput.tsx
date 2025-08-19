'use client';

import { useState } from 'react';
import { Contestant } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

interface ContestantInputProps {
  contestants: Contestant[];
  onContestantsChange: (contestants: Contestant[]) => void;
  onNext: () => void;
  onBack?: () => void;
}

export default function ContestantInput({ contestants, onContestantsChange, onNext, onBack }: ContestantInputProps) {
  const [newContestantName, setNewContestantName] = useState('');

  const addContestant = () => {
    if (newContestantName.trim() && !contestants.find(c => c.name.toLowerCase() === newContestantName.toLowerCase())) {
      const newContestant: Contestant = {
        id: uuidv4(),
        name: newContestantName.trim(),
      };
      onContestantsChange([...contestants, newContestant]);
      setNewContestantName('');
    }
  };

  const removeContestant = (id: string) => {
    onContestantsChange(contestants.filter(c => c.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContestantName.trim()) {
      addContestant();
    }
  };

  const canProceed = contestants.length >= 2;

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Add Contestants
      </h2>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newContestantName}
            onChange={(e) => setNewContestantName(e.target.value)}
            placeholder="Enter contestant name"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            maxLength={50}
          />
          <button
            type="submit"
            disabled={!newContestantName.trim() || contestants.some(c => c.name.toLowerCase() === newContestantName.toLowerCase())}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Contestants ({contestants.length})
        </h3>
        
        {contestants.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No contestants added yet
          </p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {contestants.map((contestant, index) => (
              <div
                key={contestant.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <span className="text-gray-800 dark:text-white">
                    {contestant.name}
                  </span>
                </div>
                <button
                  onClick={() => removeContestant(contestant.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-center space-y-3">
        <div className="flex gap-4 justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
            >
              ← Back
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Generate Tournament Bracket
          </button>
        </div>
        
        {!canProceed && (
          <p className="text-sm text-red-600 dark:text-red-400">
            Add at least 2 contestants to continue
          </p>
        )}
      </div>
    </div>
  );
}