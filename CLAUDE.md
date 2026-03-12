# 🏦 Santos Imobiliário Online — Planejamento do Projeto

## Visão Geral

Jogo estilo Santos Imobiliário (Monopoly) rodando diretamente no navegador.
Suporte a single player (contra bots), multiplayer local e multiplayer online.

- **Frontend:** HTML + CSS + JavaScript (vanilla ou framework leve)
- **Multiplayer:** Firebase Realtime Database (fase inicial)
- **Bots:** Lógica local em JS, sem IA externa
- **Jogadores por partida:** 2 a 6 (humanos + bots)

---

## Fases do Desenvolvimento

### ✅ FASE 1 — Core do Jogo (Single Player)
> Objetivo: toda a lógica funciona localmente, sem rede

- [ ] Estrutura de dados do tabuleiro (casas, propriedades, tipos)
- [ ] Estado da partida (jogadores, dinheiro, posições, propriedades)
- [ ] Turno: rolar dados → mover → aplicar efeito da casa
- [ ] Compra de propriedades
- [ ] Pagamento de aluguel
- [ ] Construção de casas e hotéis
- [ ] Cartas de Sorte/Revés
- [ ] Casas especiais: Prisão, Imposto, Salário, Estacionamento
- [ ] Negociação entre jogadores
- [ ] Hipoteca de propriedades
- [ ] Condição de vitória/derrota (falência)
- [ ] Interface visual do tabuleiro
- [ ] Interface de ações do jogador

---

### 🤖 FASE 2 — Sistema de Bots

- [ ] Interface `Player` unificada (humano e bot usam a mesma API)
- [ ] Bot Fácil: compra aleatória, sem negociação
- [ ] Bot Médio: compra estratégica por grupo de cor, negociação básica
- [ ] Bot Difícil: monta monopólios, bloqueia adversários, negocia ativamente
- [ ] Delay artificial nas ações do bot (UX — parecer mais humano)
- [ ] Modo single player completo: 1 humano + 1 a 5 bots

---

### 🌐 FASE 3 — Multiplayer Online (Firebase)

- [ ] Setup Firebase (Realtime Database)
- [ ] Criar/entrar em sala com código
- [ ] Sincronização do estado da partida em tempo real
- [ ] Sistema de turnos online (lock de ação)
- [ ] Tratamento de desconexão → jogador vira bot automaticamente
- [ ] Chat simples entre jogadores
- [ ] Lobby com lista de salas abertas (opcional)

---

### 🎨 FASE 4 — Polimento

- [ ] Animações de movimento de peças
- [ ] Sons (dados, compra, falência)
- [ ] Responsividade mobile
- [ ] Temas visuais (clássico, moderno)
- [ ] Histórico de ações da partida
- [ ] Timer de turno (evitar jogador AFK)

---

## Estrutura de Arquivos Sugerida

```
/
├── index.html
├── style.css
├── app.js                  ← entry point
│
├── core/
│   ├── board.js            ← definição do tabuleiro e casas
│   ├── game.js             ← estado e controle da partida
│   ├── player.js           ← classe base do jogador
│   ├── dice.js             ← lógica dos dados
│   ├── cards.js            ← cartas sorte/revés
│   ├── auction.js          ← leilão de propriedades
│   └── rules.js            ← regras e constantes
│
├── bots/
│   ├── bot-base.js         ← classe base do bot
│   ├── bot-easy.js
│   ├── bot-medium.js
│   └── bot-hard.js
│
├── multiplayer/
│   ├── firebase-config.js
│   ├── room.js             ← criar/entrar sala
│   └── sync.js             ← sincronização de estado
│
├── ui/
│   ├── board-render.js     ← renderização do tabuleiro
│   ├── player-panel.js     ← painel de jogadores
│   ├── trade-modal.js      ← modal de negociação
│   └── notifications.js    ← mensagens de evento
│
└── assets/
    ├── images/
    └── sounds/
```

---

## Estrutura de Dados Principal

### Tabuleiro
```javascript
const board = [
  { id: 0,  type: 'start',    name: 'Ponto de Partida', salary: 2000 },
  { id: 1,  type: 'property', name: 'Rua...',  price: 600,  rent: [50,250,750,...], color: 'purple',  group: 1 },
  { id: 2,  type: 'chest',    name: 'Sorte/Revés' },
  { id: 4,  type: 'tax',      name: 'Imposto',  amount: 200 },
  { id: 5,  type: 'station',  name: 'Estação 1', price: 2000 },
  { id: 10, type: 'jail',     name: 'Prisão / Visita' },
  { id: 20, type: 'parking',  name: 'Estacionamento Grátis' },
  { id: 30, type: 'go-jail',  name: 'Vá para a Prisão' },
  // ... 40 casas total
]
```

### Estado da Partida
```javascript
const gameState = {
  id: 'uuid-da-partida',
  status: 'waiting' | 'playing' | 'finished',
  currentTurn: 0,           // índice do jogador atual
  round: 1,
  players: [...],
  board: [...],
  deck: { chest: [...], chance: [...] },
  log: [],                  // histórico de ações
}
```

### Jogador
```javascript
const player = {
  id: 'p1',
  name: 'Fabricio',
  type: 'human' | 'bot',
  botLevel: null | 'easy' | 'medium' | 'hard',
  color: '#e74c3c',
  piece: 'car',             // peça no tabuleiro
  position: 0,
  money: 15000,
  properties: [],           // ids das propriedades
  inJail: false,
  jailTurns: 0,
  jailCards: 0,             // cartas "sair da prisão"
  bankrupt: false,
  connected: true,          // para multiplayer
}
```

### Propriedade
```javascript
const property = {
  boardId: 1,
  ownerId: null,
  houses: 0,                // 0–4 casas, 5 = hotel
  mortgaged: false,
  // Aluguel: [sem casa, 1 casa, 2 casas, 3 casas, 4 casas, hotel]
  rent: [50, 250, 750, 2250, 4000, 5500],
}
```

---

## Interface Unificada de Jogador (Humano + Bot)

```javascript
class Player {
  async decideBuy(property) {}        // retorna true/false
  async decideTrade(offer) {}         // retorna aceitar/recusar/contraproposta
  async decideBuild(properties) {}    // retorna onde construir
  async decideMortgage(debt) {}       // retorna o que hipotecar
  async decideAuction(property) {}    // retorna lance
}

// Bot apenas sobrescreve esses métodos com lógica automática
// HumanPlayer espera input da UI
```

---

## Regras Implementadas (versão padrão)

- Salário ao passar pelo ponto de partida: **R$ 2.000**
- Capital inicial por jogador: **R$ 15.000**
- Para construir casas: precisa ter o **grupo completo**
- Prisão: fica 3 turnos ou paga **R$ 500** ou usa carta
- Falência: ao não conseguir pagar, declara falência — propriedades vão a leilão
- Leilão: quando jogador recusa compra ou vai à falência
- Imposto de luxo: valor fixo ou % do patrimônio (configurável)

---

## Configurações da Partida (configuráveis antes de iniciar)

```javascript
const config = {
  startingMoney: 15000,
  salary: 2000,
  maxHouses: 32,
  maxHotels: 12,
  auctionOnRefuse: true,
  freeParkingJackpot: false,   // variante popular
  turnTimeLimit: 60,           // segundos, 0 = sem limite
  doublesGoToJail: true,       // 3x dupla = prisão
}
```

---

## Stack Técnica

| Camada | Tecnologia | Motivo |
|---|---|---|
| UI/Lógica | HTML + CSS + JS Vanilla | Zero dependências, roda em qualquer browser |
| Multiplayer | Firebase Realtime DB | Sem backend próprio, gratuito para escala inicial |
| Hosting | Firebase Hosting / GitHub Pages | Fácil deploy, HTTPS grátis |
| Futuro (escala) | Node.js + Socket.io + Azure | Quando precisar de controle total |

---

## Ordem de Implementação Recomendada

1. Definir e renderizar o tabuleiro (visual estático)
2. Criar estado da partida e lógica de turno
3. Implementar movimento de peças + efeitos de casa
4. Compra, aluguel, construção
5. Cartas sorte/revés
6. Prisão, impostos, casas especiais
7. Negociação e hipoteca
8. Falência e fim de jogo
9. Bots (fácil → médio → difícil)
10. Multiplayer online (Firebase)
11. Polimento visual e UX

---

## 🎨 Guia de Assets Gráficos

### Filosofia: Code-First

Priorizar geração gráfica via **código (SVG/CSS)** ao invés de imagens externas.
Vantagens: sem dependência de arquivos, responsivo, fácil de tematizar, leve.

---

### Tabuleiro — CSS Grid

O tabuleiro é um grid 11x11 onde apenas as bordas são ocupadas (40 casas).
O centro fica livre para exibir cartas sorteadas, dados e informações da rodada.

```
┌──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┐
│39│38│37│36│35│34│33│32│31│30│29│
├──┼──┴──┴──┴──┴──┴──┴──┴──┴──┼──┤
│40│                           │28│
├──┤      CENTRO DO            ├──┤
│ 1│      TABULEIRO            │27│
├──┤    (dados, cartas,        ├──┤
│ 2│     log de ações)         │26│
├──┤                           ├──┤
│..│                           │..│
├──┼──┬──┬──┬──┬──┬──┬──┬──┬──┼──┤
│10│11│12│13│14│15│16│17│18│19│20│
└──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┘
```

```css
.board {
  display: grid;
  grid-template-columns: 80px repeat(9, 60px) 80px;
  grid-template-rows: 80px repeat(9, 60px) 80px;
  width: fit-content;
}

/* Casas de canto: maiores (80x80px) */
/* Casas normais: 60x80px (rotacionadas nas laterais) */
```

Cada casa é um `<div>` com classes baseadas no tipo:
`.cell-property`, `.cell-jail`, `.cell-tax`, `.cell-chest`, `.cell-station`

---

### Casas do Tabuleiro — Estrutura HTML por tipo

```html
<!-- Propriedade -->
<div class="cell cell-property" data-id="1">
  <div class="cell-color-bar" style="background:#9b59b6"></div>
  <span class="cell-name">Rua das Flores</span>
  <span class="cell-price">R$ 600</span>
  <!-- mini-houses renderizadas dinamicamente -->
</div>

<!-- Casa especial -->
<div class="cell cell-jail">
  <svg><!-- ícone SVG inline --></svg>
  <span>Prisão / Visita</span>
</div>
```

---

### Peças dos Jogadores — SVG Inline

Peças geradas em SVG puro, coloridas dinamicamente pela cor do jogador.
Não usar imagens externas — cada peça é um SVG embutido no JS.

```javascript
const PIECES = {
  car: `<svg viewBox="0 0 24 24">
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11
             c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1
             c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"
          fill="currentColor"/>
  </svg>`,
  hat:  `<svg>...</svg>`,
  ship: `<svg>...</svg>`,
  iron: `<svg>...</svg>`,
  boot: `<svg>...</svg>`,
  dog:  `<svg>...</svg>`,
}

// Aplicar cor do jogador via CSS currentColor
piece.style.color = player.color
```

Fontes de SVGs gratuitos para peças:
- **SVGRepo** (svgrepo.com) — buscar: car, top hat, battleship, iron, boot, dog
- **Iconify** (iconify.design) — biblioteca com +200k ícones, exporta SVG

---

### Dados — CSS + JS Animado

Dados gerados 100% em CSS/HTML, sem imagem.

```html
<div class="die" data-value="4">
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
  <span class="dot"></span>
</div>
```

```css
.die {
  width: 60px; height: 60px;
  border-radius: 10px;
  background: white;
  border: 2px solid #333;
  display: grid;
  padding: 8px;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
}

.dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: #222;
}

/* Animação de rolagem */
@keyframes roll {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}
.die.rolling { animation: roll 0.6s ease-out; }
```

---

### Cartas Sorte / Revés — HTML Estilizado

```html
<div class="card card-chest">
  <div class="card-header">📦 Sorte</div>
  <div class="card-icon">🏆</div>
  <div class="card-text">Você ganhou o prêmio de beleza da vizinhança. Receba R$ 500.</div>
  <div class="card-value">+ R$ 500</div>
</div>
```

```css
.card {
  width: 200px; height: 280px;
  border-radius: 12px;
  padding: 20px;
  font-family: 'Georgia', serif;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.card-chest  { background: linear-gradient(135deg, #f39c12, #e67e22); color: white; }
.card-chance { background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; }
```

---

### Título de Propriedade — SVG/HTML

```html
<div class="deed">
  <div class="deed-color" style="background:#9b59b6">TÍTULO DE POSSE</div>
  <div class="deed-name">Rua das Flores</div>
  <div class="deed-rent">
    <p>Aluguel............. R$ 50</p>
    <p>Com 1 casa......... R$ 250</p>
    <p>Com 2 casas........ R$ 750</p>
    <p>Com 3 casas........ R$ 2.250</p>
    <p>Com 4 casas........ R$ 4.000</p>
    <p>Com HOTEL.......... R$ 5.500</p>
  </div>
  <div class="deed-build">Casa R$ 500 · Hotel R$ 500</div>
  <div class="deed-mortgage">Hipoteca: R$ 300</div>
</div>
```

---

### Cédulas de Dinheiro — HTML Estilizado

```javascript
const BILL_COLORS = {
  1:    { bg: '#95a5a6', text: '#2c3e50' },
  5:    { bg: '#27ae60', text: 'white'   },
  10:   { bg: '#2980b9', text: 'white'   },
  50:   { bg: '#8e44ad', text: 'white'   },
  100:  { bg: '#e67e22', text: 'white'   },
  500:  { bg: '#e74c3c', text: 'white'   },
  1000: { bg: '#f1c40f', text: '#2c3e50' },
}

function renderBill(value) {
  const { bg, text } = BILL_COLORS[value]
  return `
    <div class="bill" style="background:${bg}; color:${text}">
      <span class="bill-corner">${value}</span>
      <span class="bill-center">R$ ${value}</span>
      <span class="bill-corner">${value}</span>
    </div>`
}
```

---

### Casas e Hotéis — CSS Puro

```css
/* Casa verde */
.house {
  width: 12px; height: 10px;
  background: #27ae60;
  border-radius: 2px 2px 0 0;
  position: relative;
}
.house::before {
  content: '';
  position: absolute;
  top: -6px; left: -2px;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 7px solid #2ecc71;
}

/* Hotel vermelho */
.hotel {
  width: 16px; height: 12px;
  background: #e74c3c;
  border-radius: 2px 2px 0 0;
}
.hotel::before {
  border-bottom-color: #c0392b;
}
```

---

### Ferramentas Externas Gratuitas (assets artísticos opcionais)

| Asset | Ferramenta | Link |
|---|---|---|
| Ícones SVG (peças, símbolos) | SVGRepo | svgrepo.com |
| Ícones UI | Iconify | iconify.design |
| Arte / ilustrações temáticas | Bing Image Creator | bing.com/images/create |
| Arte / ilustrações temáticas | Adobe Firefly | firefly.adobe.com |
| Texto em imagens (cartas) | Ideogram | ideogram.ai |
| Templates editáveis | Canva | canva.com |

> ⚠️ Assets externos (PNG/JPG) devem ficar em `/assets/images/`.
> Sempre ter fallback em CSS caso o arquivo não carregue.

---

### Ordem de Implementação Gráfica Recomendada

1. Tabuleiro em CSS Grid (estrutura, sem estilo fino)
2. Tipos de casas com cores e labels
3. Peças dos jogadores em SVG inline
4. Dados animados em CSS
5. Painel de jogadores (dinheiro, propriedades)
6. Cartas Sorte/Revés (modal animado)
7. Título de propriedade (modal ao clicar na casa)
8. Cédulas de dinheiro (animação de pagamento)
9. Casas e hotéis no tabuleiro
10. Polimento: sombras, transições, tema de cores

---

## Notas para o Claude Code

- Sempre manter a lógica de jogo **separada** da UI (MVC simples)
- Toda ação do jogo deve gerar uma entrada no `gameState.log`
- O estado deve ser **serializável em JSON** para sincronização Firebase
- Bots devem ter delay configurável para não parecerem instantâneos
- Testar cada fase com jogos simulados antes de avançar
- Priorizar funcionalidade antes de animações e polimento visual
- **Gráficos: sempre preferir SVG/CSS inline** — evitar dependência de arquivos externos
- SVGs de peças devem usar `currentColor` para herdar a cor do jogador dinamicamente
- Toda animação deve respeitar `prefers-reduced-motion` para acessibilidade
- Componentes visuais (carta, deed, cédula) devem ser funções JS que retornam HTML string ou DOM node
