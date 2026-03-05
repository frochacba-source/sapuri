import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import Announcements from "./pages/Announcements";
import SubAdmins from "./pages/SubAdmins";
import GvgAttacks from "./pages/GvgAttacks";
import GotAttacks from "./pages/GotAttacks";
import GeneralAnnouncements from "./pages/GeneralAnnouncements";
import Ranking from "./pages/Ranking";
import MemberHistory from "./pages/MemberHistory";
import ReliquiasAttacks from "./pages/ReliquiasAttacks";
import ReliquiasAvisos from "./pages/ReliquiasAvisos";
import GotAvisos from "./pages/GotAvisos";
import GvgEvolution from "./pages/GvgEvolution";
import GvgTimeIdeal from "./pages/GvgTimeIdeal";
import Top5 from "./pages/Top5";
import PrecisaAtencao from "./pages/PrecisaAtencao";
import SubAdminLogin from "./pages/SubAdminLogin";
import WhatsAppConfig from "./pages/WhatsAppConfig";
import WhatsAppAvisos from "./pages/WhatsAppAvisos";
import GotStrategy from "./pages/GotStrategy";
import GotStrategiesPanel from '@/pages/GotStrategiesPanel';
import GvgStrategiesPanel from '@/pages/GvgStrategiesPanel';
import GotAttacksReport from '@/pages/GotAttacksReport';
import CardsPanel from '@/pages/CardsPanel';
import { CharactersPanel } from '@/pages/CharactersPanel';
import { RecommendationsPanel } from '@/pages/RecommendationsPanel';
import { AIChatPanel } from '@/pages/AIChatPanel';
import { ArayashikiAnalysisPanel } from '@/pages/ArayashikiAnalysisPanel';
import { ArayashikiSyncPanel } from '@/pages/ArayashikiSyncPanel';
import GvgSeasonControl from "./pages/GvgSeasonControl";
import WhatsAppTest from "./pages/WhatsAppTest";
import GvgAvisosWhatsApp from "./pages/GvgAvisosWhatsApp";
import GvgCustomMessages from "./pages/GvgCustomMessages";
import ReliquiasAvisosConfig from "./pages/ReliquiasAvisosConfig";
import { BackupManager } from "./pages/BackupManager";
import AccountsPanel from "./pages/AccountsPanel";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/subadmin-login" component={SubAdminLogin} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/membros" component={Members} />
      <Route path="/escalacao/:eventType" component={Schedule} />
      <Route path="/avisos/:eventType" component={Announcements} />
      <Route path="/avisos-gerais" component={GeneralAnnouncements} />
      <Route path="/gvg/ataques" component={GvgAttacks} />
      <Route path="/gvg/evolucao" component={GvgEvolution} />
      <Route path="/gvg/time-ideal" component={GvgTimeIdeal} />
      <Route path="/got/ataques" component={GotAttacks} />
      <Route path="/got/avisos" component={GotAvisos} />
      <Route path="/got/avisos-whatsapp" component={WhatsAppAvisos} />
      <Route path="/got/estrategia" component={GotStrategy} />
      <Route path="/got/painel-estrategias" component={GotStrategiesPanel} />
      <Route path="/gvg/painel-estrategias" component={GvgStrategiesPanel} />
      <Route path="/cartas" component={CardsPanel} />
      <Route path="/personagens" component={CharactersPanel} />
      <Route path="/recomendador" component={RecommendationsPanel} />
      <Route path="/ia-chat" component={AIChatPanel} />
      <Route path="/analise-cartas" component={ArayashikiAnalysisPanel} />
      <Route path="/sincronizar-cartas" component={ArayashikiSyncPanel} />
      <Route path="/gvg-season" component={GvgSeasonControl} />
      <Route path="/gvg/temporada" component={GvgSeasonControl} />
      <Route path="/reliquias/ataques" component={ReliquiasAttacks} />
      <Route path="/reliquias/avisos" component={ReliquiasAvisos} />
      <Route path="/reliquias/avisos-config" component={ReliquiasAvisosConfig} />
      <Route path="/gvg/avisos-whatsapp" component={GvgAvisosWhatsApp} />
      <Route path="/gvg/mensagens-personalizadas" component={GvgCustomMessages} />
      <Route path="/ranking" component={Ranking} />
      <Route path="/top5" component={Top5} />
      <Route path="/precisa-atencao" component={PrecisaAtencao} />
      <Route path="/membro/:memberId" component={MemberHistory} />
      <Route path="/historico" component={History} />
      <Route path="/estatisticas" component={Stats} />
      <Route path="/sub-admins" component={SubAdmins} />
      <Route path="/configuracoes" component={Settings} />
      <Route path="/whatsapp-config" component={WhatsAppConfig} />
      <Route path="/whatsapp-test" component={WhatsAppTest} />
      <Route path="/backups" component={BackupManager} />
      <Route path="/painel-contas" component={AccountsPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
