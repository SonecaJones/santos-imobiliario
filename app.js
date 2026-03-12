/**
 * @file app.js
 * @description Ponto de entrada da aplicação.
 */

import { renderBoard } from './ui/board-render.js';
import { renderPlayers } from './ui/player-render.js';
import { renderPlayerPanels } from './ui/player-panel.js';
import { DiceUI } from './ui/dice-render.js';
import { NotificationUI } from './ui/notifications.js';
import { sfx } from './ui/audio-engine.js';
import { SetupUI } from './ui/setup-ui.js';
import { Player } from './core/player.js';
import { GameController } from './core/game.js';
import { BOARD } from './core/board.js';

let game;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Santos Imobiliário...');
    
    // 1. Inicializa a interface de Setup
    new SetupUI((selectedPlayers) => {
        startGame(selectedPlayers);
    });
});

/**
 * Inicia a partida com os jogadores configurados no Setup
 */
function startGame(playerConfigs) {
    const logContainer = document.getElementById('game-log');
    const rollButton = document.getElementById('roll-button');

    // 1. Define o que acontece ao clicar em uma casa
    const handleCellClick = (space) => {
        if (space.type === 'property' || space.type === 'station') {
            const owner = space.ownerId ? game.players.find(p => p.id === space.ownerId) : null;
            const isOwner = owner && owner.id === game.currentPlayer.id && game.currentPlayer.type === 'human';
            
            const actions = {
                canBuild: isOwner && space.type === 'property' && !space.mortgaged,
                canMortgage: isOwner && !space.mortgaged && (space.houses || 0) === 0,
                canUnmortgage: isOwner && space.mortgaged && game.currentPlayer.money >= (space.price / 2 * 1.1),
                
                onBuild: async (propId) => {
                    if (await game.buildHouse(game.currentPlayer, propId)) {
                        sfx.playCoin();
                        refreshUI();
                    }
                },
                onMortgage: async (propId) => {
                    if (await game.mortgageProperty(game.currentPlayer, propId)) {
                        sfx.playCoin();
                        refreshUI();
                    }
                },
                onUnmortgage: async (propId) => {
                    if (await game.unmortgageProperty(game.currentPlayer, propId)) {
                        sfx.playCoin();
                        refreshUI();
                    }
                }
            };

            NotificationUI.showDeed(space, owner ? owner.name : 'Sem dono', actions);
        }
    };

    const refreshUI = () => {
        renderBoard(handleCellClick);
        renderPlayers(game.players);
        renderPlayerPanels(game.players, game.currentPlayerIndex, showPlayerInventory);
        updateVisualLog(game.log, logContainer);
    };

    /**
     * Mostra o inventário de propriedades de um jogador específico.
     */
    function showPlayerInventory(player) {
        const playerProperties = BOARD.filter(p => p.ownerId === player.id);
        
        if (playerProperties.length === 0) {
            NotificationUI.alert('📦 Inventário Vazio', `${player.name} ainda não possui propriedades.`);
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        let propsHTML = playerProperties.map(prop => `
            <div class="inventory-item" style="border-left: 10px solid ${prop.color || '#95a5a6'}">
                <div class="prop-info">
                    <div class="prop-name">${prop.name}</div>
                    <div class="prop-details">${prop.houses === 5 ? '🏨 Hotel' : prop.houses > 0 ? `🏠 ${prop.houses} Casas` : 'Terreno'}</div>
                </div>
                <button class="action-button mini-btn" id="view-prop-${prop.id}">VER</button>
            </div>
        `).join('');

        overlay.innerHTML = `
            <div class="modal-content inventory-modal">
                <h3>Propriedades de ${player.name}</h3>
                <div class="inventory-list">
                    ${propsHTML}
                </div>
                <button id="close-inventory" class="action-button modal-btn" style="margin-top:20px">FECHAR</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.getElementById('close-inventory').onclick = () => overlay.remove();
        
        // Configura botões individualmente para ver no tabuleiro
        playerProperties.forEach(prop => {
            document.getElementById(`view-prop-${prop.id}`).onclick = () => {
                overlay.remove();
                handleCellClick(prop);
            };
        });
    }

    // 2. Renderiza o tabuleiro inicial
    renderBoard(handleCellClick);

    // 3. Cria as instâncias de Player baseadas na configuração
    const players = playerConfigs.map((config, index) => {
        const p = new Player(`p${index}`, config.name, config.color, config.type);
        p.piece = config.piece;
        return p;
    });

    // 4. Inicializa o controlador do jogo
    game = new GameController(players);
    window.game = game;

    // 5. Configura animações e callbacks do motor
    game.onDiceRoll = async (d1, d2) => {
        const rollSfxInterval = setInterval(() => sfx.playDice(), 100);
        await DiceUI.animateRoll(d1, d2);
        clearInterval(rollSfxInterval);
    };

    game.onStep = async (player) => {
        sfx.playStep();
        renderPlayers(game.players);
        renderPlayerPanels(game.players, game.currentPlayerIndex, showPlayerInventory);
        await new Promise(resolve => setTimeout(resolve, 250));
    };

    game.onLuckCard = async (card) => {
        if (card.isPositive) sfx.playLuck();
        else sfx.playError();
        await NotificationUI.showLuckCard(card);
    };

    game.onMoneyChange = (player, amount) => {
        if (amount > 0) sfx.playCoin();
        spawnMoneyAnimation(player, amount);
    };

    // 6. Renderiza estado inicial
    renderPlayers(game.players);
    renderPlayerPanels(game.players, game.currentPlayerIndex, showPlayerInventory);
    DiceUI.render(1, 1);

    // 7. Configura botão de ação principal
    rollButton.onclick = async () => {
        rollButton.disabled = true;
        await game.takeTurn();
        refreshUI();
        rollButton.disabled = false;
        rollButton.textContent = `TURNO DE: ${game.currentPlayer.name}`;
    };

    rollButton.textContent = `TURNO DE: ${game.currentPlayer.name}`;
}

/**
 * Helpers Visuais
 */
function spawnMoneyAnimation(player, amount) {
    const pieceEl = document.getElementById(`piece-${player.id}`);
    if (!pieceEl) return;

    const rect = pieceEl.getBoundingClientRect();
    const x = rect.left + (rect.width / 2);
    const y = rect.top;

    const el = document.createElement('div');
    el.className = `money-float ${amount > 0 ? 'gain' : 'loss'}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = 'translateX(-50%)';
    el.innerText = `${amount > 0 ? '+' : ''}${amount} M$`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1500);
}

function updateVisualLog(logs, container) {
    if (!container) return;
    container.innerHTML = logs.slice(-10).reverse().map(msg => 
        `<div class="log-entry">${msg}</div>`
    ).join('');
}
