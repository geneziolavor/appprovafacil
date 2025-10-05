'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Briefcase } from 'lucide-react';
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
import { mockTurmas, mockEscolas } from '@/lib/data';
import type { Turma } from '@/lib/types';

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>(mockTurmas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);

  const getEscolaNome = (id: string) => mockEscolas.find(e => e.id === id)?.nome || 'N/A';

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTurmas(turmas.filter(t => t.id !== id));
  };
  
  const handleOpenDialog = () => {
    setEditingTurma(null);
    setIsDialogOpen(true);
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTurmaData = {
      nome: formData.get('nome') as string,
      ano: Number(formData.get('ano')),
      escolaId: '1', // Mock
    };

    if (editingTurma) {
      setTurmas(turmas.map(t => t.id === editingTurma.id ? { ...t, ...newTurmaData } : t));
    } else {
      setTurmas([...turmas, { id: String(Date.now()), ...newTurmaData }]);
    }
    setIsDialogOpen(false);
    setEditingTurma(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <PageHeader title="Turmas" description="Gerencie as turmas cadastradas." icon={Briefcase}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Turma
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingTurma ? 'Editar Turma' : 'Adicionar Turma'}</DialogTitle>
                <DialogDescription>
                  {editingTurma ? 'Atualize as informações da turma.' : 'Preencha os dados da nova turma.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input id="nome" name="nome" defaultValue={editingTurma?.nome} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ano" className="text-right">
                      Ano
                    </Label>
                    <Input id="ano" name="ano" type="number" defaultValue={editingTurma?.ano} className="col-span-3" required />
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
            <CardTitle>Lista de Turmas</CardTitle>
            <CardDescription>Total de {turmas.length} turmas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Escola</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {turmas.map(turma => (
                  <TableRow key={turma.id}>
                    <TableCell className="font-medium">{turma.nome}</TableCell>
                    <TableCell>{turma.ano}</TableCell>
                    <TableCell>{getEscolaNome(turma.escolaId)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(turma)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(turma.id)}>
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
