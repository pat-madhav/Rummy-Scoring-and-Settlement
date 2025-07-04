import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { TutorialProvider } from "@/components/tutorial/tutorial-provider";
import { Tutorial } from "@/components/tutorial/tutorial";
import { TutorialButton } from "@/components/tutorial/tutorial-button";
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
      <Route path="/scoring/:gameId">{(params) => <ScoringScreen gameId={params.gameId!} />}</Route>
      <Route path="/settlement/:gameId">{(params) => <SettlementScreen gameId={params.gameId!} />}</Route>
      <Route path="/post-game/:gameId">{(params) => <PostGameScreen gameId={params.gameId!} />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="rummy-scorer-theme">
        <TutorialProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <Tutorial />
            <TutorialButton variant="floating" />
          </TooltipProvider>
        </TutorialProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
