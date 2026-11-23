/* Recal — fabricação do cone em 3D conforme a rolagem + galeria horizontal */
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));           // progresso local de um trecho
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  const story = document.getElementById('story');
  const steps = [...document.querySelectorAll('.cstep')];
  const railItems = [...document.querySelectorAll('.crail li')];
  const hudStep = document.getElementById('hudStep');
  const progressEl = document.getElementById('coneProgress');
  const reveal = document.getElementById('reveal');
  const labels = { d: document.getElementById('dimD'), h: document.getElementById('dimH'), t: document.getElementById('dimT') };

  // trechos da rolagem (0–1) para cada etapa
  const STAGES = [
    [0.00, 0.14], // corte
    [0.14, 0.34], // calandragem
    [0.34, 0.46], // soldagem
    [0.46, 0.62], // revestimento
    [0.62, 0.74], // montagem
    [0.74, 0.86], // inspeção
  ];                // 0.86–1: revelação da peça real

  const storyProgress = () => {
    const r = story.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };

  /* ---------------- HUD ---------------- */
  let currentStep = -1;
  const updateHud = p => {
    let i = STAGES.findIndex(([a, b]) => p >= a && p < b);
    if (i === -1) i = p >= 0.86 ? 5 : 0;
    if (i !== currentStep) {
      currentStep = i;
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i && p < 0.88));
      hudStep.textContent = '0' + (i + 1);
    }
    steps.forEach((s, k) => { if (k === i) s.classList.toggle('is-on', p < 0.88); });
    railItems.forEach((li, k) => {
      li.classList.toggle('is-on', k === i);
      li.classList.toggle('is-done', k < i);
    });
    progressEl.style.width = p * 100 + '%';
    const rv = seg(p, 0.88, 0.95);
    reveal.style.opacity = rv;
    reveal.classList.toggle('is-on', rv > 0.3);
    document.querySelector('.crail').style.opacity = 1 - rv;
  };

  /* ---------------- 3D ---------------- */
  const canvas = document.getElementById('scene');
  let renderer;
  try {
    if (!window.THREE) throw new Error('three');
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    addEventListener('scroll', () => updateHud(storyProgress()), { passive: true });
    updateHud(storyProgress());
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));


  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xdfe8f0, 0x1a2a3a, 0.5));
  const key = new THREE.DirectionalLight(0xfff6ec, 1.15); key.position.set(5, 8, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ff0bf, 0.6); rim.position.set(-6, 3, -5); scene.add(rim);

  // ambiente de reflexo (galpão iluminado) para o aço ter brilho real
  (() => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const g = new THREE.SphereGeometry(10, 48, 24);
    const pa = g.attributes.position, cols = new Float32Array(pa.count * 3);
    const top = new THREE.Color(0xe6f0fa), mid = new THREE.Color(0x3c5f86), low = new THREE.Color(0x0c1f36), c = new THREE.Color();
    for (let i = 0; i < pa.count; i++) {
      const y = pa.getY(i) / 10;
      if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.6)); else c.copy(mid).lerp(low, Math.min(1, -y * 2));
      // faixas de luz como as lâmpadas do galpão
      if (y > 0.35 && Math.abs(Math.sin(Math.atan2(pa.getZ(i), pa.getX(i)) * 6)) > 0.93) c.setRGB(1, 1, 1);
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    envScene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
    scene.environment = pmrem.fromScene(envScene, 0.03).texture;
  })();

  // ----- geometria do cone (chapa planificada -> cone) -----
  // proporções da peça real: base Ø 5,2 m, topo Ø 3,9 m, cone com ~1 m de altura
  const ALPHA_F = THREE.MathUtils.degToRad(40);   // semiângulo do cone
  const R_BASE = 2.6, R_TOP = 1.95;
  const S1 = R_TOP / Math.sin(ALPHA_F), S2 = R_BASE / Math.sin(ALPHA_F);   // geratrizes (topo e base)
  const THETA = 2 * Math.PI * Math.sin(ALPHA_F); // ângulo da planificação
  const NU = 180, NV = 14;
  const SMID = (S1 + S2) / 2;

  const conePos = (u, v, alpha, out) => {
    const s = S1 + (S2 - S1) * v;
    const a = (u - 0.5) * THETA;
    const sa = Math.sin(alpha), ca = Math.cos(alpha);
    const phi = a / sa;
    out.x = s * sa * Math.cos(phi);
    out.z = s * sa * Math.sin(phi);
    out.y = -s * ca;
    return out;
  };

  const vertCount = (NU + 1) * (NV + 1);
  const positions = new Float32Array(vertCount * 3);
  const uvs = new Float32Array(vertCount * 2);
  const idx = [];
  for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) {
    const k = i * (NV + 1) + j;
    uvs[k * 2] = i / NU; uvs[k * 2 + 1] = j / NV;
  }
  for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) {
    const a = i * (NV + 1) + j, b = a + NV + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(idx);

  const group = new THREE.Group();
  scene.add(group);

  const steelMat = new THREE.MeshStandardMaterial({ color: 0x463b35, metalness: 0.3, roughness: 0.8, envMapIntensity: 0.3, side: THREE.DoubleSide });
  const body = new THREE.Mesh(geo, steelMat);
  group.add(body);

  // textura da malha antidesgaste: um painel por repetição (8 painéis na volta),
  // losangos grandes em cima, faixa de triângulos menores embaixo, costura vertical e pinos soldados
  const tex = (() => {
    const W = 512, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const SPLIT = 392;                       // divisão entre a zona de losangos e a faixa inferior
    g.lineCap = 'square';
    const bar = (x1, y1, x2, y2, w) => {     // barra soldada com sombra e brilho
      g.strokeStyle = 'rgba(20,14,10,.85)'; g.lineWidth = w + 4; g.beginPath(); g.moveTo(x1 + 2, y1 + 2); g.lineTo(x2 + 2, y2 + 2); g.stroke();
      g.strokeStyle = '#6c6057'; g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      g.strokeStyle = 'rgba(205,190,175,.45)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x1 - 1, y1 - 1); g.lineTo(x2 - 1, y2 - 1); g.stroke();
    };
    const stud = (x, y) => {
      g.fillStyle = 'rgba(15,10,8,.7)'; g.beginPath(); g.arc(x + 1.5, y + 1.5, 5, 0, 7); g.fill();
      g.fillStyle = '#b5a89b'; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill();
    };
    // zona superior: 4 losangos na largura, 5 de altura
    g.save(); g.beginPath(); g.rect(0, 0, W, SPLIT); g.clip();
    const dw = W / 5, dh = SPLIT / 6;
    for (let k = -8; k <= 13; k++) {
      bar(k * dw, 0, k * dw + dw * 6, dh * 6, 5);
      bar(k * dw, 0, k * dw - dw * 6, dh * 6, 5);
    }
    for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) { stud(dw * (i + .5), dh * (j + .5)); stud(dw * i, dh * j); }
    g.restore();
    // faixa inferior: triângulos menores
    g.save(); g.beginPath(); g.rect(0, SPLIT, W, H - SPLIT); g.clip();
    const tw = W / 8, th = H - SPLIT;
    for (let k = -2; k <= 10; k++) { bar(k * tw, SPLIT, k * tw + tw, H, 5); bar(k * tw, SPLIT, k * tw - tw, H, 5); }
    for (let k = 0; k < 8; k++) stud(tw * (k + .5), SPLIT + th * .55);
    g.restore();
    bar(0, SPLIT, W, SPLIT, 9);              // barra horizontal entre as zonas
    bar(0, 0, 0, H, 10); bar(W, 0, W, H, 10); // costura entre painéis
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.flipY = false;                         // v=0 no topo do cone
    t.repeat.set(8, 1);
    t.anisotropy = 8;
    return t;
  })();
  const meshMat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, opacity: 0, metalness: 0.25, roughness: 0.8, envMapIntensity: 0.3, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false });
  const lining = new THREE.Mesh(geo, meshMat);
  group.add(lining);

  // tocha de corte
  const torch = new THREE.PointLight(0xffb347, 0, 3);
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffd27a }));
  group.add(torch, spark);

  // costuras de solda (linhas ao longo da geratriz)
  const SEAMS = [0, 1, 2, 3, 4, 5, 6, 7].map(k => k / 8);
  const seams = SEAMS.map(() => {
    const m = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
    group.add(m); return m;
  });
  const HOT = new THREE.Color(0xfff0b8), WARM = new THREE.Color(0xff6a1a), COLD = new THREE.Color(0x3a2a20);

  // faíscas (partículas com gravidade)
  const MAXP = 600;
  const pPos = new Float32Array(MAXP * 3), pVel = new Float32Array(MAXP * 3), pLife = new Float32Array(MAXP);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffb347, size: 0.045, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
  const sparksPts = new THREE.Points(pGeo, pMat);
  group.add(sparksPts);
  let pHead = 0;
  const emit = (x, y, z, n, power = 1) => {
    for (let i = 0; i < n; i++) {
      const k = pHead; pHead = (pHead + 1) % MAXP;
      pPos[k * 3] = x; pPos[k * 3 + 1] = y; pPos[k * 3 + 2] = z;
      const a = Math.random() * Math.PI * 2, up = 0.02 + Math.random() * 0.05;
      const sp = (0.01 + Math.random() * 0.035) * power;
      pVel[k * 3] = Math.cos(a) * sp; pVel[k * 3 + 1] = up * power; pVel[k * 3 + 2] = Math.sin(a) * sp;
      pLife[k] = 1;
    }
  };
  const stepSparks = () => {
    for (let k = 0; k < MAXP; k++) {
      if (pLife[k] <= 0) { pPos[k * 3 + 1] = -99; continue; }
      pVel[k * 3 + 1] -= 0.0032;
      pPos[k * 3] += pVel[k * 3]; pPos[k * 3 + 1] += pVel[k * 3 + 1]; pPos[k * 3 + 2] += pVel[k * 3 + 2];
      if (pPos[k * 3 + 1] < -0.5) { pPos[k * 3 + 1] = -0.5; pVel[k * 3 + 1] *= -0.3; pVel[k * 3] *= 0.6; pVel[k * 3 + 2] *= 0.6; }
      pLife[k] -= 0.02 + Math.random() * 0.02;
    }
    pGeo.attributes.position.needsUpdate = true;
  };

  // anel superior em caixão: faixa vertical, 3 flanges, nervuras radiais formando bolsas abertas,
  // parede interna e montantes verticais internos (como na foto da peça)
  const ring = new THREE.Group();
  const topR = R_TOP;
  const RING_IN = topR - 0.26, RING_OUT = topR + 0.05;
  const BAND = 0.26, FL = [BAND, BAND + 0.22];   // alturas dos flanges
  const RING_TOP = FL[1], WALL_TOP = RING_TOP + 0.22;
  const CONE_H = (S2 - S1) * Math.cos(ALPHA_F);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x684634, metalness: 0.4, roughness: 0.72, envMapIntensity: 0.35, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const holeMat = new THREE.MeshStandardMaterial({ color: 0x5a3d2d, metalness: 0.35, roughness: 0.78, envMapIntensity: 0.3, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const flangeMat = new THREE.MeshStandardMaterial({ color: 0x7d5a46, metalness: 0.45, roughness: 0.65, envMapIntensity: 0.35, transparent: true, opacity: 0, side: THREE.DoubleSide });
  const ringMats = [ringMat, holeMat, flangeMat];
  // faixa vertical entre o cone e o caixão
  const band = new THREE.Mesh(new THREE.CylinderGeometry(topR + 0.01, topR + 0.01, BAND, 128, 1, true), ringMat);
  band.position.y = BAND / 2; ring.add(band);
  // flanges horizontais (chapas com espessura)
  FL.forEach(y => {
    const fl = new THREE.Mesh(new THREE.CylinderGeometry(RING_OUT, RING_OUT, 0.035, 128, 1, true), flangeMat);
    fl.position.y = y; ring.add(fl);
    const top = new THREE.Mesh(new THREE.RingGeometry(RING_IN, RING_OUT, 128), flangeMat);
    top.rotation.x = -Math.PI / 2; top.position.y = y + 0.0175; ring.add(top);
    const bot = top.clone(); bot.position.y = y - 0.0175; ring.add(bot);
  });
  // parede interna (fundo das bolsas) e borda superior
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(RING_IN, RING_IN, WALL_TOP - BAND, 128, 1, true), holeMat);
  wall.position.y = (WALL_TOP + BAND) / 2; ring.add(wall);
  const wallLip = new THREE.Mesh(new THREE.RingGeometry(RING_IN - 0.03, RING_IN + 0.01, 128), flangeMat);
  wallLip.rotation.x = -Math.PI / 2; wallLip.position.y = WALL_TOP; ring.add(wallLip);
  // nervuras radiais: 32 na volta, formando as bolsas retangulares
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(RING_OUT - RING_IN, RING_TOP - BAND, 0.03), ringMat);
    rib.position.set(Math.cos(a) * (RING_IN + RING_OUT) / 2, (RING_TOP + BAND) / 2, Math.sin(a) * (RING_IN + RING_OUT) / 2);
    rib.rotation.y = -a;
    ring.add(rib);
  }
  // barra intermediária dentro das bolsas
  const midBar = new THREE.Mesh(new THREE.CylinderGeometry(RING_OUT - 0.06, RING_OUT - 0.06, 0.03, 128, 1, true), flangeMat);
  midBar.position.y = (BAND + RING_TOP) / 2; ring.add(midBar);
  // gabarito amarelo de içamento apoiado no piso, como na foto
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf2c200, metalness: 0.2, roughness: 0.55, transparent: true, opacity: 0 });
  ringMats.push(yellowMat);
  const tri = new THREE.Group();
  [[0, 0.5, 0], [Math.PI * 2 / 3, 0.5, 0], [Math.PI * 4 / 3, 0.5, 0]].forEach(([a, L]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(L, 0.05, 0.06), yellowMat);
    b.position.set(Math.cos(a + Math.PI / 2) * 0.15, 0, Math.sin(a + Math.PI / 2) * 0.15);
    b.rotation.y = -a; tri.add(b);
  });
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.05), yellowMat); mast.position.y = 0.14; tri.add(mast);
  tri.position.set(-RING_IN * 0.45, -CONE_H + 0.03, RING_IN * 0.35);
  ring.add(tri);
  // reforços verticais externos mais grossos a cada 3 bolsas
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.06, RING_TOP - BAND + 0.04, 0.09), flangeMat);
    st.position.set(Math.cos(a) * (RING_OUT - 0.02), (RING_TOP + BAND) / 2, Math.sin(a) * (RING_OUT - 0.02));
    st.rotation.y = -a;
    ring.add(st);
  }
  // montantes verticais internos, do piso até o topo da parede
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const h = CONE_H + WALL_TOP;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.1), ringMat);
    post.position.set(Math.cos(a) * (RING_IN - 0.08), WALL_TOP - h / 2, Math.sin(a) * (RING_IN - 0.08));
    post.rotation.y = -a;
    ring.add(post);
  }
  group.add(ring);

  // cotas de inspeção
  const dimMat = new THREE.LineBasicMaterial({ color: 0xf2b200, transparent: true, opacity: 0 });
  const mkLine = pts => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), dimMat);
  const baseR = S2 * Math.sin(ALPHA_F);
  const yBase = -(S2 - SMID) * Math.cos(ALPHA_F);
  const yTop = (SMID - S1) * Math.cos(ALPHA_F) + WALL_TOP;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const dims = new THREE.Group();
  dims.add(mkLine([V(-baseR, yBase - 0.25, 0), V(baseR, yBase - 0.25, 0)]));
  dims.add(mkLine([V(-baseR, yBase - 0.35, 0), V(-baseR, yBase - 0.15, 0)]));
  dims.add(mkLine([V(baseR, yBase - 0.35, 0), V(baseR, yBase - 0.15, 0)]));
  dims.add(mkLine([V(baseR + 0.35, yBase, 0), V(baseR + 0.35, yTop, 0)]));
  dims.add(mkLine([V(-topR, yTop + 0.3, 0), V(topR, yTop + 0.3, 0)]));
  group.add(dims);
  const anchors = { d: V(0, yBase - 0.25, 0), h: V(baseR + 0.35, (yBase + yTop) / 2, 0), t: V(0, yTop + 0.3, 0) };

  // chão com sombra suave
  const floor = new THREE.Mesh(new THREE.CircleGeometry(3.3, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.14 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -(S2 - SMID) * Math.cos(ALPHA_F) - 0.01;
  scene.add(floor);

  /* ----- atualização por rolagem ----- */
  const tmp = new THREE.Vector3();
  const pos = geo.attributes.position;
  let target = 0, smooth = 0, moving = false;

  const build = p => {
    const pCut = ease(seg(p, ...STAGES[0]));
    const pRoll = ease(seg(p, ...STAGES[1]));
    const pWeld = seg(p, ...STAGES[2]);
    const pLine = ease(seg(p, ...STAGES[3]));
    const pRing = ease(seg(p, ...STAGES[4]));
    const pDim = seg(p, ...STAGES[5]);

    const alpha = lerp(Math.PI / 2 - 0.0001, ALPHA_F, pRoll);

    // posições + centro
    let cx = 0, cy = 0, cz = 0;
    for (let i = 0; i <= NU; i++) for (let j = 0; j <= NV; j++) {
      conePos(i / NU, j / NV, alpha, tmp);
      const k = i * (NV + 1) + j;
      pos.array[k * 3] = tmp.x; pos.array[k * 3 + 1] = tmp.y; pos.array[k * 3 + 2] = tmp.z;
      cx += tmp.x; cy += tmp.y; cz += tmp.z;
    }
    cx /= vertCount; cy /= vertCount; cz /= vertCount;
    for (let k = 0; k < vertCount; k++) { pos.array[k * 3] -= cx; pos.array[k * 3 + 1] -= cy; pos.array[k * 3 + 2] -= cz; }
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    // corte: revela a chapa ao longo do ângulo
    const cut = Math.max(1, Math.round(NU * pCut));
    geo.setDrawRange(0, cut * NV * 6);
    const cutting = pCut > 0 && pCut < 1;
    const cu = cut / NU;
    conePos(cu, 1, alpha, tmp);
    spark.position.set(tmp.x - cx, tmp.y - cy + 0.02, tmp.z - cz);
    torch.position.copy(spark.position);
    spark.visible = cutting;
    torch.intensity = cutting ? 2.2 + Math.random() * 0.8 : 0;
    if (cutting && moving) emit(spark.position.x, spark.position.y, spark.position.z, 6, 1);

    // solda: cordão incandescente que esfria até a cor do aço
    let welding = false;
    seams.forEach((m, n) => {
      const grow = clamp(pWeld * 4.5 - n * 0.5);   // costuras em sequência, com sobreposição
      m.visible = pWeld > 0 && grow > 0.02 && pLine < 0.6;
      if (!m.visible) return;
      const pts = [];
      for (let j = 0; j <= 10; j++) {
        conePos(SEAMS[n] + 0.0005, (j / 10) * grow, alpha, tmp);
        tmp.multiplyScalar(1.01);
        pts.push(new THREE.Vector3(tmp.x - cx, tmp.y - cy, tmp.z - cz));
      }
      m.geometry.dispose();
      m.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.035, 6, false);
      const cool = Math.max(clamp((pWeld * 4.5 - n * 0.5 - 1) * 2), clamp((p - STAGES[2][1]) / 0.06)); // esfria depois de completo
      const col = m.material.color;
      if (grow < 1) col.copy(HOT).lerp(WARM, 0.4); else col.copy(WARM).lerp(COLD, cool);
      if (grow > 0 && grow < 1) {
        welding = true;
        const tip = pts[pts.length - 1];
        if (moving) emit(tip.x, tip.y, tip.z, 8, 0.9);
        torch.position.copy(tip); torch.intensity = 2.6 + Math.random();
      }
    });
    if (!cutting && !welding) torch.intensity = 0;

    // revestimento
    meshMat.opacity = pLine;
    steelMat.color.setHex(0x564a43).lerp(new THREE.Color(0x3f342e), pLine);

    // anel superior desce e encaixa
    const ro = Math.min(1, pRing * 1.6);
    ringMats.forEach(m => { m.opacity = ro; m.transparent = ro < 1; m.depthWrite = ro >= 1; });
    if (pRing > 0.97 && pRing < 0.995 && moving) emit(0, (SMID - S1) * Math.cos(ALPHA_F), 0, 20, 1.4);
    ring.position.set(0, (SMID - S1) * Math.cos(ALPHA_F) + (1 - pRing) * 2.4, 0);
    ring.visible = pRing > 0;

    // cotas
    const rvHide = 1 - seg(p, 0.87, 0.9);
    dimMat.opacity = pDim * rvHide;
    dims.visible = pDim > 0 && rvHide > 0;

    // câmera e rotação
    const pc = ease(clamp(p / 0.4));
    // aproxima na solda, afasta na montagem: movimento de câmera de cinema
    const close = Math.sin(Math.PI * seg(p, 0.32, 0.6)) * 0.24;
    const dist = 1 - close;
    camera.position.set(Math.sin(p * 3) * 0.6, lerp(19, 6.6, pc) * (1 - close * 0.5), lerp(4, 11.2, pc) * dist);
    camera.lookAt(0, lerp(0, 0.05, pc) + close * 0.4, 0);
    // uma volta completa até a inspeção, depois a peça assenta de frente para as cotas
    group.rotation.y = -0.6 + Math.PI * 2 * ease(clamp(p / 0.78)) + Math.sin(p * 9) * 0.04 * seg(p, 0.78, 1);

    // na revelação o modelo desliza para a esquerda
    const rv = ease(seg(p, 0.88, 0.96));
    group.position.x = -rv * (innerWidth > 860 ? 2.8 : 0);
    group.position.y = rv * (innerWidth > 860 ? 0 : -0.6);
    floor.position.x = group.position.x;

    // rótulos das cotas (projeção 3D -> tela)
    const show = pDim > 0.4 && rv < 0.5;
    Object.entries(anchors).forEach(([k, v]) => {
      const w = v.clone(); group.localToWorld(w); w.project(camera);
      const el = labels[k];
      el.style.left = (w.x * 0.5 + 0.5) * innerWidth + 'px';
      el.style.top = (-w.y * 0.5 + 0.5) * innerHeight + 'px';
      el.style.opacity = show ? 1 : 0;
    });
  };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // em telas largas o cone fica à direita do texto
    camera.setViewOffset(w, h, innerWidth > 860 ? -w * 0.14 : 0, innerWidth > 860 ? 0 : h * 0.12, w, h);
    camera.updateProjectionMatrix();
  };
  addEventListener('resize', resize);
  resize();

  const onScroll = () => { target = storyProgress(); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll(); smooth = target;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loop = () => {
    const before = smooth;
    smooth += (target - smooth) * (reduce ? 1 : 0.09);
    if (Math.abs(target - smooth) < 0.0002) smooth = target;
    moving = Math.abs(smooth - before) > 0.00005 || Math.random() < 0.15;
    build(smooth);
    stepSparks();
    updateHud(smooth);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  loop();
})();

/* ---------------- galeria horizontal ---------------- */
(() => {
  const works = document.getElementById('works');
  const track = document.getElementById('track');
  if (!works || !track) return;
  const bar = document.getElementById('worksBar');
  const num = document.getElementById('workNum');
  const cards = [...track.children];

  const size = () => {
    const extra = track.scrollWidth - innerWidth + 48;
    works.style.height = (innerHeight + Math.max(0, extra)) + 'px';
    return extra;
  };
  let extra = size();
  addEventListener('resize', () => { extra = size(); });

  const update = () => {
    const r = works.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)));
    track.style.transform = `translate3d(${-p * extra}px,0,0)`;
    bar.style.width = p * 100 + '%';
    const total = cards.filter(c => !c.classList.contains('work--end')).length;
    const i = Math.min(total, Math.round(p * (cards.length - 1)) + 1);
    num.textContent = String(i).padStart(2, '0');
    // leve paralaxe nas fotos
    cards.forEach(c => {
      const img = c.querySelector('img');
      if (!img) return;
      const cr = c.getBoundingClientRect();
      const off = (cr.left + cr.width / 2 - innerWidth / 2) / innerWidth;
      img.style.transform = `scale(1.12) translateX(${off * -24}px)`;
    });
  };
  addEventListener('scroll', update, { passive: true });
  update();
})();
