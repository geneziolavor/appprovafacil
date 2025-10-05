'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, ListChecks } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { Header } from '@/components/header';
import type { Questao, Prova } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useCollection, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc, query, where } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export default function QuestoesPage() {
  const params = useParams();
  const firestore = useFirestore();
  const provaId = params.id as string;
  
  const provaDocRef = useMemoFirebase(() => doc(firestore, 'provas', provaId), [firestore, provaId]);
  const { data: prova } = useDoc<Prova>(provaDocRef);

  const questoesCollection = useMemoFirebase(() => collection(firestore, 'questoes'), [firestore]);
  const questoesQuery = useMemoFirebase(() => query(questoesCollection, where('provaId', '==', provaId)), [questoesCollection, provaId]);
  const { data: questoes, isLoading } = useCollection<Questao>(questoesQuery);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestao, setEditingQuestao] = useState<Questao | null>(null);

  const handleEdit = (questao: Questao) => {
    setEditingQuestao(questao);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const docRef = doc(firestore, 'questoes', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleOpenDialog = () => {
    setEditingQuestao(null);
    setIsDialogOpen(true);
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newQuestaoData: Omit<Questao, 'id'> = {
      numero: Number(formData.get('numero')),
      enunciado: formData.get('enunciado') as string,
      provaId: provaId,
      tipo: 'multipla-escolha',
      alternativaA: formData.get('alternativaA') as string,
      alternativaB: formData.get('alternativaB') as string,
      alternativaC: formData.get('alternativaC') as string,
      alternativaD: formData.get('alternativaD') as string,
      alternativaCorreta: formData.get('alternativaCorreta') as 'A' | 'B' | 'C' | 'D',
    };

    if (editingQuestao) {
      const docRef = doc(firestore, 'questoes', editingQuestao.id);
      setDocumentNonBlocking(docRef, newQuestaoData, { merge: true });
    } else {
      addDocumentNonBlocking(questoesCollection, newQuestaoData);
    }
    setIsDialogOpen(false);
    setEditingQuestao(null);
  };

  if (!prova && !isLoading) {
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
        <PageHeader title={`Questões da Prova: ${prova?.titulo || '...'}`} description="Gerencie as questões da prova." icon={ListChecks}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Questão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingQuestao ? 'Editar Questão' : 'Adicionar Questão'}</DialogTitle>
                <DialogDescription>
                  {editingQuestao ? 'Atualize as informações da questão.' : 'Preencha os dados da nova questão.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="numero" className="text-right">
                      Número
                    </Label>
                    <Input id="numero" name="numero" type="number" defaultValue={editingQuestao?.numero} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="enunciado" className="text-right mt-2">
                      Enunciado
                    </Label>
                    <Textarea id="enunciado" name="enunciado" defaultValue={editingQuestao?.enunciado} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alternativaA" className="text-right">
                      Alternativa A
                    </Label>
                    <Input id="alternativaA" name="alternativaA" defaultValue={editingQuestao?.alternativaA} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alternativaB" className="text-right">
                      Alternativa B
                    </Label>
                    <Input id="alternativaB" name="alternativaB" defaultValue={editingQuestao?.alternativaB} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alternativaC" className="text-right">
                      Alternativa C
                    </Label>
                    <Input id="alternativaC" name="alternativaC" defaultValue={editingQuestao?.alternativaC} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alternativaD" className="text-right">
                      Alternativa D
                    </Label>
                    <Input id="alternativaD" name="alternativaD" defaultValue={editingQuestao?.alternativaD} className="col-span-3" required />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="alternativaCorreta" className="text-right">
                      Correta
                    </Label>
                    <Select name="alternativaCorreta" defaultValue={editingQuestao?.alternativaCorreta} required>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione a alternativa correta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
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
            <CardTitle>Lista de Questões</CardTitle>
            <CardDescription>Total de {questoes?.length || 0} questões.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Número</TableHead>
                  <TableHead>Enunciado</TableHead>
                  <TableHead className="w-[150px]">Alt. Correta</TableHead>
                  <TableHead className="text-right w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={4} className="text-center">Carregando...</TableCell></TableRow>}
                {questoes?.sort((a,b) => a.numero - b.numero).map(questao => (
                  <TableRow key={questao.id}>
                    <TableCell className="font-medium">{questao.numero}</TableCell>
                    <TableCell>{questao.enunciado}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{questao.alternativaCorreta}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(questao)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(questao.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    