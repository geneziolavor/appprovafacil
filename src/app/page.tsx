import Link from 'next/link';
import { Users, School, Briefcase, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Header } from '@/components/header';

const menuItems = [
  {
    title: 'Alunos',
    description: 'Gerenciar alunos',
    href: '/alunos',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    color: 'hover:border-blue-500/50',
    iconBgColor: 'bg-blue-100',
  },
  {
    title: 'Escolas',
    description: 'Gerenciar escolas',
    href: '/escolas',
    icon: <School className="h-8 w-8 text-green-500" />,
    color: 'hover:border-green-500/50',
    iconBgColor: 'bg-green-100',
  },
  {
    title: 'Turmas',
    description: 'Gerenciar turmas',
    href: '/turmas',
    icon: <Briefcase className="h-8 w-8 text-yellow-500" />,
    color: 'hover:border-yellow-500/50',
    iconBgColor: 'bg-yellow-100',
  },
  {
    title: 'Provas',
    description: 'Gerenciar provas',
    href: '/provas',
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    color: 'hover:border-purple-500/50',
    iconBgColor: 'bg-purple-100',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col bg-muted/40 p-4 md:p-8">
        <div className="container mx-auto">
            <div className="bg-card p-8 rounded-2xl mb-8 shadow-sm">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
                        Bem-vindo ao ProvaFácil
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        Seu assistente inteligente para correção de avaliações.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full">
            {menuItems.map((item) => (
                <Link href={item.href} key={item.title} className="group">
                <Card className={`h-full transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg bg-card border-border/80 ${item.color}`}>
                    <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                    <div className={`mb-4 rounded-full p-4 ${item.iconBgColor}`}>
                        {item.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold font-headline text-card-foreground">
                        {item.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1 text-sm">
                        {item.description}
                    </CardDescription>
                    </CardHeader>
                </Card>
                </Link>
            ))}
            </div>
        </div>
      </main>
    </div>
  );
}
