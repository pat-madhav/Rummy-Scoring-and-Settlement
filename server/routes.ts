import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertGameSchema, 
  insertGamePlayerSchema, 
  insertGameRoundSchema, 
  insertGameScoreSchema,
  insertGameSettlementSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game routes
  app.post("/api/games", async (req, res) => {
    try {
      const gameData = insertGameSchema.parse(req.body);
      const game = await storage.createGame(gameData);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: "Invalid game data" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const game = await storage.getGame(id);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  app.put("/api/games/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      await storage.updateGameStatus(id, status);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update game status" });
    }
  });

  // Player routes
  app.post("/api/games/:gameId/players", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const playerData = insertGamePlayerSchema.parse({ ...req.body, gameId });
      const player = await storage.createGamePlayer(playerData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: "Invalid player data" });
    }
  });

  app.get("/api/games/:gameId/players", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const players = await storage.getGamePlayers(gameId);
      res.json(players);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });

  app.put("/api/players/:playerId/status", async (req, res) => {
    try {
      const playerId = parseInt(req.params.playerId);
      const { isActive, hasReEntered } = req.body;
      await storage.updatePlayerStatus(playerId, isActive, hasReEntered);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update player status" });
    }
  });

  // Round routes
  app.post("/api/games/:gameId/rounds", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const roundData = insertGameRoundSchema.parse({ ...req.body, gameId });
      const round = await storage.createGameRound(roundData);
      res.json(round);
    } catch (error) {
      res.status(400).json({ error: "Invalid round data" });
    }
  });

  app.get("/api/games/:gameId/rounds", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const rounds = await storage.getGameRounds(gameId);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rounds" });
    }
  });

  // Score routes
  app.post("/api/games/:gameId/scores", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const scoreData = insertGameScoreSchema.parse({ ...req.body, gameId });
      const score = await storage.createGameScore(scoreData);
      res.json(score);
    } catch (error) {
      res.status(400).json({ error: "Invalid score data" });
    }
  });

  app.get("/api/games/:gameId/scores", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const scores = await storage.getGameScores(gameId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });

  app.put("/api/scores/:scoreId", async (req, res) => {
    try {
      const scoreId = parseInt(req.params.scoreId);
      const { score } = req.body;
      await storage.updateGameScore(scoreId, score);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update score" });
    }
  });

  // Settlement routes
  app.post("/api/games/:gameId/settlements", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const settlementData = insertGameSettlementSchema.parse({ ...req.body, gameId });
      const settlement = await storage.createGameSettlement(settlementData);
      res.json(settlement);
    } catch (error) {
      res.status(400).json({ error: "Invalid settlement data" });
    }
  });

  app.get("/api/games/:gameId/settlements", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const settlements = await storage.getGameSettlements(gameId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  });

  // Complex queries
  app.get("/api/games/:gameId/state", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const gameState = await storage.getGameState(gameId);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game state" });
    }
  });

  app.get("/api/games/:gameId/players-with-scores", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const playersWithScores = await storage.getPlayersWithScores(gameId);
      res.json(playersWithScores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch players with scores" });
    }
  });

  // Settlement calculation endpoint
  app.post("/api/games/:gameId/calculate-settlement", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const gameState = await storage.getGameState(gameId);
      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }

      const playersWithScores = await storage.getPlayersWithScores(gameId);
      const { game } = gameState;
      
      // Calculate settlement amounts
      const settlements = playersWithScores.map(player => {
        const finalScore = player.totalScore;
        const pointsLeft = player.pointsLeft;
        const packsRemaining = player.packsRemaining;
        const residualPoints = player.residualPoints;
        
        // Settlement algorithm: winner gets positive amount, others pay based on their excess points
        const lowestScore = Math.min(...playersWithScores.map(p => p.totalScore));
        const isWinner = finalScore === lowestScore;
        
        let settlementAmount = 0;
        if (game.buyInAmount && parseFloat(game.buyInAmount) > 0) {
          const buyIn = parseFloat(game.buyInAmount);
          const excessPoints = Math.max(0, finalScore - lowestScore);
          const pointDifference = excessPoints / game.packPoints;
          
          if (isWinner) {
            // Winner gets total of all other players' payments
            const totalPayments = playersWithScores
              .filter(p => p.id !== player.id)
              .reduce((sum, p) => {
                const otherExcess = Math.max(0, p.totalScore - lowestScore);
                const otherDifference = otherExcess / game.packPoints;
                return sum + (otherDifference * buyIn);
              }, 0);
            settlementAmount = totalPayments;
          } else {
            // Others pay based on their excess points
            settlementAmount = -(pointDifference * buyIn);
          }
        }

        return {
          playerId: player.id,
          finalScore,
          pointsLeft,
          packsRemaining,
          residualPoints,
          settlementAmount: settlementAmount.toFixed(2)
        };
      });

      res.json({ settlements });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate settlement" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
