import { Tournament, Contestant, TournamentPhase } from '@/types/tournament';

export interface SavedTournament {
  id: string;
  name: string;
  tournament: Tournament;
  phase: TournamentPhase;
  contestants: Contestant[];
  savedAt: string;
  lastModified: string;
}

const STORAGE_KEY = 'tournament-runner-saves';

export function saveTournament(
  name: string,
  tournament: Tournament,
  phase: TournamentPhase,
  contestants: Contestant[]
): SavedTournament {
  const savedTournament: SavedTournament = {
    id: tournament.id,
    name: name.trim() || `Tournament ${new Date().toLocaleDateString()}`,
    tournament,
    phase,
    contestants,
    savedAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  };

  const existingSaves = getSavedTournaments();
  const existingIndex = existingSaves.findIndex(save => save.id === tournament.id);
  
  if (existingIndex >= 0) {
    // Update existing save
    existingSaves[existingIndex] = {
      ...savedTournament,
      savedAt: existingSaves[existingIndex].savedAt, // Keep original save time
    };
  } else {
    // Add new save
    existingSaves.push(savedTournament);
  }

  // Keep only the 10 most recent saves to avoid storage bloat
  const sortedSaves = existingSaves
    .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
    .slice(0, 10);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedSaves));
  return savedTournament;
}

export function getSavedTournaments(): SavedTournament[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load saved tournaments:', error);
    return [];
  }
}

export function loadTournament(id: string): SavedTournament | null {
  const savedTournaments = getSavedTournaments();
  return savedTournaments.find(save => save.id === id) || null;
}

export function deleteSavedTournament(id: string): void {
  const savedTournaments = getSavedTournaments();
  const filtered = savedTournaments.filter(save => save.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function autoSaveTournament(
  tournament: Tournament,
  phase: TournamentPhase,
  contestants: Contestant[]
): void {
  // Auto-save with a special prefix to distinguish from manual saves
  const autoSaveName = `Auto-save: ${getProgressDescription(tournament, phase)}`;
  saveTournament(autoSaveName, tournament, phase, contestants);
}

function getProgressDescription(tournament: Tournament, phase: TournamentPhase): string {
  if (phase === 'setup' || phase === 'bracket-generation' || phase === 'manual-setup') {
    return 'Setup phase';
  }

  if (phase === 'complete') {
    return `Complete - Winner: ${tournament.winner?.name}`;
  }

  // Count completed matches
  const completedMatches = tournament.matches.filter(m => m.isFinished).length;
  const totalMatches = tournament.matches.length;
  const currentRound = Math.min(...tournament.matches
    .filter(m => !m.isFinished && m.contestant1 && m.contestant2)
    .map(m => m.round)) || tournament.totalRounds;

  return `Round ${currentRound} - ${completedMatches}/${totalMatches} matches complete`;
}

export function validateSavedTournament(saved: SavedTournament): boolean {
  try {
    return !!(
      saved.id &&
      saved.name &&
      saved.tournament &&
      saved.phase &&
      saved.contestants &&
      Array.isArray(saved.contestants) &&
      Array.isArray(saved.tournament.matches) &&
      saved.tournament.totalRounds > 0
    );
  } catch {
    return false;
  }
}

// Utility to check if localStorage is available
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}