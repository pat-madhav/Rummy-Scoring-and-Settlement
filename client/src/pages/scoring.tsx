import { useState, useEffect, useCallback } from "react";
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
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({}); // playerId-roundNumber -> isOpen


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

  // Helper functions for dropdown management
  const getDropdownKey = useCallback((playerId: number, roundNumber: number) => `${playerId}-${roundNumber}`, []);
  
  const closeDropdown = useCallback((playerId: number, roundNumber: number) => {
    const key = getDropdownKey(playerId, roundNumber);
    setTimeout(() => {
      setOpenDropdowns(prev => ({ ...prev, [key]: false }));
    }, 0);
  }, [getDropdownKey]);

  const closeAllDropdowns = useCallback(() => {
    setTimeout(() => {
      setOpenDropdowns({});
    }, 0);
  }, []);

  const openSingleDropdown = useCallback((playerId: number, roundNumber: number) => {
    const key = getDropdownKey(playerId, roundNumber);
    // Use setTimeout to avoid React rendering conflicts
    setTimeout(() => {
      setOpenDropdowns({ [key]: true });
    }, 0);
  }, [getDropdownKey]);

  // Click outside effect to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on dropdown content or input
      if (!target.closest('.dropdown-container')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);



  // Shared function to check if round should advance and validate
  const checkRoundAdvancement = (newScores: Record<number, Record<number, string>>, roundNumber: number) => {
    if (roundNumber !== currentRound) return;
    
    const currentRoundScores = Object.keys(newScores).reduce((acc, playerIdStr) => {
      const playerScore = newScores[playerIdStr]?.[roundNumber];
      if (playerScore && playerScore !== "") {
        acc[playerIdStr] = playerScore;
      }
      return acc;
    }, {} as Record<string, string>);
    
    // If all active players have entered scores for current round, validate and advance
    const allPlayers = players || [];
    const playersNotOut = allPlayers.filter(p => {
      const playerTotal = Object.values(newScores[p.id] || {}).reduce((total, score) => {
        const numScore = typeof score === 'string' ? parseInt(score) || 0 : score;
        return total + numScore;
      }, 0);
      return playerTotal < game.forPoints && p.isActive;
    });
    
    const currentRoundPlayersWithScores = playersNotOut.filter(p => newScores[p.id]?.[roundNumber]);
    
    if (playersNotOut.length > 1 && currentRoundPlayersWithScores.length === playersNotOut.length) {
      // Validate minimum 1 Rummy rule
      const rummyScores = Object.values(currentRoundScores).filter(scoreStr => parseInt(scoreStr) === 0);
      if (rummyScores.length === 0) {
        toast({
          title: "Invalid Round",
          description: "At least one player must have a Rummy (0 points) in each round",
          variant: "destructive",
        });
        return false;
      }
      
      // Validate maximum 1 Rummy rule
      if (rummyScores.length > 1) {
        toast({
          title: "Invalid Round",
          description: "Only one player can have a Rummy (0 points) in each round",
          variant: "destructive",
        });
        return false;
      }
      
      // Check if game should continue (more than 1 player remaining)
      if (playersNotOut.length > 1) {
        // Debounce round advancement to prevent duplicate creation
        setTimeout(() => {
          setCurrentRound(prev => prev + 1);
        }, 500);
      }
    }
    return true;
  };

  const handleScoreChange = (playerId: number, roundNumber: number, score: string) => {
    // Close dropdown when user starts typing
    closeDropdown(playerId, roundNumber);
    
    // Validate score against full count setting
    const numScore = parseInt(score);
    if (!isNaN(numScore) && score !== "") {
      const maxScore = game.fullCountPoints === 80 ? 80 : game.forPoints;
      if (numScore > maxScore) {
        toast({
          title: "Invalid Score",
          description: `Enter a score less than full count (${maxScore})`,
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
      
      // Check if round should advance
      const shouldContinue = checkRoundAdvancement(newScores, roundNumber);
      if (!shouldContinue) {
        return prev;
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

    const activePlayers = gameStateQuery.data.players.filter(p => {
      const playerTotal = calculatePlayerTotal(p.id);
      return playerTotal < game.forPoints && p.isActive;
    });
    
    if (activePlayers.length < 2) {
      toast({
        title: "Cannot Settle Game",
        description: "Settlement requires at least 2 active players",
        variant: "destructive",
      });
      return;
    }

    setLocation(`/settlement/${gameId}`);
  };

  const handleRemoveRound = (roundNumber: number) => {
    if (confirm(`Are you sure you want to remove Round ${roundNumber}? This will delete all scores for this round and cannot be undone.`)) {
      // Remove scores for this round from all players
      setScores(prevScores => {
        const newScores = { ...prevScores };
        Object.keys(newScores).forEach(playerIdStr => {
          const playerId = parseInt(playerIdStr);
          if (newScores[playerId] && newScores[playerId][roundNumber]) {
            delete newScores[playerId][roundNumber];
          }
        });
        return newScores;
      });

      // If removing the last completed round, move back to that round
      if (roundNumber === currentRound - 1) {
        setCurrentRound(currentRound - 1);
      }
      
      setEditingRound(null);
      setHoveredRound(null);
      
      toast({
        title: "Round Removed",
        description: `Round ${roundNumber} has been deleted`,
      });
    }
  };

  // Helper functions for player state
  const getPlayerState = (playerId: number) => {
    const totalScore = calculatePlayerTotal(playerId);
    const packsRemaining = calculatePacksRemaining(playerId);
    
    // Calculate active players first
    const activePlayers = players.filter(p => {
      const pTotal = calculatePlayerTotal(p.id);
      return pTotal < game.forPoints && p.isActive;
    });
    
    // Check if player is the winner (only one active player left) - this overrides all other states
    if (activePlayers.length === 1 && activePlayers[0].id === playerId) {
      return { state: "Winner", color: "bg-green-800 dark:bg-green-900" };
    }
    
    // Check if player is "Out" - total score >= max score
    if (totalScore >= game.forPoints) {
      return { state: "Out", color: "bg-red-600 dark:bg-red-700" };
    }
    
    // Check if player has "Compulsory" (no packs left)
    if (packsRemaining === 0) {
      return { state: "Compulsory", color: "bg-red-200 dark:bg-red-800/50" };
    }
    
    // Check if round 1 is completed (all active players have scores for round 1)
    let round1Completed = false;
    
    if (currentRound >= 1) {
      // Check if all active players have scores for round 1
      const playersWithRound1Scores = activePlayers.filter(p => scores[p.id]?.[1]);
      round1Completed = playersWithRound1Scores.length === activePlayers.length;
    }
    
    // Apply "Least" highlighting if round 1 is completed and there are multiple active players
    if (round1Completed && activePlayers.length > 1) {
      const activeTotals = activePlayers.map(p => calculatePlayerTotal(p.id));
      const minTotal = Math.min(...activeTotals);
      
      if (totalScore === minTotal && totalScore >= 0) {
        return { state: "Least", color: "bg-green-200 dark:bg-green-800/50" };
      }
    }
    
    return { state: "", color: "" };
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
    return Math.max(0, game.forPoints - total - 1);
  };
  
  const calculatePacksRemaining = (playerId: number) => {
    const pointsLeft = calculatePointsLeft(playerId);
    return Math.floor(pointsLeft / game.packPoints);
  };
  
  const calculatePackSafePoints = (playerId: number) => {
    const pointsLeft = calculatePointsLeft(playerId);
    return pointsLeft % game.packPoints;
  };

  const handleScoreOption = (playerId: number, roundNumber: number, option: string) => {
    // Check if player has 0 packs left and is trying to pack
    const packsRemaining = calculatePacksRemaining(playerId);
    if (packsRemaining === 0 && (option === "pack" || option === "mid-pack")) {
      toast({
        title: "Compulsory",
        description: "Player with 0 packs left cannot pack or mid-pack",
        variant: "destructive",
      });
      return;
    }

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
    
    // Close dropdown when option is selected
    closeDropdown(playerId, roundNumber);
    
    // Validate score against full count setting
    const numScore = parseInt(score);
    if (!isNaN(numScore) && score !== "") {
      const maxScore = game.fullCountPoints === 80 ? 80 : game.forPoints;
      if (numScore > maxScore) {
        toast({
          title: "Invalid Score",
          description: `Enter a score less than full count (${maxScore})`,
          variant: "destructive",
        });
        return;
      }
    }
    
    // Set the score directly and use shared round advancement logic
    setScores(prev => {
      const newScores = {
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [roundNumber]: score,
        },
      };
      
      // Use shared function to check round advancement (prevents duplicate rounds)
      const shouldContinue = checkRoundAdvancement(newScores, roundNumber);
      if (!shouldContinue) {
        return prev;
      }
      
      return newScores;
    });
  };

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
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Scoring
              </h1>
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
      <main className="max-w-6xl mx-auto p-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
        </div>

        {/* Re-entry notification */}
        {gameStateQuery.data?.game.reEntryAllowed && (
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
                  {/* Player Names Row */}
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Round</th>
                    {players.map((player) => {
                      const playerState = getPlayerState(player.id);
                      
                      return (
                        <th key={player.id} className={`px-4 py-3 text-center text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent min-w-24 ${playerState.color}`}>
                          <div>{player.name}</div>
                          {gameStateQuery.data?.game.reEntryAllowed && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                const playerWithScores = playersWithScoresQuery.data?.find(p => p.id === player.id);
                                if (playerWithScores) {
                                  handleReEntryClick(playerWithScores);
                                }
                              }}
                              className="mt-1 text-xs hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            >
                              Re-Entry
                            </Button>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                  {/* Player State Row */}
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-left text-xs text-gray-600 dark:text-gray-400"></th>
                    {players.map((player) => {
                      const playerState = getPlayerState(player.id);
                      
                      return (
                        <th key={`state-${player.id}`} className={`px-4 py-2 text-center text-xs font-medium ${playerState.color} text-gray-700 dark:text-gray-300`}>
                          {playerState.state}
                        </th>
                      );
                    })}
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
                          {/* Edit and Remove buttons - appear on hover/tap */}
                          {(hoveredRound === roundNumber || isEditing) && (
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 flex flex-col gap-1 ml-2">
                              <Button
                                size="sm"
                                className="bg-orange-400 hover:bg-orange-500 text-white text-xs px-2 py-1 h-5 rounded-full shadow-md transition-all duration-200 border-2 border-white dark:border-gray-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingRound(isEditing ? null : roundNumber);
                                }}
                              >
                                {isEditing ? "Save" : "Edit"}
                              </Button>
                              {!isEditing && (
                                <Button
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 h-5 rounded-full shadow-md transition-all duration-200 border-2 border-white dark:border-gray-800"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveRound(roundNumber);
                                  }}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          )}
                        </td>
                        {players.map((player) => {
                          const savedScore = scores[player.id]?.[roundNumber];
                          const displayScore = savedScore ? parseInt(savedScore) : 0;
                          return (
                            <td key={player.id} className={`px-4 py-3 ${getPlayerState(player.id).color}`}>
                              {getPlayerState(player.id).state !== "Out" ? (
                                <div className="relative dropdown-container">
                                  <Input
                                    type="number"
                                    placeholder="Score"
                                    value={savedScore || ""}
                                    onChange={(e) => handleScoreChange(player.id, roundNumber, e.target.value)}
                                    onFocus={(e) => {
                                      e.target.select();
                                      // Close all dropdowns first, then open this one
                                      openSingleDropdown(player.id, roundNumber);
                                    }}
                                    onKeyDown={(e) => {
                                      // Close dropdown when user starts typing (any key except tab, enter, escape)
                                      if (!['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                        closeDropdown(player.id, roundNumber);
                                      }
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Close all dropdowns first, then open this one
                                      openSingleDropdown(player.id, roundNumber);
                                    }}
                                    className="w-full text-center h-8 cursor-text text-sm"
                                  />
                                  {openDropdowns[getDropdownKey(player.id, roundNumber)] && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dropdown-container">
                                      <div
                                        onClick={() => handleScoreOption(player.id, roundNumber, "rummy")}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                      >
                                        Rummy (0)
                                      </div>
                                      {calculatePacksRemaining(player.id) > 0 ? (
                                        <>
                                          <div
                                            onClick={() => handleScoreOption(player.id, roundNumber, "pack")}
                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                          >
                                            Pack ({game.packPoints})
                                          </div>
                                          <div
                                            onClick={() => handleScoreOption(player.id, roundNumber, "mid-pack")}
                                            className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                          >
                                            Mid-Pack ({game.midPackPoints})
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div
                                            onClick={() => {
                                              toast({
                                                title: "Compulsory",
                                                description: "Player with 0 packs left cannot pack or mid-pack",
                                                variant: "destructive",
                                              });
                                            }}
                                            className="px-3 py-2 text-sm opacity-50 cursor-not-allowed border-b border-gray-100 dark:border-gray-600"
                                          >
                                            Pack ({game.packPoints})
                                          </div>
                                          <div
                                            onClick={() => {
                                              toast({
                                                title: "Compulsory",
                                                description: "Player with 0 packs left cannot pack or mid-pack",
                                                variant: "destructive",
                                              });
                                            }}
                                            className="px-3 py-2 text-sm opacity-50 cursor-not-allowed border-b border-gray-100 dark:border-gray-600"
                                          >
                                            Mid-Pack ({game.midPackPoints})
                                          </div>
                                        </>
                                      )}
                                      {game.fullCountPoints === 80 && (
                                        <div
                                          onClick={() => handleScoreOption(player.id, roundNumber, "full-count")}
                                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                          Full-Count ({game.fullCountPoints})
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full text-center py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded border text-sm">
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
                    {players.map((player) => {
                      const currentTotalScore = calculatePlayerTotal(player.id);
                      const isPlayerOut = getPlayerState(player.id).state === "Out";
                      
                      // Check if player will become out with this round's score
                      const currentScore = scores[player.id]?.[currentRound];
                      const willBecomeOut = currentScore && (currentTotalScore >= game.forPoints);
                      
                      // Show input if player is not out yet, or if they're becoming out in this round
                      const showInput = !isPlayerOut || (willBecomeOut && currentScore);
                      
                      return (
                        <td key={player.id} className={`px-4 py-3 ${getPlayerState(player.id).color}`}>
                          {showInput ? (
                            <div className="relative dropdown-container">
                              <Input
                                type="number"
                                placeholder="Score"
                                value={scores[player.id]?.[currentRound] || ""}
                                onChange={(e) => handleScoreChange(player.id, currentRound, e.target.value)}
                                onFocus={(e) => {
                                  e.target.select();
                                  // Open dropdown when focusing on input
                                  const key = getDropdownKey(player.id, currentRound);
                                  setOpenDropdowns(prev => ({ ...prev, [key]: true }));
                                }}
                                onKeyDown={(e) => {
                                  // Close dropdown when user starts typing (any key except tab, enter, escape)
                                  if (!['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                    closeDropdown(player.id, currentRound);
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Open dropdown when clicking on input
                                  const key = getDropdownKey(player.id, currentRound);
                                  setOpenDropdowns(prev => ({ ...prev, [key]: true }));
                                }}
                                className={`w-full text-center h-10 cursor-text text-sm min-w-20 ${!scores[player.id]?.[currentRound] ? "border-blue-500 dark:border-blue-400 border-2" : ""}`}
                              />
                              {openDropdowns[getDropdownKey(player.id, currentRound)] && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dropdown-container">
                                  <div
                                    onClick={() => handleScoreOption(player.id, currentRound, "rummy")}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                  >
                                    Rummy (0)
                                  </div>
                                  {calculatePacksRemaining(player.id) > 0 ? (
                                    <>
                                      <div
                                        onClick={() => handleScoreOption(player.id, currentRound, "pack")}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                      >
                                        Pack ({game.packPoints})
                                      </div>
                                      <div
                                        onClick={() => handleScoreOption(player.id, currentRound, "mid-pack")}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                      >
                                        Mid-Pack ({game.midPackPoints})
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div
                                        onClick={() => {
                                          toast({
                                            title: "Compulsory",
                                            description: "Player has no packs left - must play Rummy or Full-Count",
                                            variant: "destructive",
                                          });
                                        }}
                                        className="px-3 py-2 text-sm opacity-50 cursor-not-allowed border-b border-gray-100 dark:border-gray-600"
                                      >
                                        Pack ({game.packPoints})
                                      </div>
                                      <div
                                        onClick={() => {
                                          toast({
                                            title: "Compulsory",
                                            description: "Player has no packs left - must play Rummy or Full-Count",
                                            variant: "destructive",
                                          });
                                        }}
                                        className="px-3 py-2 text-sm opacity-50 cursor-not-allowed border-b border-gray-100 dark:border-gray-600"
                                      >
                                        Mid-Pack ({game.midPackPoints})
                                      </div>
                                    </>
                                  )}
                                  {game.fullCountPoints === 80 && (
                                    <div
                                      onClick={() => handleScoreOption(player.id, currentRound, "full-count")}
                                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      Full-Count ({game.fullCountPoints})
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-400">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
                
                {/* Summary Rows */}
                <tfoot className="bg-gray-50 dark:bg-gray-700">
                  <tr className="font-semibold border-t-4 border-b-4 border-gray-800 dark:border-gray-200">
                    <td className="px-4 py-3 text-lg font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Total</td>
                    {players.map((player) => (
                      <td key={player.id} className={`px-4 py-3 text-center text-lg font-bold text-gray-900 dark:text-white ${getPlayerState(player.id).color}`}>
                        {calculatePlayerTotal(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Points left</td>
                    {players.map((player) => (
                      <td key={player.id} className={`px-4 py-3 text-center text-gray-700 dark:text-gray-300 ${getPlayerState(player.id).color}`}>
                        {calculatePointsLeft(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Packs</td>
                    {players.map((player) => (
                      <td key={player.id} className={`px-4 py-3 text-center text-gray-700 dark:text-gray-300 ${getPlayerState(player.id).color}`}>
                        {calculatePacksRemaining(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent font-semibold">Pack Safe</td>
                    {players.map((player) => {
                      const packSafePoints = calculatePackSafePoints(player.id);
                      const isPlayerOut = getPlayerState(player.id).state === "Out";
                      const playerTotal = calculatePlayerTotal(player.id);
                      const hasScores = playerTotal > 0; // Player has entered at least one score
                      
                      return (
                        <td key={player.id} className={`px-4 py-3 text-center text-gray-700 dark:text-gray-300 ${getPlayerState(player.id).color}`}>
                          {!hasScores ? "" : (!isPlayerOut && packSafePoints === 0 ? "Yes" : packSafePoints)}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Fixed Bottom Navigation - Consistent across all pages */}
      <div className="fixed bottom-6 left-0 right-0 z-50">
        {/* Subtle fade gradient overlay */}
        <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
        <div className="w-[70%] mx-auto relative flex space-x-4">
          <Button
            onClick={handleSettleGame}
            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px] settlement-btn"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Settle Game
          </Button>
          <Button
            onClick={handleRestartGame}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart Game
          </Button>
        </div>
      </div>

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
