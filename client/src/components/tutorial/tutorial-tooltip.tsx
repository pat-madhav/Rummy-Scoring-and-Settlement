import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X, Trophy, Star, Target } from 'lucide-react';
import { useTutorial } from './tutorial-provider';

interface TutorialTooltipProps {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  points?: number;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  targetSelector,
  title,
  description,
  position,
  points = 0,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { totalPoints, markStepCompleted } = useTutorial();

  useEffect(() => {
    const updatePosition = () => {
      const targetElement = document.querySelector(targetSelector);
      if (targetElement && tooltipRef.current) {
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        let top = 0;
        let left = 0;

        switch (position) {
          case 'top':
            top = targetRect.top + scrollY - tooltipRect.height - 16;
            left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'bottom':
            top = targetRect.bottom + scrollY + 16;
            left = targetRect.left + scrollX + (targetRect.width - tooltipRect.width) / 2;
            break;
          case 'left':
            top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.left + scrollX - tooltipRect.width - 16;
            break;
          case 'right':
            top = targetRect.top + scrollY + (targetRect.height - tooltipRect.height) / 2;
            left = targetRect.right + scrollX + 16;
            break;
        }

        // Ensure tooltip stays within viewport
        const maxLeft = window.innerWidth - tooltipRect.width - 16;
        const maxTop = window.innerHeight - tooltipRect.height - 16;

        left = Math.max(16, Math.min(left, maxLeft));
        top = Math.max(16, Math.min(top, maxTop));

        setTooltipPosition({ top, left });
      }
    };

    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
      // Add highlight to target element
      targetElement.classList.add('tutorial-highlight');
      
      // Update position initially and on resize/scroll
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      
      // Make tooltip visible
      setTimeout(() => setIsVisible(true), 100);

      return () => {
        targetElement.classList.remove('tutorial-highlight');
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [targetSelector, position]);

  const handleNext = () => {
    if (points > 0) {
      setShowPoints(true);
      markStepCompleted(`step-${stepNumber}`);
      setTimeout(() => {
        setShowPoints(false);
        onNext();
      }, 1500);
    } else {
      onNext();
    }
  };

  const progress = (stepNumber / totalSteps) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300" 
           style={{ opacity: isVisible ? 1 : 0 }} />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`fixed z-50 w-80 max-w-sm transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        <Card className="bg-white dark:bg-gray-800 border-2 border-blue-500 shadow-2xl">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {stepNumber} of {totalSteps}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Tutorial Progress</span>
                <div className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-600">{totalPoints}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {description}
              </p>
              {points > 0 && (
                <div className="mt-3 flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-yellow-600">
                    +{points} points for completing this step
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                disabled={isFirst}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip Tour
              </Button>
              
              <Button
                size="sm"
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <span>{isLast ? 'Finish' : 'Next'}</span>
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Arrow pointing to target */}
        <div
          className={`absolute w-0 h-0 ${
            position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-500' :
            position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-blue-500' :
            position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent border-l-blue-500' :
            'right-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent border-r-blue-500'
          }`}
        />
      </div>

      {/* Points Animation */}
      {showPoints && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-60">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span className="font-bold text-lg">+{points} Points!</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};