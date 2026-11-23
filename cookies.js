/* Recal — aviso de cookies (LGPD)
   O site não usa cookies próprios de rastreamento nem ferramentas de análise.
   Conteúdos de terceiros que gravam cookies (Google Maps) só carregam com consentimento;
   o vídeo do Instagram já carrega apenas quando a pessoa clica para assistir. */
(() => {
  const KEY = 'recal-cookies'; // 'aceito' | 'recusado'
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const set = v => { try { localStorage.setItem(KEY, v); } catch (e) {} };

  // ---------- mapa: carrega só com consentimento (ou clique pontual) ----------
  const loadMaps = () => document.querySelectorAll('[data-consent-map]').forEach(box => {
    if (box.querySelector('iframe')) return;
    const f = document.createElement('iframe');
    f.title = box.dataset.title || 'Mapa';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.src = box.dataset.src;
    box.innerHTML = ''; box.appendChild(f); box.classList.add('is-loaded');
  });
  document.querySelectorAll('[data-consent-map] [data-load-map]').forEach(b =>
    b.addEventListener('click', loadMaps));

  // ---------- aviso ----------
  let bar;
  const close = () => { if (bar) { bar.classList.remove('is-on'); setTimeout(() => bar && (bar.hidden = true), 400); } };
  const choose = v => { set(v); if (v === 'aceito') loadMaps(); close(); };

  const open = () => {
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'ck'; bar.hidden = true;
      bar.setAttribute('role', 'dialog');
      bar.setAttribute('aria-live', 'polite');
      bar.setAttribute('aria-label', 'Aviso de cookies');
      bar.innerHTML =
        '<div class="ck__txt"><b>Este site respeita a sua privacidade</b>' +
        '<p>Não usamos cookies de rastreamento nem de publicidade. Alguns conteúdos de terceiros, como o mapa do Google, podem gravar cookies no seu navegador. ' +
        'Eles só são carregados se você aceitar. Saiba mais na <a href="politica-privacidade.html#cookies">Política de Privacidade</a>.</p></div>' +
        '<div class="ck__btns"><button type="button" class="ck__btn ck__btn--ghost" data-ck="recusado">Recusar</button>' +
        '<button type="button" class="ck__btn" data-ck="aceito">Aceitar</button></div>';
      bar.querySelectorAll('[data-ck]').forEach(b => b.addEventListener('click', () => choose(b.dataset.ck)));
      document.body.appendChild(bar);
    }
    bar.hidden = false;
    void bar.offsetWidth; // força o estado inicial para a transição de entrada
    bar.classList.add('is-on');
  };

  // link "Preferências de cookies" (rodapé e política) reabre o aviso
  document.querySelectorAll('[data-cookie-prefs]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); open(); }));

  const st = get();
  if (st === 'aceito') loadMaps();
  else if (!st) setTimeout(open, 1200);
})();
