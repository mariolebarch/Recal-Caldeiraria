/* ===================== RECAL — script ===================== */
(() => {
  const WHATSAPP = '5531984028313'; // Comercial: recebe os pedidos de orçamento
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- fotos: troca pela definitiva quando o arquivo existir ---------- */
  $$('img[data-photo]').forEach(img => {
    const probe = new Image();
    probe.onload = () => { img.src = img.dataset.photo; };
    probe.src = img.dataset.photo;
  });

  /* ---------- ano ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- header / progresso / nav ativa ---------- */
  const header = $('#header');
  const progress = $('#progress');
  const navLinks = $$('.nav a');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const tlFill = $('#timelineFill');
  const timeline = $('#timeline');

  const onScroll = () => {
    const y = window.scrollY;
    if (progress) {
      const h = document.documentElement.scrollHeight - innerHeight;
      progress.style.width = (y / h) * 100 + '%';
    }
    header.classList.toggle('is-scrolled', y > 40);

    let current = null;
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s; });
    navLinks.forEach(a => a.classList.toggle('is-active', !!current && a.getAttribute('href') === '#' + current.id && !a.classList.contains('btn')));

    if (timeline && tlFill) {
      const r = timeline.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
      tlFill.style.width = p * 100 + '%';
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- menu mobile ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  navLinks.forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- reveal + contadores ---------- */
  const animateCount = el => {
    const end = +el.dataset.count;
    const dur = 1600;
    const t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur);
      const v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = v.toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  // entra ao aparecer; ao sair por baixo (rolando para cima) volta ao estado inicial,
  // assim a animação se repete sempre que a seção é revista
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const el = e.target;
      if (e.isIntersecting) {
        if (el.classList.contains('reveal') && !el.classList.contains('in')) {
          const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
          el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 80 + 'ms';
          el.classList.add('in');
        }
        if (el.dataset.count && !el.dataset.counted) { el.dataset.counted = '1'; animateCount(el); }
      } else if (e.boundingClientRect.top > 0) {
        el.classList.remove('in');
        el.style.transitionDelay = '0ms';
        if (el.dataset.count) { delete el.dataset.counted; el.textContent = '0'; }
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal, [data-count]').forEach(el => io.observe(el));
  // garante que o conteúdo da primeira dobra apareça mesmo se o observer atrasar
  setTimeout(() => $$('.hero .reveal').forEach(el => el.classList.add('in')), 60);

  /* ---------- cards: spotlight + toque ---------- */
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
    card.addEventListener('click', e => {
      if (!e.target.closest('a')) card.classList.toggle('is-open');
    });
    const link = card.querySelector('.card__link');
    if (link && card.dataset.service) {
      link.addEventListener('click', () => {
        const radio = $(`input[name="servico"][value="${card.dataset.service}"]`);
        if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }
  });

  /* ---------- relógio do blueprint ---------- */
  const clock = $('#clock');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('pt-BR'); };
  tick(); setInterval(tick, 1000);

  /* ---------- PROJETO INTERATIVO (engenharia) ---------- */
  const bp = $('#blueprint');
  const stage = $('#bpStage');
  const canvas = $('#bpCanvas');
  const stepsEl = $('#steps');
  if (bp && stage && stepsEl) {
    const PHASES = [
      ['DIAGNÓSTICO', 'LEVANTAMENTO DE CAMPO'],
      ['PROJETO', 'MODELAGEM 3D · REV.03'],
      ['FABRICAÇÃO', 'SOLDAGEM EM ANDAMENTO'],
      ['INSPEÇÃO', 'CONTROLE DIMENSIONAL OK'],
      ['ENTREGA E MONTAGEM', 'LIBERADO PARA EMBARQUE'],
    ];
    const items = $$('li', stepsEl);
    const segs = $$('.blueprint__seg i', bp);
    const CYCLE = 4500;
    let active = 1, timer = null, paused = false;

    const setStep = n => {
      active = n;
      bp.dataset.active = n;
      items.forEach(li => {
        const on = +li.dataset.step === n;
        li.classList.remove('is-active');
        if (on) { void li.offsetWidth; li.classList.add('is-active'); }
      });
      segs.forEach((s, k) => s.classList.toggle('on', k < n));
      $('#bpPhase').textContent = `ETAPA 0${n}/05 · ${PHASES[n - 1][0]}`;
      $('#bpStatus').textContent = PHASES[n - 1][1];
    };
    const startCycle = () => {
      clearInterval(timer);
      timer = setInterval(() => { if (!paused) setStep(active % 5 + 1); }, CYCLE);
    };
    stepsEl.style.setProperty('--cycle', CYCLE + 'ms');

    items.forEach(li => {
      const n = +li.dataset.step;
      li.addEventListener('mouseenter', () => { paused = true; stepsEl.classList.add('paused'); setStep(n); });
      li.addEventListener('focus', () => { paused = true; stepsEl.classList.add('paused'); setStep(n); });
      li.addEventListener('click', () => setStep(n));
    });
    stepsEl.addEventListener('mouseleave', () => { paused = false; stepsEl.classList.remove('paused'); setStep(active); startCycle(); });

    // inclinação 3D acompanhando o mouse
    const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
    if (fine) {
      stage.addEventListener('pointermove', e => {
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        bp.classList.add('is-hover');
        bp.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
      });
      stage.addEventListener('pointerleave', () => {
        bp.classList.remove('is-hover');
        bp.style.transform = '';
      });

      // mira estilo CAD com coordenadas em mm
      const cx = $('.cross--x', canvas), cy = $('.cross--y', canvas), read = $('#crossRead');
      canvas.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        cx.style.transform = `translateY(${y}px)`;
        cy.style.transform = `translateX(${x}px)`;
        const mmX = Math.round((x / r.width) * 4200).toString().padStart(4, '0');
        const mmY = Math.round((1 - y / r.height) * 9200).toString().padStart(4, '0');
        read.textContent = `X ${mmX} · Y ${mmY} mm`;
        const flip = x > r.width - 150;
        read.style.transform = `translate(${flip ? x - 140 : x + 12}px, ${y + 12}px)`;
      });
    }

    setStep(1);
    startCycle();
  }

  /* ---------- aberto agora? (seg–qui 7h–17h · sex 7h–16h) ---------- */
  const badge = $('#openBadge');
  const now = new Date();
  const d = now.getDay(), fim = d === 5 ? 16 : 17;
  const open = d >= 1 && d <= 5 && now.getHours() >= 7 && now.getHours() < fim;
  badge.textContent = open ? '● Aberto agora' : '● Fechado agora';
  badge.className = 'open-badge ' + (open ? 'on' : 'off');

  /* ---------- WIZARD DE ORÇAMENTO ---------- */
  const form = $('#wizard');
  const panels = $$('.panel', form);
  const steps = $$('.wstep', form);
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const sendBtns = $('#sendBtns');
  let step = 0;


  const val = n => (new FormData(form).get(n) || '').toString().trim();
  const data = () => {
    const fd = new FormData(form);
    return {
      demanda: val('demanda'), servico: val('servico'), desenho: val('desenho'),
      quantidade: val('quantidade'), prazo: val('prazo'), extras: fd.getAll('extras').join(', '),
      descricao: val('descricao'), nome: val('nome'), empresa: val('empresa'),
      local: val('local'), telefone: val('telefone'), retorno: val('retorno'),
      lgpd: val('lgpd'),
    };
  };

  const validate = i => {
    const d = data();
    if (i === 0) {
      const ok = !!(d.demanda && d.servico);
      $('[data-err="servico"]').classList.toggle('show', !ok);
      return ok;
    }
    if (i === 2) {
      let ok = true;
      ['nome', 'empresa', 'telefone'].forEach(f => {
        const bad = !d[f];
        form.elements[f].classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (!d.lgpd) ok = false;
      $('.consent', form).classList.toggle('is-invalid', !d.lgpd);
      $('[data-err="contato"]').classList.toggle('show', !ok);
      return ok;
    }
    return true;
  };

  const go = i => {
    step = i;
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    steps.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-done', k < i); });
    $('#wizProgress').style.width = ((i + 1) / panels.length) * 100 + '%';
    prevBtn.disabled = i === 0;
    nextBtn.hidden = i === panels.length - 1;
    sendBtns.hidden = i !== panels.length - 1;
  };

  nextBtn.addEventListener('click', () => { if (validate(step)) go(step + 1); });
  prevBtn.addEventListener('click', () => go(Math.max(0, step - 1)));
  steps.forEach(s => s.addEventListener('click', () => {
    const t = +s.dataset.go;
    if (t <= step) return go(t);
    for (let k = step; k < t; k++) if (!validate(k)) return go(k);
    go(t);
  }));

  form.addEventListener('change', e => {
    const n = e.target.name;
    if (n === 'servico') {
      const icon = e.target.closest('.opt').querySelector('.opt__icon svg');
      const box = $('#sheetPreview');
      box.innerHTML = icon.outerHTML;
      box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
    }
    if (n === 'demanda') $('#emergNote').hidden = e.target.value !== 'Emergência';
    if ((n === 'servico' || n === 'demanda') && step === 0) {
      const d = data();
      if (d.demanda && d.servico) { $('[data-err="servico"]').classList.remove('show'); setTimeout(() => go(1), 450); }
    }
  });

  // ficha ao vivo
  const outs = $$('[data-out]');
  const meterFill = $('#meterFill');
  const meterVal = $('#meterVal');
  const stamp = $('#stamp');
  const tip = $('#sheetTip');
  // pesos: o que mais influencia a precisão de um orçamento de caldeiraria
  const WEIGHTS = { demanda: 10, servico: 14, desenho: 20, quantidade: 10, prazo: 10, descricao: 14, empresa: 10, local: 12 };
  const TIPS = [
    ['demanda', 'Comece escolhendo o tipo de demanda.'],
    ['servico', 'Selecione o serviço.'],
    ['desenho', 'Tem desenho ou fotos? É o que mais acelera o orçamento.'],
    ['prazo', 'Diga para quando precisa.'],
    ['quantidade', 'Quantas peças? Um toque no + já resolve.'],
    ['descricao', 'Uma frase sobre a peça já ajuda a engenharia.'],
    ['local', 'Cidade de entrega ajuda a calcular logística.'],
  ];

  const render = () => {
    const d = data();
    outs.forEach(o => {
      const key = o.dataset.out;
      let v = d[key];
      if (key === 'quantidade' && v) v += ' un.';
      const empty = key === 'servico' ? 'Aguardando seleção' : key === 'demanda' ? 'DEMANDA' : '—';
      const txt = (key === 'demanda' && v) ? v.toUpperCase() : (v || empty);
      if (o.textContent !== txt) {
        o.textContent = txt;
        o.classList.toggle('filled', !!v);
        o.classList.remove('flash'); void o.offsetWidth; if (v) o.classList.add('flash');
      }
    });
    const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);
    const got = Object.entries(WEIGHTS).reduce((a, [k, w]) => a + (d[k] ? w : 0), 0);
    const pct = Math.round(got / total * 100);
    meterFill.style.width = pct + '%';
    meterVal.textContent = pct + '%';
    const next = TIPS.find(([k]) => !d[k]);
    tip.textContent = next ? next[1] : 'Ótimo! Sua solicitação está bem completa.';
    stamp.classList.toggle('show', !!(d.demanda && d.servico && d.nome && d.empresa && d.telefone && d.lgpd));
  };
  // contador de peças (− / +)
  const qtd = form.elements.quantidade;
  $$('[data-step-q]', form).forEach(b => b.addEventListener('click', () => {
    const n = Math.min(999, Math.max(0, (parseInt(qtd.value, 10) || 0) + +b.dataset.stepQ));
    qtd.value = n || '';
    qtd.classList.remove('bump'); void qtd.offsetWidth; qtd.classList.add('bump');
    render();
  }));

  form.addEventListener('input', render);
  form.addEventListener('change', render);

  const buildMessage = () => {
    const d = data();
    const L = (label, v) => v ? `*${label}:* ${v}` : null;
    const lines = [
      `*SOLICITAÇÃO DE ORÇAMENTO*`,
      '',
      L('Demanda', d.demanda),
      L('Serviço', d.servico),
      L('Desenho técnico', d.desenho),
      L('Quantidade', d.quantidade),
      L('Prazo', d.prazo),
      L('Incluir', d.extras),
      L('Descrição', d.descricao),
      '',
      L('Nome', d.nome),
      L('Empresa', d.empresa),
      L('Entrega', d.local),
      L('Telefone', d.telefone),
      L('Prefere retorno por', d.retorno),
      d.lgpd ? '_Autorizo o uso dos meus dados para a elaboração do orçamento, conforme a Política de Privacidade (LGPD)._' : null,
      '',
      d.desenho && !d.desenho.startsWith('Preciso') ? '_Vou anexar o desenho/fotos nesta conversa._' : null,
      '_Enviado pelo site recalcaldeiraria.com.br_',
    ];
    return lines.filter(l => l !== null).join('\n').replace(/\n{3,}/g, '\n\n');
  };

  $('#sendWpp').addEventListener('click', () => {
    if (!validate(0)) return go(0);
    if (!validate(2)) return;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildMessage())}`, '_blank', 'noopener');
  });
  go(0);
  render();
})();

/* ---------- vídeo institucional (carrega só ao clicar) ---------- */
(() => {
  const facade = document.getElementById('videoFacade');
  const embed = document.getElementById('videoEmbed');
  if (!facade || !embed) return;
  facade.addEventListener('click', () => {
    embed.innerHTML = '<iframe src="https://www.instagram.com/reel/C1I6kApBoxY/embed/" title="Vídeo institucional Recal" allowtransparency="true" allowfullscreen="true" scrolling="no" loading="lazy"></iframe>';
    embed.hidden = false;
    facade.hidden = true;
  });
})();

/* ---------- contato: fachada revelada pela rolagem ---------- */
(() => {
  const sec = document.getElementById('contato');
  if (!sec || !sec.querySelector('.visit__bg img')) return;   // só no layout antigo com a fachada em tela cheia
  const img = sec.querySelector('.visit__bg img');
  const shade = sec.querySelector('.visit__shade');
  const intro = document.getElementById('visitIntro');
  const panel = document.getElementById('visitPanel');
  const mq = matchMedia('(max-width: 900px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const update = () => {
    if (mq.matches) { img.style.transform = ''; shade.style.opacity = ''; intro.style.cssText = ''; panel.style.transform = ''; return; }
    const r = sec.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight));
    const enter = clamp(1 - r.top / innerHeight);         // entrada da seção na tela
    img.style.transform = `scale(${1.18 - 0.12 * enter - 0.06 * p})`;
    const pp = ease(clamp((p - 0.15) / 0.45));            // painel sobe
    shade.style.opacity = 0.25 + 0.6 * pp;
    intro.style.opacity = 1 - clamp((p - 0.05) / 0.25);
    intro.style.transform = `translateY(${-40 * clamp(p / 0.3)}px)`;
    panel.style.transform = `translateY(${(1 - pp) * 100}%)`;
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
})();

/* ---------- acessibilidade: pausas e foco no erro (revisão web-design-guidelines) ---------- */
(() => {
  const ICON_P = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  const ICON_R = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  const mk = (cls, label, html) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', label); b.innerHTML = html;
    return b;
  };

  // faixa de clientes: botão de pausa
  const mq = document.querySelector('.mq');
  if (mq) {
    const b = mk('mq__pause', 'Pausar a faixa de clientes', ICON_P + '<span>Pausar faixa</span>');
    mq.after(b);
    b.addEventListener('click', () => {
      const on = mq.classList.toggle('is-paused');
      b.setAttribute('aria-pressed', on); b.innerHTML = on ? ICON_R + '<span>Continuar faixa</span>' : ICON_P + '<span>Pausar faixa</span>';
      b.setAttribute('aria-label', on ? 'Continuar a faixa de clientes' : 'Pausar a faixa de clientes');
    });
  }

  // Engenharia: pausa explícita do ciclo automático das etapas
  const steps = document.getElementById('steps');
  if (steps) {
    let off = false;
    const b = mk('eng-pause', 'Pausar a troca automática das etapas', ICON_P + '<span>Pausar etapas</span>');
    steps.after(b);
    const hold = () => { const cur = steps.querySelector('li.is-active') || steps.querySelector('li'); cur && cur.dispatchEvent(new MouseEvent('mouseenter')); };
    b.addEventListener('click', () => {
      off = !off; b.setAttribute('aria-pressed', off);
      b.setAttribute('aria-label', off ? 'Continuar a troca automática das etapas' : 'Pausar a troca automática das etapas');
      b.innerHTML = off ? ICON_R + '<span>Continuar etapas</span>' : ICON_P + '<span>Pausar etapas</span>';
      if (off) hold(); else steps.dispatchEvent(new MouseEvent('mouseleave'));
    });
    steps.addEventListener('mouseleave', e => { if (off && e.isTrusted) setTimeout(hold, 0); });
  }

  // orçamento: leva o foco ao primeiro campo com erro
  document.querySelectorAll('.err').forEach(err => new MutationObserver(() => {
    if (!err.classList.contains('show')) return;
    const panel = err.closest('.panel'); if (!panel) return;
    const bad = panel.querySelector('input.is-invalid') || panel.querySelector('.consent.is-invalid input') ||
      [...panel.querySelectorAll('input[type=radio]')].find(r => !panel.querySelector(`input[name="${r.name}"]:checked`));
    if (bad) bad.focus();
  }).observe(err, { attributes: true, attributeFilter: ['class'] }));
})();

/* ---------- clientes: logos se alternam quando houver mais clientes que espaços ---------- */
(() => {
  const grid = document.querySelector('.lg__grid');
  const pool = document.getElementById('lgPool');
  if (!grid || !pool) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Usiminas e Aperam (cartões em destaque) ficam fixos; os demais giram
  const cells = [...grid.querySelectorAll('.lg__cell:not(.lg__cell--key)')];
  const all = () => [...grid.querySelectorAll('.lg__cell img'), ...pool.content.querySelectorAll('img')].map(i => ({ src: i.getAttribute('src'), alt: i.alt }));
  let paused = false, visible = true, last = -1;
  grid.addEventListener('mouseenter', () => paused = true);
  grid.addEventListener('mouseleave', () => paused = false);
  grid.addEventListener('focusin', () => paused = true);
  grid.addEventListener('focusout', () => paused = false);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(grid);
  const swap = () => {
    if (reduce || paused || !visible || document.hidden) return;
    const shown = new Set([...grid.querySelectorAll('.lg__cell img:not(.is-out)')].map(i => i.getAttribute('src')));
    const waiting = all().filter(l => !shown.has(l.src));
    if (!waiting.length || !cells.length) return;          // sem clientes extras: grade fica parada
    let k; do { k = Math.floor(Math.random() * cells.length); } while (cells.length > 1 && k === last);
    last = k;
    const cell = cells[k], old = cell.querySelector('img'), next = waiting[Math.floor(Math.random() * waiting.length)];
    const img = new Image();
    img.src = next.src; img.alt = next.alt; img.className = 'is-in';
    img.onload = () => {
      cell.appendChild(img);
      old.classList.add('is-out');
      requestAnimationFrame(() => requestAnimationFrame(() => img.classList.add('show')));
      setTimeout(() => {
        // o logo que saiu volta para a fila de espera
        if (!pool.content.querySelector(`img[src="${old.getAttribute('src')}"]`)) pool.content.appendChild(old.cloneNode());
        pool.content.querySelector(`img[src="${next.src.split('/').slice(-3).join('/')}"]`)?.remove();
        old.remove(); img.className = '';
      }, 750);
    };
  };
  setInterval(swap, 2800);
})();
