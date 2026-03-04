import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trophy, Star, Target, Users, AlertTriangle, Medal, Crown, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MemberScore {
  memberId: number;
  memberName: string;
  totalStars: number;
  totalBattles: number;
  totalScheduled: number;
  missedAttacks: number;
  errorAttacks: number;
  scorePoints: number;
  scoreExecution: number;
  scoreParticipation: number;
  scoreFinal: number;
}

export default function GvgTimeIdeal() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0);
    return date.toISOString().split("T")[0];
  });

  const { data: ranking } = trpc.ranking.gvg.useQuery({
    startDate,
    endDate,
    limit: 100,
  });

  const { data: evolutionData } = trpc.gvgAttacks.getEvolutionData.useQuery({
    startDate,
    endDate,
  });

  const idealTeam = useMemo(() => {
    if (!ranking || ranking.length === 0) return [];

    // Calculate max values for normalization
    const maxStars = Math.max(...ranking.map((r: { totalStars: number | string }) => Number(r.totalStars) || 0), 1);

    const scores: MemberScore[] = ranking.map((member: { memberId: number; memberName: string; totalStars: number; totalAttacks: number; avgStars: number }) => {
      const totalStars = Number(member.totalStars) || 0;
      const totalBattles = Number(member.totalAttacks) || 0;
      
      // Get member data from evolution
      const memberEvolution = evolutionData?.filter((e: { memberId: number }) => e.memberId === member.memberId) || [];
      const totalScheduled = memberEvolution.length;
      
      // Count missed attacks (scheduled but didn't attack - 0 stars)
      const missedAttacks = memberEvolution.filter((e: { totalStars: number; attack1Stars: number; attack2Stars: number }) => 
        e.totalStars === 0
      ).length;
      
      // Count error attacks (low stars - less than 3 total)
      const errorAttacks = memberEvolution.filter((e: { totalStars: number }) => 
        e.totalStars > 0 && e.totalStars < 3
      ).length;

      // 1. Score Pontuação (50%) - normalized 0-100
      const scorePoints = (totalStars / maxStars) * 100;

      // 2. Score Execução (30%) - penalize failures
      // Start at 100, subtract penalties
      const missedPenalty = missedAttacks * 15; // High penalty for not attacking
      const errorPenalty = errorAttacks * 5; // Medium penalty for errors
      const scoreExecution = Math.max(0, 100 - missedPenalty - errorPenalty);

      // 3. Score Participação (20%) - constancy
      const scoreParticipation = totalScheduled > 0 
        ? ((totalBattles / totalScheduled) * 100)
        : 0;

      // Final Score (weighted)
      const scoreFinal = (scorePoints * 0.5) + (scoreExecution * 0.3) + (scoreParticipation * 0.2);

      return {
        memberId: member.memberId,
        memberName: member.memberName,
        totalStars,
        totalBattles,
        totalScheduled,
        missedAttacks,
        errorAttacks,
        scorePoints: Math.round(scorePoints * 10) / 10,
        scoreExecution: Math.round(scoreExecution * 10) / 10,
        scoreParticipation: Math.round(scoreParticipation * 10) / 10,
        scoreFinal: Math.round(scoreFinal * 10) / 10,
      };
    });

    // Sort by scoreFinal descending, then by tiebreakers
    return scores.sort((a, b) => {
      // Primary: Score Final
      if (b.scoreFinal !== a.scoreFinal) return b.scoreFinal - a.scoreFinal;
      // Tiebreaker 1: Total stars
      if (b.totalStars !== a.totalStars) return b.totalStars - a.totalStars;
      // Tiebreaker 2: Less failures
      const aFailures = a.missedAttacks + a.errorAttacks;
      const bFailures = b.missedAttacks + b.errorAttacks;
      if (aFailures !== bFailures) return aFailures - bFailures;
      // Tiebreaker 3: More participations
      return b.totalBattles - a.totalBattles;
    }).slice(0, 20);
  }, [ranking, evolutionData]);

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-bold text-muted-foreground">{position}</span>;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Time Ideal - GvG
        </h1>
        <p className="text-muted-foreground">
          Os 20 melhores membros baseado em desempenho, disciplina e constância
        </p>
      </div>

      {/* Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Critérios de Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">Pontuação (50%)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Total de estrelas obtidas no período, normalizado de 0 a 100
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Execução (30%)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Penaliza falhas: não atacar (-15pts), ataque com erro (-5pts)
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Participação (20%)</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Constância: (ataques realizados ÷ escalações) × 100
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideal Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 20 - Time Ideal
          </CardTitle>
          <CardDescription>
            Ordenado por Score Final (desempate: pontuação, menos falhas, mais participações)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {idealTeam.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado encontrado no período selecionado
            </p>
          ) : (
            <div className="space-y-3">
              {idealTeam.map((member, index) => (
                <div
                  key={member.memberId}
                  className={`p-4 rounded-lg border ${
                    index < 3 
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-300 dark:border-yellow-700"
                      : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Position */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-background border-2 border-primary">
                      {getPositionIcon(index + 1)}
                    </div>

                    {/* Name and Score */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg truncate">{member.memberName}</span>
                        <Badge variant="outline" className={getScoreColor(member.scoreFinal)}>
                          Score: {member.scoreFinal}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <Progress value={member.scoreFinal} className="h-2" />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-purple-600">{member.totalStars}</div>
                        <div className="text-xs text-muted-foreground">Estrelas</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600">{member.scoreParticipation}%</div>
                        <div className="text-xs text-muted-foreground">Participação</div>
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${member.missedAttacks + member.errorAttacks > 0 ? "text-red-600" : "text-green-600"}`}>
                          {member.missedAttacks + member.errorAttacks}
                        </div>
                        <div className="text-xs text-muted-foreground">Falhas</div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="md:hidden mt-3 flex justify-around text-sm border-t pt-3">
                    <div className="text-center">
                      <div className="font-semibold text-purple-600">{member.totalStars}</div>
                      <div className="text-xs text-muted-foreground">Estrelas</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600">{member.scoreParticipation}%</div>
                      <div className="text-xs text-muted-foreground">Participação</div>
                    </div>
                    <div className="text-center">
                      <div className={`font-semibold ${member.missedAttacks + member.errorAttacks > 0 ? "text-red-600" : "text-green-600"}`}>
                        {member.missedAttacks + member.errorAttacks}
                      </div>
                      <div className="text-xs text-muted-foreground">Falhas</div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mt-3 pt-3 border-t flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">Pontuação:</span>
                      <span className="font-medium">{member.scorePoints}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-blue-500" />
                      <span className="text-muted-foreground">Execução:</span>
                      <span className="font-medium">{member.scoreExecution}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-green-500" />
                      <span className="text-muted-foreground">Participação:</span>
                      <span className="font-medium">{member.scoreParticipation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
