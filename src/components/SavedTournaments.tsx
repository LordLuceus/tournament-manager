'use client';

import { useState, useEffect } from 'react';
import { SavedTournament, getSavedTournaments, deleteSavedTournament } from '@/lib/persistence';

interface SavedTournamentsProps {
  onLoadTournament: (saved: SavedTournament) => void;
  onBack: () => void;
}

export default function SavedTournaments({ onLoadTournament, onBack }: SavedTournamentsProps) {
  const [savedTournaments, setSavedTournaments] = useState<SavedTournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  useEffect(() => {
    setSavedTournaments(getSavedTournaments());
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this saved tournament?')) {
      deleteSavedTournament(id);
      setSavedTournaments(getSavedTournaments());
      if (selectedTournament === id) {
        setSelectedTournament(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  const getProgressInfo = (saved: SavedTournament) => {
    if (saved.phase === 'complete') {
      return `✅ Complete - Winner: ${saved.tournament.winner?.name}`;
    }

    if (saved.phase === 'setup' || saved.phase === 'bracket-generation' || saved.phase === 'manual-setup') {
      return '🔧 Setup phase';
    }

    const completedMatches = saved.tournament.matches.filter(m => m.isFinished).length;
    const totalMatches = saved.tournament.matches.length;
    const progressPercent = Math.round((completedMatches / totalMatches) * 100);

    return `🏆 In progress - ${completedMatches}/${totalMatches} matches (${progressPercent}%)`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Saved Tournaments
      </h2>

      {savedTournaments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🏆</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No saved tournaments yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Tournaments are automatically saved when you start playing matches
          </p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {savedTournaments.map((saved) => (
            <div
              key={saved.id}
              className={`border rounded-lg p-4 transition-colors cursor-pointer ${
                selectedTournament === saved.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
              onClick={() => setSelectedTournament(saved.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                    {saved.name}
                  </h3>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>{getProgressInfo(saved)}</div>
                    <div>📊 {saved.contestants.length} contestants</div>
                    <div>💾 Saved: {formatDate(saved.lastModified)}</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadTournament(saved);
                    }}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Load
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(saved.id);
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Back to Main Menu
        </button>
        
        {savedTournaments.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete all saved tournaments?')) {
                savedTournaments.forEach(saved => deleteSavedTournament(saved.id));
                setSavedTournaments([]);
                setSelectedTournament(null);
              }
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>💡 Tip: Tournaments are automatically saved when you make progress</p>
        <p>Only the 10 most recent tournaments are kept to save space</p>
      </div>
    </div>
  );
}