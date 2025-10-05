'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Users } from 'lucide-react';
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
import type { Aluno, Escola, Turma } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AlunosPage() {
  const firestore = useFirestore();
  const alunosCollection = useMemoFirebase(() => collection(firestore, 'alunos'), [firestore]);
  const { data: alunos, isLoading } = useCollection<Aluno>(alunosCollection);

  const escolasCollection = useMemoFirebase(() => collection(firestore, 'escolas'), [firestore]);
  const { data: escolas } = useCollection<Escola>(escolasCollection);

  const turmasCollection = useMemoFirebase(() => collection(firestore, 'turmas'), [firestore]);
  const { data: turmas } = useCollection<Turma>(turmasCollection);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const getEscolaNome = (id: string) => escolas?.find(e => e.id === id)?.nome || 'N/A';
  const getTurmaNome = (id: string) => turmas?.find(t => t.id === id)?.nome || 'N/A';

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const docRef = doc(firestore, 'alunos', id);
    deleteDocumentNonBlocking(docRef);
  };
  
  const handleOpenDialog = () => {
    setEditingAluno(null);
    setIsDialogOpen(true);
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newAlunoData = {
      nome: formData.get('nome') as string,
      dataNascimento: formData.get('dataNascimento') as string,
      escolaId: formData.get('escolaId') as string,
      turmaId: formData.get('turmaId') as string,
    };

    if (editingAluno) {
      const docRef = doc(firestore, 'alunos', editingAluno.id);
      updateDocumentNonBlocking(docRef, newAlunoData);
    } else {
      addDocumentNonBlocking(alunosCollection, newAlunoData);
    }
    setIsDialogOpen(false);
    setEditingAluno(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <PageHeader title="Alunos" description="Gerencie os alunos cadastrados." icon={Users}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingAluno ? 'Editar Aluno' : 'Adicionar Aluno'}</DialogTitle>
                <DialogDescription>
                  {editingAluno ? 'Atualize as informações do aluno.' : 'Preencha os dados do novo aluno.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input id="nome" name="nome" defaultValue={editingAluno?.nome} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dataNascimento" className="text-right">
                      Data Nasc.
                    </Label>
                    <Input id="dataNascimento" name="dataNascimento" type="date" defaultValue={editingAluno?.dataNascimento} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="escolaId" className="text-right">
                      Escola
                    </Label>
                    <Select name="escolaId" defaultValue={editingAluno?.escolaId}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecione uma escola" />
                      </SelectTrigger>
                      <SelectContent>
                        {escolas?.map(escola => (
                          <SelectItem key={escola.id} value={escola.id}>{escola.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="turmaId" className="text-right">
                      Turma
                    </Label>
                     <Select name="turmaId" defaultValue={editingAluno?.turmaId}>
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
            <CardTitle>Lista de Alunos</CardTitle>
            <CardDescription>Total de {alunos?.length || 0} alunos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de Nascimento</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={5} className="text-center">Carregando...</TableCell></TableRow>}
                {alunos?.map(aluno => (
                  <TableRow key={aluno.id}>
                    <TableCell className="font-medium">{aluno.nome}</TableCell>
                    <TableCell>{new Date(aluno.dataNascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                    <TableCell>{getEscolaNome(aluno.escolaId)}</TableCell>
                    <TableCell>{getTurmaNome(aluno.turmaId)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(aluno)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(aluno.id)}>
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
