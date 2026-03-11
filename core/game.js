/**
 * @file core/game.js
 * @description Controlador principal da lógica do jogo.
 */

import { BOARD } from './board.js';
import { RULES } from './rules.js';
import { Dice } from './dice.js';
import { LUCK_CARDS } from './cards.js';

export class GameController {
    constructor(players) {
        this.players = players; // Array de instâncias de Player
        this.currentPlayerIndex = 0;
        this.dice = new Dice();
        this.round = 1;
        this.log = []; // Histórico de ações
        
        this.status = 'playing'; // 'waiting', 'playing', 'finished'
        this.doublesStreak = 0; // Conta dobradinhas consecutivas

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

    /**
     * Executa um turno completo para o jogador atual.
     */
    async takeTurn() {
        const player = this.currentPlayer;
        
        if (player.bankrupt) {
            this.nextTurn();
            return;
        }

        // 1. Rolar Dados
        const rollResult = this.dice.roll();
        
        // Se houver callback de animação de dados, aguarda
        if (this.onDiceRoll) {
            await this.onDiceRoll(rollResult.die1, rollResult.die2);
        }

        this.addLog(`${player.name} rolou ${rollResult.die1} e ${rollResult.die2} (Total: ${rollResult.total} Mangos)`);

        // 2. Verificar Prisão (Regra de 3 dobradinhas)
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

        // 3. Movimentação (Passo a passo para animação)
        for (let i = 0; i < rollResult.total; i++) {
            const passedStartOnce = player.move(1);
            
            if (passedStartOnce) {
                player.updateMoney(RULES.SALARY);
                this.addLog(`${player.name} passou pelo Ponto de Partida e recebeu ${RULES.SALARY} Mangos`);
            }

            // Se houver um callback de animação, aguarda ele
            if (this.onStep) {
                await this.onStep(player);
            }
        }

        // 4. Aplicar Efeito da Casa (Somente na casa final)
        const currentSpace = BOARD[player.position];
        await this.applySpaceEffect(player, currentSpace, rollResult.total);

        // 5. Finalizar Turno
        // Se não tirou dobradinha, passa a vez. Se tirou, joga de novo (dentro do limite).
        if (!rollResult.isDouble || player.inJail) {
            this.nextTurn();
        } else {
            this.addLog(`${player.name} tirou dobradinha e joga novamente!`);
            // Em uma implementação real, o takeTurn seria chamado novamente pelo loop principal
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

    /**
     * Gerencia pagamentos, verificando se o jogador tem saldo ou precisa hipotecar.
     */
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
                await NotificationUI.alert('💸 Dívida Pendente', `Você deve <strong>M$ ${amount}</strong>, mas tem apenas <strong>M$ ${payer.money}</strong>. Hipoteque propriedades para pagar!`);
                // No caso humano, o saldo ficará negativo e ele deve hipotecar antes de terminar o turno
            }
        }

        payer.updateMoney(-amount);
        if (receiver) {
            receiver.updateMoney(amount);
            this.addLog(`${payer.name} pagou M$ ${amount} para ${receiver.name}`);
        } else {
            this.addLog(`${payer.name} pagou M$ ${amount} de taxas/impostos`);
        }
    }

    calculateMaxLiquidity(player) {
        let assets = player.money;
        const playerProperties = BOARD.filter(p => p.ownerId === player.id && !p.mortgaged);
        playerProperties.forEach(p => {
            assets += p.price / 2;
            if (p.houses > 0) {
                assets += (p.houses * p.housePrice) / 2;
            }
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

        // Devolve propriedades ao banco ou passa para o credor
        BOARD.forEach(space => {
            if (space.ownerId === player.id) {
                if (creditor) {
                    space.ownerId = creditor.id;
                    this.addLog(`${space.name} agora pertence a ${creditor.name}`);
                } else {
                    space.ownerId = null;
                    space.houses = 0;
                    space.mortgaged = false;
                }
            }
        });

        await NotificationUI.alert('💀 Falência', `${player.name} faliu e deixou a partida.`);
        this.checkWinCondition();
    }

    checkWinCondition() {
        const activePlayers = this.players.filter(p => !p.bankrupt);
        if (activePlayers.length === 1) {
            this.status = 'finished';
            const winner = activePlayers[0];
            NotificationUI.alert('🏆 VITÓRIA!', `PARABÉNS! <strong>${winner.name}</strong> é o novo magnata de Santos!`);
            this.addLog(`FIM DE JOGO: ${winner.name} venceu!`);
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
                player.position = 0;
                player.updateMoney(RULES.SALARY);
            } else if (card.value === 10) {
                this.goToJail(player);
            }
            if (this.onStep) await this.onStep(player);
        }
    }

    async handleProperty(player, space, rollTotal) {
        if (!space.ownerId) {
            const wantToBuy = await player.decideBuy(space);
            if (wantToBuy && player.money >= space.price) {
                player.updateMoney(-space.price);
                player.properties.push(space.id);
                space.ownerId = player.id;
                this.addLog(`${player.name} comprou ${space.name} por ${space.price} Mangos`);
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
            // Se tem casas/hotel
            if (space.houses > 0) {
                return space.rent[space.houses];
            }

            // Se não tem casas, verifica se o dono tem o monopólio (aluguel dobrado)
            const owner = this.players.find(p => p.id === space.ownerId);
            const groupProperties = BOARD.filter(p => p.group === space.group);
            const ownsAll = groupProperties.every(p => p.ownerId === owner.id && !p.mortgaged);

            return ownsAll ? space.rent[0] * 2 : space.rent[0];
        }

        return 0;
    }

    /**
     * Hipoteca uma propriedade.
     */
    async mortgageProperty(player, propertyId) {
        const space = BOARD.find(p => p.id === propertyId);
        if (!space || space.ownerId !== player.id || space.mortgaged) return false;

        // Regra: não pode hipotecar se tiver casas
        if (space.houses > 0) {
            this.addLog(`Venda as casas antes de hipotecar ${space.name}.`);
            return false;
        }

        const mortgageValue = space.price / 2;
        player.updateMoney(mortgageValue);
        space.mortgaged = true;
        this.addLog(`${player.name} hipotecou ${space.name} e recebeu ${mortgageValue} Mangos.`);
        return true;
    }

    /**
     * Desipoteca uma propriedade.
     */
    async unmortgageProperty(player, propertyId) {
        const space = BOARD.find(p => p.id === propertyId);
        if (!space || space.ownerId !== player.id || !space.mortgaged) return false;

        const unmortgageCost = (space.price / 2) * 1.1; // 10% de juros
        if (player.money < unmortgageCost) return false;

        player.updateMoney(-unmortgageCost);
        space.mortgaged = false;
        this.addLog(`${player.name} pagou ${unmortgageCost.toFixed(0)} Mangos e desipotecou ${space.name}.`);
        return true;
    }

    /**
     * Tenta construir uma casa em uma propriedade.
     */
    async buildHouse(player, propertyId) {
        const space = BOARD.find(p => p.id === propertyId);

        if (!space || space.ownerId !== player.id || space.type !== 'property') return false;
        if (space.houses >= 5) return false; // Já tem hotel
        if (player.money < space.housePrice) return false;

        // Verifica monopólio
        const groupProperties = BOARD.filter(p => p.group === space.group);
        const ownsAll = groupProperties.every(p => p.ownerId === player.id);
        if (!ownsAll) return false;

        // Regra de construção uniforme: não pode ter 2 casas a mais que outra no grupo
        const minHousesInGroup = Math.min(...groupProperties.map(p => p.houses || 0));
        if (space.houses > minHousesInGroup) {
            this.addLog(`Você deve construir de forma equilibrada em todo o grupo ${space.group}.`);
            return false;
        }

        player.updateMoney(-space.housePrice);
        space.houses = (space.houses || 0) + 1;
        this.addLog(`${player.name} construiu ${space.houses === 5 ? 'um HOTEL' : 'uma casa'} em ${space.name}`);

        return true;
    }

    async handleLuckCard(player) {
        player.position = 10; // Prisão
        player.inJail = true;
        this.addLog(`${player.name} foi para a prisão!`);
    }

    nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        if (this.currentPlayerIndex === 0) {
            this.round++;
        }
        this.doublesStreak = 0;
    }

    addLog(message) {
        this.log.push(message);
        console.log(`[Game Log]: ${message}`);
    }
}
