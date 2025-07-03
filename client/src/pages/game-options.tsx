import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/theme-provider";
import { useGameState } from "@/hooks/use-game-state";
import { calculatePacksPerGame } from "@/lib/game-utils";
import { Moon, Sun, ArrowLeft, Settings } from "lucide-react";

export default function GameOptionsScreen() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { gameOptions, updateGameOptions } = useGameState();
  
  const [customPoints, setCustomPoints] = useState("");
  const [showCustomPoints, setShowCustomPoints] = useState(false);

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

  const handlePackPointsChange = (field: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateGameOptions({ [field]: numValue });
    }
  };

  const packsPerGame = calculatePacksPerGame(gameOptions.forPoints || 101, gameOptions.packPoints || 25);

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
      <main className="max-w-2xl mx-auto p-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Set Game Rules</h2>
        
        <div className="space-y-8">
          {/* Game Settings - Merged section with all settings */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Game Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* # of Players */}
                <div className="flex items-center justify-between">
                  <Label className="text-white"># of Players</Label>
                  <div className="flex items-center space-x-2">
                    {[2, 3, 4, 5, 6, 7].map((count) => (
                      <Button
                        key={count}
                        variant={gameOptions.playerCount === count ? "default" : "outline"}
                        onClick={() => handlePlayerCountChange(count)}
                        className="px-3 py-1 text-sm"
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
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={gameOptions.packPoints === 25 ? "default" : "outline"}
                      onClick={() => updateGameOptions({ packPoints: 25 })}
                      className="px-3 py-1 text-sm"
                      size="sm"
                    >
                      25
                    </Button>
                    <Input
                      type="number"
                      value={gameOptions.packPoints}
                      onChange={(e) => handlePackPointsChange("packPoints", e.target.value)}
                      className="w-20 text-center"
                    />
                  </div>
                </div>

                {/* Mid-Pack Points */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Mid-Pack Points</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={gameOptions.midPackPoints === 50 ? "default" : "outline"}
                      onClick={() => updateGameOptions({ midPackPoints: 50 })}
                      className="px-3 py-1 text-sm"
                      size="sm"
                    >
                      50
                    </Button>
                    <Input
                      type="number"
                      value={gameOptions.midPackPoints}
                      onChange={(e) => handlePackPointsChange("midPackPoints", e.target.value)}
                      className="w-20 text-center"
                    />
                  </div>
                </div>

                {/* Full-Count Points */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Full-Count Points</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={gameOptions.fullCountPoints === 80 ? "default" : "outline"}
                      onClick={() => updateGameOptions({ fullCountPoints: 80 })}
                      className="px-3 py-1 text-sm"
                      size="sm"
                    >
                      80
                    </Button>
                    <Button
                      variant={gameOptions.fullCountPoints !== 80 ? "default" : "outline"}
                      onClick={() => updateGameOptions({ fullCountPoints: gameOptions.forPoints || 101 })}
                      className="px-3 py-1 text-sm"
                      size="sm"
                    >
                      Full-Count
                    </Button>
                  </div>
                </div>

                {/* Buy-In */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Buy-In</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={gameOptions.buyInAmount}
                    onChange={(e) => updateGameOptions({ buyInAmount: e.target.value })}
                    className="w-32 text-center"
                  />
                </div>

                {/* Implied Game Rules */}
                <div className="pt-2 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-2">Implied Game Rules</h4>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {packsPerGame} packs / game
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/advanced-settings")}
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Advanced Settings
            </Button>
            <Button
              onClick={() => setLocation("/player-names")}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Next
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
