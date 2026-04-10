/**
 * @file ui/board-render.js
 * @description Responsável por renderizar visualmente o tabuleiro no DOM.
 */

import { BOARD } from '../core/board.js';

export function renderBoard(onCellClick) {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;

    // Remove apenas as células antigas, mantém o .board-center se existir
    const existingCells = boardEl.querySelectorAll('.cell');
    existingCells.forEach(cell => cell.remove());

    BOARD.forEach((space, index) => {
        const cell = document.createElement('div');
        cell.className = `cell cell-${space.type}`;
        if (space.mortgaged) cell.classList.add('mortgaged');
        cell.id = `cell-${space.id}`;
        
        // Posicionamento no Grid CSS (1 a 11)
        const { row, col } = getGridPosition(index);
        cell.style.gridRow = row;
        cell.style.gridColumn = col;

        // Clique para ver detalhes
        cell.onclick = () => {
            if (onCellClick) onCellClick(space);
        };

        // Conteúdo da célula
        let innerHTML = '';

        if (space.mortgaged) {
            innerHTML += `<div class="mortgage-badge">HIPOTECADO</div>`;
        }

        // Se tiver cor, renderiza a barra (para properties e stations)
        if (space.color) {
            innerHTML += `<div class="cell-color-bar" style="background-color: ${space.color}"></div>`;
        }

        if (space.type === 'property') {
            // Container de Casas/Hotéis
            if (space.houses > 0) {
                innerHTML += `<div class="houses-container">`;
                if (space.houses === 5) {
                    innerHTML += `<div class="hotel"></div>`;
                } else {
                    for (let i = 0; i < space.houses; i++) {
                        innerHTML += `<div class="house"></div>`;
                    }
                }
                innerHTML += `</div>`;
            }

            innerHTML += `<span class="cell-name">${space.name}</span>`;
            innerHTML += `<span class="cell-price">M$ ${space.price}</span>`;
        } else {
            innerHTML += `<span class="cell-name">${space.name}</span>`;
            if (space.amount) {
                innerHTML += `<span class="cell-price">M$ ${space.amount}</span>`;
            } else if (space.price) {
                innerHTML += `<span class="cell-price">M$ ${space.price}</span>`;
            }
        }

        cell.innerHTML = innerHTML;
        boardEl.appendChild(cell);
    });
}

/**
 * Mapeia o índice da casa (0-39) para coordenadas do Grid (1-11)
 */
export function getGridPosition(index) {
    // 0: Bottom-Right
    if (index === 0) return { row: 11, col: 11 };
    
    // 1-9: Bottom row (Right to Left)
    if (index > 0 && index < 10) return { row: 11, col: 11 - index };
    
    // 10: Bottom-Left
    if (index === 10) return { row: 11, col: 1 };
    
    // 11-19: Left column (Bottom to Top)
    if (index > 10 && index < 20) return { row: 11 - (index - 10), col: 1 };
    
    // 20: Top-Left
    if (index === 20) return { row: 1, col: 1 };
    
    // 21-29: Top row (Left to Right)
    if (index > 20 && index < 30) return { row: 1, col: 1 + (index - 20) };
    
    // 30: Top-Right
    if (index === 30) return { row: 1, col: 11 };
    
    // 31-39: Right column (Top to Bottom)
    if (index > 30 && index < 40) return { row: 1 + (index - 30), col: 11 };

    return { row: 1, col: 1 };
}
