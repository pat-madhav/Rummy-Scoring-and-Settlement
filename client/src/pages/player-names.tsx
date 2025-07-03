import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/components/theme-provider";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, ArrowLeft, Play } from "lucide-react";

export default function PlayerNamesScreen() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { gameOptions, updateGameOptions, startNewGame, createGameMutation } = useGameState();
  const { toast } = useToast();
  
  const [playerNames, setPlayerNames] = useState(
    gameOptions.playerNames || Array(gameOptions.playerCount || 3).fill("")
  );

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    updateGameOptions({ playerNames: newNames });
  };

  const clearAllNames = () => {
    const emptyNames = Array(gameOptions.playerCount || 3).fill("");
    setPlayerNames(emptyNames);
    updateGameOptions({ playerNames: emptyNames });
  };

  const assignDefaultNames = () => {
    const defaultNames = Array.from({ length: gameOptions.playerCount || 3 }, (_, i) => `Player ${i + 1}`);
    setPlayerNames(defaultNames);
    updateGameOptions({ playerNames: defaultNames });
  };

  const handleStartGame = async () => {
    const validNames = playerNames.filter(name => name.trim());
    if (validNames.length < (gameOptions.playerCount || 3)) {
      toast({
        title: "Missing Player Names",
        description: "Please enter names for all players",
        variant: "destructive",
      });
      return;
    }

    try {
      updateGameOptions({ playerNames: validNames });
      const game = await startNewGame();
      setLocation(`/scoring/${game.id}`);
      toast({
        title: "Game Started!",
        description: `New game created with ${validNames.length} players`,
      });
    } catch (error) {
      toast({
        title: "Error Starting Game",
        description: "Failed to create the game. Please try again.",
        variant: "destructive",
      });
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Enter Player Names</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: gameOptions.playerCount || 3 }).map((_, index) => {
                const isEmpty = !playerNames[index] || playerNames[index].trim() === "";
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <Label className="w-20 text-gray-700 dark:text-gray-300 font-medium">
                      Player {index + 1}
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter name"
                      value={playerNames[index] || ""}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className={`flex-1 ${isEmpty ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400" : ""}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex space-x-3">
              <Button
                onClick={clearAllNames}
                variant="outline"
                className="flex-1"
              >
                Clear All Names
              </Button>
              <Button
                onClick={assignDefaultNames}
                variant="outline"
                className="flex-1"
              >
                Default Names
              </Button>
            </div>

            <div className="mt-4">
              <Button
                onClick={handleStartGame}
                disabled={createGameMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                {createGameMutation.isPending ? (
                  "Creating Game..."
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Begin Game
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
