# 🐍 Termo Python

Jogo de adivinhar palavras no estilo [term.ooo](https://term.ooo/), com vocabulário
de **Python, programação e ciência de dados**. Feito para a disciplina
Data Science I — IDP.

- **1 palavra** — 6 tentativas
- **DUETTO** — 2 palavras ao mesmo tempo, 7 tentativas
- Uma palavra nova por dia, definida pelo professor
- Botão de **dica** que não dá dica nenhuma (é de propósito)
- Tela de vitória com foto de prêmio
- Estatísticas e compartilhamento do resultado em emojis
- 100% estático (HTML + CSS + JS), sem build, sem dependências

---

## Estrutura

```
termo-python/
├── index.html            página do jogo
├── assets/
│   ├── estilo.css                aparência
│   ├── jogo.js                   lógica (não precisa mexer)
│   └── wagner_moura_python.png   foto exibida na tela de vitória
├── dados/
│   ├── palavras.js   ←   ARQUIVO DE AMBIENTE: as palavras de cada dia
│   └── dicionario.js ←   palavras aceitas como palpite
└── .nojekyll             necessário para o GitHub Pages servir tudo
```

---

## Como colocar a palavra do dia

Abra **`dados/palavras.js`** e adicione um bloco dentro de `PALAVRAS_DO_DIA`.
A chave é a data no formato `"AAAA-MM-DD"`:

| Data          | Chave          |
|---------------|----------------|
| 28/09/2026    | `"2026-09-28"` |
| 05/10/2026    | `"2026-10-05"` |

```js
'2026-10-03': {
  solo: {
    palavra: 'SLICE',
    dica: 'Fatiamento de sequências: lista[1:4]',
  },
  duetto: [
    { palavra: 'YIELD', dica: 'Transforma uma função em geradora.' },
    { palavra: 'ASYNC', dica: 'Declara uma função assíncrona.' },
  ],
},
```

Regras:

- A palavra tem **exatamente 5 letras**.
- Pode ter acento (`'LAÇOS'`, `'ÍNDEX'`). O aluno digita sem acento e o jogo
  revela o acento quando a letra cai na posição certa.
- `dica` está desativada hoje: o botão 💡 sempre responde
  *"Cara tu ainda quer dica? Que moleza."* Os textos continuam no arquivo
  caso você queira religar as dicas — nesse caso, edite `mostrarDica()`
  em `assets/jogo.js`.
- Se a palavra não estiver no `dicionario.js`, tudo bem — a resposta do dia é
  sempre aceita automaticamente. Mas vale acrescentá-la ao dicionário para que
  ela também possa ser usada como palpite em outros dias.

**Data não cadastrada?** O jogo sorteia uma palavra da lista `RESERVA`
(no fim do mesmo arquivo), de forma determinística — todos os alunos daquele
dia recebem a mesma palavra.

**Antes de 28/09/2026** o jogo mostra o puzzle de estreia (LISTA / TUPLA+PRINT),
para você conseguir testar a página antes de liberar para a turma.

---

## Palavras já cadastradas

| Data       | 1 palavra | DUETTO         |
|------------|-----------|----------------|
| 28/09/2026 | LISTA     | TUPLA · PRINT  |
| 29/09/2026 | INPUT     | WHILE · BREAK  |
| 30/09/2026 | FLOAT     | RANGE · INDEX  |
| 01/10/2026 | DADOS     | NUMPY · PANDA  |
| 02/10/2026 | CLASS     | FALSE · ERROR  |

---

## Outras configurações

No topo de `dados/palavras.js`, o objeto `CONFIG`:

| Campo               | O que faz                                              |
|---------------------|--------------------------------------------------------|
| `titulo`            | nome exibido                                            |
| `subtitulo`         | linha do rodapé                                         |
| `tentativasSolo`    | tentativas no modo 1 palavra (padrão: 6)                |
| `tentativasDuetto`  | tentativas no modo DUETTO (padrão: 7)                   |
| `fusoHorario`       | fuso usado para decidir "que dia é hoje"                |
| `dataInicial`       | data do puzzle #1, usada para numerar os dias           |

---

## Publicando no GitHub Pages

1. Crie um repositório no GitHub (ex.: `termo-python`).
2. Envie os arquivos:

   ```bash
   git init
   git add .
   git commit -m "Termo Python"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/termo-python.git
   git push -u origin main
   ```

3. No repositório: **Settings → Pages**
   - *Source*: `Deploy from a branch`
   - *Branch*: `main` / `/ (root)` → **Save**
4. Em um ou dois minutos o jogo estará em
   `https://SEU-USUARIO.github.io/termo-python/`

Para trocar a palavra depois, basta editar `dados/palavras.js` direto pelo
site do GitHub (ícone do lápis) e clicar em *Commit changes* — o Pages
republica sozinho.

> Dica: se você editar e o navegador ainda mostrar a palavra antiga, é cache.
> Peça aos alunos um **Ctrl + F5**.

---

## Rodando localmente

Como é tudo estático, basta abrir o `index.html` no navegador.
Se preferir um servidor:

```bash
python -m http.server 8000
```

E acesse `http://localhost:8000`.

---

## Como funciona o placar

O progresso do dia e as estatísticas ficam no `localStorage` do navegador de
cada aluno — nada é enviado para servidor nenhum. Recarregar a página mantém o
jogo onde parou; estatísticas de **1 palavra** e **DUETTO** são contadas
separadamente.
