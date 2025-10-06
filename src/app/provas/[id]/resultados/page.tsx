'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { Header } from "@/components/header";
import { PageHeader } from "@/components/page-header";
import { BarChart2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsChart } from "@/components/results-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collection, doc } from "firebase/firestore";
import type { Aluno, Prova, Resultado } from "@/lib/types";

export default function ResultadosPage() {
  const firestore = useFirestore();
  const params = useParams();
  const provaId = params.id as string;
  
  // Carrega a prova
  const provaDocRef = useMemoFirebase(() => doc(firestore, 'provas', provaId), [firestore, provaId]);
  const { data: prova, isLoading: isProvaLoading } = useDoc<Prova>(provaDocRef);

  // Carrega TODOS os resultados e filtra no cliente para maior robustez
  const allResultadosQuery = useMemoFirebase(() => collection(firestore, 'resultados'), [firestore]);
  const { data: allResultados, isLoading: areResultadosLoading } = useCollection<Resultado>(allResultadosQuery);
  
  const resultados = useMemo(() => {
    if (!allResultados) return [];
    return allResultados.filter(r => r.provaId === provaId);
  }, [allResultados, provaId]);
  
  // Carrega todos os alunos para mapear o ID para o nome
  const alunosCollectionRef = useMemoFirebase(() => collection(firestore, 'alunos'), [firestore]);
  const { data: alunos, isLoading: areAlunosLoading } = useCollection<Aluno>(alunosCollectionRef);

  const getAlunoNome = (alunoId: string) => {
    if (!alunos) return 'Carregando...';
    const aluno = alunos.find(a => a.id === alunoId);
    return aluno ? aluno.nome : 'Aluno não encontrado';
  };

  const isLoading = isProvaLoading || areAlunosLoading;

  // Cálculos de métricas gerais
  const totalAcertos = useMemo(() => resultados.reduce((sum, r) => sum + r.acertos, 0), [resultados]);
  const totalErros = useMemo(() => resultados.reduce((sum, r) => sum + r.erros, 0), [resultados]);
  const totalQuestoesRespondidas = totalAcertos + totalErros;
  const mediaGeral = useMemo(() => {
    if (resultados.length === 0) return 0;
    const somaDasMedias = resultados.reduce((sum, r) => sum + r.media, 0);
    return (somaDasMedias / resultados.length) * 10;
  }, [resultados]);
  
  const chartData = useMemo(() => [
    { name: 'Acertos', value: totalAcertos, fill: 'hsl(var(--chart-2))' },
    { name: 'Erros', value: totalErros, fill: 'hsl(var(--chart-3))' },
  ], [totalAcertos, totalErros]);

  if (isLoading && resultados.length === 0) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8 container mx-auto">
            <PageHeader title="Carregando Resultados..." />
            </main>
        </div>
    );
  }

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
                     <p className="text-xs text-muted-foreground">de {totalQuestoesRespondidas} questões</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalErros}</div>
                    <p className="text-xs text-muted-foreground">de {totalQuestoesRespondidas} questões</p>
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
                    {resultados.length > 0 ? (
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
                                {resultados.map(r => {
                                    const mediaAluno = r.media * 10;
                                    return (
                                        <TableRow key={r.id}>
                                            <TableCell className="font-medium">{getAlunoNome(r.alunoId)}</TableCell>
                                            <TableCell>{r.acertos}</TableCell>
                                            <TableCell>{r.erros}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={mediaAluno >= 60 ? 'default' : 'destructive'}>
                                                    {mediaAluno.toFixed(1)}%
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            Nenhum resultado foi lançado para esta prova ainda.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
