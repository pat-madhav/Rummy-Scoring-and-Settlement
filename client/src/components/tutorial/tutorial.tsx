import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { TutorialTooltip } from './tutorial-tooltip';
import { useTutorial } from './tutorial-provider';

export const Tutorial: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    steps, 
    nextStep, 
    prevStep, 
    skipTutorial,
    markStepCompleted 
  } = useTutorial();
  const [location] = useLocation();

  // Filter steps for current page
  const currentPageSteps = steps.filter(step => {
    if (step.page === location) return true;
    if (step.page.endsWith('/*')) {
      const basePage = step.page.slice(0, -2);
      return location.startsWith(basePage);
    }
    return false;
  });

  const currentStepData = currentPageSteps[currentStep];

  // Auto-advance when user performs actions
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const handleInteraction = (event: Event) => {
      if (currentStepData.action) {
        const target = event.target as HTMLElement;
        const targetElement = document.querySelector(currentStepData.target);
        
        if (targetElement && (targetElement === target || targetElement.contains(target))) {
          if (currentStepData.action === 'click' && event.type === 'click') {
            markStepCompleted(currentStepData.id);
            setTimeout(() => nextStep(), 1000);
          } else if (currentStepData.action === 'focus' && event.type === 'focus') {
            markStepCompleted(currentStepData.id);
            setTimeout(() => nextStep(), 1000);
          }
        }
      }
    };

    if (currentStepData.action === 'click') {
      document.addEventListener('click', handleInteraction);
    } else if (currentStepData.action === 'focus') {
      document.addEventListener('focus', handleInteraction, true);
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('focus', handleInteraction, true);
    };
  }, [isActive, currentStep, currentStepData, nextStep, markStepCompleted]);

  if (!isActive || !currentStepData || currentPageSteps.length === 0) {
    return null;
  }

  return (
    <TutorialTooltip
      targetSelector={currentStepData.target}
      title={currentStepData.title}
      description={currentStepData.description}
      position={currentStepData.position}
      points={currentStepData.points}
      stepNumber={currentStep + 1}
      totalSteps={currentPageSteps.length}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTutorial}
      isFirst={currentStep === 0}
      isLast={currentStep === currentPageSteps.length - 1}
    />
  );
};