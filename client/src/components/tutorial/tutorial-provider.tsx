import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  page: string; // Which page this step belongs to
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'focus' | 'scroll';
  nextAction?: () => void;
  prevAction?: () => void;
  points?: number;
  unlockNext?: boolean;
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  totalPoints: number;
  completedSteps: Set<string>;
  startTutorial: () => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  markStepCompleted: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

const tutorialSteps: TutorialStep[] = [
  // Welcome Page Steps
  {
    id: 'welcome-intro',
    title: 'Welcome to Rummy Scorer! 🎉',
    description: 'Your free companion for scoring and settlement. Let\'s take a quick tour to get you started!',
    target: '.main-title',
    page: '/',
    position: 'bottom',
    points: 10,
  },
  {
    id: 'welcome-start',
    title: 'Start Your First Game',
    description: 'Click this button to begin setting up your first rummy game with custom rules.',
    target: '.start-game-btn',
    page: '/',
    position: 'top',
    action: 'click',
    points: 20,
  },
  
  // Game Options Steps
  {
    id: 'game-options-intro',
    title: 'Game Rules Setup',
    description: 'Here you can customize all the rules for your rummy game. Let\'s explore the main settings first.',
    target: '.main-settings-card',
    page: '/game-options',
    position: 'top',
    points: 15,
  },
  {
    id: 'players-selection',
    title: 'Select Number of Players',
    description: 'Choose how many players will be in your game. You can select between 2-7 players.',
    target: '[data-tutorial="players-section"]',
    page: '/game-options',
    position: 'bottom',
    points: 25,
  },
  {
    id: 'points-selection',
    title: 'Set Maximum Points',
    description: 'Choose the target points for your game. 101 is traditional, but you can also pick 100 or set a custom value.',
    target: '[data-tutorial="points-section"]',
    page: '/game-options',
    position: 'bottom',
    points: 25,
  },
  {
    id: 'pack-points',
    title: 'Configure Pack Points',
    description: 'Set the points players get when they "pack" (fold their hand). This is typically 20 points.',
    target: '[data-tutorial="pack-points-section"]',
    page: '/game-options',
    position: 'bottom',
    points: 30,
  },
  {
    id: 'advanced-settings',
    title: 'Advanced Settings',
    description: 'These purple-labeled settings let you fine-tune joker rules, buy-ins, and special scoring options.',
    target: '.advanced-settings-card',
    page: '/game-options',
    position: 'top',
    points: 20,
  },
  {
    id: 'implied-rules',
    title: 'Game Rules Reference',
    description: 'These green-labeled rules show you the implied game rules based on your settings. They help clarify how the game will work.',
    target: '.implied-rules-card',
    page: '/game-options',
    position: 'top',
    points: 15,
  },
  {
    id: 'continue-to-names',
    title: 'Ready for Player Names',
    description: 'Once you\'re happy with your settings, click Continue to add player names.',
    target: '.continue-btn',
    page: '/game-options',
    position: 'top',
    action: 'click',
    points: 30,
  },
  
  // Player Names Steps
  {
    id: 'player-names-intro',
    title: 'Add Player Names',
    description: 'Enter the names of all players who will be participating in the game.',
    target: '.player-names-card',
    page: '/player-names',
    position: 'top',
    points: 20,
  },
  {
    id: 'default-names',
    title: 'Quick Fill Option',
    description: 'Use "Default Names" to quickly fill empty fields with Player 1, Player 2, etc.',
    target: '.default-names-btn',
    page: '/player-names',
    position: 'bottom',
    points: 15,
  },
  {
    id: 'start-game',
    title: 'Start the Game!',
    description: 'Click "Start Game" to begin scoring. You\'ll be taken to the scoring interface.',
    target: '.start-game-btn',
    page: '/player-names',
    position: 'top',
    action: 'click',
    points: 40,
  },
  
  // Scoring Steps
  {
    id: 'scoring-intro',
    title: 'Scoring Interface',
    description: 'This is where the magic happens! Each row shows a player, and columns represent game rounds.',
    target: '.scoring-table',
    page: '/scoring/*',
    position: 'top',
    points: 25,
  },
  {
    id: 'score-input',
    title: 'Enter Scores',
    description: 'Click on a score box to see quick options (Rummy, Pack, etc.) or type any custom score directly.',
    target: '.score-input:first-child',
    page: '/scoring/*',
    position: 'bottom',
    points: 35,
  },
  {
    id: 'player-stats',
    title: 'Player Statistics',
    description: 'Check each player\'s total score, remaining points, and packs left. Colors indicate player status.',
    target: '.player-stats',
    page: '/scoring/*',
    position: 'left',
    points: 25,
  },
  {
    id: 'game-completion',
    title: 'Game End Detection',
    description: 'The game automatically detects when it\'s over and will show settlement options.',
    target: '.settlement-btn',
    page: '/scoring/*',
    position: 'top',
    points: 30,
  },
  
  // Settlement Steps
  {
    id: 'settlement-intro',
    title: 'Final Settlement',
    description: 'Here you can see the final money distribution based on everyone\'s scores and the buy-in amount.',
    target: '.settlement-summary',
    page: '/settlement/*',
    position: 'top',
    points: 30,
  },
  {
    id: 'settlement-share',
    title: 'Share Results',
    description: 'Share the final results with all players or start a new game.',
    target: '.share-btn',
    page: '/settlement/*',
    position: 'bottom',
    points: 25,
  },
];

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [location] = useLocation();

  // Load tutorial progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('rummy-tutorial-progress');
    if (savedProgress) {
      const { points, completed } = JSON.parse(savedProgress);
      setTotalPoints(points || 0);
      setCompletedSteps(new Set(completed || []));
    }
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('rummy-tutorial-progress', JSON.stringify({
      points: totalPoints,
      completed: [...completedSteps],
    }));
  }, [totalPoints, completedSteps]);

  const startTutorial = () => {
    setIsActive(true);
    setCurrentStep(0);
  };

  const stopTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      const current = tutorialSteps[currentStep];
      if (current.nextAction) {
        current.nextAction();
      }
      setCurrentStep(currentStep + 1);
    } else {
      stopTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const current = tutorialSteps[currentStep];
      if (current.prevAction) {
        current.prevAction();
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    stopTutorial();
  };

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.has(stepId)) {
      const step = tutorialSteps.find(s => s.id === stepId);
      if (step) {
        setCompletedSteps(prev => new Set([...prev, stepId]));
        setTotalPoints(prev => prev + (step.points || 0));
      }
    }
  };

  const isStepCompleted = (stepId: string) => {
    return completedSteps.has(stepId);
  };

  // Filter steps based on current page
  const currentPageSteps = tutorialSteps.filter(step => {
    if (step.page === location) return true;
    if (step.page.endsWith('/*')) {
      const basePage = step.page.slice(0, -2);
      return location.startsWith(basePage);
    }
    return false;
  });

  const contextValue: TutorialContextType = {
    isActive,
    currentStep,
    steps: currentPageSteps,
    totalPoints,
    completedSteps,
    startTutorial,
    stopTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    markStepCompleted,
    isStepCompleted,
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
};