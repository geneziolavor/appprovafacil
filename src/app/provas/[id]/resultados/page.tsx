'use client';

import { Header } from "@/components/header";
import { PageHeader } from "@/components/page-header";
import { BarChart2, CheckCircle2, XCircle } from "lucide-react";
import { mockProvas, mockResultados } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsChart } from "@/components/results-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ResultadosPage({ params }: { params: { id: string } }) {
  const provaId = params.id;
  const prova = mockProvas.find((p) => p.id === provaId);
  const resultados = mockResultados.filter((r) => r.provaId === provaId);

  if (!prova) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8 container mx-auto">
          <PageHeader title="Prova não encontrada" />
        </main>
      </div>
    );
  }

  const totalAcertos = resultados.reduce((sum, r) => sum + r.acertos, 0);
  const totalErros = resultados.reduce((sum, r) => sum + r.erros, 0);
  const totalQuestoes = resultados.length > 0 ? (resultados[0].acertos + resultados[0].erros) * resultados.length : 0;
  const mediaGeral = resultados.length > 0 ? resultados.reduce((sum, r) => sum + r.media, 0) / resultados.length : 0;
  
  const chartData = [
    { name: 'Acertos', value: totalAcertos, fill: 'hsl(var(--chart-2))' },
    { name: 'Erros', value: totalErros, fill: 'hsl(var(--chart-3))' },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <PageHeader title={`Resultados: ${prova.titulo}`} description="Análise de desempenho da turma na prova." icon={BarChart2} />
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
                    <span className="text-muted-foreground">%</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{mediaGeral.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Média de aproveitamento da turma</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Acertos</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalAcertos}</div>
                     <p className="text-xs text-muted-foreground">de {totalQuestoes} questões respondidas</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalErros}</div>
                    <p className="text-xs text-muted-foreground">de {totalQuestoes} questões respondidas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos Avaliados</CardTitle>
                    <span className="text-muted-foreground">Nº</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{resultados.length}</div>
                    <p className="text-xs text-muted-foreground">Total de alunos que fizeram a prova</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Visão Geral</CardTitle>
                    <CardDescription>Distribuição de acertos e erros.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ResultsChart data={chartData} />
                </CardContent>
            </Card>
            <Card className="md:col-span-3">
                 <CardHeader>
                    <CardTitle>Resultados por Aluno</CardTitle>
                    <CardDescription>Desempenho individual dos alunos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Aluno</TableHead>
                                <TableHead>Acertos</TableHead>
                                <TableHead>Erros</TableHead>
                                <TableHead className="text-right">Média</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {resultados.map(r => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">Aluno ID: {r.alunoId}</TableCell>
                                    <TableCell>{r.acertos}</TableCell>
                                    <TableCell>{r.erros}</TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={r.media >= 60 ? 'default' : 'destructive'} className="bg-opacity-20 text-foreground">
                                            {r.media.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
