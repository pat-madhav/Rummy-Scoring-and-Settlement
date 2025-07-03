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
          {/* Game Settings - Merged section at the top */}
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
                    <Button
                      variant={gameOptions.forPoints === 100 ? "default" : "outline"}
                      onClick={() => handlePointsChange(100)}
                      className={`px-3 py-1 text-sm transition-all duration-300 ${showCustomPoints ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                      size="sm"
                    >
                      100
                    </Button>
                    <Button
                      variant={gameOptions.forPoints === 101 ? "default" : "outline"}
                      onClick={() => handlePointsChange(101)}
                      className={`px-3 py-1 text-sm transition-all duration-300 ${showCustomPoints ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                      size="sm"
                    >
                      101
                    </Button>
                    {showCustomPoints ? (
                      <Input
                        type="number"
                        placeholder="Enter points"
                        value={customPoints}
                        onChange={(e) => handleCustomPointsChange(e.target.value)}
                        className="w-40 text-center text-sm h-8 absolute right-0 transition-all duration-300 ease-in-out"
                        autoFocus
                        onBlur={() => {
                          if (!customPoints) {
                            handlePointsChange(101);
                          }
                        }}
                      />
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handlePointsChange("custom")}
                        className="px-3 py-1 text-sm"
                        size="sm"
                      >
                        Custom
                      </Button>
                    )}
                  </div>
                </div>

                {/* Pack */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Pack</Label>
                  <Input
                    id="pack"
                    type="number"
                    value={gameOptions.packPoints}
                    onChange={(e) => handlePackPointsChange("packPoints", e.target.value)}
                    className="w-20 text-center"
                  />
                </div>

                {/* Mid-Pack */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Mid-Pack</Label>
                  <Input
                    id="midpack"
                    type="number"
                    value={gameOptions.midPackPoints}
                    onChange={(e) => handlePackPointsChange("midPackPoints", e.target.value)}
                    className="w-20 text-center"
                  />
                </div>

                {/* Full-Count */}
                <div className="flex items-center justify-between">
                  <Label className="text-white">Full-Count</Label>
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
              </div>
            </CardContent>
          </Card>

          {/* Buy-In */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buy-In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency" className="text-sm font-medium mb-2 block">Currency</Label>
                  <Select
                    value={gameOptions.currency}
                    onValueChange={(value) => updateGameOptions({ currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">$ (USD)</SelectItem>
                      <SelectItem value="₹">₹ (INR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium mb-2 block">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={gameOptions.buyInAmount}
                    onChange={(e) => updateGameOptions({ buyInAmount: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Indirect Game Settings */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Indirect Game Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {packsPerGame} packs / game
                </p>
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
