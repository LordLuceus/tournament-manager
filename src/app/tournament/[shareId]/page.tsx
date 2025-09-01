'use client';

import { Tournament } from '@/types/tournament';
import BracketDisplay from '@/components/BracketDisplay';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function SharedTournamentPage() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid tournament link');
      setLoading(false);
      return;
    }

    const fetchTournament = async () => {
      try {
        const response = await fetch(`/api/tournament/${shareId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Tournament not found or no longer available');
          } else {
            setError('Failed to load tournament');
          }
          return;
        }

        const tournamentData: Tournament = await response.json();
        setTournament(tournamentData);
      } catch (err) {
        console.error('Error fetching tournament:', err);
        setError('Failed to load tournament');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [shareId]);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Tournament link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Tournament Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Link 
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go to Tournament Manager
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🏆 Shared Tournament
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {tournament.contestants.length} contestants • {tournament.totalRounds} rounds
            {tournament.isComplete && tournament.winner && (
              <span className="ml-2">
                • Winner: <strong className="text-yellow-600 dark:text-yellow-400">{tournament.winner.name}</strong>
              </span>
            )}
          </p>
          
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={copyShareLink}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
            >
              🔗 Copy Link
            </button>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              🏠 Create Your Tournament
            </Link>
          </div>
        </header>

        <BracketDisplay
          tournament={tournament}
          onSelectWinner={() => {}} // No-op for read-only view
          isReadOnly={true}
        />

        {/* Tournament Statistics */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Tournament Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tournament.contestants.length}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Contestants</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tournament.matches.filter(m => m.isFinished).length}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Completed Matches</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {tournament.matches.filter(m => m.report).length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Matches with Reports</div>
            </div>
          </div>
        </div>

        <footer className="text-center mt-8 text-gray-500 dark:text-gray-400 text-sm">
          <p>
            Powered by{' '}
            <Link 
              href="/" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Tournament Manager
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}