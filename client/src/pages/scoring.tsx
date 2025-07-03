import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculatePlayerStats, validateReEntryConditions, shouldShowSettlement } from "@/lib/game-utils";
import { ReEntryModal } from "@/components/re-entry-modal";
import { Moon, Sun, X, Calculator, RotateCcw, ChevronDown } from "lucide-react";
import type { GameState, PlayerWithScores } from "@shared/schema";

interface ScoringScreenProps {
  gameId: string;
}

export default function ScoringScreen({ gameId }: ScoringScreenProps) {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [scores, setScores] = useState<Record<number, Record<number, string>>>({}); // playerId -> roundNumber -> score
  const [currentRound, setCurrentRound] = useState(1);
  const [showReEntryModal, setShowReEntryModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithScores | null>(null);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [hoveredRound, setHoveredRound] = useState<number | null>(null);

  const gameStateQuery = useQuery({
    queryKey: [`/api/games/${gameId}/state`],
    enabled: !!gameId,
  });

  const playersWithScoresQuery = useQuery({
    queryKey: [`/api/games/${gameId}/players-with-scores`],
    enabled: !!gameId,
  });

  const createScoreMutation = useMutation({
    mutationFn: async ({ playerId, roundId, score }: { playerId: number, roundId: number, score: number }) => {
      const response = await apiRequest("POST", `/api/games/${gameId}/scores`, {
        playerId,
        roundId,
        score,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    },
  });

  const updatePlayerStatusMutation = useMutation({
    mutationFn: async ({ playerId, isActive, hasReEntered }: { playerId: number, isActive: boolean, hasReEntered?: boolean }) => {
      const response = await apiRequest("PUT", `/api/players/${playerId}/status`, {
        isActive,
        hasReEntered,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    },
  });

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleScoreChange = (playerId: number, roundNumber: number, score: string) => {
    // Validate score against full count setting
    const numScore = parseInt(score);
    if (!isNaN(numScore) && score !== "") {
      const maxScore = game.fullCountPoints === 80 ? 80 : game.forPoints;
      if (numScore > maxScore) {
        toast({
          title: "Invalid Score",
          description: "You are entering a score that is greater than full count",
          variant: "destructive",
        });
        return;
      }
    }

    setScores(prev => {
      const newScores = {
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [roundNumber]: score,
        },
      };
      
      // Check if current round is complete (all players have entered scores)
      if (roundNumber === currentRound) {
        const currentRoundScores = Object.keys(newScores).reduce((acc, playerIdStr) => {
          const playerScore = newScores[playerIdStr]?.[roundNumber];
          if (playerScore && playerScore !== "") {
            acc[playerIdStr] = playerScore;
          }
          return acc;
        }, {} as Record<string, string>);
        
        // If all active players have entered scores for current round, validate and advance
        const activePlayers = players?.filter(p => p.isActive) || [];
        if (activePlayers.length > 0 && Object.keys(currentRoundScores).length === activePlayers.length) {
          // Validate minimum 1 Rummy rule
          const hasRummy = Object.values(currentRoundScores).some(scoreStr => parseInt(scoreStr) === 0);
          if (!hasRummy) {
            toast({
              title: "Invalid Round",
              description: "At least one player must have a Rummy (0 points) in each round",
              variant: "destructive",
            });
            return prev;
          }
          
          setCurrentRound(prev => prev + 1);
        }
      }
      
      return newScores;
    });
  };

  const handleReEntryClick = (player: PlayerWithScores) => {
    if (!gameStateQuery.data?.game.reEntryAllowed) {
      toast({
        title: "Re-entry Not Allowed",
        description: "Re-entry is disabled for this game",
        variant: "destructive",
      });
      return;
    }

    const activePlayers = gameStateQuery.data?.players.filter(p => p.isActive) || [];
    const validation = validateReEntryConditions(activePlayers, playersWithScoresQuery.data?.map(p => ({ player: p, packsRemaining: p.packsRemaining })) || []);
    
    if (!validation.isValid) {
      toast({
        title: "Re-entry Not Allowed",
        description: validation.reason,
        variant: "destructive",
      });
      return;
    }

    setSelectedPlayer(player);
    setShowReEntryModal(true);
  };

  const handleReEntryConfirm = async () => {
    if (!selectedPlayer) return;

    try {
      await updatePlayerStatusMutation.mutateAsync({
        playerId: selectedPlayer.id,
        isActive: true,
        hasReEntered: true,
      });

      toast({
        title: "Re-entry Confirmed",
        description: `${selectedPlayer.name} has re-entered the game`,
      });

      setShowReEntryModal(false);
      setSelectedPlayer(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process re-entry",
        variant: "destructive",
      });
    }
  };

  const handleCloseGame = () => {
    if (confirm("Are you sure you want to close the current game? All progress will be lost.")) {
      setLocation("/");
    }
  };

  const handleRestartGame = () => {
    if (confirm("Are you sure you want to restart the game? All scores will be reset.")) {
      setLocation("/player-names");
    }
  };

  const handleSettleGame = () => {
    if (!gameStateQuery.data) return;

    const activePlayers = gameStateQuery.data.players.filter(p => p.isActive);
    if (!shouldShowSettlement(activePlayers)) {
      toast({
        title: "Cannot Settle Game",
        description: "Settlement is only available when 4 or fewer players remain",
        variant: "destructive",
      });
      return;
    }

    setLocation(`/settlement/${gameId}`);
  };

  if (gameStateQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading game...</div>
      </div>
    );
  }

  if (gameStateQuery.isError || !gameStateQuery.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg text-red-600 dark:text-red-400">
          {gameStateQuery.isError ? "Error loading game" : "Game not found"}
        </div>
      </div>
    );
  }

  const { game, players } = gameStateQuery.data;
  const playersWithScores = playersWithScoresQuery.data || [];
  
  // Calculate current totals from scores state
  const calculatePlayerTotal = (playerId: number) => {
    const playerScores = scores[playerId] || {};
    return Object.values(playerScores).reduce((total, score) => {
      const numScore = typeof score === 'string' ? parseInt(score) || 0 : score;
      return total + numScore;
    }, 0);
  };
  
  const calculatePointsLeft = (playerId: number) => {
    const total = calculatePlayerTotal(playerId);
    return Math.max(0, game.forPoints - total);
  };
  
  const calculatePacksRemaining = (playerId: number) => {
    const pointsLeft = calculatePointsLeft(playerId);
    return Math.floor(pointsLeft / game.packPoints);
  };
  
  const calculateResidualPoints = (playerId: number) => {
    const pointsLeft = calculatePointsLeft(playerId);
    return pointsLeft % game.packPoints;
  };

  const handleScoreOption = (playerId: number, roundNumber: number, option: string) => {
    let score: string;
    
    switch (option) {
      case "rummy":
        score = "0";
        break;
      case "pack":
        score = game.packPoints.toString();
        break;
      case "mid-pack":
        score = game.midPackPoints.toString();
        break;
      case "full-count":
        score = game.fullCountPoints.toString();
        break;
      default:
        return;
    }
    
    handleScoreChange(playerId, roundNumber, score);
  };

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
            
            <div className="flex items-center space-x-4">
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
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseGame}
                className="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Scoring</h2>
        </div>

        {/* Re-entry notification */}
        {game.reEntryAllowed && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Re-entry allowed only if:</span> (1) At least 3 players are playing, (2) There's at least one pack remaining in the top score of remaining players
            </p>
          </div>
        )}

        {/* Scoring Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Round</th>
                    {players.map((player) => (
                      <th key={player.id} className="px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white min-w-24">
                        <div>{player.name}</div>
                        {game.reEntryAllowed && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              const playerWithScores = playersWithScores.find(p => p.id === player.id);
                              if (playerWithScores) {
                                handleReEntryClick(playerWithScores);
                              }
                            }}
                            className="mt-1 text-xs"
                          >
                            Re-Entry
                          </Button>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                  {/* Completed rounds */}
                  {Array.from({ length: currentRound - 1 }, (_, index) => {
                    const roundNumber = index + 1;
                    const isEditing = editingRound === roundNumber;
                    
                    return (
                      <tr 
                        key={roundNumber} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group"
                        onMouseEnter={() => setHoveredRound(roundNumber)}
                        onMouseLeave={() => setHoveredRound(null)}
                        onClick={() => setHoveredRound(roundNumber)} // For mobile tap
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white relative">
                          {roundNumber}
                          {/* Edit button - appears on hover/tap */}
                          {(hoveredRound === roundNumber || isEditing) && (
                            <Button
                              size="sm"
                              className="absolute -right-2 top-1/2 transform -translate-y-1/2 bg-orange-400 hover:bg-orange-500 text-white text-xs px-2 py-1 h-6 rounded-full shadow-md transition-all duration-200 border-2 border-white dark:border-gray-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRound(isEditing ? null : roundNumber);
                              }}
                            >
                              {isEditing ? "Save" : "Edit"}
                            </Button>
                          )}
                        </td>
                        {players.map((player) => {
                          const savedScore = scores[player.id]?.[roundNumber];
                          const displayScore = savedScore ? parseInt(savedScore) : 0;
                          return (
                            <td key={player.id} className="px-4 py-3">
                              {isEditing ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Input
                                      type="number"
                                      placeholder="Enter Score"
                                      value={savedScore || ""}
                                      onChange={(e) => handleScoreChange(player.id, roundNumber, e.target.value)}
                                      className="w-full text-center h-8 cursor-pointer"
                                    />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="center">
                                    <DropdownMenuItem
                                      onClick={() => handleScoreOption(player.id, roundNumber, "rummy")}
                                    >
                                      Rummy (0)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleScoreOption(player.id, roundNumber, "pack")}
                                    >
                                      Pack ({game.packPoints})
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleScoreOption(player.id, roundNumber, "mid-pack")}
                                    >
                                      Mid-Pack ({game.midPackPoints})
                                    </DropdownMenuItem>
                                    {game.fullCountPoints === 80 && (
                                      <DropdownMenuItem
                                        onClick={() => handleScoreOption(player.id, roundNumber, "full-count")}
                                      >
                                        Full-Count ({game.fullCountPoints})
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : (
                                <div className="w-full text-center py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded border">
                                  {displayScore}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  
                  {/* Current round input - only one empty row */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-blue-50 dark:bg-blue-900/10">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{currentRound}</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Input
                              type="number"
                              placeholder="Enter Score"
                              value={scores[player.id]?.[currentRound] || ""}
                              onChange={(e) => handleScoreChange(player.id, currentRound, e.target.value)}
                              className="w-full text-center h-10 cursor-pointer"
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center">
                            <DropdownMenuItem
                              onClick={() => handleScoreOption(player.id, currentRound, "rummy")}
                            >
                              Rummy (0)
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleScoreOption(player.id, currentRound, "pack")}
                            >
                              Pack ({game.packPoints})
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleScoreOption(player.id, currentRound, "mid-pack")}
                            >
                              Mid-Pack ({game.midPackPoints})
                            </DropdownMenuItem>
                            {game.fullCountPoints === 80 && (
                              <DropdownMenuItem
                                onClick={() => handleScoreOption(player.id, currentRound, "full-count")}
                              >
                                Full-Count ({game.fullCountPoints})
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    ))}
                  </tr>
                </tbody>
                
                {/* Summary Rows */}
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr className="font-semibold">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">Total</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center text-gray-900 dark:text-white">
                        {calculatePlayerTotal(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Points left</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {calculatePointsLeft(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Packs rmng</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-gray-700 dark:text-gray-300">
                            {calculatePacksRemaining(player.id)}
                          </span>
                          <ChevronDown className="w-3 h-3 text-gray-400 mt-1" />
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">Residual points rmng</td>
                    {players.map((player) => (
                      <td key={player.id} className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {calculateResidualPoints(player.id)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <Button
            onClick={handleSettleGame}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Settle Game
          </Button>
          <Button
            onClick={handleRestartGame}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Game
          </Button>
        </div>
      </main>

      {/* Re-entry Modal */}
      <ReEntryModal
        isOpen={showReEntryModal}
        onClose={() => setShowReEntryModal(false)}
        onConfirm={handleReEntryConfirm}
        playerName={selectedPlayer?.name || ""}
        isLoading={updatePlayerStatusMutation.isPending}
      />
    </div>
  );
}
