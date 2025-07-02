import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import WelcomeScreen from "@/pages/welcome";
import GameOptionsScreen from "@/pages/game-options";
import AdvancedSettingsScreen from "@/pages/advanced-settings";
import PlayerNamesScreen from "@/pages/player-names";
import ScoringScreen from "@/pages/scoring";
import SettlementScreen from "@/pages/settlement";
import PostGameScreen from "@/pages/post-game";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={WelcomeScreen} />
      <Route path="/game-options" component={GameOptionsScreen} />
      <Route path="/advanced-settings" component={AdvancedSettingsScreen} />
      <Route path="/player-names" component={PlayerNamesScreen} />
      <Route path="/scoring/:gameId" component={ScoringScreen} />
      <Route path="/settlement/:gameId" component={SettlementScreen} />
      <Route path="/post-game/:gameId" component={PostGameScreen} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="rummy-scorer-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
