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
  tipo: string;
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
  questaoId: string;
  correto: boolean;
};

export type Resultado = {
  id: string;
  alunoId: string;
  provaId: string;
  acertos: number;
  erros: number;
  media: number;
};
