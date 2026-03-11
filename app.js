/**
 * @file app.js
 * @description Ponto de entrada da aplicação.
 */

import { renderBoard } from './ui/board-render.js';
import { renderPlayers } from './ui/player-render.js';
import { renderPlayerPanels } from './ui/player-panel.js';
import { DiceUI } from './ui/dice-render.js';
import { NotificationUI } from './ui/notifications.js';
import { Player } from './core/player.js';
import { GameController } from './core/game.js';

let game;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Santos Imobiliário...');
    
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
                    if (await game.buildHouse(game.currentPlayer, propId)) refreshUI();
                },
                onMortgage: async (propId) => {
                    if (await game.mortgageProperty(game.currentPlayer, propId)) refreshUI();
                },
                onUnmortgage: async (propId) => {
                    if (await game.unmortgageProperty(game.currentPlayer, propId)) refreshUI();
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

    // 2. Renderiza o tabuleiro passando o callback de clique
    renderBoard(handleCellClick);

    // 3. Cria os jogadores
    const p1 = new Player('p1', 'Caiçara 1', '#e74c3c', 'human');
    p1.piece = 'car';
    
    const p2 = new Player('p2', 'Bot Santista', '#3498db', 'bot');
    p2.piece = 'ship';

    // 4. Inicializa o controlador do jogo
    game = new GameController([p1, p2]);

    // 4. Configura animação de dados, movimento e cartas
    game.onDiceRoll = async (d1, d2) => {
        await DiceUI.animateRoll(d1, d2);
    };

    game.onStep = async () => {
        renderPlayers(game.players);
        renderPlayerPanels(game.players, game.currentPlayerIndex);
        await new Promise(resolve => setTimeout(resolve, 250)); // Delay da caminhada
    };

    game.onLuckCard = async (card) => {
        await NotificationUI.showLuckCard(card);
    };

    // 5. Renderiza estado inicial
    renderPlayers(game.players);
    renderPlayerPanels(game.players, game.currentPlayerIndex);
    DiceUI.render(1, 1); // Mostra dados iniciais (1,1)

    // 7. Configura botão de ação
    const rollButton = document.getElementById('roll-button');
    const logContainer = document.getElementById('game-log');

    rollButton.addEventListener('click', async () => {
        rollButton.disabled = true;
        
        // Executa o turno
        await game.takeTurn();
        
        // Atualiza UI
        renderPlayers(game.players);
        renderPlayerPanels(game.players, game.currentPlayerIndex);
        updateVisualLog(game.log, logContainer);

        rollButton.disabled = false;
        rollButton.textContent = `TURNO DE: ${game.currentPlayer.name}`;
    });

    rollButton.textContent = `TURNO DE: ${game.currentPlayer.name}`;
});

function updateVisualLog(logs, container) {
    container.innerHTML = logs.slice(-10).reverse().map(msg => 
        `<div class="log-entry">${msg}</div>`
    ).join('');
}
