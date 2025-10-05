import type { Escola, Turma, Aluno, Prova, Questao, Resultado } from './types';

export const mockEscolas: Escola[] = [
  { id: '1', nome: 'Escola Modelo', cidade: 'São Paulo' },
  { id: '2', nome: 'Colégio Futuro', cidade: 'Rio de Janeiro' },
];

export const mockTurmas: Turma[] = [
  { id: '1', nome: 'Turma A', ano: 2024, escolaId: '1' },
  { id: '2', nome: 'Turma B', ano: 2024, escolaId: '1' },
  { id: '3', nome: 'Turma C', ano: 2023, escolaId: '2' },
];

export const mockAlunos: Aluno[] = [
  { id: '1', nome: 'Ana Silva', email: 'ana.silva@email.com', escolaId: '1', turmaId: '1' },
  { id: '2', nome: 'Bruno Costa', email: 'bruno.costa@email.com', escolaId: '1', turmaId: '1' },
  { id: '3', nome: 'Carla Dias', email: 'carla.dias@email.com', escolaId: '1', turmaId: '2' },
  { id: '4', nome: 'Daniel Faria', email: 'daniel.faria@email.com', escolaId: '2', turmaId: '3' },
];

export const mockProvas: Prova[] = [
  { id: '1', titulo: 'Prova de Matemática 1', data: '2024-05-10', turmaId: '1' },
  { id: '2', titulo: 'Prova de Português 1', data: '2024-05-12', turmaId: '1' },
  { id: '3', titulo: 'Prova de Ciências', data: '2024-06-01', turmaId: '2' },
];

export const mockQuestoes: Questao[] = [
  { id: '1', provaId: '1', numero: 1, enunciado: 'Quanto é 2 + 2?' },
  { id: '2', provaId: '1', numero: 2, enunciado: 'Quanto é 5 * 8?' },
  { id: '3', provaId: '2', numero: 1, enunciado: 'Qual o sujeito da frase "O menino correu"?' },
];

export const mockResultados: Resultado[] = [
    { id: '1', provaId: '1', alunoId: '1', acertos: 8, erros: 2, media: 80.0 },
    { id: '2', provaId: '1', alunoId: '2', acertos: 6, erros: 4, media: 60.0 },
    { id: '3', provaId: '2', alunoId: '1', acertos: 9, erros: 1, media: 90.0 },
];
