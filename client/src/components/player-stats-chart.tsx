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
  roundScores: { round: number; score: number; color: string }[];
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

  // Color palette for rounds - each round gets a different color
  const roundColors = [
    '#3B82F6', // Blue - Round 1
    '#10B981', // Green - Round 2
    '#F59E0B', // Yellow - Round 3
    '#EF4444', // Red - Round 4
    '#8B5CF6', // Purple - Round 5
    '#F97316', // Orange - Round 6
    '#06B6D4', // Cyan - Round 7
    '#EC4899', // Pink - Round 8
    '#64748B', // Slate - Round 9
    '#DC2626', // Red alt - Round 10
  ];

  const calculatePlayerStats = (): PlayerStat[] => {
    return players.map((player, index) => {
      let totalScore = 0;
      const roundScores: { round: number; score: number; color: string }[] = [];
      
      // Only include completed rounds (not current round unless game is complete)
      Object.entries(scores[player.id] || {}).forEach(([roundStr, score]) => {
        const roundNum = parseInt(roundStr);
        const numScore = typeof score === 'string' ? parseInt(score) || 0 : score;
        
        // Only animate/show rounds that are complete (before current round, or if game is complete)
        if (roundNum < currentRound || gameComplete) {
          totalScore += numScore;
          
          // Include all scores (including 0) to show round participation
          roundScores.push({
            round: roundNum,
            score: numScore,
            color: roundColors[(roundNum - 1) % roundColors.length]
          });
        }
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
        roundScores
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

  // Limit graph at MaxScore + 10, don't scale beyond that
  const maxScore = Math.max(...animatedStats.map(stat => stat.totalScore), game.forPoints) + 10;
  const chartHeight = 200;
  
  // Calculate target line position correctly - it should be at forPoints level
  // The chart area starts at 32px from bottom (pb-8), and the target line should be positioned
  // relative to the chart's coordinate system
  const targetLinePosition = 32 + (game.forPoints / maxScore) * chartHeight;
  
  // Debug: Compare target line with actual bar calculations
  console.log('Target line vs bar comparison:', {
    forPoints: game.forPoints,
    maxScore,
    chartHeight,
    targetLinePosition,
    pradeepScore: 75,
    pradeepBarHeight: (75 / maxScore) * chartHeight,
    pradeepBarTop: 32 + (75 / maxScore) * chartHeight,
    shouldTargetBeHigher: game.forPoints > 75,
    visualDifference: targetLinePosition - (32 + (75 / maxScore) * chartHeight)
  });
  


  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Player Statistics</h3>
        <div className="text-sm text-gray-400">
          Target: {game.forPoints} points
        </div>
      </div>
      
      {/* Legend - showing round colors */}
      <div className="mb-4">
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          {Array.from({ length: Math.max(currentRound - 1, 1) }, (_, i) => i + 1).map((round) => (
            <div key={round} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: roundColors[(round - 1) % roundColors.length] }}
              />
              <span className="text-gray-300">Round {round}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative mx-auto" style={{ height: chartHeight + 40, maxWidth: '98%' }}>
        {/* Chart container */}
        <div className="flex items-end justify-around h-full pb-8 overflow-x-auto">
          <AnimatePresence>
            {animatedStats.map((stat, index) => {
              const barHeight = (stat.totalScore / maxScore) * chartHeight;
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
                  
                  {/* Stacked Bar - showing each round's contribution */}
                  <motion.div
                    className="w-12 rounded-t-lg relative overflow-hidden flex flex-col-reverse"
                    style={{ 
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
                    
                    {/* Render each round as a segment */}
                    {stat.roundScores.map((roundScore, roundIndex) => {
                      const segmentHeight = stat.totalScore > 0 ? (roundScore.score / stat.totalScore) * barHeight : 0;
                      return (
                        <motion.div
                          key={roundScore.round}
                          className="w-full border-b border-gray-700/30"
                          style={{ 
                            backgroundColor: roundScore.color,
                            height: segmentHeight,
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: segmentHeight }}
                          transition={{ 
                            duration: 0.6, 
                            ease: "easeOut",
                            delay: (index * 0.1) + (roundIndex * 0.1)
                          }}
                        />
                      );
                    })}
                    
                    {/* Add a fallback single color bar if no round scores */}
                    {stat.roundScores.length === 0 && stat.totalScore > 0 && (
                      <motion.div
                        className="w-full"
                        style={{ 
                          backgroundColor: roundColors[0],
                          height: barHeight,
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: barHeight }}
                        transition={{ 
                          duration: 0.8, 
                          ease: "easeOut",
                          delay: index * 0.1 
                        }}
                      />
                    )}
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
        
        {/* Horizontal grid lines at pack point multiples */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: Math.floor(maxScore / game.packPoints) }, (_, i) => (i + 1) * game.packPoints)
            .filter(packValue => packValue < maxScore)
            .map((packValue, index) => (
            <div
              key={index}
              className="absolute w-full border-t border-gray-600/30"
              style={{ 
                bottom: `${32 + (packValue / maxScore) * chartHeight}px`,
              }}
            />
          ))}
        </div>
        
        {/* Target line */}
        <motion.div
          className="absolute w-full border-t-2 border-dashed border-red-400/60"
          style={{ 
            bottom: `${targetLinePosition}px`,
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
    </div>
  );
};

export default PlayerStatsChart;