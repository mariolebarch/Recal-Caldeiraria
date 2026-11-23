/* Recal — páginas internas */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  // header
  const header = $('#header');
  const onScroll = () => header && header.classList.toggle('is-scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // menu mobile
  const burger = $('#burger'), nav = $('#nav');
  if (burger && nav) burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  // reveal: entra ao aparecer e volta ao estado inicial quando sai por baixo (repete ao rolar de novo)
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    const el = e.target;
    if (e.isIntersecting) {
      if (!el.classList.contains('in')) {
        const sib = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = Math.min(sib.indexOf(el), 5) * 80 + 'ms';
        el.classList.add('in');
      }
    } else if (e.boundingClientRect.top > 0) {
      el.classList.remove('in'); el.style.transitionDelay = '0ms';
    }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  // linha do tempo: preenchimento acompanha a rolagem (nos dois sentidos)
  const htl = $('.htl');
  if (htl) {
    const fill = $('.htl__fill', htl);
    const items = $$('.htl__item', htl);
    const upd = () => {
      const r = htl.getBoundingClientRect();
      const line = innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (line - r.top) / r.height));
      fill.style.height = p * 100 + '%';
      items.forEach(it => it.classList.toggle('is-past', it.getBoundingClientRect().top < line));
    };
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }

  // vídeo institucional: carrega o player do Instagram só no clique
  const facade = $('#videoFacade'), embed = $('#videoEmbed');
  if (facade && embed) facade.addEventListener('click', () => {
    embed.innerHTML = '<iframe src="https://www.instagram.com/reel/C1I6kApBoxY/embed/" title="Vídeo institucional Recal" allowtransparency="true" allowfullscreen="true" scrolling="no" loading="lazy"></iframe>';
    embed.hidden = false; facade.hidden = true;
  });
})();

/* voltar ao site: retorna para a seção de onde a pessoa veio */
(() => {
  const de = new URLSearchParams(location.search).get('de');
  const target = 'index.html' + (de && /^[a-z]+$/.test(de) ? '#' + de : '');
  let fromSite = false;
  try { const r = new URL(document.referrer); fromSite = r.origin === location.origin && /\/(index\.html)?$/.test(r.pathname); } catch (e) {}
  document.querySelectorAll('[data-back]').forEach(a => {
    a.href = target;
    a.addEventListener('click', ev => {
      // veio do site: volta pelo histórico, mantendo exatamente a posição da rolagem
      if (fromSite && history.length > 1) { ev.preventDefault(); history.back(); }
    });
  });
  const fl = document.querySelector('.back-float');
  if (fl) {
    const upd = () => fl.classList.toggle('is-on', scrollY > 300);
    addEventListener('scroll', upd, { passive: true }); upd();
  }
})();
