'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bot, Loader2, Upload, Send, CheckCircle2, XCircle } from 'lucide-react';
import { automatedTestGrading, type AutomatedTestGradingOutput } from '@/ai/flows/automated-test-grading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/header';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import type { Prova } from '@/lib/types';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export default function CorrigirProvaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const provaId = params.id as string;
  
  const provaDocRef = useMemoFirebase(() => doc(firestore, 'provas', provaId), [firestore, provaId]);
  const { data: prova, isLoading: isProvaLoading } = useDoc<Prova>(provaDocRef);

  const [studentSheet, setStudentSheet] = useState<File | null>(null);
  const [answerKey, setAnswerKey] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutomatedTestGradingOutput | null>(null);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleGrade = async () => {
    if (!studentSheet || !answerKey) {
      toast({
        variant: 'destructive',
        title: 'Arquivos Faltando',
        description: 'Por favor, envie a foto da resposta do aluno e do gabarito.',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const studentSheetUri = await fileToDataUri(studentSheet);
      const answerKeyUri = await fileToDataUri(answerKey);

      const response = await automatedTestGrading({
        photoDataUri: studentSheetUri,
        answerKeyDataUri: answerKeyUri,
        testId: provaId,
        studentId: 'mock-student-01', // Mocking student ID
      });
      
      setResult(response);
      toast({
        title: 'Correção Concluída!',
        description: `A prova foi corrigida com sucesso.`,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro Detalhado da IA',
        description: error.message || 'Um erro desconhecido ocorreu.',
        duration: 9000,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveAndRedirect = async () => {
    if (!result) return;
    
    // Save corrections
    const correcoesCollection = collection(firestore, 'correcoes');
    addDocumentNonBlocking(correcoesCollection, {
        alunoId: 'mock-student-01',
        provaId: provaId,
        correcoes: result.corrections,
        dataCorrecao: new Date().toISOString(),
    });
    
    // Save results
    const resultadosCollection = collection(firestore, 'resultados');
    const resultadoData = {
        alunoId: 'mock-student-01',
        provaId: provaId,
        acertos: result.results.correctCount,
        erros: result.results.incorrectCount,
        media: result.results.accuracy,
    };
    addDocumentNonBlocking(resultadosCollection, resultadoData)

    toast({
        title: 'Resultados Salvos!',
        description: `Navegando para a página de resultados.`,
    });
    router.push(`/provas/${provaId}/resultados`);
  }

  if (isProvaLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8 container mx-auto">
            <PageHeader title="Carregando..." />
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
        <PageHeader title={`Correção: ${prova.titulo}`} description="Use a IA para corrigir a prova automaticamente." icon={Bot} />

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Arquivos</CardTitle>
              <CardDescription>Envie a foto da folha de respostas do aluno e a foto do gabarito oficial.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="student-sheet">Resposta do Aluno</Label>
                <div className="flex items-center gap-2">
                   <Input id="student-sheet" type="file" accept="image/*" onChange={(e) => setStudentSheet(e.target.files?.[0] || null)} />
                   {studentSheet && <CheckCircle2 className="text-green-500"/>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer-key">Gabarito Oficial</Label>
                <div className="flex items-center gap-2">
                  <Input id="answer-key" type="file" accept="image/*" onChange={(e) => setAnswerKey(e.target.files?.[0] || null)} />
                  {answerKey && <CheckCircle2 className="text-green-500"/>}
                </div>
              </div>
              <Button onClick={handleGrade} disabled={isLoading || !studentSheet || !answerKey} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Corrigindo...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Corrigir com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Resultados da Correção</CardTitle>
              <CardDescription>Os resultados da correção da IA serão exibidos aqui.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              {isLoading && <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />}
              {!isLoading && !result && <div className="text-center text-muted-foreground">Aguardando correção...</div>}
              {result && (
                <div className="w-full space-y-4">
                  <Alert variant={result.results.accuracy >= 60 ? 'default' : 'destructive'} className="bg-card">
                      <AlertTitle className="text-lg font-bold">Resultado Final</AlertTitle>
                      <AlertDescription>
                          <p><strong>Acertos:</strong> {result.results.correctCount}</p>
                          <p><strong>Erros:</strong> {result.results.incorrectCount}</p>
                          <p><strong>Aproveitamento:</strong> {result.results.accuracy.toFixed(2)}%</p>
                      </AlertDescription>
                  </Alert>

                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    <h4 className="font-semibold">Correções por Questão:</h4>
                    {result.corrections.map((correction) => (
                      <div key={correction.questionId} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                        <span className="font-medium">Questão {correction.questionId}</span>
                        {correction.correct ? (
                          <span className="flex items-center text-green-600"><CheckCircle2 className="mr-2 h-4 w-4"/> Correta</span>
                        ) : (
                          <span className="flex items-center text-red-600"><XCircle className="mr-2 h-4 w-4"/> Incorreta</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleSaveAndRedirect} className="w-full">Salvar e Ver Relatório</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
