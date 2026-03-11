/**
 * @file core/game.js
 * @description Controlador principal da lógica do jogo.
 */

import { BOARD } from './board.js';
import { RULES } from './rules.js';
import { Dice } from './dice.js';
import { LUCK_CARDS } from './cards.js';
import { NotificationUI } from '../ui/notifications.js';

export class GameController {
    constructor(players) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.dice = new Dice();
        this.round = 1;
        this.log = [];
        this.status = 'playing';
        this.doublesStreak = 0;

        // Inicializa e embaralha o deck de cartas
        this.deck = [...LUCK_CARDS];
        this.shuffleDeck();
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    drawCard() {
        if (this.deck.length === 0) {
            this.deck = [...LUCK_CARDS];
            this.shuffleDeck();
        }
        return this.deck.pop();
    }

    get currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    async takeTurn() {
        const player = this.currentPlayer;
        if (player.bankrupt) {
            this.nextTurn();
            return;
        }

        const rollResult = this.dice.roll();
        if (this.onDiceRoll) await this.onDiceRoll(rollResult.die1, rollResult.die2);

        this.addLog(`${player.name} rolou ${rollResult.die1} e ${rollResult.die2} (Total: ${rollResult.total})`);

        if (rollResult.isDouble) {
            this.doublesStreak++;
            if (this.doublesStreak >= RULES.DOUBLES_LIMIT) {
                this.goToJail(player);
                this.nextTurn();
                return;
            }
        } else {
            this.doublesStreak = 0;
        }

        for (let i = 0; i < rollResult.total; i++) {
            const passedStartOnce = player.move(1);
            if (passedStartOnce) {
                player.updateMoney(RULES.SALARY);
                this.addLog(`${player.name} passou pelo Ponto de Partida e recebeu ${RULES.SALARY} Mangos`);
            }
            if (this.onStep) await this.onStep(player);
        }

        const currentSpace = BOARD[player.position];
        await this.applySpaceEffect(player, currentSpace, rollResult.total);

        if (!rollResult.isDouble || player.inJail) {
            this.nextTurn();
        } else {
            this.addLog(`${player.name} tirou dobradinha e joga novamente!`);
        }
    }

    async applySpaceEffect(player, space, rollTotal) {
        this.addLog(`${player.name} caiu em ${space.name}`);

        switch (space.type) {
            case 'property':
            case 'station':
                await this.handleProperty(player, space, rollTotal);
                break;
            case 'tax':
                await this.payDebt(player, space.amount);
                break;
            case 'go-jail':
                this.goToJail(player);
                break;
            case 'chest':
                await this.handleLuckCard(player);
                break;
        }
    }

    async handleLuckCard(player) {
        const card = this.drawCard();
        if (this.onLuckCard) await this.onLuckCard(card);

        this.addLog(`${player.name} tirou: ${card.title} - ${card.text}`);

        if (card.type === 'money') {
            if (card.value < 0) {
                await this.payDebt(player, Math.abs(card.value));
            } else {
                player.updateMoney(card.value);
            }
        } else if (card.type === 'move') {
            if (card.value === 0) {
                const stepsToStart = (40 - player.position) % 40;
                for (let i = 0; i < stepsToStart; i++) {
                    player.move(1);
                    if (this.onStep) await this.onStep(player);
                }
                player.updateMoney(RULES.SALARY);
            } else if (card.value === 10) {
                this.goToJail(player);
                if (this.onStep) await this.onStep(player);
            }
        }
    }

    async payDebt(payer, amount, receiver = null) {
        if (payer.bankrupt) return;

        if (payer.money < amount) {
            const totalPossible = this.calculateMaxLiquidity(payer);
            if (totalPossible < amount) {
                await this.declareBankruptcy(payer, receiver);
                return;
            }
            if (payer.type === 'bot') {
                await this.autoMortgage(payer, amount);
            } else {
                await NotificationUI.alert('💸 Dívida Pendente', `Você deve M$ ${amount}. Hipoteque algo para pagar!`);
            }
        }

        payer.updateMoney(-amount);
        if (receiver) {
            receiver.updateMoney(amount);
            this.addLog(`${payer.name} pagou M$ ${amount} para ${receiver.name}`);
        } else {
            this.addLog(`${payer.name} pagou M$ ${amount} de taxas`);
        }
    }

    calculateMaxLiquidity(player) {
        let assets = player.money;
        const playerProperties = BOARD.filter(p => p.ownerId === player.id && !p.mortgaged);
        playerProperties.forEach(p => {
            assets += p.price / 2;
            if (p.houses > 0) assets += (p.houses * p.housePrice) / 2;
        });
        return assets;
    }

    async autoMortgage(player, goalAmount) {
        const playerProperties = BOARD.filter(p => p.ownerId === player.id && !p.mortgaged);
        for (const prop of playerProperties) {
            if (player.money >= goalAmount) break;
            await this.mortgageProperty(player, prop.id);
        }
    }

    async declareBankruptcy(player, creditor = null) {
        player.bankrupt = true;
        player.money = 0;
        this.addLog(`🚨 FALÊNCIA: ${player.name} está fora do jogo!`);

        BOARD.forEach(space => {
            if (space.ownerId === player.id) {
                if (creditor) {
                    space.ownerId = creditor.id;
                } else {
                    space.ownerId = null;
                    space.houses = 0;
                    space.mortgaged = false;
                }
            }
        });

        await NotificationUI.alert('💀 Falência', `${player.name} faliu.`);
        this.checkWinCondition();
    }

    checkWinCondition() {
        const activePlayers = this.players.filter(p => !p.bankrupt);
        if (activePlayers.length === 1) {
            this.status = 'finished';
            NotificationUI.alert('🏆 VITÓRIA!', `${activePlayers[0].name} venceu!`);
        }
    }

    goToJail(player) {
        player.position = 10;
        player.inJail = true;
        this.addLog(`${player.name} foi para a prisão!`);
    }

    async handleProperty(player, space, rollTotal) {
        if (!space.ownerId) {
            const wantToBuy = await player.decideBuy(space);
            if (wantToBuy && player.money >= space.price) {
                player.updateMoney(-space.price);
                player.properties.push(space.id);
                space.ownerId = player.id;
                this.addLog(`${player.name} comprou ${space.name} por M$ ${space.price}`);
            }
        } else if (space.ownerId !== player.id) {
            const owner = this.players.find(p => p.id === space.ownerId);
            if (!owner.inJail && !space.mortgaged) {
                const rent = this.calculateRent(space, rollTotal);
                await this.payDebt(player, rent, owner);
            }
        }
    }

    calculateRent(space, rollTotal) {
        if (space.mortgaged) return 0;
        if (space.type === 'station') {
            const owner = this.players.find(p => p.id === space.ownerId);
            const stationsOwned = BOARD.filter(s => s.type === 'station' && s.ownerId === owner.id && !s.mortgaged).length;
            return space.rent[stationsOwned - 1] || space.rent[0];
        }
        if (space.type === 'property') {
            if (space.houses > 0) return space.rent[space.houses];
            const owner = this.players.find(p => p.id === space.ownerId);
            const groupProperties = BOARD.filter(p => p.group === space.group);
            const ownsAll = groupProperties.every(p => p.ownerId === owner.id && !p.mortgaged);
            return ownsAll ? space.rent[0] * 2 : space.rent[0];
        }
        return 0;
    }

    async mortgageProperty(player, propertyId) {
        const space = BOARD.find(p => p.id === propertyId);
        if (!space || space.ownerId !== player.id || space.mortgaged) return false;
        if (space.houses > 0) return false;
        const mortgageValue = space.price / 2;
        player.updateMoney(mortgageValue);
        space.mortgaged = true;
        this.addLog(`${player.name} hipotecou ${space.name} (+M$ ${mortgageValue})`);
        return true;
    }

    async unmortgageProperty(player, propertyId) {
        const space = BOARD.find(p => p.id === propertyId);
        if (!space || space.ownerId !== player.id || !space.mortgaged) return false;
        const unmortgageCost = (space.price / 2) * 1.1;
        if (player.money < unmortgageCost) return false;
        player.updateMoney(-unmortgageCost);
        space.mortgaged = false;
        this.addLog(`${player.name} desipotecou ${space.name} (-M$ ${unmortgageCost.toFixed(0)})`);
        return true;
    }

    async buildHouse(player, propertyId) {
        const space = BOARD.find(p => p.id === propertyId);
        if (!space || space.ownerId !== player.id || space.type !== 'property' || space.houses >= 5 || player.money < space.housePrice) return false;
        const groupProperties = BOARD.filter(p => p.group === space.group);
        if (!groupProperties.every(p => p.ownerId === player.id)) return false;
        const minHousesInGroup = Math.min(...groupProperties.map(p => p.houses || 0));
        if (space.houses > minHousesInGroup) return false;
        player.updateMoney(-space.housePrice);
        space.houses = (space.houses || 0) + 1;
        this.addLog(`${player.name} construiu em ${space.name}`);
        return true;
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) this.round++;
        this.doublesStreak = 0;
    }

    addLog(message) {
        this.log.push(message);
        console.log(`[Game Log]: ${message}`);
    }
}
