import type { GamePlayer, Game } from "@shared/schema";

export interface PlayerSettlement {
  playerId: number;
  playerName: string;
  finalScore: number;
  pointsLeft: number;
  packsRemaining: number;
  residualPoints: number;
  settlementAmount: number;
  isWinner: boolean;
}

export function calculateSettlement(
  playersWithScores: Array<{
    id: number;
    name: string;
    totalScore: number;
    pointsLeft: number;
    packsRemaining: number;
    residualPoints: number;
  }>,
  game: Game
): PlayerSettlement[] {
  if (playersWithScores.length === 0) return [];

  const lowestScore = Math.min(...playersWithScores.map(p => p.totalScore));
  const buyInAmount = parseFloat(game.buyInAmount || "0");
  
  // Calculate settlement amounts
  const settlements: PlayerSettlement[] = playersWithScores.map(player => {
    const isWinner = player.totalScore === lowestScore;
    let settlementAmount = 0;

    if (buyInAmount > 0) {
      if (isWinner) {
        // Winner gets the sum of all other players' payments
        const totalPayments = playersWithScores
          .filter(p => p.id !== player.id)
          .reduce((sum, otherPlayer) => {
            const excessPacks = Math.max(0, Math.floor((otherPlayer.totalScore - lowestScore) / game.packPoints));
            return sum + (excessPacks * buyInAmount);
          }, 0);
        settlementAmount = totalPayments;
      } else {
        // Others pay based on their excess packs
        const excessPacks = Math.max(0, Math.floor((player.totalScore - lowestScore) / game.packPoints));
        settlementAmount = -(excessPacks * buyInAmount);
      }
    }

    return {
      playerId: player.id,
      playerName: player.name,
      finalScore: player.totalScore,
      pointsLeft: player.pointsLeft,
      packsRemaining: player.packsRemaining,
      residualPoints: player.residualPoints,
      settlementAmount,
      isWinner,
    };
  });

  // Ensure the settlement balances out (sum should be approximately zero)
  const totalSettlement = settlements.reduce((sum, s) => sum + s.settlementAmount, 0);
  if (Math.abs(totalSettlement) > 0.01) {
    // Adjust the winner's amount to balance
    const winner = settlements.find(s => s.isWinner);
    if (winner) {
      winner.settlementAmount -= totalSettlement;
    }
  }

  return settlements;
}

export function getSettlementSummary(settlements: PlayerSettlement[]) {
  const winner = settlements.find(s => s.isWinner);
  const totalMoney = settlements.reduce((sum, s) => sum + Math.abs(s.settlementAmount), 0) / 2; // Divide by 2 as each transaction is counted twice
  const maxLoss = Math.min(...settlements.map(s => s.settlementAmount));
  const maxGain = Math.max(...settlements.map(s => s.settlementAmount));

  return {
    winner: winner?.playerName || "Unknown",
    totalMoney,
    maxLoss: Math.abs(maxLoss),
    maxGain,
    playerCount: settlements.length,
  };
}
