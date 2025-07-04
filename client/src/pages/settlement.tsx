import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { calculateSettlement, getSettlementSummary } from "@/lib/settlement-algorithm";
import { formatCurrency } from "@/lib/game-utils";
import { Moon, Sun, Home, Share2, Trophy } from "lucide-react";
import type { GameState } from "@shared/schema";

interface SettlementScreenProps {
  gameId: string;
}

export default function SettlementScreen({ gameId }: SettlementScreenProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const gameStateQuery = useQuery({
    queryKey: ["/api/games", gameId, "state"],
    enabled: !!gameId,
  });

  const playersWithScoresQuery = useQuery({
    queryKey: ["/api/games", gameId, "players-with-scores"],
    enabled: !!gameId,
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNewGame = () => {
    setLocation("/");
  };

  const handleShareResults = () => {
    if (!gameStateQuery.data || !playersWithScoresQuery.data) return;

    const { game } = gameStateQuery.data;
    const settlements = calculateSettlement(playersWithScoresQuery.data, game);
    const summary = getSettlementSummary(settlements);

    const resultText = `Rummy Game Results 🎯\n\n🏆 Winner: ${summary.winner}\n\nFinal Scores:\n${settlements
      .map((s) => `${s.playerName}: ${s.finalScore} pts ${s.isWinner ? "🏆" : ""}`)
      .join("\n")}\n\nMoney Distribution:\n${settlements
      .map((s) => `${s.playerName}: ${formatCurrency(s.settlementAmount, game.currency)}`)
      .join("\n")}\n\nGame played with Rummy Scorer 🃏`;

    if (navigator.share) {
      navigator.share({
        title: "Rummy Game Results",
        text: resultText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(resultText);
      alert("Results copied to clipboard!");
    }
  };

  if (gameStateQuery.isLoading || playersWithScoresQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading settlement...</div>
      </div>
    );
  }

  if (!gameStateQuery.data || !playersWithScoresQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">Game not found</div>
      </div>
    );
  }

  const { game } = gameStateQuery.data;
  const settlements = calculateSettlement(playersWithScoresQuery.data, game);
  const summary = getSettlementSummary(settlements);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">♠</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rummy Scorer</h1>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Game Settlement</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Final Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Final Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settlements.map((settlement) => (
                  <div
                    key={settlement.playerId}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                      {settlement.playerName}
                      {settlement.isWinner && <Trophy className="w-4 h-4 ml-2 text-yellow-500" />}
                    </span>
                    <span className={`text-lg font-bold ${
                      settlement.isWinner
                        ? "text-green-600 dark:text-green-400"
                        : settlement.finalScore > 60
                        ? "text-red-600 dark:text-red-400"
                        : "text-orange-600 dark:text-orange-400"
                    }`}>
                      {settlement.finalScore} pts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Money Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Money Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settlements.map((settlement) => (
                  <div
                    key={settlement.playerId}
                    className={`flex justify-between items-center p-3 rounded-lg border ${
                      settlement.settlementAmount >= 0
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">
                      {settlement.playerName}
                    </span>
                    <span className={`text-lg font-bold ${
                      settlement.settlementAmount >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {formatCurrency(settlement.settlementAmount, game.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Settlement calculated based on pack differences and buy-in amount
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winner Celebration */}
        <div className="mt-8 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-6 text-center border border-yellow-200 dark:border-yellow-700">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">Congratulations!</h3>
          <p className="text-lg text-yellow-700 dark:text-yellow-300">
            <span className="font-semibold">{summary.winner}</span> wins with the lowest score!
          </p>
          <div className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
            Total Money: {formatCurrency(summary.totalMoney, game.currency)} • Players: {summary.playerCount}
          </div>
        </div>

        {/* Add spacing before buttons */}
        <div className="h-16"></div>

        {/* Action Buttons with subtle fade effect */}
        <div className="sticky bottom-0 p-4 -mx-4">
          {/* Subtle fade gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/60 via-gray-50/30 to-transparent dark:from-gray-900 dark:via-gray-900/60 dark:via-gray-900/30 dark:to-transparent pointer-events-none h-24"></div>
          <div className="flex space-x-4 relative">
            <Button
              onClick={handleNewGame}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Home className="w-4 h-4 mr-2" />
              New Game
            </Button>
            <Button
              onClick={handleShareResults}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
