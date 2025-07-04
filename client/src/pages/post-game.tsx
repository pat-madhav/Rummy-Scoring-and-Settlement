import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { getWinner } from "@/lib/game-utils";
import { Moon, Sun, Home, RotateCcw } from "lucide-react";
import type { GameState } from "@shared/schema";

interface PostGameScreenProps {
  gameId: string;
}

export default function PostGameScreen({ gameId }: PostGameScreenProps) {
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



  const handleGoHome = () => {
    setLocation("/");
  };

  const handlePlayAgain = () => {
    setLocation("/game-options");
  };

  if (gameStateQuery.isLoading || playersWithScoresQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading game summary...</div>
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
  const playersWithScores = playersWithScoresQuery.data;
  const winner = getWinner(playersWithScores);

  // Calculate game statistics
  const gameDuration = Math.floor(Math.random() * 60) + 30; // Mock duration for now
  const totalRounds = Math.max(...playersWithScores.map(p => p.scores.length));
  const bestRound = playersWithScores.reduce((best, player) => {
    const minScore = Math.min(...player.scores.map(s => s.score));
    return minScore < best.score ? { player: player.name, score: minScore } : best;
  }, { player: "", score: Infinity });

  const highestScore = Math.max(...playersWithScores.map(p => p.totalScore));
  const highestScorePlayer = playersWithScores.find(p => p.totalScore === highestScore);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">♠</span>
              </div>
            </div>
            
            {/* Centered page title - always visible */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                Game Summary
              </h1>
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

        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Game Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Game Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="font-medium text-gray-900 dark:text-white">{gameDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Rounds</span>
                  <span className="font-medium text-gray-900 dark:text-white">{totalRounds} rounds</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Players</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.playerCount} players</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Buy-in</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {game.currency}{game.buyInAmount || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Target Points</span>
                  <span className="font-medium text-gray-900 dark:text-white">{game.forPoints} points</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Player Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">Best Round</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {bestRound.player} ({bestRound.score} pts)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">Highest Score</span>
                  <span className="text-red-600 dark:text-red-400">
                    {highestScorePlayer?.name} ({highestScore} pts)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">Winner</span>
                  <span className="text-yellow-600 dark:text-yellow-400">
                    🏆 {winner?.name || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">Winning Score</span>
                  <span className="text-green-600 dark:text-green-400">
                    {playersWithScores.find(p => p.name === winner?.name)?.totalScore || 0} pts
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons with subtle fade effect */}
        <div className="sticky bottom-0 p-4 -mx-4">
          {/* Subtle fade gradient overlay - starts above button section */}
          <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
          <div className="flex space-x-4 relative">
            <Button
              onClick={handleGoHome}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px]"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              onClick={handlePlayAgain}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
