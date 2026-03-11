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

let game;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Santos Imobiliário...');
    
    // 1. Inicializa a interface de Setup
    // O jogo só começa de fato quando o callback do SetupUI for disparado
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
        renderPlayerPanels(game.players, game.currentPlayerIndex);
        updateVisualLog(game.log, logContainer);
    };

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
    window.game = game; // Expor para debug se necessário

    // 5. Configura animações e callbacks do motor
    game.onDiceRoll = async (d1, d2) => {
        const rollSfxInterval = setInterval(() => sfx.playDice(), 100);
        await DiceUI.animateRoll(d1, d2);
        clearInterval(rollSfxInterval);
    };

    game.onStep = async (player) => {
        sfx.playStep();
        renderPlayers(game.players);
        renderPlayerPanels(game.players, game.currentPlayerIndex);
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
    renderPlayerPanels(game.players, game.currentPlayerIndex);
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
    console.log('Partida iniciada!');
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
