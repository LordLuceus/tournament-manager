'use client';

import { useState } from 'react';

interface SaveTournamentDialogProps {
  isOpen: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
  defaultName?: string;
}

export default function SaveTournamentDialog({ 
  isOpen, 
  onSave, 
  onCancel, 
  defaultName = '' 
}: SaveTournamentDialogProps) {
  const [tournamentName, setTournamentName] = useState(defaultName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = tournamentName.trim() || `Tournament ${new Date().toLocaleDateString()}`;
    onSave(name);
    setTournamentName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          Save Tournament
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label 
              htmlFor="tournament-name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Tournament Name
            </label>
            <input
              id="tournament-name"
              type="text"
              value={tournamentName}
              onChange={(e) => setTournamentName(e.target.value)}
              placeholder={`Tournament ${new Date().toLocaleDateString()}`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              maxLength={50}
              autoFocus
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Save Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}