export interface Contestant {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  contestant1?: Contestant;
  contestant2?: Contestant;
  winner?: Contestant;
  isFinished: boolean;
  isBye: boolean;
}

export interface Tournament {
  id: string;
  contestants: Contestant[];
  matches: Match[];
  currentRound: number;
  totalRounds: number;
  isComplete: boolean;
  winner?: Contestant;
}

export type TournamentPhase = 'menu' | 'saved-tournaments' | 'setup' | 'bracket-generation' | 'manual-setup' | 'tournament' | 'complete';