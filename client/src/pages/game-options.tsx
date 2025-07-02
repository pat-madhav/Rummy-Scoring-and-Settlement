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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Set CLUB Game Rules</h2>
        
        <div className="space-y-8">
          {/* Number of Players */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg"># of Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[2, 3, 4, 5, 6, 7].map((count) => (
                  <Button
                    key={count}
                    variant={gameOptions.playerCount === count ? "default" : "outline"}
                    onClick={() => handlePlayerCountChange(count)}
                    className="h-12"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Points Target */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">For Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[100, 101].map((points) => (
                  <Button
                    key={points}
                    variant={gameOptions.forPoints === points ? "default" : "outline"}
                    onClick={() => handlePointsChange(points)}
                    className="h-12"
                  >
                    {points}
                  </Button>
                ))}
                <Button
                  variant={showCustomPoints ? "default" : "outline"}
                  onClick={() => handlePointsChange("custom")}
                  className="h-12"
                >
                  Custom
                </Button>
              </div>
              {showCustomPoints && (
                <Input
                  type="number"
                  placeholder="Enter custom points"
                  value={customPoints}
                  onChange={(e) => handleCustomPointsChange(e.target.value)}
                  className="w-full"
                />
              )}
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

          {/* Pack Values */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pack">Pack</Label>
                  <Input
                    id="pack"
                    type="number"
                    value={gameOptions.packPoints}
                    onChange={(e) => handlePackPointsChange("packPoints", e.target.value)}
                    className="w-20 text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="midpack">Mid-Pack</Label>
                  <Input
                    id="midpack"
                    type="number"
                    value={gameOptions.midPackPoints}
                    onChange={(e) => handlePackPointsChange("midPackPoints", e.target.value)}
                    className="w-20 text-center"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="fullcount">Full-Count</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="fullcount"
                      type="number"
                      value={gameOptions.fullCountPoints}
                      onChange={(e) => handlePackPointsChange("fullCountPoints", e.target.value)}
                      className="w-20 text-center"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">FC</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
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
