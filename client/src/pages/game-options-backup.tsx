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
import { Moon, Sun, ArrowLeft, Settings, ChevronDown, ChevronRight, Play } from "lucide-react";

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
  const [mainSettingsOpen, setMainSettingsOpen] = useState(true); // Auto-open on page load
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Set Game Rules
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 py-8 pb-24 main-content">
        
        <div className="space-y-8">
          {/* Main Settings - Collapsible */}
          <Card className="bg-gray-900/50 border-gray-800 main-settings-card">
            <Collapsible open={mainSettingsOpen} onOpenChange={setMainSettingsOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-800/50 transition-colors duration-200 rounded-t-lg">
                  <CardTitle className="text-xl font-bold text-white bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent flex items-center justify-between">
                    Main Settings
                    {mainSettingsOpen ? <ChevronDown className="h-5 w-5 text-blue-400" /> : <ChevronRight className="h-5 w-5 text-blue-400" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent className="transition-all duration-300 ease-in-out data-[state=open]:animate-slide-down data-[state=closed]:animate-slide-up">
                <CardContent>
                  <div className="space-y-4">
                    {/* Number of players */}
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Players</Label>
                      <div className="flex items-center space-x-2 mobile-button-group">
                        {[2, 3, 4, 5, 6, 7].map((count) => (
                          <Button
                            key={count}
                            variant={gameOptions.playerCount === count ? "default" : "outline"}
                            onClick={() => handlePlayerCountChange(count)}
                            className={`px-3 py-1 text-sm ${
                              gameOptions.playerCount === count 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
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
                            variant={gameOptions.forPoints === 101 && !showCustomPoints ? "default" : "outline"}
                            onClick={() => handlePointsChange(101)}
                            className={`px-3 py-1 text-sm transition-all duration-300 ${
                              gameOptions.forPoints === 101 && !showCustomPoints 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            101
                          </Button>
                          <Button
                            variant={gameOptions.forPoints === 201 && !showCustomPoints ? "default" : "outline"}
                            onClick={() => handlePointsChange(201)}
                            className={`px-3 py-1 text-sm transition-all duration-300 ${
                              gameOptions.forPoints === 201 && !showCustomPoints 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            201
                          </Button>
                        </div>
                        
                        {/* Custom Button/Input with smooth transformation */}
                        <div className="relative flex items-center">
                          {!showCustomPoints ? (
                            <Button
                              variant={gameOptions.forPoints !== 101 && gameOptions.forPoints !== 201 ? "default" : "outline"}
                              onClick={() => handlePointsChange("custom")}
                              className={`px-3 py-1 text-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
                                gameOptions.forPoints !== 101 && gameOptions.forPoints !== 201
                                  ? "" 
                                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
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
                                className="w-28 text-center text-sm h-8 transform transition-all duration-500 ease-in-out 
                                         bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 
                                         border-blue-200 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-400
                                         animate-in slide-in-from-right-3 fade-in-0"
                                autoFocus
                                onBlur={() => {
                                  if (!customPoints) {
                                    setShowCustomPoints(false);
                                  }
                                }}
                                min="50"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setShowCustomPoints(false);
                                  setCustomPoints("");
                                  updateGameOptions({ forPoints: 101 });
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
                            className={`px-3 py-1 text-sm transition-all duration-300 ${
                              gameOptions.packPoints === 25 && !showCustomPackPoints 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            25
                          </Button>
                          <Button
                            variant={gameOptions.packPoints === 20 && !showCustomPackPoints ? "default" : "outline"}
                            onClick={() => handlePackPointsChange(20)}
                            className={`px-3 py-1 text-sm transition-all duration-300 ${
                              gameOptions.packPoints === 20 && !showCustomPackPoints 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            20
                          </Button>
                        </div>
                        
                        {/* Custom Button/Input with smooth transformation */}
                        <div className="relative flex items-center">
                          {!showCustomPackPoints ? (
                            <Button
                              variant={gameOptions.packPoints !== 25 && gameOptions.packPoints !== 20 ? "default" : "outline"}
                              onClick={() => handlePackPointsChange("custom")}
                              className={`px-3 py-1 text-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
                                gameOptions.packPoints !== 25 && gameOptions.packPoints !== 20
                                  ? "" 
                                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
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
                            className={`px-3 py-1 text-sm transition-all duration-300 ${
                              gameOptions.midPackPoints === 50 && !showCustomMidPackPoints 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
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
                              className={`px-3 py-1 text-sm transform transition-all duration-500 ease-in-out hover:scale-105 ${
                                gameOptions.midPackPoints !== 50
                                  ? "" 
                                  : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                              }`}
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
                          className={`px-3 py-1 text-sm ${
                            gameOptions.fullCountPoints === 80 
                              ? "" 
                              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          size="sm"
                        >
                          80
                        </Button>
                        <Button
                          variant={gameOptions.fullCountPoints !== 80 ? "default" : "outline"}
                          onClick={() => handleFullCountChange("fullCount")}
                          className={`px-3 py-1 text-sm ${
                            gameOptions.fullCountPoints !== 80 
                              ? "" 
                              : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
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
                            variant={gameOptions.jokerType === "open" ? "default" : "outline"}
                            onClick={() => handleJokerTypeChange("open")}
                            className={`px-3 py-1 text-sm ${
                              gameOptions.jokerType === "open" 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            Open
                          </Button>
                          <Button
                            variant={gameOptions.jokerType === "closed" ? "default" : "outline"}
                            onClick={() => handleJokerTypeChange("closed")}
                            className={`px-3 py-1 text-sm ${
                              gameOptions.jokerType === "closed" 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            Closed
                          </Button>
                          <Button
                            variant={gameOptions.jokerType === "all" ? "default" : "outline"}
                            onClick={() => handleJokerTypeChange("all")}
                            className={`px-3 py-1 text-sm ${
                              gameOptions.jokerType === "all" 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            All
                          </Button>
                          <Button
                            variant={gameOptions.jokerType === "opposite" ? "default" : "outline"}
                            onClick={() => handleJokerTypeChange("opposite")}
                            className={`px-3 py-1 text-sm ${
                              gameOptions.jokerType === "opposite" 
                                ? "" 
                                : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                            size="sm"
                          >
                            Opposite
                          </Button>
                        </div>
                      </div>
                      
                      {/* All Jokers Sub-options */}
                      {showJokerSubOptions && (
                        <div className={`ml-6 space-y-3 transition-all duration-800 ease-out ${jokerSubOptionsAnimation}`}>
                          <div className="flex items-center justify-between">
                            <Label className="text-white text-sm opacity-80">All Jokers Type</Label>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant={gameOptions.allJokersType === "Closed" ? "default" : "outline"}
                                onClick={() => updateGameOptions({ allJokersType: "Closed" })}
                                className={`px-3 py-1 text-xs ${
                                  gameOptions.allJokersType === "Closed"
                                    ? "" 
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                                size="sm"
                              >
                                Closed
                              </Button>
                              <Button
                                variant={gameOptions.allJokersType === "Open" ? "default" : "outline"}
                                onClick={() => updateGameOptions({ allJokersType: "Open" })}
                                className={`px-3 py-1 text-xs ${
                                  gameOptions.allJokersType === "Open"
                                    ? "" 
                                    : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
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
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Advanced Settings - Collapsible */}
          <Card className="bg-gray-900/50 border-gray-800">
            <div className="pt-4 border-t border-gray-700">
              <Collapsible open={advancedSettingsOpen} onOpenChange={setAdvancedSettingsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto text-left hover:bg-transparent"
                  >
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Advanced Settings</h3>
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

                  {/* Currency */}
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Currency</Label>
                    <Select value={gameOptions.currency} onValueChange={(value) => updateGameOptions({ currency: value })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Other Settings */}
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Other Settings</h4>
                    
                    {/* All Trips Double Points */}
                    <div className="flex items-center justify-between">
                      <Label className="text-white">All Trips Double Points</Label>
                      <Switch
                        checked={gameOptions.allTripsDoublePoints}
                        onCheckedChange={(checked) => updateGameOptions({ allTripsDoublePoints: checked })}
                      />
                    </div>

                    {/* All Seqs Double Points */}
                    <div className="flex items-center justify-between">
                      <Label className="text-white">All Seqs Double Points</Label>
                      <Switch
                        checked={gameOptions.allSeqsDoublePoints}
                        onCheckedChange={(checked) => updateGameOptions({ allSeqsDoublePoints: checked })}
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
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </Card>

          {/* Implied Game Rules */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Implied Game Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li>• Packs/Game = {packsPerGame}</li>
                  
                  {/* Full-Count Rule */}
                  {showFullCountRule && (
                    <li className={`transition-all duration-800 ease-out ${fullCountRuleAnimation}`}>
                      • Full-Count Rule: Full-Count = {gameOptions.fullCountPoints} points
                    </li>
                  )}
                  
                  {/* Joker Type Rules */}
                  <li className="transition-all duration-800 ease-out animate-in slide-in-from-bottom-3 fade-in-0">
                    🃏 Joker Type: {gameOptions.jokerType} (Joker decided after first card is dealt)
                  </li>
                  
                  {gameOptions.jokerType === "all" && (
                    <li className="transition-all duration-800 ease-out animate-in slide-in-from-bottom-3 fade-in-0">
                      • Add 2 Joker cards to 2 decks of playing cards
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Fixed Bottom Navigation - Consistent across all pages */}
      <div className="fixed bottom-6 left-0 right-0 z-50">
        {/* Subtle fade gradient overlay */}
        <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
        <div className="w-[70%] mx-auto relative">
          <Button
            onClick={() => setLocation("/player-names")}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px]"
          >
            <Play className="w-4 h-4 mr-2" />
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}