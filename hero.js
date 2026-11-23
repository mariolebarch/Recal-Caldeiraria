/* Recal — primeira tela: peças fabricadas passando em loop contínuo, com tempo fixo.
   Cada peça: 0,9 s de movimento + 2,1 s parada = 3 s exatos, sempre iguais.
   A peça que sai por cima vai para o fim da fila (sem "rebobinar").
   Só para com movimento reduzido (acessibilidade), aba oculta ou topo fora da tela. */
(() => {
const tr=document.getElementById('glTrack'); if(!tr) return;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const box=document.querySelector('.gl');
const STEP=3000, MOVE=900;

tr.querySelectorAll('img').forEach(im=>{im.decoding='async'; im.loading='eager'; if(im.decode) im.decode().catch(()=>{});});

tr.prepend(tr.lastElementChild);            // peça 01 no centro, a última logo acima
const kids=()=>tr.children;
const center=el=>-(el.offsetTop-(box.clientHeight-el.offsetHeight)/2);
const place=(el,anim)=>{
  if(!anim) tr.classList.add('no-anim');
  tr.style.transform=`translate3d(0,${center(el)}px,0)`;
  if(!anim){ void tr.offsetHeight; tr.classList.remove('no-anim'); }
};
const mark=el=>{[...kids()].forEach(e=>e.classList.toggle('on',e===el));};
mark(kids()[1]); place(kids()[1],false);
addEventListener('resize',()=>place(kids()[1],false));
if(RM) return;

let vis=true;
new IntersectionObserver(([e])=>{vis=e.isIntersecting}).observe(document.querySelector('.hx2'));

let busy=false;
const next=()=>{
  if(busy) return; busy=true;
  const el=kids()[2]; mark(el); place(el,true);
  setTimeout(()=>{ tr.appendChild(kids()[0]); place(kids()[1],false); busy=false; }, MOVE+50);  // recicla sem salto
};

// relógio fixo: troca em t0 + n×3s, no máximo UMA troca por vez.
// Ao sair da aba (ou o topo sair da tela) o relógio recomeça do zero ao voltar,
// para nunca "recuperar o atraso" passando várias peças em sequência.
let t0=performance.now()+1000, n=0, last=performance.now();
const restart=t=>{ t0=t+STEP; n=0; };
document.addEventListener('visibilitychange',()=>restart(performance.now()));
const loop=t=>{
  if(document.hidden || !vis || t-last>500) restart(t);
  else if(t>=t0+n*STEP){ n=Math.floor((t-t0)/STEP)+1; next(); }
  last=t;
  requestAnimationFrame(loop);
};
requestAnimationFrame(loop);
})();
