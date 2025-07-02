import { 
  games, 
  gamePlayers, 
  gameRounds, 
  gameScores, 
  gameSettlements,
  type Game, 
  type GamePlayer, 
  type GameRound, 
  type GameScore,
  type GameSettlement,
  type InsertGame, 
  type InsertGamePlayer, 
  type InsertGameRound, 
  type InsertGameScore,
  type InsertGameSettlement,
  type GameState,
  type PlayerWithScores
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Game operations
  createGame(game: InsertGame): Promise<Game>;
  getGame(id: number): Promise<Game | undefined>;
  updateGameStatus(id: number, status: string): Promise<void>;
  
  // Player operations
  createGamePlayer(player: InsertGamePlayer): Promise<GamePlayer>;
  getGamePlayers(gameId: number): Promise<GamePlayer[]>;
  updatePlayerStatus(playerId: number, isActive: boolean, hasReEntered?: boolean): Promise<void>;
  
  // Round operations
  createGameRound(round: InsertGameRound): Promise<GameRound>;
  getGameRounds(gameId: number): Promise<GameRound[]>;
  
  // Score operations
  createGameScore(score: InsertGameScore): Promise<GameScore>;
  getGameScores(gameId: number): Promise<GameScore[]>;
  updateGameScore(scoreId: number, score: number): Promise<void>;
  
  // Settlement operations
  createGameSettlement(settlement: InsertGameSettlement): Promise<GameSettlement>;
  getGameSettlements(gameId: number): Promise<GameSettlement[]>;
  
  // Complex queries
  getGameState(gameId: number): Promise<GameState | undefined>;
  getPlayersWithScores(gameId: number): Promise<PlayerWithScores[]>;
}

export class DatabaseStorage implements IStorage {
  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async updateGameStatus(id: number, status: string): Promise<void> {
    await db
      .update(games)
      .set({ status, updatedAt: new Date() })
      .where(eq(games.id, id));
  }

  async createGamePlayer(insertPlayer: InsertGamePlayer): Promise<GamePlayer> {
    const [player] = await db
      .insert(gamePlayers)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async getGamePlayers(gameId: number): Promise<GamePlayer[]> {
    return await db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.gameId, gameId))
      .orderBy(asc(gamePlayers.position));
  }

  async updatePlayerStatus(playerId: number, isActive: boolean, hasReEntered?: boolean): Promise<void> {
    const updateData: any = { isActive };
    if (hasReEntered !== undefined) {
      updateData.hasReEntered = hasReEntered;
    }
    
    await db
      .update(gamePlayers)
      .set(updateData)
      .where(eq(gamePlayers.id, playerId));
  }

  async createGameRound(insertRound: InsertGameRound): Promise<GameRound> {
    const [round] = await db
      .insert(gameRounds)
      .values(insertRound)
      .returning();
    return round;
  }

  async getGameRounds(gameId: number): Promise<GameRound[]> {
    return await db
      .select()
      .from(gameRounds)
      .where(eq(gameRounds.gameId, gameId))
      .orderBy(asc(gameRounds.roundNumber));
  }

  async createGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const [score] = await db
      .insert(gameScores)
      .values(insertScore)
      .returning();
    return score;
  }

  async getGameScores(gameId: number): Promise<GameScore[]> {
    return await db
      .select()
      .from(gameScores)
      .where(eq(gameScores.gameId, gameId));
  }

  async updateGameScore(scoreId: number, score: number): Promise<void> {
    await db
      .update(gameScores)
      .set({ score })
      .where(eq(gameScores.id, scoreId));
  }

  async createGameSettlement(insertSettlement: InsertGameSettlement): Promise<GameSettlement> {
    const [settlement] = await db
      .insert(gameSettlements)
      .values(insertSettlement)
      .returning();
    return settlement;
  }

  async getGameSettlements(gameId: number): Promise<GameSettlement[]> {
    return await db
      .select()
      .from(gameSettlements)
      .where(eq(gameSettlements.gameId, gameId));
  }

  async getGameState(gameId: number): Promise<GameState | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return undefined;

    const [players, rounds, scores, settlements] = await Promise.all([
      this.getGamePlayers(gameId),
      this.getGameRounds(gameId),
      this.getGameScores(gameId),
      this.getGameSettlements(gameId)
    ]);

    return {
      game,
      players,
      rounds,
      scores,
      settlements
    };
  }

  async getPlayersWithScores(gameId: number): Promise<PlayerWithScores[]> {
    const [players, scores, game] = await Promise.all([
      this.getGamePlayers(gameId),
      this.getGameScores(gameId),
      this.getGame(gameId)
    ]);

    if (!game) return [];

    return players.map(player => {
      const playerScores = scores.filter(s => s.playerId === player.id);
      const totalScore = playerScores.reduce((sum, score) => sum + score.score, 0);
      const pointsLeft = Math.max(0, game.forPoints - totalScore);
      const packsRemaining = Math.floor(pointsLeft / game.packPoints);
      const residualPoints = pointsLeft % game.packPoints;

      return {
        ...player,
        scores: playerScores,
        totalScore,
        pointsLeft,
        packsRemaining,
        residualPoints
      };
    });
  }
}

export const storage = new DatabaseStorage();
