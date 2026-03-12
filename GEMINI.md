# ♊ Gemini CLI — Diretrizes do Projeto Santos Imobiliário

Este arquivo contém as instruções e padrões específicos para o desenvolvimento do Santos Imobiliário Online, servindo de complemento ao `CLAUDE.md`.

## 🛠 Padrões de Código

- **Modularidade:** Seguir rigorosamente a separação entre Lógica (`core/`) e Interface (`ui/`).
- **Estado Imutável (preferencialmente):** Embora o JS vanilla seja usado, tratar o `gameState` de forma que mudanças sejam rastreáveis para facilitar a futura integração com Firebase.
- **Vanila First:** Evitar bibliotecas externas a menos que estritamente necessário (ex: Firebase).
- **Documentação JSDoc:** Adicionar tipos básicos via JSDoc para facilitar a manutenção.

## 🎨 Padrões Visuais (UI/UX)

- **Estilo Cartoon/HQ:** Uso de bordas grossas pretas, cores vibrantes (Neubrutalismo), sombras sólidas e fontes lúdicas ('Fredoka One', 'Bangers').
- **Responsividade Elástica:** O tabuleiro deve usar unidades `vmin` ou cálculos proporcionais para ocupar o máximo de espaço disponível, mantendo a proporção quadrada.
- **Layout Adaptável:** "Scale & Stack" - Em desktops, layout lado a lado; em mobile, empilhado verticalmente.
- **SVG Inline:** Peças e ícones injetados via JS para permitir estilização dinâmica.

## 🚀 Fluxo de Trabalho do Gemini

1. **Pesquisa:** Validar a estrutura de dados antes de implementar a lógica de movimento.
2. **Estratégia:** Dividir cada fase do `CLAUDE.md` em pequenos incrementos testáveis.
3. **Execução:** Criar testes manuais ou scripts de log para validar a lógica de compra, aluguel e falência antes de polir a UI.
4. **Validação:** Garantir que o `gameState` possa ser convertido para JSON e restaurado perfeitamente.

---

## ✅ Progresso Atual

### Core (Lógica)
- [x] Estrutura de dados do tabuleiro (`core/board.js`).
- [x] Lógica de jogadores e movimento (`core/player.js`).
- [x] Sistema de dados e turnos (`core/dice.js`, `core/game.js`).
- [x] Cartas de Sorte/Revés (`core/cards.js`).
- [x] Compra, Aluguel e Hipoteca (`core/game.js`).

### UI (Interface)
- [x] Renderização do tabuleiro elástico (`ui/board-render.js`, `style.css`).
- [x] Estilo Visual Cartoon/HQ completo.
- [x] Responsividade Mobile (Scale & Stack).
- [x] Painel de jogadores com inventário clicável (`ui/player-panel.js`).
- [x] Animações de dados (`ui/dice-render.js`).
- [x] Modais de decisão, alertas e títulos de posse (`ui/notifications.js`).
- [x] Efeitos visuais (Partículas, Dinheiro Flutuante).

## 🚀 Próximos Passos

- [ ] Implementar sistema de **Leilão** quando um jogador recusa a compra.
- [ ] Melhorar a **IA dos Bots** (tomada de decisão mais inteligente para trocas/construção).
- [ ] Implementar **Multiplayer Online** (WebSocket/Firebase).
- [ ] Adicionar tela de **Vitoria/Game Over**.
- [ ] Persistência de estado local (`localStorage`) para retomar partidas.
