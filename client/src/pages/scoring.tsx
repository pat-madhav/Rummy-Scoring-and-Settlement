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

import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { calculatePlayerStats, validateReEntryConditions, shouldShowSettlement } from "@/lib/game-utils";
import { ReEntryModal } from "@/components/re-entry-modal";
import { X, Calculator, RotateCcw, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { GameState, PlayerWithScores } from "@shared/schema";

interface ScoringScreenProps {
  gameId: string;
}

export default function ScoringScreen({ gameId }: ScoringScreenProps) {
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [scores, setScores] = useState<Record<number, Record<number, string>>>({}); // playerId -> roundNumber -> score
  const [committedScores, setCommittedScores] = useState<Record<number, Record<number, string>>>({}); // playerId -> roundNumber -> score (only after onBlur)
  const [currentRound, setCurrentRound] = useState(1);
  const [showReEntryModal, setShowReEntryModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithScores | null>(null);
  const [editingRound, setEditingRound] = useState<number | null>(null);
  const [hoveredRound, setHoveredRound] = useState<number | null>(null);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({}); // playerId-roundNumber -> isOpen
  const [invalidInputs, setInvalidInputs] = useState<Record<string, boolean>>({}); // playerId-roundNumber -> isInvalid
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const gameStateQuery = useQuery({
    queryKey: [`/api/games/${gameId}/state`],
    enabled: !!gameId,
  });

  const playersWithScoresQuery = useQuery({
    queryKey: [`/api/games/${gameId}/players-with-scores`],
    enabled: !!gameId,
  });

  // Initialize scores and committed scores from database data
  useEffect(() => {
    if (gameStateQuery.data?.scores) {
      const dbScores: Record<number, Record<number, string>> = {};
      gameStateQuery.data.scores.forEach(score => {
        if (!dbScores[score.playerId]) {
          dbScores[score.playerId] = {};
        }
        dbScores[score.playerId][score.roundNumber] = score.score.toString();
      });
      setScores(dbScores);
      // Initialize committed scores with database data (since they're already validated)
      setCommittedScores(dbScores);
    }
  }, [gameStateQuery.data?.scores]);

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

  const getDropdownPosition = (playerId: number, roundNumber: number) => {
    const baseClasses = "absolute z-50 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg dropdown-container";
    
    if (playersWithScores && playersWithScores.length > 0) {
      const playerIndex = playersWithScores.findIndex(p => p.id === playerId);
      const totalPlayers = playersWithScores.length;
      
      // Position dropdown to avoid blocking:
      // 1. Same column (for total score visibility)
      // 2. Current round row (for all player scores visibility)
      // 3. Player names header row (for header visibility)
      
      // Strategy: Position dropdown below the score box and to the side (away from same column)
      if (playerIndex === 0) {
        // First player: position to the right and below to avoid blocking own column
        return `${baseClasses} top-full left-full ml-2`;
      } else if (playerIndex === totalPlayers - 1) {
        // Last player: position to the left and below to avoid blocking own column
        return `${baseClasses} top-full right-full mr-2`;
      } else {
        // Middle players: position to the right and below to avoid blocking own column
        return `${baseClasses} top-full left-full ml-2`;
      }
    }
    
    // Fallback: position below and to the right
    return `${baseClasses} top-full left-full ml-2`;
  };

  // Click outside effect to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if clicking on a score input (different from current open dropdown)
      const scoreInput = target.closest('input[type="text"]') as HTMLInputElement;
      
      if (scoreInput) {
        // If clicking on a different score input, close all dropdowns first
        closeAllDropdowns();
        return;
      }
      
      // Don't close if clicking on dropdown content
      if (!target.closest('.dropdown-container')) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllDropdowns]);

  // Clear error messages when round changes
  useEffect(() => {
    setErrorMessage(null);
  }, [currentRound]);



  // Shared function to check if round should advance and validate
  const checkRoundAdvancement = (newScores: Record<number, Record<number, string>>, roundNumber: number) => {
    if (roundNumber !== currentRound) return;
    
    // Don't advance round if any score input is currently focused
    const activeElement = document.activeElement;
    if (activeElement && activeElement.tagName === 'INPUT' && activeElement.getAttribute('type') === 'text') {
      // Check if it's a score input for the current round
      const inputContainer = activeElement.closest('[data-round]');
      if (inputContainer && inputContainer.getAttribute('data-round') === String(currentRound)) {
        return; // Don't advance while user is still typing
      }
    }
    
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
      // First check if any player has an invalid score (red highlighted inputs)
      for (const player of playersNotOut) {
        const score = newScores[player.id]?.[roundNumber];
        if (score && score !== "") {
          const numScore = parseInt(score);
          // Check for invalid scores (1 or any score that would be marked as invalid)
          if (!isNaN(numScore) && numScore < 2 && numScore !== 0) {
            // Don't advance round if any player has an invalid score
            return false;
          }
          // Check maximum score
          const maxScore = game.fullCountPoints === 80 ? 80 : game.forPoints;
          if (numScore > maxScore) {
            // Don't advance round if any player has an invalid score
            return false;
          }
        }
      }
      
      // LEAST COUNT VALIDATION - Only after entire round is complete
      // Validate minimum 1 Rummy rule
      const rummyScores = Object.values(currentRoundScores).filter(scoreStr => parseInt(scoreStr) === 0);
      if (rummyScores.length === 0) {
        setErrorMessage("Invalid Round\nAt least one player must have a Rummy (0 points) in each round");
        return false;
      }
      
      // Validate maximum 1 Rummy rule
      if (rummyScores.length > 1) {
        setErrorMessage("Invalid Round\nOnly one player can have a Rummy (0 points) in each round");
        return false;
      }
      
      // Clear any error message if validation passes
      setErrorMessage(null);
      
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
    
    const key = getDropdownKey(playerId, roundNumber);
    const player = players.find(p => p.id === playerId);
    const playerName = player?.name || "Player";
    
    // Check for non-numeric characters (allow empty string for ongoing input)
    if (score !== "" && !/^\d+$/.test(score)) {
      // Show red border for non-numeric input
      setInvalidInputs(prev => ({ ...prev, [key]: true }));
      setErrorMessage(`Invalid Score\nEnter numbers only for ${playerName}`);
      return; // Don't update scores with invalid input
    }
    
    // Clear error message and invalid state when user enters valid input
    if (errorMessage || invalidInputs[key]) {
      setErrorMessage(null);
      setInvalidInputs(prev => ({ ...prev, [key]: false }));
    }
    
    // Allow valid numeric input (including empty string)
    setScores(prev => {
      const newScores = {
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [roundNumber]: score,
        },
      };
      
      // Don't check round advancement while typing
      // Round advancement will be handled on blur
      
      return newScores;
    });
  };

  const validateScore = (playerId: number, roundNumber: number) => {
    const score = scores[playerId]?.[roundNumber];
    const key = getDropdownKey(playerId, roundNumber);
    const player = players.find(p => p.id === playerId);
    const playerName = player?.name || "Player";
    
    if (!score || score === "") {
      // Clear invalid state if score is empty
      setInvalidInputs(prev => ({ ...prev, [key]: false }));
      
      // Clear from committed scores as well
      setCommittedScores(prev => {
        const newCommitted = { ...prev };
        if (newCommitted[playerId]) {
          delete newCommitted[playerId][roundNumber];
          // If no more rounds for this player, remove the player entirely
          if (Object.keys(newCommitted[playerId]).length === 0) {
            delete newCommitted[playerId];
          }
        }
        return newCommitted;
      });
      
      // Re-check round advancement when clearing a score (on blur)
      if (roundNumber === currentRound) {
        checkRoundAdvancement(scores, roundNumber);
      }
      return true;
    }
    
    // Check for non-numeric characters
    if (!/^\d+$/.test(score)) {
      // Clear the invalid score
      setScores(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [roundNumber]: "",
        },
      }));
      
      setErrorMessage(`Invalid Score\nEnter numbers only for ${playerName}`);
      // Keep invalid state active (red border) until a valid score is entered
      setInvalidInputs(prev => ({ ...prev, [key]: true }));
      return false;
    }
    
    const numScore = parseInt(score);
    
    // Check minimum score (must be 0 or >= 2)
    if (numScore < 2 && numScore !== 0) {
      // Clear the invalid score
      setScores(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [roundNumber]: "",
        },
      }));
      
      setErrorMessage(`Invalid Score\nEnter a score >= minimum score (2) for ${playerName}`);
      // Keep invalid state active (red border) until a valid score is entered
      setInvalidInputs(prev => ({ ...prev, [key]: true }));
      return false;
    }
    
    // Check maximum score
    const maxScore = game.fullCountPoints === 80 ? 80 : game.forPoints;
    if (numScore > maxScore) {
      // Clear the invalid score
      setScores(prev => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          [roundNumber]: "",
        },
      }));
      
      setErrorMessage(`Invalid Score\nEnter a score <= full count (${maxScore}) for ${playerName}`);
      // Keep invalid state active (red border) until a valid score is entered
      setInvalidInputs(prev => ({ ...prev, [key]: true }));
      return false;
    }
    
    // Clear invalid state and error message if validation passes
    setInvalidInputs(prev => ({ ...prev, [key]: false }));
    setErrorMessage(null);
    
    // COMMIT the score after validation passes (this enables Out/Compulsory validation)
    setCommittedScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [roundNumber]: score,
      },
    }));
    
    // Re-check round advancement after validation passes, with a delay to ensure focus has moved
    if (roundNumber === currentRound) {
      setTimeout(() => {
        checkRoundAdvancement(scores, roundNumber);
      }, 100);
    }
    return true;
  };

  const handleReEntryClick = (player: PlayerWithScores) => {
    if (!gameStateQuery.data?.game.reEntryAllowed) {
      setErrorMessage("Re-entry Not Allowed\nRe-entry is disabled for this game");
      return;
    }

    const activePlayers = gameStateQuery.data?.players.filter(p => p.isActive) || [];
    const validation = validateReEntryConditions(activePlayers, playersWithScoresQuery.data?.map(p => ({ player: p, packsRemaining: p.packsRemaining })) || []);
    
    if (!validation.isValid) {
      setErrorMessage("Re-entry Not Allowed\n" + validation.reason);
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

      // Clear any error message on successful re-entry
      setErrorMessage(null);

      setShowReEntryModal(false);
      setSelectedPlayer(null);
    } catch (error) {
      setErrorMessage("Error\nFailed to process re-entry");
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
      setErrorMessage("Cannot Settle Game\nSettlement requires at least 2 active players");
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
    // Use committed scores for validation
    const committedTotal = calculateCommittedPlayerTotal(playerId);
    const displayTotal = calculatePlayerTotal(playerId);
    
    // Calculate active players based on committed scores
    const activePlayers = players.filter(p => {
      const pTotal = calculateCommittedPlayerTotal(p.id);
      return pTotal < game.forPoints && p.isActive;
    });
    
    // Check if player is the winner (only one active player left) - this overrides all other states
    if (activePlayers.length === 1 && activePlayers[0].id === playerId) {
      return { state: "Winner", color: "bg-green-800 dark:bg-green-900" };
    }
    
    // Check if player is "Out" - use committed total only (after onBlur)
    if (committedTotal >= game.forPoints) {
      return { state: "Out", color: "bg-red-600 dark:bg-red-700" };
    }
    
    // Check if player has "Compulsory" (no packs left)
    // For the current round, check if the player has a committed score
    // For previous rounds, use the regular scores
    let totalForCompulsory = 0;
    
    // Add up all previous round scores
    for (let round = 1; round < currentRound; round++) {
      const roundScore = scores[playerId]?.[round];
      if (roundScore !== undefined && roundScore !== "") {
        const numScore = typeof roundScore === 'string' ? parseInt(roundScore) || 0 : roundScore;
        totalForCompulsory += numScore;
      }
    }
    
    // For the current round, only include if it's committed (after blur)
    const currentRoundCommittedScore = committedScores[playerId]?.[currentRound];
    if (currentRoundCommittedScore !== undefined) {
      const numScore = typeof currentRoundCommittedScore === 'string' ? parseInt(currentRoundCommittedScore) || 0 : currentRoundCommittedScore;
      totalForCompulsory += numScore;
    }
    
    const pointsLeftForCompulsory = Math.max(0, game.forPoints - totalForCompulsory - 1);
    const packsRemainingForCompulsory = Math.floor(pointsLeftForCompulsory / game.packPoints);
    
    // Compulsory when packs = 0 and player has entered at least one score
    if (packsRemainingForCompulsory === 0 && totalForCompulsory > 0 && totalForCompulsory < game.forPoints) {
      return { state: "Compulsory", color: "bg-red-200 dark:bg-red-800/50" };
    }
    
    // Check if the latest previous round is FULLY COMPLETED (all active players have entered scores)
    let latestCompletedRound = 0;
    for (let round = 1; round < currentRound; round++) {
      const playersWithRoundScores = activePlayers.filter(p => scores[p.id]?.[round] !== undefined && scores[p.id]?.[round] !== "");
      if (playersWithRoundScores.length === activePlayers.length && activePlayers.length > 0) {
        latestCompletedRound = round;
      }
    }
    
    // Apply "Least" highlighting only if at least one round is fully completed and there are multiple active players
    if (latestCompletedRound > 0 && activePlayers.length > 1) {
      const activeTotals = activePlayers.map(p => {
        // Calculate total from all completed rounds (1 to latestCompletedRound)
        let total = 0;
        for (let round = 1; round <= latestCompletedRound; round++) {
          const roundScore = scores[p.id]?.[round];
          const numScore = typeof roundScore === 'string' ? parseInt(roundScore) || 0 : (roundScore || 0);
          total += numScore;
        }
        return total;
      });
      const minTotal = Math.min(...activeTotals);
      
      // Check if this player has the minimum total score across all completed rounds
      let playerTotal = 0;
      for (let round = 1; round <= latestCompletedRound; round++) {
        const roundScore = scores[playerId]?.[round];
        const numScore = typeof roundScore === 'string' ? parseInt(roundScore) || 0 : (roundScore || 0);
        playerTotal += numScore;
      }
      
      if (playerTotal === minTotal && playerTotal >= 0) {
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
  
  // Calculate current totals from scores state (for display)
  const calculatePlayerTotal = (playerId: number) => {
    const playerScores = scores[playerId] || {};
    return Object.values(playerScores).reduce((total, score) => {
      const numScore = typeof score === 'string' ? parseInt(score) || 0 : score;
      return total + numScore;
    }, 0);
  };

  // Calculate totals from committed scores (for Out/Compulsory validation)
  const calculateCommittedPlayerTotal = (playerId: number) => {
    const playerScores = committedScores[playerId] || {};
    return Object.values(playerScores).reduce((total, score) => {
      const numScore = typeof score === 'string' ? parseInt(score) || 0 : score;
      return total + numScore;
    }, 0);
  };

  // Check if all active players have entered scores for the current round
  const isRoundComplete = () => {
    const activePlayers = players.filter(p => {
      const pTotal = calculateCommittedPlayerTotal(p.id);
      return pTotal < game.forPoints && p.isActive;
    });
    
    return activePlayers.every(player => {
      const playerScores = scores[player.id] || {};
      return playerScores[currentRound] !== undefined && playerScores[currentRound] !== '';
    });
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
  
  // Calculate packs remaining based only on previous rounds (for dropdown disable logic)
  const calculatePacksRemainingFromPreviousRounds = (playerId: number, currentRoundNumber: number) => {
    let totalFromPreviousRounds = 0;
    
    // Add up all previous round scores (not including current round)
    for (let round = 1; round < currentRoundNumber; round++) {
      const roundScore = scores[playerId]?.[round];
      if (roundScore !== undefined && roundScore !== "") {
        const numScore = typeof roundScore === 'string' ? parseInt(roundScore) || 0 : roundScore;
        totalFromPreviousRounds += numScore;
      }
    }
    
    const pointsLeft = Math.max(0, game.forPoints - totalFromPreviousRounds - 1);
    return Math.floor(pointsLeft / game.packPoints);
  };
  
  // Calculate active players (not out and still playing)
  const activePlayers = players.filter(p => {
    const playerTotal = calculatePlayerTotal(p.id);
    return playerTotal < game.forPoints && p.isActive;
  });
  
  // Check if a round already has a rummy (0) score
  const hasRummyInRound = (roundNumber: number) => {
    return players.some(player => {
      const score = scores[player.id]?.[roundNumber];
      return score === "0" || score === "Rummy";
    });
  };

  const handleScoreOption = (playerId: number, roundNumber: number, option: string) => {
    // Check if player has 0 packs left based on previous rounds and is trying to pack
    const packsRemaining = calculatePacksRemainingFromPreviousRounds(playerId, roundNumber);
    if (packsRemaining === 0 && (option === "pack" || option === "mid-pack")) {
      setErrorMessage("Compulsory\nPlayer with 0 packs left cannot pack or mid-pack");
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
      
      // Check round advancement but don't block score entry
      setTimeout(() => {
        checkRoundAdvancement(newScores, roundNumber);
      }, 0);
      
      return newScores;
    });
    
    // COMMIT the score after setting it to trigger validation (Out/Compulsory/Least)
    setCommittedScores(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [roundNumber]: score,
      },
    }));
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
        <div className="flex justify-center">
          <Card className="w-full max-w-[95%] md:max-w-[80%]">
            <CardContent className="p-0">
              <div className="overflow-x-auto relative">
                <table className="w-full border-collapse relative">
                <thead>
                  {/* Player Names Row */}
                  <tr className="bg-blue-500 dark:bg-blue-600">
                    <th className="px-4 py-3 text-center text-lg font-bold sticky-column-header bg-blue-500 dark:bg-blue-600 w-28">
                      <span className="relative z-10 text-white">Round</span>
                    </th>
                    {players.map((player) => {
                      const playerState = getPlayerState(player.id);
                      
                      return (
                        <th key={player.id} className={`px-4 py-3 text-center text-lg font-bold text-white w-20 bg-blue-500 dark:bg-blue-600`}>
                          <div className="text-center">{player.name}</div>
                          {gameStateQuery.data?.game.reEntryAllowed && (
                            <div className="flex justify-center">
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
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                  {/* Player State Row */}
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="px-4 py-2 text-center text-xs sticky-column-header bg-state-light bg-state-dark w-28">
                      <span className="text-blue-400 font-semibold">Status</span>
                    </th>
                    {players.map((player) => {
                      const playerState = getPlayerState(player.id);
                      
                      return (
                        <th key={`state-${player.id}`} className={`px-4 py-2 w-20 text-center text-xs font-medium ${playerState.color} text-gray-700 dark:text-gray-300`}>
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
                        <td className="px-4 py-3 font-medium relative sticky-column-header bg-scoring-light bg-scoring-dark w-28">
                          <div className="flex items-center justify-between w-full h-full">
                            <div className="flex-1 flex justify-center">
                              <span className="text-blue-400 text-lg font-bold">{roundNumber}</span>
                            </div>
                            {/* Edit and Remove icons - appear on hover/tap */}
                            {(hoveredRound === roundNumber || isEditing) && (
                              <div className="flex flex-col gap-1 h-full justify-center" style={{ marginRight: '25%' }}>
                                <Pencil
                                  className="w-4 h-4 text-gray-400 hover:text-gray-500 cursor-pointer transition-colors duration-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingRound(isEditing ? null : roundNumber);
                                  }}
                                />
                                {!isEditing && (
                                  <Trash2
                                    className="w-4 h-4 text-gray-400 hover:text-gray-500 cursor-pointer transition-colors duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveRound(roundNumber);
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        {players.map((player) => {
                          const savedScore = scores[player.id]?.[roundNumber];
                          const displayScore = savedScore ? parseInt(savedScore) : 0;
                          
                          // Check if player was out BEFORE this round (not including this round)
                          const wasPlayerOutBeforeRound = (playerId: number, checkRound: number) => {
                            let cumulativeScore = 0;
                            for (let r = 1; r < checkRound; r++) {
                              const roundScore = scores[playerId]?.[r];
                              if (roundScore) {
                                cumulativeScore += parseInt(roundScore);
                              }
                            }
                            return cumulativeScore >= game.forPoints;
                          };
                          
                          const isPlayerOutBeforeThisRound = wasPlayerOutBeforeRound(player.id, roundNumber);
                          
                          return (
                            <td key={player.id} className={`px-4 py-3 w-20 ${getPlayerState(player.id).color}`}>
                              {isEditing ? (
                                // For editing mode, only show input if player wasn't out before this round
                                !isPlayerOutBeforeThisRound ? (
                                  <div className="relative dropdown-container flex justify-center">
                                    <Input
                                      type="text"
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
                                      onBlur={() => validateScore(player.id, roundNumber)}
                                      className={`w-full text-center h-8 cursor-text text-sm ${
                                        invalidInputs[getDropdownKey(player.id, roundNumber)] 
                                          ? "border-red-500 dark:border-red-400 border-2" 
                                          : ""
                                      }`}
                                    />
                                    {openDropdowns[getDropdownKey(player.id, roundNumber)] && (
                                    <div className={getDropdownPosition(player.id, roundNumber)}>
                                      {!hasRummyInRound(roundNumber) || scores[player.id]?.[roundNumber] === "0" ? (
                                        <div
                                          onClick={() => handleScoreOption(player.id, roundNumber, "rummy")}
                                          className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                        >
                                          Rummy (0)
                                        </div>
                                      ) : (
                                        <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed border-b border-gray-100 dark:border-gray-600">
                                          Rummy (0)
                                        </div>
                                      )}
                                      {calculatePacksRemainingFromPreviousRounds(player.id, roundNumber) > 0 ? (
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
                                              setErrorMessage("Compulsory\nPlayer with 0 packs left cannot pack or mid-pack");
                                            }}
                                            className="px-3 py-2 text-sm opacity-50 cursor-not-allowed border-b border-gray-100 dark:border-gray-600"
                                          >
                                            Pack ({game.packPoints})
                                          </div>
                                          <div
                                            onClick={() => {
                                              setErrorMessage("Compulsory\nPlayer with 0 packs left cannot pack or mid-pack");
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
                                  <div className="text-center text-gray-400">-</div>
                                )
                              ) : (
                                // Display logic for non-editing mode
                                isPlayerOutBeforeThisRound ? (
                                  <div className="text-center text-gray-400">-</div>
                                ) : (
                                  <div className="w-full text-center py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded border text-sm">
                                    {displayScore}
                                  </div>
                                )
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  
                  {/* Current round input - only one empty row */}
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-blue-50 dark:bg-blue-900/10">
                    <td className="px-4 py-3 font-medium sticky-column-header bg-scoring-light bg-scoring-dark text-center w-28">
                      <span className="text-blue-400 text-lg font-bold">{currentRound}</span>
                    </td>
                    {players.map((player) => {
                      const currentTotalScore = calculatePlayerTotal(player.id);
                      
                      // Check if player was out BEFORE this round (not including this round)
                      const wasPlayerOutBeforeCurrentRound = (() => {
                        let cumulativeScore = 0;
                        for (let r = 1; r < currentRound; r++) {
                          const roundScore = scores[player.id]?.[r];
                          if (roundScore) {
                            cumulativeScore += parseInt(roundScore);
                          }
                        }
                        return cumulativeScore >= game.forPoints;
                      })();
                      
                      // Show input only if player was not out before current round
                      const showInput = !wasPlayerOutBeforeCurrentRound;
                      
                      return (
                        <td key={player.id} className={`px-4 py-3 w-20 ${getPlayerState(player.id).color}`}>
                          {showInput ? (
                            <div className="relative dropdown-container flex justify-center" data-round={currentRound}>
                              <Input
                                type="text"
                                placeholder="Score"
                                value={scores[player.id]?.[currentRound] || ""}
                                onChange={(e) => handleScoreChange(player.id, currentRound, e.target.value)}
                                onFocus={(e) => {
                                  e.target.select();
                                  // Close all other dropdowns first, then open this one
                                  const key = getDropdownKey(player.id, currentRound);
                                  closeAllDropdowns();
                                  setTimeout(() => {
                                    setOpenDropdowns({ [key]: true });
                                  }, 0);
                                }}
                                onKeyDown={(e) => {
                                  // Close dropdown when user starts typing (any key except tab, enter, escape)
                                  if (!['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                    closeDropdown(player.id, currentRound);
                                  }
                                  // Clear invalid state and error message when user starts typing to fix the error
                                  if (!['Tab', 'Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                                    const key = getDropdownKey(player.id, currentRound);
                                    setInvalidInputs(prev => ({ ...prev, [key]: false }));
                                    setErrorMessage(null);
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Close all other dropdowns first, then open this one
                                  const key = getDropdownKey(player.id, currentRound);
                                  closeAllDropdowns();
                                  setTimeout(() => {
                                    setOpenDropdowns({ [key]: true });
                                  }, 0);
                                }}
                                onBlur={() => validateScore(player.id, currentRound)}
                                className={`w-16 text-center h-10 cursor-text text-sm ${
                                  invalidInputs[getDropdownKey(player.id, currentRound)] 
                                    ? "border-red-500 dark:border-red-400 border-2" 
                                    : !scores[player.id]?.[currentRound] 
                                    ? "border-blue-500 dark:border-blue-400 border-2" 
                                    : ""
                                }`}
                              />
                              {openDropdowns[getDropdownKey(player.id, currentRound)] && (
                                <div className={getDropdownPosition(player.id, currentRound)}>
                                  {!hasRummyInRound(currentRound) || scores[player.id]?.[currentRound] === "0" ? (
                                    <div
                                      onClick={() => handleScoreOption(player.id, currentRound, "rummy")}
                                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600"
                                    >
                                      Rummy (0)
                                    </div>
                                  ) : (
                                    <div className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed border-b border-gray-100 dark:border-gray-600">
                                      Rummy (0)
                                    </div>
                                  )}
                                  {calculatePacksRemainingFromPreviousRounds(player.id, currentRound) > 0 ? (
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
                                          setErrorMessage(`Compulsory\nPlayer has no packs left - must play Rummy or Full-Count`);
                                        }}
                                        className="px-3 py-2 text-sm opacity-50 cursor-not-allowed border-b border-gray-100 dark:border-gray-600"
                                      >
                                        Pack ({game.packPoints})
                                      </div>
                                      <div
                                        onClick={() => {
                                          setErrorMessage(`Compulsory\nPlayer has no packs left - must play Rummy or Full-Count`);
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
                    <td className="px-4 py-3 text-lg font-bold sticky-column-header bg-header-light bg-header-dark text-center w-28">
                      <span className="relative z-10 text-blue-400">Total</span>
                    </td>
                    {players.map((player) => (
                      <td key={player.id} className={`px-4 py-3 w-20 text-center text-lg font-bold text-gray-900 dark:text-white ${getPlayerState(player.id).color}`}>
                        {calculatePlayerTotal(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 font-semibold sticky-column-header bg-header-light bg-header-dark text-center w-28">
                      <span className="relative z-10 text-blue-400">Points left</span>
                    </td>
                    {players.map((player) => (
                      <td key={player.id} className={`px-4 py-3 w-20 text-center text-gray-700 dark:text-gray-300 ${getPlayerState(player.id).color}`}>
                        {calculatePointsLeft(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 font-semibold sticky-column-header bg-header-light bg-header-dark text-center w-28">
                      <span className="relative z-10 text-blue-400">Packs</span>
                    </td>
                    {players.map((player) => (
                      <td key={player.id} className={`px-4 py-3 w-20 text-center text-gray-700 dark:text-gray-300 ${getPlayerState(player.id).color}`}>
                        {calculatePacksRemaining(player.id)}
                      </td>
                    ))}
                  </tr>
                  <tr className="text-sm">
                    <td className="px-4 py-3 font-semibold sticky-column-header bg-header-light bg-header-dark text-center w-28">
                      <span className="relative z-10 text-blue-400">Pack Safe</span>
                    </td>
                    {players.map((player) => {
                      const packSafePoints = calculatePackSafePoints(player.id);
                      const isPlayerOut = getPlayerState(player.id).state === "Out";
                      const playerTotal = calculatePlayerTotal(player.id);
                      const hasScores = playerTotal > 0; // Player has entered at least one score
                      const maxPoints = gameStateQuery.data?.game.forPoints || 0;
                      const isNearMaxPoints = playerTotal >= (maxPoints - 1);
                      
                      return (
                        <td key={player.id} className={`px-4 py-3 w-20 text-center text-gray-700 dark:text-gray-300 ${getPlayerState(player.id).color}`}>
                          {!hasScores || isNearMaxPoints ? "" : (!isPlayerOut && packSafePoints === 0 ? "Yes" : packSafePoints)}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Error Message Display - Centered above bottom buttons */}
      {errorMessage && (
        <div className="fixed bottom-24 left-0 right-0 z-40 flex justify-center px-4">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 max-w-md mx-auto shadow-lg">
            <div className="text-center">
              {errorMessage.split('\n').map((line, index) => {
                // Parse line to underline specific parts
                const formatLine = (text: string) => {
                  // Replace "minimum score (2)" with underlined version
                  if (text.includes('minimum score (2)')) {
                    const parts = text.split('minimum score (2)');
                    return (
                      <>
                        {parts[0]}
                        <span className="underline">minimum score (2)</span>
                        {parts[1]}
                      </>
                    );
                  }
                  // Replace "full count (XX)" with underlined version
                  const fullCountMatch = text.match(/full count \(\d+\)/);
                  if (fullCountMatch) {
                    const parts = text.split(fullCountMatch[0]);
                    return (
                      <>
                        {parts[0]}
                        <span className="underline">{fullCountMatch[0]}</span>
                        {parts[1]}
                      </>
                    );
                  }
                  return text;
                };
                
                return (
                  <p key={index} className={`text-red-800 dark:text-red-200 ${index === 0 ? 'font-semibold text-sm' : 'text-sm mt-1'}`}>
                    {formatLine(line)}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation - Consistent across all pages */}
      <div className="fixed bottom-6 left-0 right-0 z-50">
        {/* Subtle fade gradient overlay - top */}
        <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
        {/* Subtle fade gradient overlay - bottom */}
        <div className="absolute inset-x-0 top-12 -bottom-16 bg-gradient-to-b from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
        <div className={`button-container-fixed dual-buttons ${activePlayers.length === 1 ? 'animate-pulse' : ''}`}>
          <Button
            onClick={handleSettleGame}
            className="fixed-width-btn bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px] settlement-btn"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Settle Game
          </Button>
          <Button
            onClick={handleRestartGame}
            className="fixed-width-btn bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px]"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {activePlayers.length === 1 ? 'Finish' : 'Restart'}
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
