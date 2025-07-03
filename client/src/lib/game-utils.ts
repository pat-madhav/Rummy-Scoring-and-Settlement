import type { GamePlayer, GameScore, Game } from "@shared/schema";

export function calculatePlayerStats(
  player: GamePlayer,
  scores: GameScore[],
  game: Game
) {
  const playerScores = scores.filter(score => score.playerId === player.id);
  const totalScore = playerScores.reduce((sum, score) => sum + score.score, 0);
  const pointsLeft = Math.max(0, game.forPoints - totalScore);
  const packsRemaining = Math.floor(pointsLeft / game.packPoints);
  const residualPoints = pointsLeft % game.packPoints;

  return {
    totalScore,
    pointsLeft,
    packsRemaining,
    residualPoints,
  };
}

export function calculatePacksPerGame(forPoints: number, packPoints: number): number {
  return Math.floor((forPoints - 1) / packPoints);
}

export function validateReEntryConditions(
  activePlayers: GamePlayer[],
  playersWithScores: Array<{
    player: GamePlayer;
    packsRemaining: number;
  }>
): { isValid: boolean; reason?: string } {
  // Rule 1: At least 3 players must be active
  if (activePlayers.length < 3) {
    return {
      isValid: false,
      reason: "At least 3 players must be active for re-entry",
    };
  }

  // Rule 2: There must be at least one pack remaining in the top score of remaining players
  const maxPacksRemaining = Math.max(...playersWithScores.map(p => p.packsRemaining));
  if (maxPacksRemaining < 1) {
    return {
      isValid: false,
      reason: "No packs remaining for re-entry",
    };
  }

  return { isValid: true };
}

export function formatCurrency(amount: number | string, currency: string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `${currency}0`;
  
  const formatted = Math.abs(numAmount).toFixed(2);
  const sign = numAmount >= 0 ? "+" : "-";
  return `${sign}${currency}${formatted}`;
}

export function getWinner(
  playersWithScores: Array<{
    player: GamePlayer;
    totalScore: number;
  }>
): GamePlayer | null {
  if (playersWithScores.length === 0) return null;
  
  const lowestScore = Math.min(...playersWithScores.map(p => p.totalScore));
  const winner = playersWithScores.find(p => p.totalScore === lowestScore);
  
  return winner?.player || null;
}

export function isGameComplete(
  playersWithScores: Array<{
    player: GamePlayer;
    totalScore: number;
    pointsLeft: number;
  }>,
  forPoints: number
): boolean {
  // Game is complete if any player has reached or exceeded the target points
  return playersWithScores.some(p => p.totalScore >= forPoints);
}

export function shouldShowSettlement(
  activePlayers: GamePlayer[]
): boolean {
  // Settlement can be shown when max 4 players are remaining
  return activePlayers.length <= 4;
}
