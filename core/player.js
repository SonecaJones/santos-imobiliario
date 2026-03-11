/**
 * @file core/player.js
 * @description Classe base para jogadores (humanos e bots).
 */

import { RULES } from './rules.js';
import { NotificationUI } from '../ui/notifications.js';

export class Player {
    /**
     * @param {string} id 
     * @param {string} name 
     * @param {string} color 
     * @param {string} type - 'human' | 'bot'
     */
    constructor(id, name, color, type = 'human') {
        this.id = id;
        this.name = name;
        this.color = color;
        this.type = type;
        
        this.position = 0; // Começa no Ponto de Partida (id 0)
        this.money = RULES.STARTING_MONEY;
        this.properties = []; // IDs das casas que possui
        
        this.inJail = false;
        this.jailTurns = 0;
        this.jailCards = 0;
        this.bankrupt = false;
        
        this.piece = 'car'; // Default piece
    }

    /**
     * Adiciona ou remove dinheiro do jogador.
     * @param {number} amount 
     */
    updateMoney(amount) {
        this.money += amount;
        if (this.money < 0) {
            // Lógica de falência será tratada pelo GameController
            console.warn(`${this.name} está com saldo negativo: ${this.money} Mangos!`);
        }
    }

    /**
     * Move o jogador pelo tabuleiro.
     * @param {number} steps 
     * @returns {boolean} true se passou pelo ponto de partida
     */
    move(steps) {
        const oldPosition = this.position;
        this.position = (this.position + steps) % 40;
        
        // Passou pelo ponto de partida?
        return this.position < oldPosition;
    }

    /**
     * Decide se compra uma propriedade.
     * @param {object} property 
     * @returns {Promise<boolean>}
     */
    async decideBuy(property) {
        if (this.type === 'bot') {
            // Lógica simples de bot: compra se tiver dinheiro
            return this.money >= property.price + 1000; // Mantém reserva de 1000 mangos
        }

        // Jogador Humano: abre modal
        return await NotificationUI.confirm(
            '🛒 Comprar Propriedade?',
            `Deseja comprar o bairro <strong>${property.name}</strong> por <strong>M$ ${property.price}</strong> Mangos?`
        );
    }

    async decidePayJail() {
        if (this.type === 'bot') return this.money > 2000;

        return await NotificationUI.confirm(
            '⚖️ Pagar Fiança?',
            `Deseja pagar <strong>M$ 500</strong> Mangos para sair da prisão agora?`
        );
    }
}
