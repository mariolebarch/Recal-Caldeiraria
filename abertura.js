/* Recal — abertura: história contada pela rolagem + capacidade */
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const sec = document.querySelector('section.tl');
  if (!sec) return;
  const layers = [...sec.querySelectorAll('.tl__layer')];
  const imgs = layers.map(l => l.querySelector('img'));
  const chapters = [...sec.querySelectorAll('.tl__ch')];
  const N = chapters.length;
  const wipe = document.getElementById('tlWipe');
  const numEl = document.getElementById('tlNum');
  const tagEl = document.getElementById('tlTag');
  const yearEl = document.getElementById('tlYear');
  const fill = document.getElementById('tlFill');
  const bar = document.getElementById('tlBar');
  const hint = document.getElementById('tlHint');
  const navList = document.getElementById('tlNav');

  // títulos: cada linha ganha uma máscara para entrar de baixo para cima
  chapters.forEach(ch => ch.querySelectorAll('h2 > span').forEach(s => {
    const ln = document.createElement('span'); ln.className = 'ln';
    while (s.firstChild) ln.appendChild(s.firstChild);
    s.appendChild(ln);
  }));

  // navegação lateral
  const navItems = chapters.map((ch, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = `<b>${ch.dataset.year || '—'}</b><span>${ch.dataset.tag}</span>`;
    b.addEventListener('click', () => {
      const range = sec.offsetHeight - innerHeight;
      scrollTo({ top: sec.offsetTop + range * ((i + 0.05) / N), behavior: 'smooth' });
    });
    li.appendChild(b); navList.appendChild(li);
    return li;
  });

  // ano com dígitos que giram
  const cols = [0, 1, 2, 3].map(() => {
    const col = document.createElement('div'); col.className = 'col';
    const strip = document.createElement('div'); strip.className = 'strip';
    for (let n = 0; n <= 10; n++) { const s = document.createElement('span'); s.textContent = n % 10; strip.appendChild(s); }
    col.appendChild(strip); yearEl.appendChild(col);
    return strip;
  });
  const setYear = Y => {
    let lower = Y % 10;
    const pos = [0, 0, 0, lower];
    for (let k = 1; k < 4; k++) {
      const base = Math.floor(Y / Math.pow(10, k)) % 10;
      const carry = lower > 9 ? lower - 9 : 0;
      pos[3 - k] = base + carry; lower = base + carry;
    }
    cols.forEach((s, i) => { s.style.transform = `translateY(${-pos[i]}em)`; });
  };
  const years = chapters.map(c => +c.dataset.year || 0);

  let target = 0, smooth = 0, current = -1;
  const prog = () => { const r = sec.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };
  addEventListener('scroll', () => { target = prog(); }, { passive: true });
  target = smooth = prog();

  const setChapter = i => {
    if (i === current) return;
    chapters.forEach((c, k) => {
      c.classList.toggle('is-out', k === current && k !== i);
      c.classList.toggle('is-on', k === i);
    });
    setTimeout(() => chapters.forEach((c, k) => { if (k !== i) c.classList.remove('is-out'); }), 600);
    current = i;
    numEl.textContent = String(i + 1).padStart(2, '0');
    tagEl.textContent = chapters[i].dataset.tag;
    yearEl.classList.toggle('is-hidden', !years[i]);
    navItems.forEach((li, k) => { li.classList.toggle('is-on', k === i); li.classList.toggle('is-done', k < i); });
  };

  const frame = () => {
    smooth += (target - smooth) * 0.1;
    if (Math.abs(target - smooth) < 0.00005) smooth = target;
    const p = smooth;
    const f = p * N;                                    // posição contínua
    const k = Math.min(N - 1, Math.floor(f));
    const local = f - k;                                // 0..1 dentro do capítulo
    const reveal = k < N - 1 ? ease(clamp((local - 0.62) / 0.38)) : 0;

    // camadas: as anteriores ficam visíveis, a próxima é revelada de baixo para cima
    layers.forEach((l, i) => {
      if (i === 0) return;
      let c = 100;
      if (i <= k) c = 0;
      else if (i === k + 1) c = (1 - reveal) * 100;
      l.style.clipPath = `inset(${c}% 0 0 0)`;
    });
    // zoom lento (efeito Ken Burns) na imagem ativa e na que está entrando
    imgs.forEach((img, i) => {
      if (!img) return;
      let s = 1.14;
      if (i === k) s = lerp(1.08, 1.0, local);
      else if (i === k + 1) s = lerp(1.14, 1.08, reveal);
      else if (i < k) s = 1.0;
      img.style.transform = `scale(${s})`;
    });
    // linha de corte acompanha a revelação
    if (reveal > 0 && reveal < 1) { wipe.style.opacity = 1; wipe.style.top = (1 - reveal) * 100 + '%'; }
    else wipe.style.opacity = 0;

    // capítulo ativo troca quando a nova imagem está quase toda visível
    setChapter(Math.min(N - 1, reveal > 0.55 ? k + 1 : k));

    // ano gira durante a revelação
    const yA = years[k] || years[k + 1] || 2003, yB = years[Math.min(N - 1, k + 1)] || yA;
    setYear(Math.round(lerp(yA, yB, reveal)));

    fill.style.height = clamp(f / (N - 1)) * 100 + '%';
    bar.style.width = p * 100 + '%';
    hint.style.opacity = p < 0.015 ? 1 : 0;
  };
  const loop = () => { frame(); requestAnimationFrame(loop); };
  loop();

  // mostra o conteúdo inicial mesmo antes da primeira rolagem
  setChapter(0);
})();

/* ---------- capacidade: cartões entram e saem com a rolagem (nos dois sentidos) ---------- */
(() => {
  const capSec = document.getElementById('capacity');
  if (!capSec) return;
  const caps = [...capSec.querySelectorAll('.cap')];
  const fmt = (v, dec) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const nums = caps.map(c => {
    const n = c.querySelector('[data-to]');
    if (!n) return null;
    const unit = n.querySelector('small') ? n.querySelector('small').outerHTML : '';
    return { n, to: +n.dataset.to, dec: +(n.dataset.dec || 0), unit, run: 0 };
  });
  const setNum = (o, v) => { o.n.innerHTML = fmt(v, o.dec) + o.unit; };
  nums.forEach(o => o && setNum(o, 0));
  const count = o => {
    const id = ++o.run, t0 = performance.now();
    const step = t => {
      if (id !== o.run) return;                       // cancelado (cartão saiu)
      const q = Math.min(1, (t - t0) / 1400);
      setNum(o, o.to * (1 - Math.pow(1 - q, 3)));
      if (q < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const onScroll = () => {
    const r = capSec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    const entered = r.top < innerHeight * 0.25;
    caps.forEach((c, i) => {
      const on = entered && p >= (i / caps.length) * 0.6;
      const was = c.classList.contains('is-on');
      if (on && !was) { c.classList.add('is-on'); if (nums[i]) count(nums[i]); }
      else if (!on && was) { c.classList.remove('is-on'); if (nums[i]) { nums[i].run++; setNum(nums[i], 0); } }
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
