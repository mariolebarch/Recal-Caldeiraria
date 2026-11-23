/* Recal — primeira tela: troca das peças por varredura e alternância das fotos da equipe */
(() => {
  const hx = document.getElementById('inicio');
  if (!hx || !hx.classList.contains('hx')) return;
  const $ = id => document.getElementById(id);

  // a primeira tela ocupa exatamente o espaço visível abaixo do topo e do menu
  const fit = () => hx.style.setProperty('--top', Math.max(0, hx.getBoundingClientRect().top + scrollY) + 'px');
  fit(); addEventListener('resize', fit);

  const B = 'img/obras/';
  const P = [
    ['roda-cacambas', 'Roda de caçambas', 'Mineração · caldeiraria pesada'],
    ['distribuidor-multitubos', 'Distribuidor multitubos', 'Usinagem CNC e caldeiraria'],
    ['duto-revestido', 'Duto revestido', 'Revestimento interno'],
    ['cone-antidesgaste', 'Cone antidesgaste', 'Calandragem e solda'],
    ['derivacao-y', 'Derivação em Y', 'Tubulação flangeada'],
    ['transporte-dutos', 'Pronto para a sua planta', 'Preparo e transporte'],
  ];
  const HOLD = 4600, SWEEP = 1400, CREW = 7000;
  const works = $('hxWorks'), cur = $('hxCur'), nxt = $('hxNext'), wire = $('hxWire');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // pré-carrega as fotos das peças depois que a página terminar de abrir
  addEventListener('load', () => P.forEach(([f]) => { new Image().src = B + f + '.jpg'; }));

  const btns = P.map(([f, n], k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Ver ' + n);
    b.innerHTML = `<img src="${B}${f}.jpg" alt="" width="168" height="148" loading="lazy">`;
    b.addEventListener('click', () => go(k));
    $('hxReel').appendChild(b); return b;
  });

  const info = k => {
    $('hxNum').textContent = String(k + 1).padStart(2, '0');
    const n = $('hxName'), s = $('hxSector');
    n.textContent = P[k][1]; s.textContent = P[k][2];
    cur.alt = P[k][1] + ' fabricada pela Recal';
    if (!reduce && n.animate) [n, s].forEach(el => el.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)' }));
    btns.forEach((b, i) => { b.classList.toggle('on', i === k); b.setAttribute('aria-current', i === k); b.style.setProperty('--p', '0%'); });
  };

  let idx = 0, t0 = performance.now(), sweeping = false;
  const setCur = k => { cur.src = B + P[k][0] + '.jpg'; cur.style.animation = 'none'; void cur.offsetWidth; cur.style.animation = ''; };
  const go = k => {
    const to = (k + P.length) % P.length;
    if (sweeping || to === idx) return;
    if (reduce) { setCur(to); idx = to; t0 = performance.now(); return info(idx); }
    nxt.src = wire.src = B + P[to][0] + '.jpg';
    sweeping = true; works.classList.add('is-scanning');
    const s0 = performance.now();
    const step = now => {
      const p = Math.min(1, (now - s0) / SWEEP);
      const e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      works.style.setProperty('--x', e * 112 + '%');
      if (p < 1) return requestAnimationFrame(step);
      setCur(to); works.style.setProperty('--x', '0%'); works.classList.remove('is-scanning');
      sweeping = false; idx = to; t0 = performance.now(); info(idx);
    };
    requestAnimationFrame(step);
  };

  // pausar / continuar (exigência de acessibilidade para movimento automático)
  let paused = false;
  const pb = document.createElement('button');
  pb.type = 'button'; pb.className = 'hx__pause'; pb.setAttribute('aria-pressed', 'false');
  pb.setAttribute('aria-label', 'Pausar a troca automática das peças');
  pb.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  pb.addEventListener('click', () => {
    paused = !paused;
    pb.setAttribute('aria-pressed', String(paused));
    pb.setAttribute('aria-label', paused ? 'Continuar a troca automática das peças' : 'Pausar a troca automática das peças');
    pb.innerHTML = paused ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  });
  $('hxReel').prepend(pb);

  info(0);
  if (reduce) { paused = true; pb.hidden = true; return; }

  // avança sozinho só quando a primeira tela está visível
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) t0 = performance.now() - (parseFloat(btns[idx].style.getPropertyValue('--p')) || 0) / 100 * HOLD; }).observe(hx);
  const loop = now => {
    if (visible && !sweeping && !document.hidden && !paused) {
      const p = Math.min(1, (now - t0) / HOLD);
      btns[idx].style.setProperty('--p', p * 100 + '%');
      if (p >= 1) go(idx + 1);
    } else if (!sweeping) t0 = now - (parseFloat(btns[idx].style.getPropertyValue('--p')) || 0) / 100 * HOLD;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  // fotos da equipe se alternam devagar
  const crew = [...$('hxCrew').children]; let c = 0;
  setInterval(() => { if (!visible || document.hidden || paused) return; crew[c].classList.remove('on'); c = (c + 1) % crew.length; crew[c].classList.add('on'); }, CREW);
})();
