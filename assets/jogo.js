/* =====================================================================
   TERMO PYTHON — lógica do jogo
   ---------------------------------------------------------------------
   Não é preciso editar este arquivo para trocar as palavras.
   As palavras ficam em  dados/palavras.js
   ===================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     utilidades
     ------------------------------------------------------------------ */

  // "LAÇOS" -> "LACOS"  (tira acento, cedilha e deixa maiúsculo)
  function norm(s) {
    return String(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }

  // data de hoje no fuso configurado, no formato "AAAA-MM-DD"
  function hojeISO() {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: CONFIG.fusoHorario,
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function iso2br(iso) {
    const p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  function diasEntre(isoA, isoB) {
    const a = new Date(isoA + 'T12:00:00');
    const b = new Date(isoB + 'T12:00:00');
    return Math.round((b - a) / 86400000);
  }

  // gerador determinístico a partir de uma string (mesmo sorteio p/ todos)
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  function ler(chave, padrao) {
    try {
      const v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch (e) { return padrao; }
  }

  function salvar(chave, valor) {
    try { localStorage.setItem(chave, JSON.stringify(valor)); } catch (e) {}
  }

  /* ------------------------------------------------------------------
     dicionário de palavras aceitas
     ------------------------------------------------------------------ */
  const ACEITAS = new Set();
  (typeof DICIONARIO !== 'undefined' ? DICIONARIO : []).forEach(function (p) {
    const n = norm(p);
    if (n.length === 5) ACEITAS.add(n);
  });

  /* ------------------------------------------------------------------
     escolha das palavras do dia
     ------------------------------------------------------------------ */
  const HOJE = hojeISO();

  function daReserva(semente) {
    const lista = (typeof RESERVA !== 'undefined' ? RESERVA : [])
      .filter(function (r) { return norm(r.palavra).length === 5; });
    if (!lista.length) return { palavra: 'LISTA', dica: '' };
    return lista[hash(semente) % lista.length];
  }

  // Antes da data de estreia, o jogo mostra o puzzle de estreia
  // (útil para o professor testar a página antes de liberar para a turma).
  const DIA_ATIVO = PALAVRAS_DO_DIA[HOJE] ||
    (HOJE < CONFIG.dataInicial ? PALAVRAS_DO_DIA[CONFIG.dataInicial] : null);

  function alvosDoDia(modo) {
    const dia = DIA_ATIVO;
    let brutos;

    if (modo === 'duetto') {
      brutos = (dia && dia.duetto && dia.duetto.length === 2)
        ? dia.duetto
        : [daReserva(HOJE + ':d1'), daReserva(HOJE + ':d2')];
      // evita as duas iguais no sorteio automático
      if (norm(brutos[0].palavra) === norm(brutos[1].palavra)) {
        brutos = [brutos[0], daReserva(HOJE + ':d2:alt')];
      }
    } else {
      brutos = [(dia && dia.solo) ? dia.solo : daReserva(HOJE + ':s')];
    }

    return brutos.map(function (b) {
      const n = norm(b.palavra);
      ACEITAS.add(n); // a resposta sempre é um palpite válido
      return {
        original: String(b.palavra).toUpperCase(),
        norm: n,
        dica: b.dica || 'Sem dica para hoje.',
      };
    });
  }

  const NUMERO_PUZZLE = Math.max(1, diasEntre(CONFIG.dataInicial, HOJE) + 1);

  /* ------------------------------------------------------------------
     estado
     ------------------------------------------------------------------ */
  let modo = ler('termopython:modo', 'solo');
  if (modo !== 'solo' && modo !== 'duetto') modo = 'solo';

  let alvos = [];
  let maxTentativas = 6;
  let tentativas = [];     // palpites já enviados (normalizados)
  let atual = '';          // o que está sendo digitado
  let resolvidoEm = [];    // índice da tentativa que matou cada palavra (ou -1)
  let fim = false;
  let travado = false;     // durante a animação

  const $ = function (id) { return document.getElementById(id); };
  const elTab = $('tabuleiros');
  const elTeclado = $('teclado');

  function chaveJogo() { return 'termopython:jogo:' + HOJE + ':' + modo; }
  function chaveStats() { return 'termopython:stats:' + modo; }

  /* ------------------------------------------------------------------
     avaliação de um palpite
     ------------------------------------------------------------------ */
  function avaliar(palpite, alvo) {
    const res = ['ausente', 'ausente', 'ausente', 'ausente', 'ausente'];
    const sobra = {};

    for (let i = 0; i < 5; i++) {
      if (palpite[i] === alvo[i]) res[i] = 'certa';
      else sobra[alvo[i]] = (sobra[alvo[i]] || 0) + 1;
    }
    for (let i = 0; i < 5; i++) {
      if (res[i] === 'certa') continue;
      const c = palpite[i];
      if (sobra[c] > 0) { res[i] = 'posicao'; sobra[c]--; }
    }
    return res;
  }

  /* ------------------------------------------------------------------
     montagem do tabuleiro
     ------------------------------------------------------------------ */
  function ajustarTamanhoCelula() {
    const qtdTabuleiros = alvos.length;
    const larguraDisp = Math.min(window.innerWidth - 24, 560);
    const gapEntre = qtdTabuleiros > 1 ? 14 : 0;
    const util = larguraDisp - gapEntre;
    const celulas = 5 * qtdTabuleiros;
    let tam = Math.floor((util - (celulas - qtdTabuleiros) * 5) / celulas);

    // não deixa estourar a altura em telas baixas
    const alturaDisp = window.innerHeight - 330;
    const tamPorAltura = Math.floor((alturaDisp - (maxTentativas - 1) * 5) / maxTentativas);

    tam = Math.max(26, Math.min(tam, tamPorAltura, 62));
    elTab.style.setProperty('--tam-cel', tam + 'px');
  }

  function montarTabuleiros() {
    elTab.innerHTML = '';
    alvos.forEach(function (_, b) {
      const t = document.createElement('div');
      t.className = 'tabuleiro';
      t.dataset.board = String(b);
      for (let l = 0; l < maxTentativas; l++) {
        const linha = document.createElement('div');
        linha.className = 'linha';
        for (let c = 0; c < 5; c++) {
          const cel = document.createElement('div');
          cel.className = 'cel';
          linha.appendChild(cel);
        }
        t.appendChild(linha);
      }
      elTab.appendChild(t);
    });
    ajustarTamanhoCelula();
  }

  function celulas(b, linha) {
    return elTab.children[b].children[linha].children;
  }

  /* ------------------------------------------------------------------
     desenho do estado atual
     ------------------------------------------------------------------ */
  function pintarLinha(b, l, palpite, animar) {
    const alvo = alvos[b];
    const jaResolvido = resolvidoEm[b] !== -1 && resolvidoEm[b] < l;
    const cels = celulas(b, l);

    if (jaResolvido) {  // tabuleiro já morto: linha fica vazia
      for (let i = 0; i < 5; i++) {
        cels[i].className = 'cel';
        cels[i].textContent = '';
      }
      return;
    }

    const res = avaliar(palpite, alvo.norm);
    for (let i = 0; i < 5; i++) {
      const cel = cels[i];
      // revela o acento quando a letra está na posição certa
      cel.textContent = res[i] === 'certa' ? alvo.original[i] : palpite[i];
      cel.className = 'cel ' + res[i];
      if (animar) {
        cel.classList.add('virar');
        cel.style.animationDelay = (i * 0.28) + 's';
      }
    }
  }

  function pintarAtual() {
    const l = tentativas.length;
    if (l >= maxTentativas) return;
    alvos.forEach(function (_, b) {
      if (resolvidoEm[b] !== -1) return;
      const cels = celulas(b, l);
      for (let i = 0; i < 5; i++) {
        cels[i].textContent = atual[i] || '';
        cels[i].className = 'cel' + (atual[i] ? ' preenchida' : '');
      }
    });
  }

  function marcarResolvidos() {
    alvos.forEach(function (_, b) {
      elTab.children[b].classList.toggle('resolvido', resolvidoEm[b] !== -1);
    });
  }

  function redesenhar(animarUltima) {
    tentativas.forEach(function (p, l) {
      alvos.forEach(function (_, b) {
        pintarLinha(b, l, p, animarUltima && l === tentativas.length - 1);
      });
    });
    pintarAtual();
    marcarResolvidos();
    pintarTeclado();
  }

  /* ------------------------------------------------------------------
     teclado
     ------------------------------------------------------------------ */
  const FILEIRAS = [
    'QWERTYUIOP'.split(''),
    'ASDFGHJKL'.split(''),
    ['ENTER'].concat('ZXCVBNM'.split(''), ['APAGAR']),
  ];

  function montarTeclado() {
    elTeclado.innerHTML = '';
    FILEIRAS.forEach(function (fileira) {
      const div = document.createElement('div');
      div.className = 'fileira';
      fileira.forEach(function (k) {
        const b = document.createElement('button');
        b.className = 'tecla' + (k.length > 1 ? ' larga' : '');
        b.textContent = k === 'APAGAR' ? '⌫' : k;
        b.dataset.tecla = k;
        b.addEventListener('click', function () { digitar(k); });
        div.appendChild(b);
      });
      elTeclado.appendChild(div);
    });
  }

  const PESO = { ausente: 1, posicao: 2, certa: 3 };
  const COR = {
    certa: 'var(--certa)', posicao: 'var(--posicao)', ausente: 'var(--ausente)',
  };

  function pintarTeclado() {
    // melhor status de cada letra, por tabuleiro
    const estado = alvos.map(function () { return {}; });

    tentativas.forEach(function (p, l) {
      alvos.forEach(function (alvo, b) {
        if (resolvidoEm[b] !== -1 && resolvidoEm[b] < l) return;
        const res = avaliar(p, alvo.norm);
        for (let i = 0; i < 5; i++) {
          const c = p[i];
          const anterior = estado[b][c];
          if (!anterior || PESO[res[i]] > PESO[anterior]) estado[b][c] = res[i];
        }
      });
    });

    elTeclado.querySelectorAll('.tecla').forEach(function (btn) {
      const k = btn.dataset.tecla;
      btn.className = 'tecla' + (k.length > 1 ? ' larga' : '');
      btn.style.removeProperty('--cor-a');
      btn.style.removeProperty('--cor-b');
      if (k.length > 1) return;

      if (alvos.length === 1) {
        const s = estado[0][k];
        if (s) btn.classList.add(s);
      } else {
        const ca = COR[estado[0][k]] || null;
        const cb = COR[estado[1][k]] || null;
        if (ca || cb) {
          btn.classList.add('dupla');
          if (ca) btn.style.setProperty('--cor-a', ca);
          if (cb) btn.style.setProperty('--cor-b', cb);
        }
      }
    });
  }

  /* ------------------------------------------------------------------
     entrada do usuário
     ------------------------------------------------------------------ */
  function digitar(k) {
    if (fim || travado) return;

    if (k === 'ENTER') { enviar(); return; }
    if (k === 'APAGAR') {
      atual = atual.slice(0, -1);
      pintarAtual();
      return;
    }
    if (/^[A-Z]$/.test(k) && atual.length < 5) {
      atual += k;
      pintarAtual();
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!document.getElementById('modal-ajuda').hidden ||
        !document.getElementById('modal-stats').hidden) {
      if (e.key === 'Escape') fecharModais();
      return;
    }
    if (e.key === 'Enter') { digitar('ENTER'); return; }
    if (e.key === 'Backspace') { digitar('APAGAR'); return; }
    const c = norm(e.key);
    if (c.length === 1) digitar(c);
  });

  function tremer() {
    const l = tentativas.length;
    alvos.forEach(function (_, b) {
      if (resolvidoEm[b] !== -1) return;
      const linha = elTab.children[b].children[l];
      linha.classList.remove('erro');
      void linha.offsetWidth;
      linha.classList.add('erro');
    });
  }

  let timerAviso;
  function avisar(msg, ms) {
    const el = $('aviso');
    el.textContent = msg;
    el.classList.add('visivel');
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () { el.classList.remove('visivel'); }, ms || 1800);
  }

  function enviar() {
    if (atual.length < 5) { avisar('A palavra tem 5 letras'); tremer(); return; }
    if (!ACEITAS.has(atual)) { avisar('Palavra não encontrada na lista'); tremer(); return; }

    const linha = tentativas.length;
    tentativas.push(atual);

    alvos.forEach(function (alvo, b) {
      if (resolvidoEm[b] === -1 && atual === alvo.norm) resolvidoEm[b] = linha;
      pintarLinha(b, linha, atual, true);
    });

    atual = '';
    travado = true;
    persistir();

    setTimeout(function () {
      travado = false;
      marcarResolvidos();
      pintarTeclado();

      const ganhou = resolvidoEm.every(function (r) { return r !== -1; });
      const acabou = ganhou || tentativas.length >= maxTentativas;

      if (acabou) {
        fim = true;
        registrarStats(ganhou);
        persistir();
        setTimeout(function () { abrirStats(ganhou ? 'vitoria' : 'derrota'); }, 500);
        if (ganhou) avisar(['Perfeito!', 'Excelente!', 'Muito bem!', 'Boa!', 'Ufa!', 'No limite!'][tentativas.length - 1] || 'Boa!');
      } else {
        pintarAtual();
      }
    }, 1500);
  }

  /* ------------------------------------------------------------------
     persistência do jogo do dia
     ------------------------------------------------------------------ */
  function persistir() {
    salvar(chaveJogo(), {
      tentativas: tentativas,
      resolvidoEm: resolvidoEm,
      fim: fim,
      palavras: alvos.map(function (a) { return a.norm; }),
    });
  }

  function restaurar() {
    const s = ler(chaveJogo(), null);
    if (!s) return false;
    // se o professor trocou a palavra do dia depois que alguém já jogou,
    // o progresso antigo é descartado
    const mesmas = s.palavras && s.palavras.length === alvos.length &&
      s.palavras.every(function (p, i) { return p === alvos[i].norm; });
    if (!mesmas) return false;

    tentativas = s.tentativas || [];
    resolvidoEm = s.resolvidoEm || alvos.map(function () { return -1; });
    fim = !!s.fim;
    return true;
  }

  /* ------------------------------------------------------------------
     estatísticas
     ------------------------------------------------------------------ */
  function statsVazias() {
    return { jogos: 0, vitorias: 0, seq: 0, melhorSeq: 0, dist: {}, ultimoDia: null };
  }

  function registrarStats(ganhou) {
    const st = ler(chaveStats(), statsVazias());
    if (st.ultimoDia === HOJE) return;  // não conta duas vezes o mesmo dia
    st.ultimoDia = HOJE;
    st.jogos++;
    if (ganhou) {
      st.vitorias++;
      st.seq++;
      st.melhorSeq = Math.max(st.melhorSeq, st.seq);
      const n = tentativas.length;
      st.dist[n] = (st.dist[n] || 0) + 1;
    } else {
      st.seq = 0;
    }
    salvar(chaveStats(), st);
  }

  function renderStats(resultado) {
    const st = ler(chaveStats(), statsVazias());
    $('st-jogos').textContent = st.jogos;
    $('st-vitorias').textContent = st.vitorias;
    $('st-taxa').textContent = st.jogos ? Math.round(100 * st.vitorias / st.jogos) + '%' : '0%';
    $('st-seq').textContent = st.seq;
    $('st-melhor').textContent = st.melhorSeq;

    const box = $('stats-dist');
    box.innerHTML = '';
    let maxV = 1;
    for (let i = 1; i <= maxTentativas; i++) maxV = Math.max(maxV, st.dist[i] || 0);
    const destaque = (resultado === 'vitoria') ? tentativas.length : -1;

    for (let i = 1; i <= maxTentativas; i++) {
      const v = st.dist[i] || 0;
      const linha = document.createElement('div');
      linha.className = 'barra-linha';
      linha.innerHTML =
        '<span class="rotulo">' + i + '</span>' +
        '<span class="barra' + (i === destaque ? ' destaque' : '') + '" style="width:' +
        (8 + 92 * v / maxV) + '%">' + v + '</span>';
      box.appendChild(linha);
    }

    const res = $('stats-resultado');
    if (resultado === 'vitoria') {
      $('stats-titulo').textContent = 'Você acertou! 🐍';
      res.innerHTML = 'Em <b>' + tentativas.length + '</b> tentativa' +
        (tentativas.length > 1 ? 's' : '') + '.<br>' + htmlDicas();
    } else if (resultado === 'derrota') {
      $('stats-titulo').textContent = 'Fim de jogo';
      res.innerHTML = 'A palavra ' + (alvos.length > 1 ? 'do dia era' : 'era') + ':<br>' +
        alvos.map(function (a) {
          return '<span class="palavra-revelada">' + a.original + '</span>';
        }).join('') + '<br>' + htmlDicas();
    } else {
      $('stats-titulo').textContent = 'Estatísticas';
      res.innerHTML = fim ? htmlDicas() :
        '<span style="opacity:.7">Modo ' + (modo === 'duetto' ? 'DUETTO' : '1 palavra') +
        ' — puzzle #' + NUMERO_PUZZLE + '</span>';
    }

    $('btn-compartilhar').style.display = fim ? 'block' : 'none';
  }

  function htmlDicas() {
    if (!fim) return '';
    return '<div style="margin-top:10px;font-size:12.5px;text-align:left">' +
      alvos.map(function (a) {
        return '<div style="margin:6px 0"><b>' + a.original + '</b> — ' + a.dica + '</div>';
      }).join('') + '</div>';
  }

  /* ------------------------------------------------------------------
     compartilhar
     ------------------------------------------------------------------ */
  const EMOJI = { certa: '🟩', posicao: '🟨', ausente: '⬛' };

  function textoCompartilhar() {
    const ganhou = resolvidoEm.every(function (r) { return r !== -1; });
    const cab = 'Termo Python ' + (modo === 'duetto' ? 'DUETTO ' : '') +
      '#' + NUMERO_PUZZLE + ' ' +
      (ganhou ? tentativas.length : 'X') + '/' + maxTentativas;

    const linhas = tentativas.map(function (p, l) {
      return alvos.map(function (alvo, b) {
        if (resolvidoEm[b] !== -1 && resolvidoEm[b] < l) return '⬜⬜⬜⬜⬜';
        return avaliar(p, alvo.norm).map(function (r) { return EMOJI[r]; }).join('');
      }).join(' ');
    });

    return cab + '\n\n' + linhas.join('\n') + '\n\n' + location.href;
  }

  $('btn-compartilhar').addEventListener('click', function () {
    const txt = textoCompartilhar();
    if (navigator.share) {
      navigator.share({ text: txt }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt)
        .then(function () { avisar('Resultado copiado!'); })
        .catch(function () { avisar('Não foi possível copiar'); });
    }
  });

  /* ------------------------------------------------------------------
     modais
     ------------------------------------------------------------------ */
  function fecharModais() {
    $('modal-ajuda').hidden = true;
    $('modal-stats').hidden = true;
  }

  function abrirStats(resultado) {
    renderStats(resultado || null);
    $('modal-stats').hidden = false;
  }

  $('btn-ajuda').addEventListener('click', function () { $('modal-ajuda').hidden = false; });
  $('btn-stats').addEventListener('click', function () { abrirStats(null); });

  document.querySelectorAll('[data-fechar]').forEach(function (b) {
    b.addEventListener('click', fecharModais);
  });
  document.querySelectorAll('.modal-fundo').forEach(function (f) {
    f.addEventListener('click', function (e) { if (e.target === f) fecharModais(); });
  });

  /* ------------------------------------------------------------------
     dica
     ------------------------------------------------------------------ */
  let dicaAberta = false;
  $('btn-dica').addEventListener('click', function () {
    dicaAberta = !dicaAberta;
    mostrarDica();
  });

  function mostrarDica() {
    const el = $('texto-dica');
    if (!dicaAberta) { el.innerHTML = ''; return; }
    el.innerHTML = alvos.map(function (a, i) {
      const rot = alvos.length > 1 ? '<span class="rotulo">Palavra ' + (i + 1) + ':</span> ' : '';
      return rot + a.dica;
    }).join('<br>');
  }

  /* ------------------------------------------------------------------
     troca de modo
     ------------------------------------------------------------------ */
  document.querySelectorAll('.modo-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.dataset.modo === modo) return;
      modo = btn.dataset.modo;
      salvar('termopython:modo', modo);
      iniciar();
    });
  });

  /* ------------------------------------------------------------------
     início
     ------------------------------------------------------------------ */
  function iniciar() {
    document.querySelectorAll('.modo-btn').forEach(function (b) {
      b.classList.toggle('ativo', b.dataset.modo === modo);
    });

    alvos = alvosDoDia(modo);
    maxTentativas = modo === 'duetto' ? CONFIG.tentativasDuetto : CONFIG.tentativasSolo;
    tentativas = [];
    atual = '';
    resolvidoEm = alvos.map(function () { return -1; });
    fim = false;
    travado = false;
    dicaAberta = false;

    montarTabuleiros();
    restaurar();
    redesenhar(false);
    mostrarDica();

    $('legenda-topo').textContent =
      (modo === 'duetto' ? 'DUETTO · ' : '') + 'Puzzle #' + NUMERO_PUZZLE + ' · ' + iso2br(HOJE);

    $('rodape-info').textContent =
      CONFIG.subtitulo + ' · ' + (PALAVRAS_DO_DIA[HOJE] ? 'palavra do dia'
        : DIA_ATIVO ? 'prévia do puzzle de estreia' : 'palavra da reserva');

    if (fim) setTimeout(function () {
      const ganhou = resolvidoEm.every(function (r) { return r !== -1; });
      abrirStats(ganhou ? 'vitoria' : 'derrota');
    }, 350);
  }

  montarTeclado();
  iniciar();

  window.addEventListener('resize', ajustarTamanhoCelula);

  // abre a ajuda automaticamente na primeira visita
  if (!ler('termopython:visitou', false)) {
    salvar('termopython:visitou', true);
    $('modal-ajuda').hidden = false;
  }
})();
