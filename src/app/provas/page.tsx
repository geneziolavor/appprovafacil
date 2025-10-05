'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FileText, BarChart2, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { Header } from '@/components/header';
import type { Prova, Turma } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function ProvasPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const provasCollection = useMemoFirebase(() => collection(firestore, 'provas'), [firestore]);
  const { data: provas, isLoading } = useCollection<Prova>(provasCollection);

  const turmasCollection = useMemoFirebase(() => collection(firestore, 'turmas'), [firestore]);
  const { data: turmas } = useCollection<Turma>(turmasCollection);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProva, setEditingProva] = useState<Prova | null>(null);
  const [numeroDeQuestoes, setNumeroDeQuestoes] = useState(10);
  const [gabarito, setGabarito] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});

  useEffect(() => {
    if (editingProva) {
      setNumeroDeQuestoes(editingProva.numeroDeQuestoes || 10);
      setGabarito(editingProva.gabarito || {});
    } else {
      setNumeroDeQuestoes(10);
      setGabarito({});
    }
  }, [editingProva]);

  const getTurmaNome = (id: string) => turmas?.find(t => t.id === id)?.nome || 'N/A';
  
  const handleEdit = (prova: Prova) => {
    setEditingProva(prova);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const docRef = doc(firestore, 'provas', id);
    deleteDocumentNonBlocking(docRef);
  };

  const handleOpenDialog = () => {
    setEditingProva(null);
    setIsDialogOpen(true);
  }
  
  const handleGabaritoChange = (question: string, value: 'A' | 'B' | 'C' | 'D') => {
    setGabarito(prev => ({ ...prev, [question]: value }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (Object.keys(gabarito).length !== numeroDeQuestoes) {
        toast({
            variant: 'destructive',
            title: 'Gabarito Incompleto',
            description: 'Por favor, preencha a resposta para todas as questões do gabarito.'
        });
        return;
    }

    const formData = new FormData(event.currentTarget);
    const newProvaData = {
      titulo: formData.get('titulo') as string,
      dataAplicacao: formData.get('dataAplicacao') as string,
      turmaId: formData.get('turmaId') as string,
      numeroDeQuestoes: numeroDeQuestoes,
      gabarito: gabarito,
    };

    if (editingProva) {
      const docRef = doc(firestore, 'provas', editingProva.id);
      setDocumentNonBlocking(docRef, newProvaData, { merge: true });
    } else {
      addDocumentNonBlocking(provasCollection, newProvaData as any);
    }
    setIsDialogOpen(false);
    setEditingProva(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <PageHeader title="Provas" description="Gerencie as provas e suas correções." icon={FileText}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Prova
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProva ? 'Editar Prova' : 'Adicionar Prova'}</DialogTitle>
                <DialogDescription>
                  {editingProva ? 'Atualize as informações da prova e seu gabarito.' : 'Preencha os dados da nova prova e seu gabarito.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="titulo" className="text-right">
                      Título
                    </Label>
                    <Input id="titulo" name="titulo" defaultValue={editingProva?.titulo} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dataAplicacao" className="text-right">
                      Data
                    </Label>
                    <Input id="dataAplicacao" name="dataAplicacao" type="date" defaultValue={editingProva?.dataAplicacao} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="turmaId" className="text-right">
                      Turma
                    </Label>
                    <Select name="turmaId" defaultValue={editingProva?.turmaId} required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                      <SelectContent>
                        {turmas?.map(turma => (
                          <SelectItem key={turma.id} value={turma.id}>{turma.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4 border-t pt-4 mt-4">
                    <Label htmlFor="numeroDeQuestoes" className="text-right">
                        Nº de Questões
                    </Label>
                    <Input
                        id="numeroDeQuestoes"
                        name="numeroDeQuestoes"
                        type="number"
                        className="col-span-1"
                        value={numeroDeQuestoes}
                        onChange={(e) => setNumeroDeQuestoes(parseInt(e.target.value, 10) || 0)}
                        min={1}
                        required
                    />
                  </div>
                   <div className="border-t pt-4 mt-4">
                     <Label className='mb-4'>Gabarito</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 mt-2 max-h-60 overflow-y-auto pr-4">
                        {Array.from({ length: numeroDeQuestoes }, (_, i) => i + 1).map((q) => (
                            <div key={q} className="flex items-center gap-2">
                                <Label htmlFor={`q-${q}`} className="min-w-[70px] text-right">
                                    Questão {q}
                                </Label>
                                <Select
                                    name={`gabarito-${q}`}
                                    value={gabarito[q]}
                                    onValueChange={(value) => handleGabaritoChange(q.toString(), value as 'A' | 'B' | 'C' | 'D')}
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
                </div>
                <DialogFooter>
                  <Button type="submit">Salvar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </PageHeader>
        <Card>
          <CardHeader>
            <CardTitle>Lista de Provas</CardTitle>
            <CardDescription>Total de {provas?.length || 0} provas.</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead className="text-right w-[200px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>}
                  {provas?.map(prova => (
                    <TableRow key={prova.id}>
                      <TableCell className="font-medium">{prova.titulo}</TableCell>
                      <TableCell>{new Date(prova.dataAplicacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>{getTurmaNome(prova.turmaId)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon">
                              <Link href={`/provas/${prova.id}/corrigir-rapido`}>
                                <ListChecks className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Correção Rápida</p>
                          </TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon">
                              <Link href={`/provas/${prova.id}/resultados`}>
                                <BarChart2 className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Resultados</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(prova)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Prova</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(prova.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir Prova</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
