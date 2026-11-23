---
version: 1.0
name: Recal-design-system
description: Sistema visual do site da Recal Estruturas e Caldeiraria (Ipatinga, MG). Linguagem industrial e técnica, de chão de fábrica: azul-marinho profundo como base de autoridade, verde Recal para ação, verde-menta como brilho técnico nas superfícies escuras. Títulos em Barlow Condensed (fonte condensada e robusta, como placas e desenhos técnicos), texto em Barlow e detalhes técnicos em IBM Plex Mono. Fotos reais de peças fabricadas e de colaboradores são a matéria-prima: nada de ilustração genérica.

colors:
  primary: "#1e9a52"          # verde Recal: botões principais, rótulos, destaques
  primary-hover: "#157a40"
  primary-soft: "#e7f4ec"      # fundos de ícones e itens selecionados
  primary-soft-strong: "#f3fbf6"
  navy: "#143456"              # topo, rodapé, faixas institucionais
  navy-deep: "#0f2540"         # painéis escuros (ficha do orçamento, seções de números)
  navy-night: "#071423"        # primeira tela e fundos de foto
  navy-timeline: "#0b1b2e"     # linha do tempo
  blue: "#1f4f86"
  mint: "#9ff0bf"              # brilho técnico SOMENTE sobre fundo escuro
  mint-strong: "#3ee07f"       # pontos "ao vivo", barras de progresso
  mint-label: "#7fe0a6"        # rótulos sobre fundo escuro
  ink: "#16201b"               # títulos
  text: "#38433d"              # texto corrido
  muted: "#6b756f"             # apoio, legendas
  line: "#e2e5e0"              # bordas e divisores
  line-hover: "#a9c9b5"
  paper: "#f4f5f2"             # fundo alternado das seções claras
  white: "#ffffff"
  input-bg: "#fbfcfb"
  yellow: "#f2b200"            # selo de demanda / alerta leve
  emergency: "#d9822b"         # demanda "Emergência"
  emergency-soft: "#fff5ea"
  error: "#c8372d"

typography:
  display-xl:                  # título da primeira tela
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: clamp(38px, min(4.3vw, 8vh), 78px)
    fontWeight: 800
    lineHeight: 0.93
    letterSpacing: -0.005em
  display-lg:                  # títulos de seção (.title)
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: clamp(34px, 4.2vw, 52px)
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: -0.005em
  display-number:              # números de capacidade (500 t, 38,1 mm)
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: clamp(38px, 6.6vh, 66px)
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.01em
  title-md:                    # títulos de cartão
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: 21px
    fontWeight: 700
    lineHeight: 1.1
  body-md:
    fontFamily: "Barlow, system-ui, Segoe UI, Roboto, sans-serif"
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.65
  body-sm:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: 14.5px
    fontWeight: 400
    lineHeight: 1.55
  label:                       # rótulo de seção com traço ("— SERVIÇOS")
    fontFamily: "Barlow, sans-serif"
    fontSize: 13px
    fontWeight: 700
    letterSpacing: 0.14em
    textTransform: uppercase
  mono:                        # dados técnicos, contadores, fichas, fontes
    fontFamily: "IBM Plex Mono, ui-monospace, Consolas, monospace"
    fontSize: 11-13px
    fontWeight: 400-500
    letterSpacing: 0.12em-0.22em
    textTransform: uppercase
  button:
    fontFamily: "Barlow, sans-serif"
    fontSize: 15px (16px no tamanho grande)
    fontWeight: 600
    lineHeight: 1

rounded:
  xs: 4px       # botões
  sm: 6px       # cartões, campos, imagens
  md: 8px       # opções do formulário, cartões de peça
  lg: 10px      # quadros grandes (orçamento, capacidade)
  xl: 12px
  pill: 999px   # chips, selos, aviso de cookies

spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  head-gap: 56px          # título da seção → conteúdo
  section: 110px          # padding vertical das seções (80px no celular)
  container: min(1200px, 100% - 48px)

motion:
  ease: cubic-bezier(.2, .7, .2, 1)
  reveal: elementos sobem 24px e aparecem ao entrar na tela; voltam ao estado inicial ao sair por baixo
  scan: troca de peças por linha de luz verde-menta (1,4 s), com faixa em "modo projeto técnico" atrás
  drift: zoom lento de 6 a 9 s nas fotos de destaque
  reduced-motion: todas as animações são desligadas com prefers-reduced-motion

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    hoverBackground: "{colors.primary-hover}"
    textColor: "{colors.white}"
    rounded: "{rounded.xs}"
    padding: 13px 24px (16px 30px no grande)
  button-outline:
    backgroundColor: "{colors.white}"
    border: 2px solid {colors.line}
    textColor: "{colors.ink}"
  button-outline-light:        # sobre foto ou fundo escuro
    border: 2px solid rgba(255,255,255,.7)
    textColor: "{colors.white}"
    hover: fundo branco, texto {colors.ink}
  button-white:                # dentro de faixa azul
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
  topbar:
    backgroundColor: "{colors.navy}"
    height: 40px
    fontSize: 13.5px
  header:
    backgroundColor: "{colors.white}"
    height: 78px
    border: 1px solid {colors.line}
    sticky: true
  hero-split:                  # primeira tela
    background: "{colors.navy-night}"
    left: fotos da equipe (alternam a cada 7 s)
    right: peças fabricadas (trocam a cada 4,6 s por varredura)
    division: degradê horizontal com mask-image, nunca uma linha reta
  section-head:
    left: label + título
    right: parágrafo de apoio em {colors.muted}, alinhado à base
  service-card:
    background: "{colors.white}"
    border: 1px solid {colors.line}
    rounded: "{rounded.sm}"
    icon: 44px, fundo {colors.primary-soft}, traço {colors.primary}
    hover: sobe 4px, filete verde de 3px no topo
  capacity-card:
    rounded: "{rounded.lg}"
    variants: claro (branco) e escuro ({colors.navy-deep})
    number: "{typography.display-number}" com unidade em {colors.primary}
    source: legenda mono "FONTE: RELATÓRIO 2023"
  quote-wizard:
    steps: 3 (Demanda → Detalhes → Contato)
    options: cartões com ícone (seleção = borda e ícone verdes)
    chips: pílulas; selecionado = fundo {colors.navy}
    live-sheet: painel {colors.navy-deep} com texto mono, atualizado em tempo real
    send: somente WhatsApp
  text-input:
    background: "{colors.input-bg}"
    border: 1.5px solid {colors.line}
    rounded: "{rounded.sm}"
    focus: borda {colors.primary} + halo rgba(30,154,82,.12)
  cookie-banner:
    background: "{colors.navy}"
    rounded: 14px
    accept: fundo {colors.mint}, texto {colors.navy}
  footer:
    background: "{colors.navy}"
    textColor: rgba(255,255,255,.75)
    credit: "Criado e acompanhado por" + marca BarchMind (preta/verde-limão, fonte Montserrat)
---

# Recal · Sistema de design

> Leia este arquivo antes de criar ou alterar qualquer parte visual do site da Recal. Use os tokens, a tipografia e os componentes definidos aqui. Se algo novo for necessário, derive dos valores existentes em vez de inventar cores ou fontes.

## Overview

A Recal é uma caldeiraria pesada com mais de 20 anos em Ipatinga. O site precisa transmitir **tamanho, precisão e gente de verdade**. A linguagem visual vem do próprio chão de fábrica:

- **Azul-marinho** como base institucional (autoridade, indústria, siderurgia).
- **Verde Recal** como cor de ação: todo botão principal e todo rótulo de seção é verde.
- **Verde-menta** como "luz técnica": aparece só sobre fundos escuros, em linhas de varredura, progresso, unidades e destaques. Nunca usar menta sobre fundo branco.
- **Fotos reais** de peças e de colaboradores são o principal recurso visual. Ilustrações genéricas e banco de imagens não combinam com a marca.
- **Detalhes de desenho técnico** (fonte mono, grades sutis, cantos em colchete, legendas em caixa-alta) reforçam a engenharia, sempre com moderação.

O arquivo de referência dos estilos é `styles.css` (tokens em `:root`). Páginas internas usam também `paginas.css`; a primeira tela usa `inicio.css`; a linha do tempo e a capacidade usam `abertura.css`.

## Colors

### Marca e ação
- `primary` #1e9a52: botões principais, rótulos de seção, ícones, estado selecionado.
- `primary-hover` #157a40: hover dos botões e links verdes.
- `primary-soft` #e7f4ec: fundo de ícones, halo de foco.

### Base institucional
- `navy` #143456: faixa do topo, rodapé, chips selecionados, aviso de cookies.
- `navy-deep` #0f2540, `navy-night` #071423, `navy-timeline` #0b1b2e: superfícies escuras em camadas (ficha do orçamento, primeira tela, linha do tempo).

### Luz técnica (só sobre escuro)
- `mint` #9ff0bf, `mint-strong` #3ee07f, `mint-label` #7fe0a6.

### Texto e superfícies
- `ink` #16201b (títulos), `text` #38433d (corrido), `muted` #6b756f (apoio).
- `paper` #f4f5f2 alterna com branco entre seções; `line` #e2e5e0 para bordas.

### Estados
- `error` #c8372d. `emergency` #d9822b com fundo `emergency-soft` #fff5ea só para a demanda de emergência no orçamento. `yellow` #f2b200 para o rótulo de demanda na ficha.

## Typography

### Famílias
- **Barlow Condensed** (700–800): todos os títulos, números de capacidade, nomes de peças.
- **Barlow** (400–700): texto corrido, botões, navegação.
- **IBM Plex Mono** (400–500): contadores ("01 / 08"), fichas técnicas, legendas de fonte, código de orçamento (RC-0000).
- Todas carregadas do Google Fonts no mesmo `<link>`.

### Hierarquia
| Uso | Fonte | Tamanho | Peso |
|---|---|---|---|
| Título da primeira tela | Barlow Condensed | clamp(38px, 4.3vw/8vh, 78px) | 800 |
| Título de seção | Barlow Condensed | clamp(34px, 4.2vw, 52px) | 700 |
| Número de capacidade | Barlow Condensed | clamp(38px, 6.6vh, 66px) | 800 |
| Título de cartão | Barlow Condensed | 21px | 700 |
| Texto corrido | Barlow | 17px / 1.65 | 400 |
| Texto de cartão | Barlow | 14–14.5px / 1.5 | 400 |
| Rótulo de seção | Barlow | 13px, caixa-alta, 0.14em | 700 |
| Dado técnico | IBM Plex Mono | 11–13px, caixa-alta, 0.12–0.22em | 400–500 |

### Princípios
- Títulos curtos e diretos, com uma palavra-chave em destaque (`<em>` em verde ou menta).
- Unidades de medida menores e coloridas ao lado do número (`500<small>t</small>`).
- Nunca usar fonte serifada nem script.

## Layout

### Espaçamento
- Seções com 110px de padding vertical (80px no celular).
- Cabeçalho de seção em duas colunas: rótulo + título à esquerda, apoio à direita, 56px até o conteúdo.
- Container: min(1200px, 100% − 48px).

### Caber na tela
- Blocos-chave (primeira tela, capacidade, serviços, orçamento) devem caber inteiros numa tela de 1366×768 a 100% de zoom. Tamanhos que dependem da altura usam `vh` dentro de `clamp()`.

## Elevation & Depth
- Sombras suaves e azuladas: `0 22px 40px -24px rgba(20,32,27,.3)` em hover de cartões; `0 40px 80px -40px rgba(15,37,64,.35)` em quadros grandes.
- Profundidade nas áreas escuras vem de camadas de navy, degradês e grades de 64–72px com 3% de opacidade, não de sombras.

## Shapes
- Raios pequenos e técnicos: 4px (botões), 6px (cartões e campos), 8–10px (quadros), 999px (chips e selos).
- Cantos em colchete e linhas finas como moldura técnica, nunca formas orgânicas ou blobs.

### Fotografia
- Peças fotografadas no galpão, de preferência com pessoas na cena para dar escala.
- Colaboradores sempre sorrindo e com EPI quando no galpão.
- Fotos de destaque recebem um zoom lento (drift) e tratamento azul-escuro por cima para unificar a cor.

## Components

### Navegação
Faixa azul de 40px (endereço, "Recal em 90 segundos", telefone, horário, Instagram) + cabeçalho branco fixo de 78px com logo, links e botão verde "Solicitar orçamento".

### Botões
Primário verde; contorno claro sobre fotos; branco dentro de faixas azuis. Texto sempre com verbo de ação ("Solicitar orçamento", "Ver peças fabricadas").

### Cartões de serviço
Ícone de 44px ao lado do título, descrição curta e especificações em linha separadas por "·" em verde. Link "Solicitar orçamento →".

### Cartões de capacidade
Número grande, título, uma linha de detalhe e a fonte do dado em mono. Alternam claro e escuro.

### Orçamento (assistente em 3 passos)
1. Demanda e serviço (cartões com ícone). 2. Detalhes rápidos e opcionais (desenho/fotos, prazo, contador de peças, uma frase, atalhos). 3. Contato com consentimento LGPD. A ficha ao vivo à direita mostra o pedido em mono e a barra de precisão. Envio só por WhatsApp.

### Faixa de clientes
Logos em carrossel infinito, com destaque maior para Usiminas e Aperam.

### Rodapé
Navy, quatro colunas, links legais (Política, Termos, Preferências de cookies) e o crédito "Criado e acompanhado por BarchMind".

## Do's and Don'ts

### Do
- Usar fotos reais da Recal e números com fonte citada.
- Manter verde para ação e navy para estrutura.
- Usar menta só como luz sobre fundos escuros.
- Testar se o bloco cabe na tela a 100% antes de entregar.
- Respeitar `prefers-reduced-motion`.

### Don't
- Não usar a paleta creme/coral ou fontes serifadas.
- Não inventar medidas, certificações ou clientes.
- Não colocar mais de uma cor de destaque no mesmo bloco.
- Não usar divisões retas entre fotos na primeira tela: use degradê.
- Não carregar scripts de terceiros sem necessidade (Three.js e QR code são locais).

## Responsive Behavior

### Breakpoints
- 1250px: menos miniaturas na primeira tela.
- 1100px / 1000px: capacidade em 2 colunas; primeira tela vira coluna com degradê vertical.
- 900px: serviços e opções do orçamento em 2 colunas.
- 600px: tudo em 1 coluna, seções com 80px de padding.

### Toque
Áreas clicáveis com no mínimo 44px; botões lado a lado no celular quando couberem.

## Iteration Guide
1. Comece pelos tokens de `:root` em `styles.css`.
2. Reaproveite `.section`, `.head`, `.label`, `.title`, `.btn`.
3. Para blocos novos, crie classes com prefixo próprio (ex.: `.hx__` na primeira tela) para não colidir com as existentes.
4. Aumente o `?v=` do CSS e do JS no HTML a cada mudança.

## Known Gaps
- Logos de clientes ainda em baixa resolução.
- Só duas fotos de colaboradores; mais fotos fortaleceriam a primeira tela.
- Textos legais com campos [ ] pendentes até o fechamento da proposta.
