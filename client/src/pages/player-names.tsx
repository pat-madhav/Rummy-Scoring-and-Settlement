import { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Scroll detection effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    const newNames = [...playerNames];
    for (let i = 0; i < (gameOptions.playerCount || 3); i++) {
      // Only fill empty fields
      if (!newNames[i] || newNames[i].trim() === "") {
        newNames[i] = `Player ${i + 1}`;
      }
    }
    setPlayerNames(newNames);
    updateGameOptions({ playerNames: newNames });
  };

  const handleStartGame = async () => {
    const expectedPlayerCount = gameOptions.playerCount || 3;
    // Only take names up to the selected player count
    const validNames = playerNames
      .slice(0, expectedPlayerCount)
      .filter(name => name && name.trim());
    
    if (validNames.length < expectedPlayerCount) {
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
      <header className={`bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">♠</span>
              </div>
              {/* Show page title in header when scrolled */}
              {isScrolled && (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-opacity duration-300">
                  Enter Player Names
                </h1>
              )}
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
      <main className="max-w-2xl mx-auto p-4 py-8 pb-24 main-content">
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
                      className={`flex-1 mobile-input ${isEmpty ? "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400" : ""}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex space-x-3 mb-6">
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
          </CardContent>
        </Card>

      </main>

      {/* Fixed Bottom Button - Independent of main content */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50">
        {/* Subtle fade gradient overlay - starts above button section */}
        <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
        <div className="max-w-2xl mx-auto relative">
          <Button
            onClick={handleStartGame}
            disabled={createGameMutation.isPending}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg min-h-[56px] start-game-btn"
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
      </div>
    </div>
  );
}
