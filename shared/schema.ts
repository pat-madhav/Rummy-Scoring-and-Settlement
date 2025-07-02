import { pgTable, text, serial, integer, boolean, timestamp, json, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  playerCount: integer("player_count").notNull(),
  forPoints: integer("for_points").notNull(),
  buyInAmount: decimal("buy_in_amount", { precision: 10, scale: 2 }),
  currency: text("currency").notNull().default("$"),
  packPoints: integer("pack_points").notNull().default(25),
  midPackPoints: integer("mid_pack_points").notNull().default(50),
  fullCountPoints: integer("full_count_points").notNull().default(80),
  jokerType: text("joker_type").notNull().default("opposite"),
  sequenceCount: integer("sequence_count").notNull().default(2),
  allTripsDoublePoints: boolean("all_trips_double_points").notNull().default(true),
  allSeqsDoublePoints: boolean("all_seqs_double_points").notNull().default(false),
  allJokersFullMoney: boolean("all_jokers_full_money").notNull().default(false),
  reEntryAllowed: boolean("re_entry_allowed").notNull().default(true),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gamePlayers = pgTable("game_players", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  hasReEntered: boolean("has_re_entered").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameRounds = pgTable("game_rounds", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  roundNumber: integer("round_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  playerId: integer("player_id").notNull().references(() => gamePlayers.id),
  roundId: integer("round_id").notNull().references(() => gameRounds.id),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameSettlements = pgTable("game_settlements", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").notNull().references(() => games.id),
  playerId: integer("player_id").notNull().references(() => gamePlayers.id),
  finalScore: integer("final_score").notNull(),
  pointsLeft: integer("points_left").notNull(),
  packsRemaining: integer("packs_remaining").notNull(),
  residualPoints: integer("residual_points").notNull(),
  settlementAmount: decimal("settlement_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const gamesRelations = relations(games, ({ many }) => ({
  players: many(gamePlayers),
  rounds: many(gameRounds),
  scores: many(gameScores),
  settlements: many(gameSettlements),
}));

export const gamePlayersRelations = relations(gamePlayers, ({ one, many }) => ({
  game: one(games, {
    fields: [gamePlayers.gameId],
    references: [games.id],
  }),
  scores: many(gameScores),
  settlement: one(gameSettlements),
}));

export const gameRoundsRelations = relations(gameRounds, ({ one, many }) => ({
  game: one(games, {
    fields: [gameRounds.gameId],
    references: [games.id],
  }),
  scores: many(gameScores),
}));

export const gameScoresRelations = relations(gameScores, ({ one }) => ({
  game: one(games, {
    fields: [gameScores.gameId],
    references: [games.id],
  }),
  player: one(gamePlayers, {
    fields: [gameScores.playerId],
    references: [gamePlayers.id],
  }),
  round: one(gameRounds, {
    fields: [gameScores.roundId],
    references: [gameRounds.id],
  }),
}));

export const gameSettlementsRelations = relations(gameSettlements, ({ one }) => ({
  game: one(games, {
    fields: [gameSettlements.gameId],
    references: [games.id],
  }),
  player: one(gamePlayers, {
    fields: [gameSettlements.playerId],
    references: [gamePlayers.id],
  }),
}));

// Schemas
export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGamePlayerSchema = createInsertSchema(gamePlayers).omit({
  id: true,
  createdAt: true,
});

export const insertGameRoundSchema = createInsertSchema(gameRounds).omit({
  id: true,
  createdAt: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores).omit({
  id: true,
  createdAt: true,
});

export const insertGameSettlementSchema = createInsertSchema(gameSettlements).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGamePlayer = z.infer<typeof insertGamePlayerSchema>;
export type GamePlayer = typeof gamePlayers.$inferSelect;
export type InsertGameRound = z.infer<typeof insertGameRoundSchema>;
export type GameRound = typeof gameRounds.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type GameScore = typeof gameScores.$inferSelect;
export type InsertGameSettlement = z.infer<typeof insertGameSettlementSchema>;
export type GameSettlement = typeof gameSettlements.$inferSelect;

// Game state types
export type GameState = {
  game: Game;
  players: GamePlayer[];
  rounds: GameRound[];
  scores: GameScore[];
  settlements?: GameSettlement[];
};

export type PlayerWithScores = GamePlayer & {
  scores: GameScore[];
  totalScore: number;
  pointsLeft: number;
  packsRemaining: number;
  residualPoints: number;
};
