import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Trophy, Play } from 'lucide-react';
import { useTutorial } from './tutorial-provider';

interface TutorialButtonProps {
  variant?: 'default' | 'minimal' | 'floating';
  className?: string;
}

export const TutorialButton: React.FC<TutorialButtonProps> = ({ 
  variant = 'default', 
  className = '' 
}) => {
  const { startTutorial, totalPoints, isActive } = useTutorial();

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-4 right-4 z-30 ${className}`}>
        <Button
          onClick={startTutorial}
          disabled={isActive}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="lg"
        >
          <HelpCircle className="w-6 h-6 text-white" />
        </Button>
        {totalPoints > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs min-w-6 h-6 flex items-center justify-center"
          >
            {totalPoints}
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={startTutorial}
        disabled={isActive}
        className={`flex items-center space-x-2 text-gray-600 hover:text-blue-600 ${className}`}
      >
        <HelpCircle className="w-4 h-4" />
        <span>Tutorial</span>
        {totalPoints > 0 && (
          <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">
            {totalPoints}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={startTutorial}
      disabled={isActive}
      className={`flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white ${className}`}
    >
      <Play className="w-4 h-4" />
      <span>Start Tutorial</span>
      {totalPoints > 0 && (
        <div className="flex items-center space-x-1 ml-2">
          <Trophy className="w-4 h-4 text-yellow-300" />
          <span className="text-yellow-300 font-semibold">{totalPoints}</span>
        </div>
      )}
    </Button>
  );
};