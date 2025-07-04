import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { useGameState } from "@/hooks/use-game-state";
import { calculatePacksPerGame } from "@/lib/game-utils";
import { Moon, Sun, ArrowLeft, Settings, ChevronDown, ChevronRight } from "lucide-react";

export default function GameOptionsScreen() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { gameOptions, updateGameOptions } = useGameState();
  
  const [customPoints, setCustomPoints] = useState("");
  const [showCustomPoints, setShowCustomPoints] = useState(false);
  const [customPackPoints, setCustomPackPoints] = useState("");
  const [showCustomPackPoints, setShowCustomPackPoints] = useState(false);
  const [customMidPackPoints, setCustomMidPackPoints] = useState("");
  const [showCustomMidPackPoints, setShowCustomMidPackPoints] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [showFullCountRule, setShowFullCountRule] = useState(false);
  const [fullCountRuleAnimation, setFullCountRuleAnimation] = useState("");
  const [showJokerSubOptions, setShowJokerSubOptions] = useState(false);
  const [jokerSubOptionsAnimation, setJokerSubOptionsAnimation] = useState("");
  const [showOppositeJokerOptions, setShowOppositeJokerOptions] = useState(false);
  const [oppositeJokerOptionsAnimation, setOppositeJokerOptionsAnimation] = useState("");

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handlePlayerCountChange = (count: number) => {
    updateGameOptions({ playerCount: count });
  };

  const handlePointsChange = (points: number | "custom") => {
    if (points === "custom") {
      setShowCustomPoints(true);
      if (customPoints) {
        updateGameOptions({ forPoints: parseInt(customPoints) });
      }
    } else {
      setShowCustomPoints(false);
      updateGameOptions({ forPoints: points });
    }
  };

  const handleCustomPointsChange = (value: string) => {
    setCustomPoints(value);
    if (value) {
      updateGameOptions({ forPoints: parseInt(value) });
    }
  };

  const handlePackPointsChange = (points: number | "custom") => {
    if (points === "custom") {
      setShowCustomPackPoints(true);
      if (customPackPoints) {
        updateGameOptions({ packPoints: parseInt(customPackPoints) });
      }
    } else {
      setShowCustomPackPoints(false);
      updateGameOptions({ packPoints: points });
    }
  };

  const handleCustomPackPointsChange = (value: string) => {
    setCustomPackPoints(value);
    if (value) {
      updateGameOptions({ packPoints: parseInt(value) });
    }
  };

  const handleMidPackPointsChange = (points: number | "custom") => {
    if (points === "custom") {
      setShowCustomMidPackPoints(true);
      if (customMidPackPoints) {
        updateGameOptions({ midPackPoints: parseInt(customMidPackPoints) });
      }
    } else {
      setShowCustomMidPackPoints(false);
      updateGameOptions({ midPackPoints: points });
    }
  };

  const handleCustomMidPackPointsChange = (value: string) => {
    setCustomMidPackPoints(value);
    if (value) {
      updateGameOptions({ midPackPoints: parseInt(value) });
    }
  };

  const packsPerGame = calculatePacksPerGame(gameOptions.forPoints || 101, gameOptions.packPoints || 25);

  // Handle Full-Count rule animation
  useEffect(() => {
    const shouldShow = gameOptions.fullCountPoints !== 80;
    
    if (shouldShow && !showFullCountRule) {
      setShowFullCountRule(true);
      setFullCountRuleAnimation("implied-rule-enter");
    } else if (!shouldShow && showFullCountRule) {
      setFullCountRuleAnimation("implied-rule-exit");
      setTimeout(() => {
        setShowFullCountRule(false);
        setFullCountRuleAnimation("");
      }, 600); // Match animation duration
    }
  }, [gameOptions.fullCountPoints, showFullCountRule]);

  // Handle Joker sub-options animation
  useEffect(() => {
    const shouldShow = gameOptions.jokerType === "all";
    
    if (shouldShow && !showJokerSubOptions) {
      setShowJokerSubOptions(true);
      setJokerSubOptionsAnimation("implied-rule-enter");
    } else if (!shouldShow && showJokerSubOptions) {
      setJokerSubOptionsAnimation("implied-rule-exit");
      setTimeout(() => {
        setShowJokerSubOptions(false);
        setJokerSubOptionsAnimation("");
      }, 600); // Match animation duration
    }
  }, [gameOptions.jokerType, showJokerSubOptions]);

  // Handle Opposite joker sub-options animation
  useEffect(() => {
    const shouldShow = gameOptions.jokerType === "opposite";
    
    if (shouldShow && !showOppositeJokerOptions) {
      setShowOppositeJokerOptions(true);
      setOppositeJokerOptionsAnimation("implied-rule-enter");
    } else if (!shouldShow && showOppositeJokerOptions) {
      setOppositeJokerOptionsAnimation("implied-rule-exit");
      setTimeout(() => {
        setShowOppositeJokerOptions(false);
        setOppositeJokerOptionsAnimation("");
      }, 600); // Match animation duration
    }
  }, [gameOptions.jokerType, showOppositeJokerOptions]);

  const handleFullCountChange = (value: number | "fullCount") => {
    if (value === "fullCount") {
      updateGameOptions({ fullCountPoints: gameOptions.forPoints || 101 });
    } else {
      updateGameOptions({ fullCountPoints: value });
    }
  };

  const handleJokerTypeChange = (type: string) => {
    if (type === "all") {
      updateGameOptions({ 
        jokerType: type,
        allJokersType: "Closed" // Default to Closed when All is selected
      });
    } else if (type === "opposite") {
      updateGameOptions({ 
        jokerType: type,
        allJokersFullMoney: false // Default to off when Opposite is selected
      });
    } else {
      updateGameOptions({ jokerType: type });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">♠</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rummy Scorer</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 py-8 main-content">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Set Game Rules</h2>
        
        <div className="space-y-8">
          {/* Game Settings - Merged section with all settings */}
          <Card className="bg-gray-900/50 border-gray-800 main-settings-card">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Main Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Number of players */}
                <div className="flex items-center justify-between" data-tutorial="players-section">
                  <Label className="text-white">Players</Label>
                  <div className="flex items-center space-x-2 mobile-button-group">
                    {[2, 3, 4, 5, 6, 7].map((count) => (
                      <Button
                        key={count}
                        variant={gameOptions.playerCount === count ? "default" : "outline"}
                        onClick={() => handlePlayerCountChange(count)}
                        className="px-3 py-1 text-sm min-h-[48px] min-w-[48px]"
                        size="sm"
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Max Points */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Max Points</Label>
                  <div className="flex items-center space-x-2 relative">
                    <div className={`flex items-center space-x-2 transition-all duration-500 ease-in-out ${
                      showCustomPoints ? 'transform -translate-x-8' : 'transform translate-x-0'
                    }`}>
                      <Button
                        variant={gameOptions.forPoints === 100 ? "default" : "outline"}
                        onClick={() => handlePointsChange(100)}
                        className="px-3 py-1 text-sm transition-all duration-300"
                        size="sm"
                      >
                        100
                      </Button>
                      <Button
                        variant={gameOptions.forPoints === 101 ? "default" : "outline"}
                        onClick={() => handlePointsChange(101)}
                        className="px-3 py-1 text-sm transition-all duration-300"
                        size="sm"
                      >
                        101
                      </Button>
                    </div>
                    
                    {/* Custom Button/Input with smooth transformation */}
                    <div className="relative flex items-center">
                      {!showCustomPoints ? (
                        <Button
                          variant="outline"
                          onClick={() => handlePointsChange("custom")}
                          className="px-3 py-1 text-sm transform transition-all duration-500 ease-in-out hover:scale-105"
                          size="sm"
                        >
                          Custom
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Enter points"
                            value={customPoints}
                            onChange={(e) => handleCustomPointsChange(e.target.value)}
                            className="w-28 text-center text-sm h-8 mobile-input transform transition-all duration-500 ease-in-out 
                                     bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 
                                     border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400
                                     animate-in slide-in-from-right-3 fade-in-0"
                            autoFocus
                            onBlur={() => {
                              if (!customPoints) {
                                setShowCustomPoints(false);
                              }
                            }}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowCustomPoints(false);
                              setCustomPoints("");
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pack Points */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Pack Points</Label>
                  <div className="flex items-center space-x-2 relative">
                    <div className={`flex items-center space-x-2 transition-all duration-500 ease-in-out ${
                      showCustomPackPoints ? 'transform -translate-x-8' : 'transform translate-x-0'
                    }`}>
                      <Button
                        variant={gameOptions.packPoints === 25 && !showCustomPackPoints ? "default" : "outline"}
                        onClick={() => handlePackPointsChange(25)}
                        className="px-3 py-1 text-sm transition-all duration-300"
                        size="sm"
                      >
                        25
                      </Button>
                    </div>
                    
                    {/* Custom Button/Input with smooth transformation */}
                    <div className="relative flex items-center">
                      {!showCustomPackPoints ? (
                        <Button
                          variant={gameOptions.packPoints !== 25 ? "default" : "outline"}
                          onClick={() => handlePackPointsChange("custom")}
                          className="px-3 py-1 text-sm transform transition-all duration-500 ease-in-out hover:scale-105"
                          size="sm"
                        >
                          Custom
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Enter points"
                            value={customPackPoints}
                            onChange={(e) => handleCustomPackPointsChange(e.target.value)}
                            className="w-28 text-center text-sm h-8 transform transition-all duration-500 ease-in-out 
                                     bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 
                                     border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400
                                     animate-in slide-in-from-right-3 fade-in-0"
                            autoFocus
                            onBlur={() => {
                              if (!customPackPoints) {
                                setShowCustomPackPoints(false);
                              }
                            }}
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowCustomPackPoints(false);
                              setCustomPackPoints("");
                              updateGameOptions({ packPoints: 25 });
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Mid-Pack Points */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Mid-Pack Points</Label>
                  <div className="flex items-center space-x-2 relative">
                    <div className={`flex items-center space-x-2 transition-all duration-500 ease-in-out ${
                      showCustomMidPackPoints ? 'transform -translate-x-8' : 'transform translate-x-0'
                    }`}>
                      <Button
                        variant={gameOptions.midPackPoints === 50 && !showCustomMidPackPoints ? "default" : "outline"}
                        onClick={() => handleMidPackPointsChange(50)}
                        className="px-3 py-1 text-sm transition-all duration-300"
                        size="sm"
                      >
                        50
                      </Button>
                    </div>
                    
                    {/* Custom Button/Input with smooth transformation */}
                    <div className="relative flex items-center">
                      {!showCustomMidPackPoints ? (
                        <Button
                          variant={gameOptions.midPackPoints !== 50 ? "default" : "outline"}
                          onClick={() => handleMidPackPointsChange("custom")}
                          className="px-3 py-1 text-sm transform transition-all duration-500 ease-in-out hover:scale-105"
                          size="sm"
                        >
                          Custom
                        </Button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            placeholder="Enter points"
                            value={customMidPackPoints}
                            onChange={(e) => handleCustomMidPackPointsChange(e.target.value)}
                            className="w-28 text-center text-sm h-8 transform transition-all duration-500 ease-in-out 
                                     bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 
                                     border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400
                                     animate-in slide-in-from-right-3 fade-in-0"
                            autoFocus
                            onBlur={() => {
                              if (!customMidPackPoints) {
                                setShowCustomMidPackPoints(false);
                              }
                            }}
                            min="1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowCustomMidPackPoints(false);
                              setCustomMidPackPoints("");
                              updateGameOptions({ midPackPoints: 50 });
                            }}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Full-Count Points */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Full-Count Points</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={gameOptions.fullCountPoints === 80 ? "default" : "outline"}
                      onClick={() => handleFullCountChange(80)}
                      className="px-3 py-1 text-sm"
                      size="sm"
                    >
                      80
                    </Button>
                    <Button
                      variant={gameOptions.fullCountPoints !== 80 ? "default" : "outline"}
                      onClick={() => handleFullCountChange("fullCount")}
                      className="px-3 py-1 text-sm"
                      size="sm"
                    >
                      Full-Count
                    </Button>
                  </div>
                </div>

                {/* Joker Type */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Joker Type</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={gameOptions.jokerType === "opposite" ? "default" : "outline"}
                        onClick={() => handleJokerTypeChange("opposite")}
                        className="px-3 py-1 text-sm"
                        size="sm"
                      >
                        Opposite
                      </Button>
                      <Button
                        variant={gameOptions.jokerType === "all" ? "default" : "outline"}
                        onClick={() => handleJokerTypeChange("all")}
                        className="px-3 py-1 text-sm"
                        size="sm"
                      >
                        All
                      </Button>
                    </div>
                  </div>
                  
                  {/* All Jokers Sub-options */}
                  {showJokerSubOptions && (
                    <div className={`ml-6 transition-all duration-800 ease-out ${jokerSubOptionsAnimation}`}>
                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm opacity-80">All Jokers Type</Label>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={gameOptions.allJokersType === "Closed" ? "default" : "outline"}
                            onClick={() => updateGameOptions({ allJokersType: "Closed" })}
                            className="px-2 py-1 text-xs"
                            size="sm"
                          >
                            Closed
                          </Button>
                          <Button
                            variant={gameOptions.allJokersType === "Open" ? "default" : "outline"}
                            onClick={() => updateGameOptions({ allJokersType: "Open" })}
                            className="px-2 py-1 text-xs"
                            size="sm"
                          >
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Opposite Jokers Sub-options */}
                  {showOppositeJokerOptions && (
                    <div className={`ml-6 transition-all duration-800 ease-out ${oppositeJokerOptionsAnimation}`}>
                      <div className="flex items-center justify-between">
                        <Label className="text-white text-sm opacity-80">All Jokers Full Money</Label>
                        <Switch
                          checked={gameOptions.allJokersFullMoney}
                          onCheckedChange={(checked) => updateGameOptions({ allJokersFullMoney: checked })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Advanced Settings - Collapsible */}
                <div className="pt-4 border-t border-gray-700">
                  <Collapsible open={advancedSettingsOpen} onOpenChange={setAdvancedSettingsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-0 h-auto text-left hover:bg-transparent"
                      >
                        <h3 className="text-xl font-bold text-white bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">Advanced Settings</h3>
                        <ChevronRight className={`h-4 w-4 text-white transition-transform duration-500 ease-in-out ${
                          advancedSettingsOpen ? 'rotate-90' : 'rotate-0'
                        }`} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="collapsible-content space-y-4 transition-all duration-700 ease-out overflow-hidden">
                      {/* Buy-In Amount */}
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Buy-In Amount</Label>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={gameOptions.buyInAmount}
                          onChange={(e) => updateGameOptions({ buyInAmount: e.target.value })}
                          className="w-32 text-center"
                        />
                      </div>



                      {/* Re-Entry Allowed */}
                      <div className="flex items-center justify-between">
                        <Label className="text-white">Re-Entry Allowed</Label>
                        <Switch
                          checked={gameOptions.reEntryAllowed}
                          onCheckedChange={(checked) => updateGameOptions({ reEntryAllowed: checked })}
                        />
                      </div>

                      {/* Double Points Section */}
                      <div className="space-y-4">
                        <div className="pt-2 border-t border-gray-600">
                          <h4 className="text-sm font-medium text-white mb-3">All opponents get double points when a winning player shows</h4>
                          <div className="space-y-3 ml-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-white">All Trips w/o Joker</Label>
                              <Switch
                                checked={gameOptions.allTripsDoublePoints}
                                onCheckedChange={(checked) => updateGameOptions({ allTripsDoublePoints: checked })}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label className="text-white">All Sequences w/o Joker</Label>
                              <Switch
                                checked={gameOptions.allSeqsDoublePoints}
                                onCheckedChange={(checked) => updateGameOptions({ allSeqsDoublePoints: checked })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Implied Game Rules */}
                <div className="pt-4 border-t border-gray-700">
                  <h3 className="text-xl font-bold text-white bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-3">Implied Game Rules</h3>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                      <li>• Packs/Game = {packsPerGame}</li>

                      {showFullCountRule && (
                        <li className={`transition-all duration-800 ease-out ${fullCountRuleAnimation}`}>
                          • Full-Count points = Sum of all cards in non winning players' hands
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>› not counting the 2 legal sequences</li>
                          </ul>
                        </li>
                      )}

                      {/* Joker Type Rules - Animated slidedown */}
                      {gameOptions.jokerType === "opposite" && (
                        <li className="transition-all duration-800 ease-out animate-in slide-in-from-bottom-3 fade-in-0">
                          • Add 1 Joker card to 2 decks of playing cards
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>› The Joker card 🃏 is a replacement for the actual joker picked by the player before the dealer</li>
                            <li>› The Joker card 🃏 does not serve as a Joker</li>
                          </ul>
                        </li>
                      )}

                      {gameOptions.jokerType === "all" && (
                        <li className="transition-all duration-800 ease-out animate-in slide-in-from-bottom-3 fade-in-0">
                          • Add 2 Joker cards to 2 decks of playing cards
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Mobile optimized with subtle fade effect */}
          <div className="sticky bottom-0 p-4 -mx-4">
            {/* Subtle fade gradient overlay - starts above button section */}
            <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
            <div className="flex justify-center relative">
              <Button
                onClick={() => setLocation("/player-names")}
                className="w-full max-w-md bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
