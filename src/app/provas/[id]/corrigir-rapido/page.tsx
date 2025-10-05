'use client';

import { useState, useEffect } from 'react';
import { useFirestore, useDocument, useCollection } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Prova, Aluno, Resultado } from '@/lib/types';
import { Header } from '@/components/header';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { CheckCircle, XCircle } from 'lucide-react';

export default function CorrigirRapidoPage({ params }: { params: { id: string } }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const provaRef = doc(firestore, 'provas', params.id);
  const { data: prova } = useDocument<Prova>(provaRef);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [resultadoFinal, setResultadoFinal] = useState<{ acertos: number; erros: number; media: number; respostasSalvas: Record<string, string> } | null>(null);

  const turmasCollection = collection(firestore, 'turmas');
  const { data: turmasData } = useCollection(turmasCollection);

  const alunosCollection = collection(firestore, 'alunos');
  const { data: alunosData } = useCollection<Aluno>(alunosCollection);

  useEffect(() => {
    if (prova && alunosData) {
      const alunosDaTurma = alunosData.filter(a => a.turmaId === prova.turmaId);
      setAlunos(alunosDaTurma);
    }
  }, [prova, alunosData]);

  const handleRespostaChange = (questao: string, valor: string) => {
    setRespostas(prev => ({ ...prev, [questao]: valor }));
  };

  const handleCorrigir = async () => {
    if (!prova || !prova.gabarito) return;
    if (!selectedAlunoId) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, selecione um aluno.' });
        return;
    }
    if (Object.keys(respostas).length !== prova.numeroDeQuestoes) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha todas as respostas.' });
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
    
    setResultadoFinal({ acertos, erros, media, respostasSalvas: respostas });

    // Salvar no banco
    const resultadoData: Partial<Resultado> = {
        alunoId: selectedAlunoId,
        provaId: params.id,
        acertos: acertos,
        erros: erros,
        media: media,
        respostas: respostas
    };
    
    // Usamos um ID customizado para evitar duplicatas
    const resultadoId = `${params.id}_${selectedAlunoId}`;
    const resultadoRef = doc(firestore, 'resultados', resultadoId);

    await setDocumentNonBlocking(resultadoRef, resultadoData);

    toast({ title: 'Sucesso!', description: `Resultado do aluno salvo. Média: ${media.toFixed(2)}` });
  };
  
  const handleNovoAluno = () => {
      setSelectedAlunoId('');
      setRespostas({});
      setResultadoFinal(null);
  }

  if (!prova) return <div className="flex-1 p-4 md:p-8 container mx-auto">Carregando prova...</div>;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <PageHeader title={`Correção Rápida: ${prova.titulo}`} description={`Data: ${new Date(prova.dataAplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`} />

        {resultadoFinal ? (
            <Card>
                <CardHeader>
                    <CardTitle>Resultado Final</CardTitle>
                    <CardDescription>Aluno: {alunos.find(a => a.id === selectedAlunoId)?.nome}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='text-center'>
                        <p className='text-lg'>Média Final</p>
                        <p className='text-4xl font-bold'>{resultadoFinal.media.toFixed(2)}</p>
                    </div>
                    <div className='flex justify-around'>
                        <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={24} />
                            <span className='text-lg'>Acertos: {resultadoFinal.acertos}</span>
                        </div>
                         <div className="flex items-center gap-2 text-red-600">
                            <XCircle size={24} />
                            <span className='text-lg'>Erros: {resultadoFinal.erros}</span>
                        </div>
                    </div>
                    <div className="border-t pt-4 mt-4">
                        <h4 className='font-semibold mb-2'>Respostas do Aluno:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                            {Object.entries(resultadoFinal.respostasSalvas).map(([q, r]) => (
                                <div key={q} className={'p-2 rounded-md ' + (prova.gabarito[q] === r ? 'bg-green-100' : 'bg-red-100')}>
                                    <strong>Questão {q}:</strong> {r}
                                    <span className='text-xs ml-1'> (G: {prova.gabarito[q]})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='text-center mt-6'>
                       <Button onClick={handleNovoAluno}>Corrigir Prova de Outro Aluno</Button>
                    </div>
                </CardContent>
            </Card>
        ) : (
             <Card>
              <CardHeader>
                <CardTitle>Lançar Respostas</CardTitle>
                <CardDescription>Selecione o aluno e insira as alternativas que ele marcou.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="w-full md:w-1/2">
                  <Label htmlFor="aluno">Aluno</Label>
                  <Select onValueChange={setSelectedAlunoId} value={selectedAlunoId} required>
                    <SelectTrigger id="aluno">
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alunos.map(aluno => (
                        <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                    <Label>Respostas do Aluno</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-4 mt-2 max-h-72 overflow-y-auto pr-4">
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
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className='text-center'>
                  <Button onClick={handleCorrigir} size='lg'>Corrigir e Salvar Resultado</Button>
                </div>
              </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
