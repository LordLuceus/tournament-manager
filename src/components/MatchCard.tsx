'use client';

import { Match, Contestant } from '@/types/tournament';

interface MatchCardProps {
  match: Match;
  onSelectWinner: (matchId: string, winner: Contestant) => void;
}

export default function MatchCard({ match, onSelectWinner }: MatchCardProps) {
  if (match.isBye) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 min-w-[200px]">
        <div className="text-center">
          <div className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            {match.winner?.name}
          </div>
          <div className="text-sm text-yellow-600 dark:text-yellow-400">
            (BYE)
          </div>
        </div>
      </div>
    );
  }

  if (!match.contestant1 && !match.contestant2) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 min-w-[200px]">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Waiting for contestants...
        </div>
      </div>
    );
  }

  const isActive = match.contestant1 && match.contestant2 && !match.isFinished;

  return (
    <div className={`border rounded-lg p-4 min-w-[200px] ${
      match.isFinished 
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
        : isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
    }`}>
      <div className="space-y-2">
        {/* Contestant 1 */}
        <div className={`p-2 rounded cursor-pointer transition-colors ${
          match.isFinished && match.winner?.id === match.contestant1?.id
            ? 'bg-green-200 dark:bg-green-800 font-medium'
            : isActive
            ? 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            : 'bg-gray-50 dark:bg-gray-700'
        }`}
        onClick={() => {
          if (isActive && match.contestant1) {
            onSelectWinner(match.id, match.contestant1);
          }
        }}
        >
          <div className="text-center">
            {match.contestant1?.name || 'TBD'}
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          vs
        </div>

        {/* Contestant 2 */}
        <div className={`p-2 rounded cursor-pointer transition-colors ${
          match.isFinished && match.winner?.id === match.contestant2?.id
            ? 'bg-green-200 dark:bg-green-800 font-medium'
            : isActive
            ? 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
            : 'bg-gray-50 dark:bg-gray-700'
        }`}
        onClick={() => {
          if (isActive && match.contestant2) {
            onSelectWinner(match.id, match.contestant2);
          }
        }}
        >
          <div className="text-center">
            {match.contestant2?.name || 'TBD'}
          </div>
        </div>
      </div>

      {match.isFinished && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center text-sm text-green-700 dark:text-green-300 font-medium">
            Winner: {match.winner?.name}
          </div>
        </div>
      )}

      {isActive && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center text-sm text-blue-600 dark:text-blue-400">
            Click contestant to select winner
          </div>
        </div>
      )}
    </div>
  );
}