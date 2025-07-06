import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, Play } from "lucide-react";

export default function WelcomeScreen() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
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
            </div>
            
            {/* Centered page title - always visible */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Rummy Scorer
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-between p-4 min-h-[calc(100vh-80px)]">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl">
                  <span className="text-white text-3xl font-bold">♠♥</span>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 whitespace-nowrap">Simple, FREE Rummy Scoring & Settlement</p>
                
                {/* Three empty lines */}
                <div className="mb-6">
                  <br />
                  <br />
                  <br />
                </div>
                
                <div className="text-center mb-8">
                  <p className="text-sm text-gray-400 dark:text-gray-500 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-medium">
                    Created By: Pattabhi Madhavaram
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Fixed Bottom Navigation - Consistent across all pages */}
        <div className="fixed bottom-6 left-0 right-0 z-50">
          {/* Subtle fade gradient overlay */}
          <div className="absolute inset-x-0 -top-16 bottom-0 bg-gradient-to-t from-gray-50 via-gray-50/70 via-gray-50/40 via-gray-50/20 to-transparent dark:from-gray-900 dark:via-gray-900/70 dark:via-gray-900/40 dark:via-gray-900/20 dark:to-transparent pointer-events-none"></div>
          <div className="w-[70%] mx-auto relative">
            <Button
              onClick={() => setLocation("/game-options")}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-base min-h-[56px] start-game-btn"
            >
              <Play className="w-4 h-4 mr-2" />
              Begin
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
