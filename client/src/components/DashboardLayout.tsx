import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { 
  LayoutDashboard, LogOut, PanelLeft, Users, History, BarChart3, Settings, 
  Swords, Trophy, Crown, MessageSquare, Shield, ChevronDown, Megaphone, Target, AlertTriangle,
  Moon, Sun, HardDrive, Wand2, Sparkles
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Entrar para continuar
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Acesso a este painel requer autenticação. Continue para fazer login.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const isAdmin = user?.role === 'admin';
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    const html = document.documentElement;
    html.classList.toggle('dark');
    setIsDark(!isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
  };

  // Event sections state
  const [gvgOpen, setGvgOpen] = useState(location.includes('/gvg'));
  const [gotOpen, setGotOpen] = useState(location.includes('/got'));
  const [reliquiasOpen, setReliquiasOpen] = useState(location.includes('/reliquias'));

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const getPageTitle = () => {
    if (location === '/dashboard') return 'Dashboard';
    if (location === '/membros') return 'Membros';
    if (location.includes('/escalacao/gvg')) return 'GvG - Escalação';
    if (location.includes('/avisos/gvg')) return 'GvG - Avisos';
    if (location.includes('/escalacao/got')) return 'GoT - Escalação';
    if (location.includes('/avisos/got')) return 'GoT - Avisos';
    if (location.includes('/escalacao/reliquias')) return 'Relíquias - Escalação';
    if (location === '/reliquias/avisos') return 'Relíquias - Avisos';
    if (location === '/gvg/ataques') return 'GvG - Ataques';
    if (location === '/gvg/evolucao') return 'GvG - Evolução';
    if (location === '/gvg/time-ideal') return 'GvG - Time Ideal';
    if (location === '/got/ataques') return 'GoT - Ataques';
    if (location === '/got/avisos') return 'GoT - Lembretes';
    if (location === '/got/estrategia') return 'GoT - Mapa Estratégia';
    if (location === '/got/painel-estrategias') return 'GoT - Painel de Estratégias';
    if (location === '/gvg/painel-estrategias') return 'GvG - Painel de Estratégias';
    if (location === '/got/relatorio-ataques') return 'GoT - Relatório de Ataques';
    if (location === '/reliquias/ataques') return 'Relíquias - Ataques';
    if (location === '/avisos-gerais') return 'Avisos Gerais';
    if (location === '/ranking') return 'Ranking';
    if (location === '/top5') return 'Top 5 - Competição';
    if (location === '/precisa-atencao') return 'Precisa de Atenção';
    if (location.includes('/membro/')) return 'Histórico do Membro';
    if (location === '/historico') return 'Histórico';
    if (location === '/estatisticas') return 'Estatísticas';
    if (location === '/sub-admins') return 'Sub-Admins';
    if (location === '/configuracoes') return 'Configurações';
    if (location === '/whatsapp-config') return 'Configuração WhatsApp';
    if (location === '/cartas') return 'Cartas';
    if (location === '/personagens') return 'Personagens';
    if (location === '/recomendador') return 'Recomendador de Cartas';
    if (location === '/ia-chat') return 'Chat com IA';
    if (location === '/analise-cartas') return 'Análise de Cartas';
    if (location === '/sincronizar-cartas') return 'Sincronizar Cartas';
    if (location === '/backups') return 'Backups do Sistema';
    if (location === '/painel-contas') return 'Painel de Contas de Jogos';
    return 'Menu';
  };

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold tracking-tight truncate">
                    Guilda Sapuri
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/dashboard'}
                  onClick={() => setLocation('/dashboard')}
                  tooltip="Dashboard"
                  className="h-10 transition-all font-normal"
                >
                  <LayoutDashboard className={`h-4 w-4 ${location === '/dashboard' ? "text-primary" : ""}`} />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Membros */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/membros'}
                  onClick={() => setLocation('/membros')}
                  tooltip="Membros"
                  className="h-10 transition-all font-normal"
                >
                  <Users className={`h-4 w-4 ${location === '/membros' ? "text-primary" : ""}`} />
                  <span>Membros</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* GvG Section */}
              {!isCollapsed ? (
                <Collapsible open={gvgOpen} onOpenChange={setGvgOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="h-10 transition-all font-normal">
                        <Swords className="h-4 w-4 text-red-500" />
                        <span>GvG</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${gvgOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/escalacao/gvg'}
                        onClick={() => setLocation('/escalacao/gvg')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Escalação</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/gvg/ataques'}
                        onClick={() => setLocation('/gvg/ataques')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Ataques</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/avisos/gvg'}
                        onClick={() => setLocation('/avisos/gvg')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Avisos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/gvg/avisos-whatsapp'}
                        onClick={() => setLocation('/gvg/avisos-whatsapp')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Avisos WhatsApp</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/gvg/evolucao'}
                        onClick={() => setLocation('/gvg/evolucao')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Evolução</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/gvg/time-ideal'}
                        onClick={() => setLocation('/gvg/time-ideal')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Time Ideal</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/gvg/painel-estrategias'}
                        onClick={() => setLocation('/gvg/painel-estrategias')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Painel de Estratégias</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.includes('/gvg')}
                    onClick={() => setLocation('/escalacao/gvg')}
                    tooltip="GvG"
                    className="h-10 transition-all font-normal"
                  >
                    <Swords className="h-4 w-4 text-red-500" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* GoT Section */}
              {!isCollapsed ? (
                <Collapsible open={gotOpen} onOpenChange={setGotOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="h-10 transition-all font-normal">
                        <Trophy className="h-4 w-4 text-blue-500" />
                        <span>GoT</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${gotOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/escalacao/got'}
                        onClick={() => setLocation('/escalacao/got')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Escalação</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/got/ataques'}
                        onClick={() => setLocation('/got/ataques')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Ataques</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/avisos/got'}
                        onClick={() => setLocation('/avisos/got')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Avisos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/got/avisos'}
                        onClick={() => setLocation('/got/avisos')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Lembretes</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/got/estrategia'}
                        onClick={() => setLocation('/got/estrategia')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Estratégia</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/got/painel-estrategias'}
                        onClick={() => setLocation('/got/painel-estrategias')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Painel de Estratégias</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/got/relatorio-ataques'}
                        onClick={() => setLocation('/got/relatorio-ataques')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Relatório de Ataques</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.includes('/got')}
                    onClick={() => setLocation('/escalacao/got')}
                    tooltip="GoT"
                    className="h-10 transition-all font-normal"
                  >
                    <Trophy className="h-4 w-4 text-blue-500" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Relíquias Section */}
              {!isCollapsed ? (
                <Collapsible open={reliquiasOpen} onOpenChange={setReliquiasOpen}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="h-10 transition-all font-normal">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span>Relíquias</span>
                        <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${reliquiasOpen ? 'rotate-180' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  </SidebarMenuItem>
                  <CollapsibleContent>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/escalacao/reliquias'}
                        onClick={() => setLocation('/escalacao/reliquias')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Escalação</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/reliquias/ataques'}
                        onClick={() => setLocation('/reliquias/ataques')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Ataques</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/reliquias/avisos'}
                        onClick={() => setLocation('/reliquias/avisos')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Avisos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={location === '/reliquias/avisos-config'}
                        onClick={() => setLocation('/reliquias/avisos-config')}
                        className="h-9 pl-8 transition-all font-normal"
                      >
                        <span>Avisos Automáticos</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location.includes('/reliquias')}
                    onClick={() => setLocation('/escalacao/reliquias')}
                    tooltip="Relíquias"
                    className="h-10 transition-all font-normal"
                  >
                    <Crown className="h-4 w-4 text-yellow-500" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Avisos Gerais */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/avisos-gerais'}
                  onClick={() => setLocation('/avisos-gerais')}
                  tooltip="Avisos Gerais"
                  className="h-10 transition-all font-normal"
                >
                  <Megaphone className={`h-4 w-4 ${location === '/avisos-gerais' ? "text-primary" : ""}`} />
                  <span>Avisos Gerais</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Ranking */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/ranking'}
                  onClick={() => setLocation('/ranking')}
                  tooltip="Ranking"
                  className="h-10 transition-all font-normal"
                >
                  <Trophy className={`h-4 w-4 ${location === '/ranking' ? "text-primary" : "text-yellow-500"}`} />
                  <span>Ranking</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Top 5 */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/top5'}
                  onClick={() => setLocation('/top5')}
                  tooltip="Top 5"
                  className="h-10 transition-all font-normal"
                >
                  <Crown className={`h-4 w-4 ${location === '/top5' ? "text-primary" : "text-amber-500"}`} />
                  <span>Top 5</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Precisa de Atenção */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/precisa-atencao'}
                  onClick={() => setLocation('/precisa-atencao')}
                  tooltip="Precisa de Atenção"
                  className="h-10 transition-all font-normal"
                >
                  <AlertTriangle className={`h-4 w-4 ${location === '/precisa-atencao' ? "text-primary" : "text-red-500"}`} />
                  <span>Precisa de Atenção</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Cartas */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/cartas'}
                  onClick={() => setLocation('/cartas')}
                  tooltip="Cartas"
                  className="h-10 transition-all font-normal"
                >
                  <Wand2 className={`h-4 w-4 ${location === '/cartas' ? "text-primary" : "text-purple-500"}`} />
                  <span>Cartas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Personagens */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/personagens'}
                  onClick={() => setLocation('/personagens')}
                  tooltip="Personagens"
                  className="h-10 transition-all font-normal"
                >
                  <Users className={`h-4 w-4 ${location === '/personagens' ? "text-primary" : "text-blue-500"}`} />
                  <span>Personagens</span>
                </SidebarMenuButton>
              </SidebarMenuItem>



              {/* Histórico */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/historico'}
                  onClick={() => setLocation('/historico')}
                  tooltip="Histórico"
                  className="h-10 transition-all font-normal"
                >
                  <History className={`h-4 w-4 ${location === '/historico' ? "text-primary" : ""}`} />
                  <span>Histórico</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Estatísticas */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/estatisticas'}
                  onClick={() => setLocation('/estatisticas')}
                  tooltip="Estatísticas"
                  className="h-10 transition-all font-normal"
                >
                  <BarChart3 className={`h-4 w-4 ${location === '/estatisticas' ? "text-primary" : ""}`} />
                  <span>Estatísticas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Sub-Admins (only for admin) */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={location === '/sub-admins'}
                    onClick={() => setLocation('/sub-admins')}
                    tooltip="Sub-Admins"
                    className="h-10 transition-all font-normal"
                  >
                    <Shield className={`h-4 w-4 ${location === '/sub-admins' ? "text-primary" : ""}`} />
                    <span>Sub-Admins</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {/* Painel de Contas */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/painel-contas'}
                  onClick={() => setLocation('/painel-contas')}
                  tooltip="Painel de Contas"
                  className="h-10 transition-all font-normal"
                >
                  <Sparkles className={`h-4 w-4 ${location === '/painel-contas' ? "text-primary" : ""}`} />
                  <span>Painel de Contas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Backups */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/backups'}
                  onClick={() => setLocation('/backups')}
                  tooltip="Backups"
                  className="h-10 transition-all font-normal"
                >
                  <HardDrive className={`h-4 w-4 ${location === '/backups' ? "text-primary" : ""}`} />
                  <span>Backups</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Configurações */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/configuracoes'}
                  onClick={() => setLocation('/configuracoes')}
                  tooltip="Configurações"
                  className="h-10 transition-all font-normal"
                >
                  <Settings className={`h-4 w-4 ${location === '/configuracoes' ? "text-primary" : ""}`} />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={location === '/whatsapp-config'}
                  onClick={() => setLocation('/whatsapp-config')}
                  tooltip="WhatsApp Bot"
                  className="h-10 transition-all font-normal"
                >
                  <MessageSquare className={`h-4 w-4 ${location === '/whatsapp-config' ? "text-primary" : ""}`} />
                  <span>WhatsApp Bot</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50">
                <DropdownMenuItem
                  onClick={toggleDarkMode}
                  className="cursor-pointer"
                >
                  {isDark ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      <span>Modo Claro</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      <span>Modo Noturno</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-foreground">
                    {getPageTitle()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
