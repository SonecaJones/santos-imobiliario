# ♊ Gemini CLI — Diretrizes do Projeto Banco Imobiliário

Este arquivo contém as instruções e padrões específicos para o desenvolvimento do Banco Imobiliário Online, servindo de complemento ao `CLAUDE.md`.

## 🛠 Padrões de Código

- **Modularidade:** Seguir rigorosamente a separação entre Lógica (`core/`) e Interface (`ui/`).
- **Estado Imutável (preferencialmente):** Embora o JS vanilla seja usado, tratar o `gameState` de forma que mudanças sejam rastreáveis para facilitar a futura integração com Firebase.
- **Vanila First:** Evitar bibliotecas externas a menos que estritamente necessário (ex: Firebase).
- **Documentação JSDoc:** Adicionar tipos básicos via JSDoc para facilitar a manutenção.

## 🎨 Padrões Visuais (UI/UX)

- **SVG Inline:** Peças e ícones devem ser injetados via JS como strings SVG para permitir troca de cores dinâmica via `currentColor`.
- **CSS Grid:** O tabuleiro deve ser responsivo e usar `grid-template-areas` ou coordenadas para posicionamento exato.
- **Tokens de Design:** Centralizar cores e medidas no `style.css` usando variáveis CSS.

## 🚀 Fluxo de Trabalho do Gemini

1. **Pesquisa:** Validar a estrutura de dados antes de implementar a lógica de movimento.
2. **Estratégia:** Dividir cada fase do `CLAUDE.md` em pequenos incrementos testáveis.
3. **Execução:** Criar testes manuais ou scripts de log para validar a lógica de compra, aluguel e falência antes de polir a UI.
4. **Validação:** Garantir que o `gameState` possa ser convertido para JSON e restaurado perfeitamente.

---

## Próximos Passos Imediatos

- [ ] Criar estrutura de diretórios.
- [ ] Implementar `core/board.js` (Dados das casas).
- [ ] Implementar `index.html` e `style.css` (Grid básico do tabuleiro).
- [ ] Implementar `ui/board-render.js` (Renderização dinâmica das casas).
