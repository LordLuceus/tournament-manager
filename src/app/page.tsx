"use client";

import BracketDisplay from "@/components/BracketDisplay";
import BracketGenerator from "@/components/BracketGenerator";
import ContestantInput from "@/components/ContestantInput";
import MainMenu from "@/components/MainMenu";
import ManualBracketSetup from "@/components/ManualBracketSetup";
import SavedTournaments from "@/components/SavedTournaments";
import SaveTournamentDialog from "@/components/SaveTournamentDialog";
import {
  autoSaveTournament,
  isStorageAvailable,
  SavedTournament,
  saveTournament,
  validateSavedTournament,
} from "@/lib/persistence";
import { advanceWinner, changeMatchWinner, generateBracket } from "@/lib/tournament";
import { Contestant, Tournament, TournamentPhase } from "@/types/tournament";
import { useEffect, useState } from "react";

export default function Home() {
  const [phase, setPhase] = useState<TournamentPhase>("menu");
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [currentSaveName, setCurrentSaveName] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Auto-save whenever tournament state changes
  useEffect(() => {
    if (tournament && phase === "tournament" && isStorageAvailable()) {
      autoSaveTournament(tournament, phase, contestants);
    }
  }, [tournament, phase, contestants]);

  // Main menu handlers
  const handleNewTournament = () => {
    setPhase("setup");
    setContestants([]);
    setTournament(null);
    setCurrentSaveName("");
  };

  const handleLoadTournaments = () => {
    setPhase("saved-tournaments");
  };

  const handleLoadTournament = (saved: SavedTournament) => {
    if (validateSavedTournament(saved)) {
      setContestants(saved.contestants);
      setTournament(saved.tournament);
      setPhase(saved.phase);
      setCurrentSaveName(saved.name);
    } else {
      alert(
        "This saved tournament appears to be corrupted and cannot be loaded."
      );
    }
  };

  const handleBackToMenu = () => {
    setPhase("menu");
  };

  // Tournament setup handlers
  const handleContestantsNext = () => {
    setPhase("bracket-generation");
  };

  const handleGenerateRandomBracket = () => {
    const newTournament = generateBracket(contestants, true);
    setTournament(newTournament);
    setPhase("tournament");
  };

  const handleGenerateManualBracket = () => {
    const newTournament = generateBracket(contestants, false);
    setTournament(newTournament);
    setPhase("tournament");
  };

  const handleManualSetup = () => {
    setPhase("manual-setup");
  };

  const handleManualConfirm = (orderedContestants: Contestant[]) => {
    const newTournament = generateBracket(orderedContestants, false);
    setTournament(newTournament);
    setPhase("tournament");
  };

  // Tournament match handlers
  const handleSelectWinner = (matchId: string, winner: Contestant) => {
    if (!tournament) return;

    const updatedTournament = advanceWinner(tournament, matchId, winner);
    setTournament(updatedTournament);

    if (updatedTournament.isComplete) {
      setPhase("complete");
    }
  };

  const handleChangeWinner = (matchId: string, newWinner: Contestant) => {
    if (!tournament) return;

    const updatedTournament = changeMatchWinner(tournament, matchId, newWinner);
    setTournament(updatedTournament);

    // Update tournament completion status
    if (updatedTournament.isComplete) {
      setPhase("complete");
    } else if (phase === "complete" && !updatedTournament.isComplete) {
      setPhase("tournament");
    }
  };

  const handleUpdateReport = (matchId: string, report: string) => {
    if (!tournament) return;

    const updatedMatches = tournament.matches.map(match =>
      match.id === matchId
        ? { ...match, report: report.trim() || undefined }
        : match
    );

    const updatedTournament = {
      ...tournament,
      matches: updatedMatches
    };

    setTournament(updatedTournament);
  };

  // Save/load handlers
  const handleSaveTournament = (name: string) => {
    if (tournament) {
      saveTournament(name, tournament, phase, contestants);
      setCurrentSaveName(name);
      setShowSaveDialog(false);
      alert("Tournament saved successfully!");
    }
  };

  const handleShowSaveDialog = () => {
    setShowSaveDialog(true);
  };

  const handleShareTournament = async () => {
    if (!tournament || !tournament.isComplete) return;

    setIsSharing(true);
    try {
      const response = await fetch('/api/tournament/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tournament),
      });

      if (!response.ok) {
        throw new Error('Failed to share tournament');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
    } catch (error) {
      console.error('Error sharing tournament:', error);
      alert('Failed to share tournament. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Tournament link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Navigation handlers
  const handleBackToSetup = () => {
    setPhase("setup");
  };

  const handleBackToBracketGeneration = () => {
    setPhase("bracket-generation");
  };

  const handleRestart = () => {
    setPhase("menu");
    setContestants([]);
    setTournament(null);
    setCurrentSaveName("");
  };

  const renderPhase = () => {
    switch (phase) {
      case "menu":
        return (
          <MainMenu
            onNewTournament={handleNewTournament}
            onLoadTournaments={handleLoadTournaments}
          />
        );

      case "saved-tournaments":
        return (
          <SavedTournaments
            onLoadTournament={handleLoadTournament}
            onBack={handleBackToMenu}
          />
        );

      case "setup":
        return (
          <ContestantInput
            contestants={contestants}
            onContestantsChange={setContestants}
            onNext={handleContestantsNext}
            onBack={handleBackToMenu}
          />
        );

      case "bracket-generation":
        return (
          <BracketGenerator
            contestants={contestants}
            onGenerateRandom={handleGenerateRandomBracket}
            onGenerateManual={handleGenerateManualBracket}
            onManualSetup={handleManualSetup}
            onBack={handleBackToSetup}
          />
        );

      case "manual-setup":
        return (
          <ManualBracketSetup
            contestants={contestants}
            onConfirm={handleManualConfirm}
            onBack={handleBackToBracketGeneration}
          />
        );

      case "tournament":
      case "complete":
        return tournament ? (
          <div className="w-full">
            <BracketDisplay
              tournament={tournament}
              onSelectWinner={handleSelectWinner}
              onChangeWinner={handleChangeWinner}
              onUpdateReport={handleUpdateReport}
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

                {tournament.isComplete && (
                  shareUrl ? (
                    <button
                      onClick={handleCopyShareLink}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      🔗 Copy Share Link
                    </button>
                  ) : (
                    <button
                      onClick={handleShareTournament}
                      disabled={isSharing}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors font-medium"
                    >
                      {isSharing ? '⏳ Sharing...' : '🌐 Share Tournament'}
                    </button>
                  )
                )}

                <button
                  onClick={handleRestart}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  🏠 Main Menu
                </button>
              </div>

              {shareUrl && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 max-w-2xl mx-auto">
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    🎉 Tournament shared successfully!
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded p-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none text-gray-700 dark:text-gray-300"
                    />
                    <button
                      onClick={handleCopyShareLink}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

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
        {phase !== "menu" && (
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
              🏆 Tournament Manager
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
