'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, School } from 'lucide-react';
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
import { mockEscolas } from '@/lib/data';
import type { Escola } from '@/lib/types';

export default function EscolasPage() {
  const [escolas, setEscolas] = useState<Escola[]>(mockEscolas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);

  const handleEdit = (escola: Escola) => {
    setEditingEscola(escola);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEscolas(escolas.filter(e => e.id !== id));
  };

  const handleOpenDialog = () => {
    setEditingEscola(null);
    setIsDialogOpen(true);
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newEscolaData = {
      nome: formData.get('nome') as string,
      cidade: formData.get('cidade') as string,
    };

    if (editingEscola) {
      setEscolas(escolas.map(e => e.id === editingEscola.id ? { ...e, ...newEscolaData } : e));
    } else {
      setEscolas([...escolas, { id: String(Date.now()), ...newEscolaData }]);
    }
    setIsDialogOpen(false);
    setEditingEscola(null);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <PageHeader title="Escolas" description="Gerencie as escolas cadastradas." icon={School}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Escola
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEscola ? 'Editar Escola' : 'Adicionar Escola'}</DialogTitle>
                <DialogDescription>
                  {editingEscola ? 'Atualize as informações da escola.' : 'Preencha os dados da nova escola.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSave}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nome" className="text-right">
                      Nome
                    </Label>
                    <Input id="nome" name="nome" defaultValue={editingEscola?.nome} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cidade" className="text-right">
                      Cidade
                    </Label>
                    <Input id="cidade" name="cidade" defaultValue={editingEscola?.cidade} className="col-span-3" required />
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
            <CardTitle>Lista de Escolas</CardTitle>
            <CardDescription>Total de {escolas.length} escolas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escolas.map(escola => (
                  <TableRow key={escola.id}>
                    <TableCell className="font-medium">{escola.nome}</TableCell>
                    <TableCell>{escola.cidade}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(escola)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(escola.id)}>
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
