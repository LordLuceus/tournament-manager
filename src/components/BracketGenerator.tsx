'use client';

import { Contestant } from '@/types/tournament';

interface BracketGeneratorProps {
  contestants: Contestant[];
  onGenerateRandom: () => void;
  onGenerateManual: () => void;
  onManualSetup: () => void;
  onBack: () => void;
}

export default function BracketGenerator({ 
  contestants, 
  onGenerateRandom, 
  onGenerateManual, 
  onManualSetup,
  onBack 
}: BracketGeneratorProps) {
  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Generate Tournament Bracket
      </h2>

      <div className="mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tournament Details
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Contestants:</strong> {contestants.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Rounds:</strong> {Math.ceil(Math.log2(contestants.length))}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Format:</strong> Single Elimination
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onGenerateRandom}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <div className="text-lg font-semibold">🎲 Random Bracket</div>
          <div className="text-sm opacity-90 mt-1">
            Automatically shuffle contestants into random matchups
          </div>
        </button>

        <button
          onClick={onGenerateManual}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <div className="text-lg font-semibold">📋 Current Order</div>
          <div className="text-sm opacity-90 mt-1">
            Use contestants in the order they were added
          </div>
        </button>

        <button
          onClick={onManualSetup}
          className="w-full px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <div className="text-lg font-semibold">✋ Custom Arrangement</div>
          <div className="text-sm opacity-90 mt-1">
            Manually arrange contestants with full control
          </div>
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          ← Back to Contestants
        </button>
      </div>
    </div>
  );
}