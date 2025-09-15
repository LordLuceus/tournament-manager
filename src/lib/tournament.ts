import { Contestant, Match, Tournament } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

export function generateBracket(contestants: Contestant[], isRandom: boolean = true): Tournament {
  if (contestants.length < 2) {
    throw new Error('Tournament requires at least 2 contestants');
  }

  const shuffledContestants = isRandom ? shuffleArray([...contestants]) : [...contestants];
  const totalRounds = Math.ceil(Math.log2(contestants.length));
  
  const matches: Match[] = [];
  let matchId = 1;

  for (let round = 1; round <= totalRounds; round++) {
    const matchesInRound = Math.pow(2, totalRounds - round);
    
    for (let position = 0; position < matchesInRound; position++) {
      const match: Match = {
        id: `match-${matchId++}`,
        round,
        position,
        isFinished: false,
        isBye: false,
      };

      if (round === 1) {
        const contestant1Index = position * 2;
        const contestant2Index = position * 2 + 1;

        match.contestant1 = shuffledContestants[contestant1Index] || undefined;
        match.contestant2 = shuffledContestants[contestant2Index] || undefined;

        if (!match.contestant2 && match.contestant1) {
          match.isBye = true;
          match.winner = match.contestant1;
          match.isFinished = true;
        }
      }

      matches.push(match);
    }
  }

  return {
    id: uuidv4(),
    contestants: shuffledContestants,
    matches,
    currentRound: 1,
    totalRounds,
    isComplete: false,
  };
}

export function advanceWinner(tournament: Tournament, matchId: string, winner: Contestant): Tournament {
  const updatedMatches = [...tournament.matches];

  // Update the current match with the winner
  const currentMatchIndex = updatedMatches.findIndex(m => m.id === matchId);
  if (currentMatchIndex === -1) return tournament;

  updatedMatches[currentMatchIndex] = {
    ...updatedMatches[currentMatchIndex],
    winner,
    isFinished: true
  };

  const currentMatch = updatedMatches[currentMatchIndex];
  const nextRound = currentMatch.round + 1;

  // If there's a next round, advance the winner
  if (nextRound <= tournament.totalRounds) {
    const nextMatchPosition = Math.floor(currentMatch.position / 2);
    const nextMatchIndex = updatedMatches.findIndex(
      m => m.round === nextRound && m.position === nextMatchPosition
    );

    if (nextMatchIndex !== -1) {
      const nextMatch = updatedMatches[nextMatchIndex];
      const isFirstSlot = currentMatch.position % 2 === 0;
      
      // Update the next match with the winner
      const updatedNextMatch = {
        ...nextMatch,
        [isFirstSlot ? 'contestant1' : 'contestant2']: winner,
      };

      updatedMatches[nextMatchIndex] = updatedNextMatch;

      // Check if both contestants are now present - if so, the match is ready
      // Don't create automatic byes unless one contestant is actually missing
      const { contestant1, contestant2 } = updatedNextMatch;
      if (contestant1 && contestant2) {
        // Match is ready for play - do nothing special
      } else if (contestant1 && !contestant2) {
        // Wait for contestant2 to be determined from other matches
        // Only create a bye if we're sure no more contestants are coming
        const otherMatchesInPreviousRound = updatedMatches.filter(m => 
          m.round === nextRound - 1 && 
          Math.floor(m.position / 2) === nextMatchPosition
        );
        const allOtherMatchesFinished = otherMatchesInPreviousRound.every(m => m.isFinished);
        
        if (allOtherMatchesFinished && otherMatchesInPreviousRound.length === 1) {
          // This was the only match feeding into this position, create a bye
          updatedMatches[nextMatchIndex] = {
            ...updatedNextMatch,
            isBye: true,
            winner: contestant1,
            isFinished: true,
          };
        }
      } else if (!contestant1 && contestant2) {
        // Wait for contestant1 to be determined from other matches
        const otherMatchesInPreviousRound = updatedMatches.filter(m => 
          m.round === nextRound - 1 && 
          Math.floor(m.position / 2) === nextMatchPosition
        );
        const allOtherMatchesFinished = otherMatchesInPreviousRound.every(m => m.isFinished);
        
        if (allOtherMatchesFinished && otherMatchesInPreviousRound.length === 1) {
          // This was the only match feeding into this position, create a bye
          updatedMatches[nextMatchIndex] = {
            ...updatedNextMatch,
            isBye: true,
            winner: contestant2,
            isFinished: true,
          };
        }
      }
    }
  }

  // Check if tournament is complete
  const finalMatch = updatedMatches.find(m => m.round === tournament.totalRounds);
  const isComplete = finalMatch?.isFinished || false;
  const tournamentWinner = isComplete ? finalMatch?.winner : undefined;

  return {
    ...tournament,
    matches: updatedMatches,
    isComplete,
    winner: tournamentWinner,
  };
}

export function changeMatchWinner(tournament: Tournament, matchId: string, newWinner: Contestant): Tournament {
  const updatedMatches = [...tournament.matches];

  // Find the match to change
  const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
  if (matchIndex === -1) return tournament;

  const match = updatedMatches[matchIndex];

  // Verify the new winner is one of the contestants in this match
  if (match.contestant1?.id !== newWinner.id && match.contestant2?.id !== newWinner.id) {
    return tournament;
  }

  // If the winner is the same, no change needed
  if (match.winner?.id === newWinner.id) {
    return tournament;
  }

  // Update the match with the new winner
  updatedMatches[matchIndex] = {
    ...match,
    winner: newWinner,
  };

  // Need to cascade the change to subsequent rounds
  // First, remove the old winner from subsequent rounds
  const nextRound = match.round + 1;

  if (nextRound <= tournament.totalRounds) {
    const nextMatchPosition = Math.floor(match.position / 2);
    const nextMatchIndex = updatedMatches.findIndex(
      m => m.round === nextRound && m.position === nextMatchPosition
    );

    if (nextMatchIndex !== -1) {
      const nextMatch = updatedMatches[nextMatchIndex];
      const isFirstSlot = match.position % 2 === 0;

      // Replace the contestant in the next match
      const updatedNextMatch = {
        ...nextMatch,
        [isFirstSlot ? 'contestant1' : 'contestant2']: newWinner,
      };

      // Reset subsequent matches if they were finished
      if (nextMatch.isFinished) {
        updatedNextMatch.winner = undefined;
        updatedNextMatch.isFinished = false;
        updatedNextMatch.isBye = false;

        // Recursively reset all matches that were affected by this change
        resetSubsequentMatches(updatedMatches, nextMatch.round, nextMatch.position, tournament.totalRounds);
      }

      updatedMatches[nextMatchIndex] = updatedNextMatch;
    }
  }

  // Recalculate tournament completion status
  const finalMatch = updatedMatches.find(m => m.round === tournament.totalRounds);
  const isComplete = finalMatch?.isFinished || false;
  const tournamentWinner = isComplete ? finalMatch?.winner : undefined;

  return {
    ...tournament,
    matches: updatedMatches,
    isComplete,
    winner: tournamentWinner,
  };
}

function resetSubsequentMatches(matches: Match[], startRound: number, startPosition: number, totalRounds: number): void {
  // Reset all matches that were affected by the winner change
  for (let round = startRound + 1; round <= totalRounds; round++) {
    const position = Math.floor(startPosition / Math.pow(2, round - startRound));
    const matchIndex = matches.findIndex(m => m.round === round && m.position === position);

    if (matchIndex !== -1 && matches[matchIndex].isFinished) {
      matches[matchIndex] = {
        ...matches[matchIndex],
        winner: undefined,
        isFinished: false,
        isBye: false,
        // Clear contestants if they came from the changed path
      };

      // Clear the contestant slot that would have been filled by this match
      if (round < totalRounds) {
        const nextPosition = Math.floor(position / 2);
        const nextMatchIndex = matches.findIndex(m => m.round === round + 1 && m.position === nextPosition);
        if (nextMatchIndex !== -1) {
          const isFirstSlot = position % 2 === 0;
          matches[nextMatchIndex] = {
            ...matches[nextMatchIndex],
            [isFirstSlot ? 'contestant1' : 'contestant2']: undefined,
          };
        }
      }
    } else {
      break; // If this match wasn't finished, subsequent ones weren't affected
    }
  }
}

export function getMatchesByRound(tournament: Tournament, round: number): Match[] {
  return tournament.matches.filter(match => match.round === round);
}

export function getActiveMatches(tournament: Tournament): Match[] {
  return tournament.matches.filter(match => 
    !match.isFinished && 
    match.contestant1 && 
    match.contestant2 &&
    !match.isBye
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}