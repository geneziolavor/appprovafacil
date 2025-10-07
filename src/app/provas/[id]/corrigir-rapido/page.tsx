'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Prova, Aluno, Resultado } from '@/lib/types';
import { Header } from '@/components/header';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Upload, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { createWorker } from 'tesseract.js';

export default function CorrigirRapidoPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const provaId = params.id as string;

  const provaRef = useMemoFirebase(() => doc(firestore, 'provas', provaId), [firestore, provaId]);
  const { data: prova } = useDoc<Prova>(provaRef);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [allAnswersFilled, setAllAnswersFilled] = useState(false);

  const alunosCollection = useMemoFirebase(() => collection(firestore, 'alunos'), [firestore]);
  const { data: alunosData } = useCollection<Aluno>(alunosCollection);

  useEffect(() => {
    if (prova && alunosData) {
      const alunosDaTurma = alunosData.filter(a => a.turmaId === prova.turmaId);
      setAlunos(alunosDaTurma);
    }
  }, [prova, alunosData]);

  useEffect(() => {
    if (prova?.numeroDeQuestoes) {
        const filledCount = Object.keys(respostas).length;
        setAllAnswersFilled(filledCount > 0 && filledCount === prova.numeroDeQuestoes);
    }
  }, [respostas, prova?.numeroDeQuestoes]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleAiCorrection = async () => {
    if (!selectedFile || !selectedAlunoId) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione um aluno e um arquivo de imagem.' });
      return;
    }

    setIsProcessing(true);
    toast({ title: 'Análise em progresso...', description: 'A IA está analisando a imagem. Isso pode levar um minuto.' });

    let worker: Tesseract.Worker | undefined;

    try {
      worker = await createWorker();
      await worker.loadLanguage('por');
      await worker.initialize('por');
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789-ABCDE',
      });

      const { data: { text } } = await worker.recognize(selectedFile);
      
      const newRespostas: Record<string, string> = {};
      const lines = text.split('\n');
      const answerRegex = /^\s*(\d+)\s*[-.)]*\s*([A-E])\s*$/i;

      lines.forEach(line => {
        const match = line.match(answerRegex);
        if (match) {
          const questao = match[1];
          const resposta = match[2].toUpperCase();
          newRespostas[questao] = resposta;
        }
      });

      if (Object.keys(newRespostas).length === 0) {
        toast({ variant: 'destructive', title: 'Nenhuma resposta encontrada', description: 'A IA não conseguiu identificar respostas no formato esperado (ex: 1. A). Tente uma imagem com melhor qualidade ou insira manualmente.' });
      } else {
        setRespostas(prev => ({ ...prev, ...newRespostas }));
        toast({ title: 'Respostas preenchidas!', description: `A IA encontrou ${Object.keys(newRespostas).length} respostas. Por favor, verifique antes de salvar.` });
      }

    } catch (error) {
      console.error("Erro no processamento da imagem com Tesseract: ", error);
      toast({ variant: 'destructive', title: 'Erro na IA', description: 'Ocorreu um erro inesperado durante a análise da imagem. Verifique sua conexão ou tente novamente.' });
    } finally {
      await worker?.terminate();
      setIsProcessing(false);
    }
  };

  const handleRespostaChange = (questao: string, valor: string) => {
    setRespostas(prev => ({ ...prev, [questao]: valor }));
  };

  const handleSaveAndVerify = async () => {
    if (!prova || !prova.gabarito || !prova.numeroDeQuestoes) {
        toast({ variant: 'destructive', title: 'Erro', description: 'A prova não tem um gabarito ou número de questões definido.' });
        return;
    }
    
    let acertos = 0;
    Object.keys(prova.gabarito).forEach(questao => {
      if (prova.gabarito[questao] === respostas[questao]) {
        acertos++;
      }
    });

    const erros = prova.numeroDeQuestoes - acertos;
    const media = (acertos / prova.numeroDeQuestoes) * 10;
    
    const resultadoData: Omit<Resultado, 'id'> = {
        alunoId: selectedAlunoId,
        provaId: provaId,
        acertos: acertos,
        erros: erros,
        media: media,
        respostas: respostas
    };
    
    const resultadoId = `${provaId}_${selectedAlunoId}`;
    const resultadoRef = doc(firestore, 'resultados', resultadoId);

    await setDocumentNonBlocking(resultadoRef, resultadoData);

    toast({ title: 'Sucesso!', description: `Resultado do aluno salvo.` });
    
    router.push(`/provas/${provaId}/resultados`);
  };
  
  if (!prova) return <div className="flex-1 p-4 md:p-8 container mx-auto">Carregando prova...</div>;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto space-y-8">
        <PageHeader title={`Correção Rápida: ${prova.titulo}`} description={`Data: ${new Date(prova.dataAplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`} />
        
        <Card>
            <CardHeader>
                <CardTitle>Passo 1: Selecione o Aluno</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="w-full md:w-1/2">
                  <Label htmlFor="aluno">Aluno</Label>
                  <Select onValueChange={setSelectedAlunoId} value={selectedAlunoId} required>
                    <SelectTrigger id="aluno">
                      <SelectValue placeholder="Selecione um aluno da turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos.map(aluno => (
                        <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </CardContent>
        </Card>

        <Card className={!selectedAlunoId ? 'opacity-50 pointer-events-none' : ''}>
            <CardHeader>
                <CardTitle>Passo 2: Preencha as Respostas</CardTitle>
                <CardDescription>Use a IA para preencher automaticamente ou insira as respostas manualmente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                    <Label className="font-semibold">Opção A: Correção com IA</Label>
                    <div className="flex items-end gap-4 mt-2">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="picture">Foto do Gabarito</Label>
                            <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <Button onClick={handleAiCorrection} disabled={isProcessing || !selectedFile}>
                            <Upload className="mr-2 h-4 w-4" />
                            {isProcessing ? 'Analisando...' : 'Analisar com IA'}
                        </Button>
                    </div>
                </div>

                <div className="relative text-center">
                    <Separator />
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground">OU</span>
                </div>

                <div>
                    <Label className="font-semibold">Opção B: Lançamento Manual</Label>
                     {prova.numeroDeQuestoes > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-4 mt-2 max-h-72 overflow-y-auto pr-4 border rounded-lg p-4 bg-transparent">
                            {Array.from({ length: prova.numeroDeQuestoes }, (_, i) => i + 1).map((q) => (
                                <div key={q} className="flex items-center gap-2">
                                    <Label htmlFor={`q-${q}`} className="min-w-[70px] text-right">
                                        Questão {q}
                                    </Label>
                                    <Select
                                        name={`resposta-${q}`}
                                        value={respostas[q] || ''}
                                        onValueChange={(value) => handleRespostaChange(q.toString(), value)}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="-" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A">A</SelectItem>
                                            <SelectItem value="B">B</SelectItem>
                                            <SelectItem value="C">C</SelectItem>
                                            <SelectItem value="D">D</SelectItem>
                                            <SelectItem value="E">E</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className={!allAnswersFilled || !selectedAlunoId ? 'opacity-50 pointer-events-none' : ''}>
             <CardHeader>
                <CardTitle>Passo 3: Salvar o Resultado</CardTitle>
                <CardDescription>Depois de verificar as respostas, clique no botão abaixo para salvar o resultado final do aluno.</CardDescription>
            </CardHeader>
            <CardContent className='text-center'>
              <Button onClick={handleSaveAndVerify} size='lg'>
                Verificar e Enviar Correção <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
        </Card>
        
      </main>
    </div>
  );
}
