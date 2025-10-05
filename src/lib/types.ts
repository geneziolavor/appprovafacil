export type Aluno = {
  id: string;
  nome: string;
  dataNascimento: string;
  escolaId: string;
  turmaId:string;
};

export type Escola = {
  id: string;
  nome: string;
  endereco: string;
};

export type Turma = {
  id: string;
  nome: string;
  ano: number;
  escolaId: string;
};

export type Prova = {
  id: string;
  titulo: string;
  dataAplicacao: string;
  turmaId: string;
};

export type Questao = {
  id: string;
  provaId: string;
  numero: number;
  enunciado: string;
  tipo: 'multipla-escolha' | 'dissertativa';
  alternativaA?: string;
  alternativaB?: string;
  alternativaC?: string;
  alternativaD?: string;
  alternativaCorreta?: 'A' | 'B' | 'C' | 'D';
};

export type RespostaOficial = {
  id: string;
  questaoId: string;
  resposta: string;
};

export type Correcao = {
  id: string;
  alunoId: string;
  provaId: string;
  dataCorrecao: string;
  correcoes: {
    questionId: string;
    correct: boolean;
  }[];
};

export type Resultado = {
  id: string;
  alunoId: string;
  provaId: string;
  acertos: number;
  erros: number;
  media: number;
};
