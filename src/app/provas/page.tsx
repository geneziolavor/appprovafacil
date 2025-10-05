'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, FileText, Bot, BarChart2, ListChecks } from 'lucide-react';
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
import { mockProvas, mockTurmas } from '@/lib/data';
import type { Prova } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function ProvasPage() {
  const [provas, setProvas] = useState<Prova[]>(mockProvas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProva, setEditingProva] = useState<Prova | null>(null);

  const getTurmaNome = (id: string) => mockTurmas.find(t => t.id === id)?.nome || 'N/A';
  
  const handleEdit = (prova: Prova) => {
    setEditingProva(prova);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProvas(provas.filter(p => p.id !== id));
  };

  const handleOpenDialog = () => {
    setEditingProva(null);
    setIsDialogOpen(true);
  }

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newProvaData = {
      titulo: formData.get('titulo') as string,
      data: formData.get('data') as string,
      turmaId: '1', // Mock
    };

    if (editingProva) {
      setProvas(provas.map(p => p.id === editingProva.id ? { ...p, ...newProvaData } : p));
    } else {
      setProvas([...provas, { id: String(Date.now()), ...newProvaData }]);
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingProva ? 'Editar Prova' : 'Adicionar Prova'}</DialogTitle>
                <DialogDescription>
                  {editingProva ? 'Atualize as informações da prova.' : 'Preencha os dados da nova prova.'}
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
                    <Label htmlFor="data" className="text-right">
                      Data
                    </Label>
                    <Input id="data" name="data" type="date" defaultValue={editingProva?.data} className="col-span-3" required />
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
            <CardDescription>Total de {provas.length} provas.</CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead className="text-right w-[240px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {provas.map(prova => (
                    <TableRow key={prova.id}>
                      <TableCell className="font-medium">{prova.titulo}</TableCell>
                      <TableCell>{new Date(prova.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>{getTurmaNome(prova.turmaId)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button asChild variant="ghost" size="icon">
                              <Link href={`/provas/${prova.id}/questoes`}>
                                <ListChecks className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Questões</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button asChild variant="ghost" size="icon">
                              <Link href={`/provas/${prova.id}/corrigir`}>
                                <Bot className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Corrigir com IA</p>
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
