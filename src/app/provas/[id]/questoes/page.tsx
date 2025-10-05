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
import { mockQuestoes, mockProvas } from '@/lib/data';
import type { Questao } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function QuestoesPage() {
  const params = useParams();
  const provaId = params.id as string;
  const prova = mockProvas.find(p => p.id === provaId);
  
  const [questoes, setQuestoes] = useState<Questao[]>(mockQuestoes.filter(q => q.provaId === provaId));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestao, setEditingQuestao] = useState<Questao | null>(null);

  const handleEdit = (questao: Questao) => {
    setEditingQuestao(questao);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setQuestoes(questoes.filter(q => q.id !== id));
  };
  
  const handleOpenDialog = () => {
    setEditingQuestao(null);
    setIsDialogOpen(true);
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newQuestaoData = {
      numero: Number(formData.get('numero')),
      enunciado: formData.get('enunciado') as string,
      provaId: provaId,
    };

    if (editingQuestao) {
      setQuestoes(questoes.map(q => q.id === editingQuestao.id ? { ...q, ...newQuestaoData } : q));
    } else {
      setQuestoes([...questoes, { id: String(Date.now()), ...newQuestaoData }]);
    }
    setIsDialogOpen(false);
    setEditingQuestao(null);
  };

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
        <PageHeader title={`Questões da Prova: ${prova.titulo}`} description="Gerencie as questões da prova." icon={ListChecks}>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Questão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="enunciado" className="text-right">
                      Enunciado
                    </Label>
                    <Textarea id="enunciado" name="enunciado" defaultValue={editingQuestao?.enunciado} className="col-span-3" required />
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
            <CardDescription>Total de {questoes.length} questões.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Número</TableHead>
                  <TableHead>Enunciado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questoes.sort((a,b) => a.numero - b.numero).map(questao => (
                  <TableRow key={questao.id}>
                    <TableCell className="font-medium">{questao.numero}</TableCell>
                    <TableCell>{questao.enunciado}</TableCell>
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
