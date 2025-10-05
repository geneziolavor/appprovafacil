'use client';

import { Header } from "@/components/header";
import { PageHeader } from "@/components/page-header";
import { BarChart2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsChart } from "@/components/results-chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useCollection, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import type { Aluno, Prova, Resultado } from "@/lib/types";

export default function ResultadosPage({ params: { id: provaId } }: { params: { id: string } }) {
  const firestore = useFirestore();
  
  // Carrega a prova
  const provaDocRef = useMemoFirebase(() => doc(firestore, 'provas', provaId), [firestore, provaId]);
  const { data: prova, isLoading: isProvaLoading } = useDoc<Prova>(provaDocRef);

  // Carrega os resultados da prova
  const resultadosCollectionRef = useMemoFirebase(() => collection(firestore, 'resultados'), [firestore]);
  const resultadosQuery = useMemoFirebase(() => query(resultadosCollectionRef, where('provaId', '==', provaId)), [resultadosCollectionRef, provaId]);
  const { data: resultados, isLoading: areResultadosLoading } = useCollection<Resultado>(resultadosQuery);
  
  // Carrega todos os alunos para mapear o ID para o nome
  const alunosCollectionRef = useMemoFirebase(() => collection(firestore, 'alunos'), [firestore]);
  const { data: alunos, isLoading: areAlunosLoading } = useCollection<Aluno>(alunosCollectionRef);

  const getAlunoNome = (alunoId: string) => {
    if (!alunos) return 'Carregando...';
    const aluno = alunos.find(a => a.id === alunoId);
    return aluno ? aluno.nome : 'Aluno não encontrado';
  };

  const isLoading = isProvaLoading || areResultadosLoading || areAlunosLoading;

  if (isLoading) {
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
  
  // Cálculos com segurança e baseados nos dados corretos
  const totalAcertos = resultados?.reduce((sum, r) => sum + (r.acertos || 0), 0) || 0;
  const totalQuestoesRespondidas = (prova.numeroDeQuestoes || 0) * (resultados?.length || 0);
  const totalErros = totalQuestoesRespondidas - totalAcertos;
  const mediaGeral = (resultados && resultados.length > 0) ? (resultados.reduce((sum, r) => sum + (r.media || 0), 0) / resultados.length) * 10 : 0;
  
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
                     <p className="text-xs text-muted-foreground">de {totalQuestoesRespondidas} questões respondidas</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Erros</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalErros}</div>
                    <p className="text-xs text-muted-foreground">de {totalQuestoesRespondidas} questões respondidas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alunos Avaliados</CardTitle>
                    <span className="text-muted-foreground">Nº</span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{resultados?.length || 0}</div>
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
                            {resultados?.map(r => {
                                const mediaAluno = (r.media || 0) * 10;
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
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
