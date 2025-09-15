'use client';

import { Tournament, Contestant } from '@/types/tournament';
import { getMatchesByRound } from '@/lib/tournament';
import MatchCard from './MatchCard';

interface BracketDisplayProps {
  tournament: Tournament;
  onSelectWinner: (matchId: string, winner: Contestant) => void;
  onChangeWinner?: (matchId: string, winner: Contestant) => void;
  onUpdateReport?: (matchId: string, report: string) => void;
  isReadOnly?: boolean;
}

export default function BracketDisplay({
  tournament,
  onSelectWinner,
  onChangeWinner,
  onUpdateReport,
  isReadOnly = false
}: BracketDisplayProps) {
  return (
    <div className="w-full overflow-x-auto p-4">
      <div className="min-w-fit">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Tournament Bracket
        </h2>
        
        <div className="flex gap-8 justify-start">
          {Array.from({ length: tournament.totalRounds }, (_, roundIndex) => {
            const round = roundIndex + 1;
            const matches = getMatchesByRound(tournament, round);
            
            return (
              <div key={round} className="flex flex-col items-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  {round === tournament.totalRounds ? 'Final' : `Round ${round}`}
                </h3>
                
                <div className="flex flex-col gap-4" style={{
                  marginTop: `${Math.pow(2, roundIndex - 1) * 60}px`
                }}>
                  {matches.map((match) => (
                    <div 
                      key={match.id} 
                      className="relative"
                      style={{
                        marginBottom: roundIndex > 0 ? `${Math.pow(2, roundIndex) * 60}px` : '0px'
                      }}
                    >
                      <MatchCard
                        match={match}
                        onSelectWinner={onSelectWinner}
                        onChangeWinner={onChangeWinner}
                        onUpdateReport={onUpdateReport}
                        isReadOnly={isReadOnly}
                      />
                      
                      {/* Connector lines */}
                      {round < tournament.totalRounds && (
                        <div className="absolute top-1/2 -right-8 w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {tournament.isComplete && tournament.winner && (
          <div className="mt-8 text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6 inline-block">
              <h2 className="text-3xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                🏆 Tournament Champion
              </h2>
              <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-300">
                {tournament.winner.name}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}