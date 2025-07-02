import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "@/components/theme-provider";
import { useGameState } from "@/hooks/use-game-state";
import { Moon, Sun, ArrowLeft } from "lucide-react";

export default function AdvancedSettingsScreen() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { gameOptions, updateGameOptions } = useGameState();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSwitchChange = (field: string, checked: boolean) => {
    updateGameOptions({ [field]: checked });
  };

  const handleSequenceCountChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      updateGameOptions({ sequenceCount: numValue });
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
                onClick={() => setLocation("/game-options")}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Advanced Settings</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Joker Type */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 dark:text-white mb-3 block">Joker Type</Label>
                <RadioGroup
                  value={gameOptions.jokerType}
                  onValueChange={(value) => updateGameOptions({ jokerType: value })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="opposite" id="opposite" />
                    <Label htmlFor="opposite">Opposite Joker</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All Jokers (Open/Closed)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Number of Sequences */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 dark:text-white mb-3 block">
                  # of Sequences
                </Label>
                <div className="flex space-x-3">
                  <Button
                    variant={gameOptions.sequenceCount === 2 ? "default" : "outline"}
                    onClick={() => updateGameOptions({ sequenceCount: 2 })}
                    className="px-4 py-2"
                    size="sm"
                  >
                    2
                  </Button>
                  <Button
                    variant={gameOptions.sequenceCount === 3 ? "default" : "outline"}
                    onClick={() => updateGameOptions({ sequenceCount: 3 })}
                    className="px-4 py-2"
                    size="sm"
                  >
                    3
                  </Button>
                </div>
              </div>

              {/* Other Settings */}
              <div>
                <Label className="text-lg font-semibold text-gray-900 dark:text-white mb-4 block">Other Settings</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                  <Label htmlFor="trips-double" className="text-gray-700 dark:text-gray-300">
                    All TRIPs w/o 🃏 - Dbl pts?
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="trips-double"
                      checked={gameOptions.allTripsDoublePoints}
                      onCheckedChange={(checked) => handleSwitchChange("allTripsDoublePoints", checked)}
                    />
                    <span className={`text-sm ${gameOptions.allTripsDoublePoints ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {gameOptions.allTripsDoublePoints ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="seqs-double" className="text-gray-700 dark:text-gray-300">
                    All SEQs w/o 🃏 - Dbl pts?
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="seqs-double"
                      checked={gameOptions.allSeqsDoublePoints}
                      onCheckedChange={(checked) => handleSwitchChange("allSeqsDoublePoints", checked)}
                    />
                    <span className={`text-sm ${gameOptions.allSeqsDoublePoints ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {gameOptions.allSeqsDoublePoints ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="jokers-full" className="text-gray-700 dark:text-gray-300">
                    All jokers - full money
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="jokers-full"
                      checked={gameOptions.allJokersFullMoney}
                      onCheckedChange={(checked) => handleSwitchChange("allJokersFullMoney", checked)}
                    />
                    <span className={`text-sm ${gameOptions.allJokersFullMoney ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {gameOptions.allJokersFullMoney ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reentry" className="text-gray-700 dark:text-gray-300">
                    Re-entry allowed
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reentry"
                      checked={gameOptions.reEntryAllowed}
                      onCheckedChange={(checked) => handleSwitchChange("reEntryAllowed", checked)}
                    />
                    <span className={`text-sm ${gameOptions.reEntryAllowed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {gameOptions.reEntryAllowed ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => setLocation("/player-names")}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
