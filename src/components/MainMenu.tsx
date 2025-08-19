'use client';

import { isStorageAvailable } from '@/lib/persistence';

interface MainMenuProps {
  onNewTournament: () => void;
  onLoadTournaments: () => void;
}

export default function MainMenu({ onNewTournament, onLoadTournaments }: MainMenuProps) {
  const storageAvailable = isStorageAvailable();

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Tournament Runner
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Single elimination tournament manager
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={onNewTournament}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <div className="text-lg font-semibold">🆕 New Tournament</div>
          <div className="text-sm opacity-90 mt-1">
            Create a fresh tournament from scratch
          </div>
        </button>

        <button
          onClick={onLoadTournaments}
          disabled={!storageAvailable}
          className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <div className="text-lg font-semibold">💾 Load Tournament</div>
          <div className="text-sm opacity-90 mt-1">
            Resume a previously saved tournament
          </div>
        </button>
      </div>

      {!storageAvailable && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Local storage is not available. Tournament saving will be disabled.
          </p>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p>✨ Features:</p>
        <p>• Custom bracket arrangement</p>
        <p>• Automatic tournament progression</p>
        <p>• Tournament saving and loading</p>
        <p>• Handles any number of contestants</p>
      </div>
    </div>
  );
}