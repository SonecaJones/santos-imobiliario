/**
 * @file ui/player-panel.js
 * @description Gerencia a exibição dos dados dos jogadores (saldo, propriedades).
 */

export function renderPlayerPanels(players, currentPlayerIndex, onPanelClick) {
    const container = document.getElementById('player-panels');
    if (!container) return;

    container.innerHTML = '';

    players.forEach((player, index) => {
        const panel = document.createElement('div');
        panel.className = `player-panel ${index === currentPlayerIndex ? 'active' : ''}`;
        panel.style.borderLeft = `8px solid ${player.color}`;

        if (player.bankrupt) panel.classList.add('bankrupt');

        panel.innerHTML = `
            <div class="player-info">
                <span class="player-name">${player.name} ${player.type === 'bot' ? '🤖' : '👤'}</span>
                <span class="player-money">M$ ${player.money.toLocaleString()}</span>
            </div>
            <div class="player-status">
                ${player.inJail ? '<span class="status-tag jail">Preso</span>' : ''}
                ${player.bankrupt ? '<span class="status-tag bankrupt">Falido</span>' : ''}
            </div>
            <div class="player-properties-count">
                🏠 ${player.properties.length} Propriedades
            </div>
        `;

        // Adiciona o evento de clique para ver propriedades
        panel.onclick = () => {
            if (onPanelClick && !player.bankrupt) {
                onPanelClick(player);
            }
        };

        container.appendChild(panel);
    });
}
