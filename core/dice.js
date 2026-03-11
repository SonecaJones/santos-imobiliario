/**
 * @file core/dice.js
 * @description Lógica de rolagem de dados.
 */

export class Dice {
    constructor() {
        this.die1 = 0;
        this.die2 = 0;
    }

    /**
     * Rola dois dados e retorna o resultado.
     * @returns {{ die1: number, die2: number, total: number, isDouble: boolean }}
     */
    roll() {
        this.die1 = Math.floor(Math.random() * 6) + 1;
        this.die2 = Math.floor(Math.random() * 6) + 1;

        return {
            die1: this.die1,
            die2: this.die2,
            total: this.die1 + this.die2,
            isDouble: this.die1 === this.die2
        };
    }
}
