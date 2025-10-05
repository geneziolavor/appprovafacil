
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
import type { Escola } from '@/lib/types';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, doc } from 'firebase/firestore';

export default function EscolasPage() {
  const firestore = useFirestore();
  
  const escolasCollection = useMemoFirebase(() => collection(firestore, 'escolas'), [firestore]);
  const { data: escolas, isLoading } = useCollection<Escola>(escolasCollection);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEscola, setEditingEscola] = useState<Escola | null>(null);

  const handleEdit = (escola: Escola) => {
    setEditingEscola(escola);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const docRef = doc(firestore, 'escolas', id);
    deleteDocumentNonBlocking(docRef);
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
      endereco: formData.get('endereco') as string,
    };

    if (editingEscola) {
      const docRef = doc(firestore, 'escolas', editingEscola.id);
      setDocumentNonBlocking(docRef, newEscolaData, { merge: true });
    } else {
      addDocumentNonBlocking(escolasCollection, newEscolaData);
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
                    <Label htmlFor="endereco" className="text-right">
                      Endereço
                    </Label>
                    <Input id="endereco" name="endereco" defaultValue={editingEscola?.endereco} className="col-span-3" required />
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
            <CardDescription>Total de {escolas?.length || 0} escolas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && <TableRow><TableCell colSpan={3} className="text-center">Carregando...</TableCell></TableRow>}
                {escolas?.map(escola => (
                  <TableRow key={escola.id}>
                    <TableCell className="font-medium">{escola.nome}</TableCell>
                    <TableCell>{escola.endereco}</TableCell>
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
