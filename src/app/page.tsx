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
  },
  {
    title: 'Escolas',
    description: 'Gerenciar escolas',
    href: '/escolas',
    icon: <School className="h-8 w-8 text-green-500" />,
    color: 'hover:border-green-500/50',
  },
  {
    title: 'Turmas',
    description: 'Gerenciar turmas',
    href: '/turmas',
    icon: <Briefcase className="h-8 w-8 text-yellow-500" />,
    color: 'hover:border-yellow-500/50',
  },
  {
    title: 'Provas',
    description: 'Gerenciar provas',
    href: '/provas',
    icon: <FileText className="h-8 w-8 text-purple-500" />,
    color: 'hover:border-purple-500/50',
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center bg-background p-4 md:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
            Bem-vindo ao ProvaFácil
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Seu assistente inteligente para correção de avaliações.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full max-w-6xl">
          {menuItems.map((item) => (
            <Link href={item.href} key={item.title} className="group">
              <Card className={`h-full transition-all duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-xl bg-card border-2 border-transparent ${item.color}`}>
                <CardHeader className="flex flex-col items-center justify-center text-center p-6">
                  <div className="mb-4 rounded-full bg-secondary p-4">
                    {item.icon}
                  </div>
                  <CardTitle className="text-2xl font-semibold font-headline text-card-foreground">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
