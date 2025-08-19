'use client';

import { useState, useEffect } from 'react';
import { Contestant, Tournament, TournamentPhase } from '@/types/tournament';
import { generateBracket, advanceWinner } from '@/lib/tournament';
import { saveTournament, autoSaveTournament, isStorageAvailable, SavedTournament, validateSavedTournament } from '@/lib/persistence';
import MainMenu from '@/components/MainMenu';
import SavedTournaments from '@/components/SavedTournaments';
import SaveTournamentDialog from '@/components/SaveTournamentDialog';
import ContestantInput from '@/components/ContestantInput';
import BracketGenerator from '@/components/BracketGenerator';
import BracketDisplay from '@/components/BracketDisplay';
import ManualBracketSetup from '@/components/ManualBracketSetup';

export default function Home() {
  const [phase, setPhase] = useState<TournamentPhase>('menu');
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentSaveName, setCurrentSaveName] = useState('');

  // Auto-save whenever tournament state changes
  useEffect(() => {
    if (tournament && phase === 'tournament' && isStorageAvailable()) {
      autoSaveTournament(tournament, phase, contestants);
    }
  }, [tournament, phase, contestants]);

  // Main menu handlers
  const handleNewTournament = () => {
    setPhase('setup');
    setContestants([]);
    setTournament(null);
    setCurrentSaveName('');
  };

  const handleLoadTournaments = () => {
    setPhase('saved-tournaments');
  };

  const handleLoadTournament = (saved: SavedTournament) => {
    if (validateSavedTournament(saved)) {
      setContestants(saved.contestants);
      setTournament(saved.tournament);
      setPhase(saved.phase);
      setCurrentSaveName(saved.name);
    } else {
      alert('This saved tournament appears to be corrupted and cannot be loaded.');
    }
  };

  const handleBackToMenu = () => {
    setPhase('menu');
  };

  // Tournament setup handlers
  const handleContestantsNext = () => {
    setPhase('bracket-generation');
  };

  const handleGenerateRandomBracket = () => {
    const newTournament = generateBracket(contestants, true);
    setTournament(newTournament);
    setPhase('tournament');
  };

  const handleGenerateManualBracket = () => {
    const newTournament = generateBracket(contestants, false);
    setTournament(newTournament);
    setPhase('tournament');
  };

  const handleManualSetup = () => {
    setPhase('manual-setup');
  };

  const handleManualConfirm = (orderedContestants: Contestant[]) => {
    const newTournament = generateBracket(orderedContestants, false);
    setTournament(newTournament);
    setPhase('tournament');
  };

  // Tournament match handlers
  const handleSelectWinner = (matchId: string, winner: Contestant) => {
    if (!tournament) return;
    
    const updatedTournament = advanceWinner(tournament, matchId, winner);
    setTournament(updatedTournament);
    
    if (updatedTournament.isComplete) {
      setPhase('complete');
    }
  };

  // Save/load handlers
  const handleSaveTournament = (name: string) => {
    if (tournament) {
      saveTournament(name, tournament, phase, contestants);
      setCurrentSaveName(name);
      setShowSaveDialog(false);
      alert('Tournament saved successfully!');
    }
  };

  const handleShowSaveDialog = () => {
    setShowSaveDialog(true);
  };

  // Navigation handlers
  const handleBackToSetup = () => {
    setPhase('setup');
  };

  const handleBackToBracketGeneration = () => {
    setPhase('bracket-generation');
  };

  const handleRestart = () => {
    setPhase('menu');
    setContestants([]);
    setTournament(null);
    setCurrentSaveName('');
  };

  const renderPhase = () => {
    switch (phase) {
      case 'menu':
        return (
          <MainMenu
            onNewTournament={handleNewTournament}
            onLoadTournaments={handleLoadTournaments}
          />
        );

      case 'saved-tournaments':
        return (
          <SavedTournaments
            onLoadTournament={handleLoadTournament}
            onBack={handleBackToMenu}
          />
        );

      case 'setup':
        return (
          <ContestantInput
            contestants={contestants}
            onContestantsChange={setContestants}
            onNext={handleContestantsNext}
            onBack={handleBackToMenu}
          />
        );
      
      case 'bracket-generation':
        return (
          <BracketGenerator
            contestants={contestants}
            onGenerateRandom={handleGenerateRandomBracket}
            onGenerateManual={handleGenerateManualBracket}
            onManualSetup={handleManualSetup}
            onBack={handleBackToSetup}
          />
        );
      
      case 'manual-setup':
        return (
          <ManualBracketSetup
            contestants={contestants}
            onConfirm={handleManualConfirm}
            onBack={handleBackToBracketGeneration}
          />
        );
      
      case 'tournament':
      case 'complete':
        return tournament ? (
          <div className="w-full">
            <BracketDisplay
              tournament={tournament}
              onSelectWinner={handleSelectWinner}
            />
            <div className="text-center mt-6 space-y-3">
              <div className="flex gap-4 justify-center flex-wrap">
                {isStorageAvailable() && (
                  <button
                    onClick={handleShowSaveDialog}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    💾 Save Tournament
                  </button>
                )}
                
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  🏠 Main Menu
                </button>
              </div>
              
              {currentSaveName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Currently loaded: <strong>{currentSaveName}</strong>
                </p>
              )}
            </div>
          </div>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {phase !== 'menu' && (
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              🏆 Tournament Runner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Single elimination tournament manager
            </p>
          </header>
        )}
        
        {renderPhase()}
        
        <SaveTournamentDialog
          isOpen={showSaveDialog}
          onSave={handleSaveTournament}
          onCancel={() => setShowSaveDialog(false)}
          defaultName={currentSaveName}
        />
      </div>
    </div>
  );
}
