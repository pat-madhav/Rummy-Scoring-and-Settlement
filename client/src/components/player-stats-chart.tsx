import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Game, GamePlayer, GameScore } from '@/../../shared/schema';

interface PlayerStatsChartProps {
  game: Game;
  players: GamePlayer[];
  scores: Record<number, Record<number, string>>;
  currentRound: number;
  gameComplete: boolean;
}

interface PlayerStat {
  id: number;
  name: string;
  totalScore: number;
  pointsLeft: number;
  packsRemaining: number;
  percentage: number;
  color: string;
}

const PlayerStatsChart: React.FC<PlayerStatsChartProps> = ({
  game,
  players,
  scores,
  currentRound,
  gameComplete
}) => {
  const [animatedStats, setAnimatedStats] = useState<PlayerStat[]>([]);
  const [prevStats, setPrevStats] = useState<PlayerStat[]>([]);

  // Color palette for players
  const playerColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#EC4899', // Pink
  ];

  const calculatePlayerStats = (): PlayerStat[] => {
    return players.map((player, index) => {
      let totalScore = 0;
      
      // Calculate total score from all rounds
      Object.entries(scores[player.id] || {}).forEach(([roundStr, score]) => {
        const numScore = typeof score === 'string' ? parseInt(score) || 0 : score;
        totalScore += numScore;
      });

      const pointsLeft = Math.max(0, game.forPoints - totalScore);
      const packsRemaining = Math.floor(pointsLeft / game.packPoints);
      
      // Calculate percentage based on progress towards forPoints
      const percentage = Math.min((totalScore / game.forPoints) * 100, 100);
      
      return {
        id: player.id,
        name: player.name,
        totalScore,
        pointsLeft,
        packsRemaining,
        percentage,
        color: playerColors[index % playerColors.length]
      };
    });
  };

  // Update stats and trigger animation
  useEffect(() => {
    const newStats = calculatePlayerStats();
    
    // Store previous stats for animation comparison
    setPrevStats(animatedStats);
    
    // Animate to new stats
    setTimeout(() => {
      setAnimatedStats(newStats);
    }, 100);
  }, [scores, currentRound, game]);

  // Initial load
  useEffect(() => {
    const initialStats = calculatePlayerStats();
    setAnimatedStats(initialStats);
  }, []);

  const maxScore = Math.max(...animatedStats.map(stat => stat.totalScore), 1);
  const chartHeight = 200;

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Player Statistics</h3>
        <div className="text-sm text-gray-400">
          Target: {game.forPoints} points
        </div>
      </div>
      
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Chart container */}
        <div className="flex items-end justify-around h-full pb-8">
          <AnimatePresence>
            {animatedStats.map((stat, index) => {
              const barHeight = (stat.totalScore / Math.max(maxScore, game.forPoints)) * chartHeight;
              const isWinner = gameComplete && stat.totalScore <= game.forPoints && 
                              animatedStats.filter(s => s.totalScore <= game.forPoints).length === 1 &&
                              stat.totalScore === Math.min(...animatedStats.filter(s => s.totalScore <= game.forPoints).map(s => s.totalScore));
              
              return (
                <motion.div
                  key={stat.id}
                  className="relative flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Score value on top */}
                  <motion.div
                    className="absolute -top-8 text-sm font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    {stat.totalScore}
                  </motion.div>
                  
                  {/* Bar */}
                  <motion.div
                    className="w-12 rounded-t-lg relative overflow-hidden"
                    style={{ 
                      backgroundColor: stat.color,
                      opacity: stat.totalScore >= game.forPoints ? 0.5 : 1
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{ 
                      duration: 0.8, 
                      ease: "easeOut",
                      delay: index * 0.1 
                    }}
                  >
                    {/* Winner crown effect */}
                    {isWinner && (
                      <motion.div
                        className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                      >
                        <div className="text-yellow-400 text-lg">👑</div>
                      </motion.div>
                    )}
                    
                    {/* Progress gradient */}
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/20 to-transparent"
                      style={{ height: '30%' }}
                    />
                  </motion.div>
                  
                  {/* Player name */}
                  <div className="mt-2 text-xs text-gray-300 text-center max-w-16 truncate">
                    {stat.name}
                  </div>
                  
                  {/* Points left indicator */}
                  <div className="text-xs text-gray-400 mt-1">
                    {stat.pointsLeft > 0 ? `${stat.pointsLeft} left` : 'OUT'}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[0.25, 0.5, 0.75, 1].map((fraction, index) => (
            <div
              key={index}
              className="absolute w-full border-t border-gray-600/30"
              style={{ 
                bottom: `${32 + (chartHeight * fraction)}px`,
              }}
            />
          ))}
        </div>
        
        {/* Target line */}
        <motion.div
          className="absolute w-full border-t-2 border-dashed border-red-400/60"
          style={{ 
            bottom: `${32 + (game.forPoints / Math.max(maxScore, game.forPoints)) * chartHeight}px`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="absolute right-2 -top-5 text-xs text-red-400 bg-gray-800 px-2 py-1 rounded">
            Target: {game.forPoints}
          </div>
        </motion.div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs">
        {animatedStats.map((stat, index) => (
          <div key={stat.id} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: stat.color }}
            />
            <span className="text-gray-300">{stat.name}</span>
            <span className="text-gray-400">({stat.totalScore})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatsChart;