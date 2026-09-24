/* =====================================================================
   ARQUIVO DE AMBIENTE  —  PALAVRAS DO DIA
   =====================================================================

   É AQUI que o professor mexe no dia a dia. Mais nada precisa ser
   alterado no resto do projeto.

   Formato da chave: "AAAA-MM-DD"  (ano-mês-dia)
     28/09/2026  ->  "2026-09-28"
     01/10/2026  ->  "2026-10-01"

   Cada dia tem:
     solo   -> 1 palavra de 5 letras
     duetto -> 2 palavras de 5 letras (o modo duplo)

   Regras das palavras:
     - SEMPRE 5 letras.
     - Pode escrever com acento (ex.: "LAÇOS", "ÍNDEX"). O jogo aceita
       a digitação sem acento e revela o acento quando a letra acerta.
     - "dica" está DESLIGADA no momento: o botão 💡 responde sempre
       "Cara tu ainda quer dica? Que moleza." Os textos abaixo ficam
       guardados caso você queira reativar as dicas de verdade um dia
       (é só mexer em RESPOSTA_DICA / mostrarDica em assets/jogo.js).

   Se uma data não estiver na lista abaixo, o jogo sorteia
   automaticamente uma palavra da RESERVA (no final do arquivo),
   de forma determinística — todos os alunos pegam a mesma.
   ===================================================================== */

const CONFIG = {
  titulo: 'TERMO PYTHON',
  subtitulo: 'Data Science I — IDP',

  // Quantas tentativas em cada modo (o Termo original usa 6 e 7)
  tentativasSolo: 6,
  tentativasDuetto: 7,

  // Fuso usado para decidir "que dia é hoje" (todos os alunos no mesmo dia)
  fusoHorario: 'America/Sao_Paulo',

  // Data em que o jogo começou — usada só para numerar os puzzles (#1, #2...)
  dataInicial: '2026-09-28',
};

const PALAVRAS_DO_DIA = {

  // ---------- 28/09/2026 — PUZZLE #1 ----------
  '2026-09-28': {
    solo: {
      palavra: 'LISTA',
      dica: 'Estrutura de dados mutável e ordenada, escrita entre colchetes: [1, 2, 3]',
    },
    duetto: [
      {
        palavra: 'TUPLA',
        dica: 'Parecida com a anterior, mas imutável. Escrita com parênteses: (1, 2, 3)',
      },
      {
        palavra: 'PRINT',
        dica: 'A função que todo mundo usa na primeira aula para mostrar algo na tela.',
      },
    ],
  },

  // ---------- 29/09/2026 — PUZZLE #2 ----------
  '2026-09-29': {
    solo: {
      palavra: 'INPUT',
      dica: 'Função que lê um texto digitado pelo usuário no teclado.',
    },
    duetto: [
      { palavra: 'WHILE', dica: 'Laço que repete "enquanto" a condição for verdadeira.' },
      { palavra: 'BREAK', dica: 'Comando que interrompe um laço no meio da execução.' },
    ],
  },

  // ---------- 30/09/2026 — PUZZLE #3 ----------
  '2026-09-30': {
    solo: {
      palavra: 'FLOAT',
      dica: 'Tipo numérico com casas decimais: 3.14 é um deles.',
    },
    duetto: [
      { palavra: 'RANGE', dica: 'Gera uma sequência de números, muito usado no for.' },
      { palavra: 'INDEX', dica: 'A posição de um elemento dentro de uma sequência.' },
    ],
  },

  // ---------- 01/10/2026 — PUZZLE #4 ----------
  '2026-10-01': {
    solo: {
      palavra: 'DADOS',
      dica: 'A matéria-prima da disciplina. Em inglês seria "data".',
    },
    duetto: [
      { palavra: 'NUMPY', dica: 'Biblioteca de arrays e álgebra linear, base do ecossistema científico.' },
      { palavra: 'PANDA', dica: 'O bicho que dá nome à biblioteca de DataFrames.' },
    ],
  },

  // ---------- 02/10/2026 — PUZZLE #5 ----------
  '2026-10-02': {
    solo: {
      palavra: 'CLASS',
      dica: 'Palavra-chave que define um molde de objetos na orientação a objetos.',
    },
    duetto: [
      { palavra: 'FALSE', dica: 'Um dos dois valores booleanos (em Python escreve-se com F maiúsculo).' },
      { palavra: 'ERROR', dica: 'O que aparece no terminal quando algo dá errado.' },
    ],
  },

  /* ---------------------------------------------------------------
     COPIE O BLOCO ABAIXO PARA ADICIONAR UM NOVO DIA:

     '2026-10-03': {
       solo: { palavra: 'XXXXX', dica: '...' },
       duetto: [
         { palavra: 'XXXXX', dica: '...' },
         { palavra: 'XXXXX', dica: '...' },
       ],
     },
     --------------------------------------------------------------- */
};

/* =====================================================================
   RESERVA — usada automaticamente em datas que não foram cadastradas
   acima. Mantenha sempre pelo menos umas 20 palavras aqui.
   ===================================================================== */
const RESERVA = [
  { palavra: 'SLICE', dica: 'Fatiamento: lista[1:4].' },
  { palavra: 'YIELD', dica: 'Palavra-chave que transforma uma função em geradora.' },
  { palavra: 'ASYNC', dica: 'Prefixo que declara uma função assíncrona.' },
  { palavra: 'AWAIT', dica: 'Espera o resultado de uma corrotina.' },
  { palavra: 'RAISE', dica: 'Comando que dispara uma exceção de propósito.' },
  { palavra: 'BYTES', dica: 'Tipo imutável de dados binários.' },
  { palavra: 'QUERY', dica: 'Consulta — em SQL ou no método de DataFrame.' },
  { palavra: 'MODEL', dica: 'O objeto treinado que faz previsões.' },
  { palavra: 'TOKEN', dica: 'Menor unidade em que um texto é quebrado.' },
  { palavra: 'CACHE', dica: 'Memória que guarda resultados já calculados.' },
  { palavra: 'STACK', dica: 'Estrutura LIFO — o último a entrar é o primeiro a sair.' },
  { palavra: 'QUEUE', dica: 'Estrutura FIFO — o primeiro a entrar é o primeiro a sair.' },
  { palavra: 'ARRAY', dica: 'Vetor homogêneo, o tipo central do NumPy.' },
  { palavra: 'DEBUG', dica: 'Caçar e corrigir defeitos no código.' },
  { palavra: 'MERGE', dica: 'Junta dois DataFrames por uma chave em comum.' },
  { palavra: 'SCOPE', dica: 'Escopo: onde uma variável é visível.' },
  { palavra: 'PARSE', dica: 'Interpretar um texto e extrair estrutura dele.' },
  { palavra: 'FLASK', dica: 'Microframework web em Python.' },
  { palavra: 'TESTE', dica: 'O que você deveria escrever antes de confiar no código.' },
  { palavra: 'VALOR', dica: 'O conteúdo guardado numa variável.' },
  { palavra: 'CHAVE', dica: 'A parte que fica à esquerda dos dois-pontos num dicionário.' },
  { palavra: 'LINHA', dica: 'Cada registro de um DataFrame.' },
  { palavra: 'GRUPO', dica: 'O que o groupby() cria.' },
  { palavra: 'MEDIA', dica: 'Soma dividida pela quantidade.' },
  { palavra: 'PILHA', dica: 'Nome em português para a estrutura LIFO.' },
  { palavra: 'TIPOS', dica: 'int, float, str, bool... são os ______ de dados.' },
  { palavra: 'TEXTO', dica: 'O que a classe str armazena.' },
  { palavra: 'NIVEL', dica: 'Cada camada de indentação no Python.' },
];
