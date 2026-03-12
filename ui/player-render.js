/**
 * @file ui/player-render.js
 * @description Responsável por desenhar as peças dos jogadores no tabuleiro.
 */

const PIECES = {
    car: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
    hat: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6,18 L6,15 C6,11 9,8 12,8 C15,8 18,11 18,15 L18,18 L20,18 L20,20 L4,20 L4,18 L6,18 Z M12,2 C10,2 9,4 9,4 L15,4 C15,4 14,2 12,2 Z"/></svg>`,
    ship: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20,18 L22,15 L18,15 L18,13 L15,13 L15,11 L13,11 L13,9 L11,11 L9,11 L9,13 L6,13 L6,15 L2,15 L4,18 L20,18 Z M1,20 L23,20 L21,22 L3,22 L1,20 Z"/></svg>`
};

export function renderPlayers(players) {
    // 1. Limpa todas as peças existentes
    document.querySelectorAll('.player-piece').forEach(el => el.remove());

    // 2. Renderiza cada jogador na sua casa atual
    players.forEach(player => {
        if (player.bankrupt) return;

        const cellEl = document.getElementById(`cell-${player.position}`);
        if (!cellEl) return;

        // Container para múltiplas peças na mesma casa
        let pieceContainer = cellEl.querySelector('.pieces-container');
        if (!pieceContainer) {
            pieceContainer = document.createElement('div');
            pieceContainer.className = 'pieces-container';
            cellEl.appendChild(pieceContainer);
        }

        const pieceEl = document.createElement('div');
        pieceEl.className = 'player-piece';
        pieceEl.id = `piece-${player.id}`;
        pieceEl.style.color = player.color;
        pieceEl.innerHTML = PIECES[player.piece] || PIECES.car;
        
        // Tooltip simples com nome do jogador
        pieceEl.title = player.name;

        pieceContainer.appendChild(pieceEl);
    });
}
