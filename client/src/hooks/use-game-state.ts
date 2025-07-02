import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Game, GamePlayer, InsertGame } from "@shared/schema";

export interface GameOptions {
  playerCount: number;
  forPoints: number;
  buyInAmount: string;
  currency: string;
  packPoints: number;
  midPackPoints: number;
  fullCountPoints: number;
  jokerType: string;
  sequenceCount: number;
  allTripsDoublePoints: boolean;
  allSeqsDoublePoints: boolean;
  allJokersFullMoney: boolean;
  reEntryAllowed: boolean;
  playerNames: string[];
}

export function useGameState() {
  const queryClient = useQueryClient();
  const [currentGameId, setCurrentGameId] = useState<number | null>(null);
  const [gameOptions, setGameOptions] = useState<Partial<GameOptions>>({
    playerCount: 3,
    forPoints: 101,
    buyInAmount: "",
    currency: "$",
    packPoints: 25,
    midPackPoints: 50,
    fullCountPoints: 80,
    jokerType: "opposite",
    sequenceCount: 2,
    allTripsDoublePoints: true,
    allSeqsDoublePoints: false,
    allJokersFullMoney: false,
    reEntryAllowed: true,
    playerNames: [],
  });

  const updateGameOptions = useCallback((updates: Partial<GameOptions>) => {
    setGameOptions(prev => ({ ...prev, ...updates }));
  }, []);

  const createGameMutation = useMutation({
    mutationFn: async (gameData: InsertGame) => {
      const response = await apiRequest("POST", "/api/games", gameData);
      return response.json();
    },
    onSuccess: (game: Game) => {
      setCurrentGameId(game.id);
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });

  const createPlayerMutation = useMutation({
    mutationFn: async ({ gameId, players }: { gameId: number, players: { name: string, position: number }[] }) => {
      const playerPromises = players.map(player => 
        apiRequest("POST", `/api/games/${gameId}/players`, player)
      );
      const responses = await Promise.all(playerPromises);
      return Promise.all(responses.map(r => r.json()));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
  });

  const gameQuery = useQuery({
    queryKey: ["/api/games", currentGameId],
    enabled: !!currentGameId,
  });

  const gameStateQuery = useQuery({
    queryKey: ["/api/games", currentGameId, "state"],
    enabled: !!currentGameId,
  });

  const playersWithScoresQuery = useQuery({
    queryKey: ["/api/games", currentGameId, "players-with-scores"],
    enabled: !!currentGameId,
  });

  const startNewGame = useCallback(async () => {
    if (!gameOptions.playerNames || gameOptions.playerNames.length === 0) {
      throw new Error("Player names are required");
    }

    const gameData: InsertGame = {
      name: `Rummy Game ${new Date().toLocaleDateString()}`,
      playerCount: gameOptions.playerCount!,
      forPoints: gameOptions.forPoints!,
      buyInAmount: gameOptions.buyInAmount || "0",
      currency: gameOptions.currency!,
      packPoints: gameOptions.packPoints!,
      midPackPoints: gameOptions.midPackPoints!,
      fullCountPoints: gameOptions.fullCountPoints!,
      jokerType: gameOptions.jokerType!,
      sequenceCount: gameOptions.sequenceCount!,
      allTripsDoublePoints: gameOptions.allTripsDoublePoints!,
      allSeqsDoublePoints: gameOptions.allSeqsDoublePoints!,
      allJokersFullMoney: gameOptions.allJokersFullMoney!,
      reEntryAllowed: gameOptions.reEntryAllowed!,
    };

    const game = await createGameMutation.mutateAsync(gameData);
    
    const players = gameOptions.playerNames.map((name, index) => ({
      name,
      position: index + 1,
    }));

    await createPlayerMutation.mutateAsync({ gameId: game.id, players });
    
    return game;
  }, [gameOptions, createGameMutation, createPlayerMutation]);

  const resetGame = useCallback(() => {
    setCurrentGameId(null);
    setGameOptions({
      playerCount: 3,
      forPoints: 101,
      buyInAmount: "",
      currency: "$",
      packPoints: 25,
      midPackPoints: 50,
      fullCountPoints: 80,
      jokerType: "opposite",
      sequenceCount: 2,
      allTripsDoublePoints: true,
      allSeqsDoublePoints: false,
      allJokersFullMoney: false,
      reEntryAllowed: true,
      playerNames: [],
    });
  }, []);

  return {
    gameOptions,
    updateGameOptions,
    currentGameId,
    setCurrentGameId,
    startNewGame,
    resetGame,
    gameQuery,
    gameStateQuery,
    playersWithScoresQuery,
    createGameMutation,
    createPlayerMutation,
  };
}
