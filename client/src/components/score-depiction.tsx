import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Package, Shield } from 'lucide-react';
import type { Game, GamePlayer } from '@shared/schema';

interface ScoreDepictionProps {
  players: GamePlayer[];
  scores: Record<number, Record<number, string>>;
  game: Game;
  currentRound: number;
  getPlayerState: (playerId: number) => { state: string; color: string };
}

export function ScoreDepiction({ 
  players, 
  scores, 
  game, 
  currentRound,
  getPlayerState 
}: ScoreDepictionProps) {
  // Calculate player statistics
  const calculatePlayerStats = (playerId: number) => {
    let total = 0;
    for (let round = 1; round <= currentRound; round++) {
      const score = scores[playerId]?.[round];
      if (score !== undefined && score !== "") {
        total += parseInt(score) || 0;
      }
    }
    
    const pointsLeft = Math.max(0, game.forPoints - total);
    const packsRemaining = Math.floor(pointsLeft / game.packPoints);
    const residualPoints = pointsLeft % game.packPoints;
    const packSafe = packsRemaining > 0 ? game.packPoints - residualPoints : 0;
    
    // Calculate progress percentage (inverse - higher score means more progress toward max)
    const progressPercent = Math.min(100, (total / game.forPoints) * 100);
    
    return { total, pointsLeft, packsRemaining, packSafe, progressPercent };
  };

  // Sort players by total score (ascending - least score first)
  const sortedPlayers = [...players].sort((a, b) => {
    const aStats = calculatePlayerStats(a.id);
    const bStats = calculatePlayerStats(b.id);
    return aStats.total - bStats.total;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      <AnimatePresence mode="popLayout">
        {sortedPlayers.map((player, index) => {
          const stats = calculatePlayerStats(player.id);
          const playerState = getPlayerState(player.id);
          const isWinner = playerState.state === "Winner";
          const isOut = playerState.state === "Out";
          const isLeast = playerState.state === "Least";
          const isCompulsory = playerState.state === "Compulsory";

          return (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                layout: { duration: 0.4, type: "spring", stiffness: 300, damping: 30 }
              }}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                isWinner 
                  ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-400 dark:border-green-600 shadow-lg shadow-green-200/50 dark:shadow-green-900/50' 
                  : isOut
                  ? 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-300 dark:border-red-700 opacity-80'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'
              }`}
            >
              {/* Winner badge */}
              {isWinner && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="absolute -top-3 -right-3"
                >
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-2 shadow-lg">
                    <Trophy className="w-5 h-5" />
                  </div>
                </motion.div>
              )}

              {/* Player name and status */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {player.name}
                </h3>
                {playerState.state && (
                  <Badge 
                    variant={isWinner ? "default" : isOut ? "destructive" : "secondary"}
                    className={`text-xs ${
                      isLeast ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 
                      isCompulsory ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : ''
                    }`}
                  >
                    {playerState.state}
                  </Badge>
                )}
              </div>

              {/* Total score with animated number */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Score</span>
                  <motion.span 
                    key={stats.total}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                  >
                    {stats.total}
                  </motion.span>
                </div>
                
                {/* Progress bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ transformOrigin: "left" }}
                >
                  <Progress 
                    value={stats.progressPercent} 
                    className={`h-2 ${
                      isOut ? 'bg-red-200 dark:bg-red-900/30' : 
                      isWinner ? 'bg-green-200 dark:bg-green-900/30' :
                      'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                </motion.div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">0</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{game.forPoints}</span>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Points Left */}
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Points Left</div>
                  <motion.div 
                    key={stats.pointsLeft}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`text-lg font-semibold ${
                      stats.pointsLeft === 0 ? 'text-red-600 dark:text-red-400' : 
                      'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {stats.pointsLeft}
                  </motion.div>
                </div>

                {/* Packs */}
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                    <Package className="w-3 h-3" />
                    Packs
                  </div>
                  <motion.div 
                    key={stats.packsRemaining}
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: 0 }}
                    className={`text-lg font-semibold ${
                      stats.packsRemaining === 0 ? 'text-orange-600 dark:text-orange-400' : 
                      'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {stats.packsRemaining}
                  </motion.div>
                </div>

                {/* Pack Safe */}
                <div className="text-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" />
                    Safe
                  </div>
                  <motion.div 
                    key={stats.packSafe}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {stats.packSafe > 0 && stats.packsRemaining > 0 && stats.total > 0 ? stats.packSafe : '-'}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}