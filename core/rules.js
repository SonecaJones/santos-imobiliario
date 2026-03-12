/**
 * @file core/rules.js
 * @description Regras e constantes fundamentais do Santos Imobiliário.
 */

export const RULES = {
    STARTING_MONEY: 15000,
    SALARY: 2000,
    JAIL_FEE: 500,
    JAIL_TURNS_MAX: 3,
    MAX_HOUSES: 32,
    MAX_HOTELS: 12,
    AUCTION_ON_REFUSE: true,
    FREE_PARKING_JACKPOT: false, // Opcional: Acumula impostos no Estacionamento
    DOUBLES_LIMIT: 3,             // 3 pares de dados seguidos = Prisão
    COLORS: {
        PURPLE: '#9b59b6',
        LIGHT_BLUE: '#3498db',
        PINK: '#e84393',
        ORANGE: '#e67e22',
        RED: '#e74c3c',
        YELLOW: '#f1c40f',
        GREEN: '#27ae60',
        DARK_BLUE: '#2980b9',
        STATION: '#95a5a6' // Cinza comercial
    }
};
