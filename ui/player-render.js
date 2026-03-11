/**
 * @file ui/player-render.js
 * @description Responsável por desenhar as peças dos jogadores no tabuleiro.
 */

const PIECES = {
    car: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
    hat: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5,19V17H6V11C6,7.69 8.69,5 12,5C15.31,5 18,7.69 18,11V17H19V19H5Z"/></svg>`,
    ship: `<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20,16V18H4V16L6,14V11C6,8.24 7.81,5.9 10.35,5.16V4.75C10.35,3.78 11.14,3 12.11,3C13.08,3 13.87,3.78 13.87,4.75V5.16C16.41,5.9 18.22,8.24 18.22,11V14L20,16Z"/></svg>`
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
