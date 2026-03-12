/**
 * @file core/board.js
 * @description Definição estática das 40 casas do tabuleiro.
 */

import { RULES } from './rules.js';

export const BOARD = [
    { id: 0,  type: 'start',    name: 'Ponto de Partida' },
    { id: 1,  type: 'property', name: 'Morro do Jabaquara', price: 600,  rent: [50, 250, 750, 2250, 4000, 5500], color: RULES.COLORS.PURPLE,     group: 'purple', housePrice: 500 },
    { id: 2,  type: 'chest',    name: 'Sorte / Revés' },
    { id: 3,  type: 'property', name: 'Morro da Nova Cintra', price: 600,  rent: [50, 250, 750, 2250, 4000, 5500], color: RULES.COLORS.PURPLE,     group: 'purple', housePrice: 500 },
    { id: 4,  type: 'tax',      name: 'Imposto Predial', amount: 2000 },
    { id: 5,  type: 'station',  name: 'Terminal Valongo',  price: 2000, rent: [250, 500, 1000, 2000], color: RULES.COLORS.STATION },
    { id: 6,  type: 'property', name: 'Areia Branca',      price: 1000, rent: [100, 500, 1500, 4500, 6250, 7500], color: RULES.COLORS.LIGHT_BLUE, group: 'light-blue', housePrice: 500 },
    { id: 7,  type: 'chest',    name: 'Sorte / Revés' },
    { id: 8,  type: 'property', name: 'Castelo',           price: 1000, rent: [100, 500, 1500, 4500, 6250, 7500], color: RULES.COLORS.LIGHT_BLUE, group: 'light-blue', housePrice: 500 },
    { id: 9,  type: 'property', name: 'Bom Retiro',        price: 1200, rent: [120, 600, 1800, 5000, 7000, 9000], color: RULES.COLORS.LIGHT_BLUE, group: 'light-blue', housePrice: 500 },
    
    { id: 10, type: 'jail',     name: 'Prisão / Visita' },
    { id: 11, type: 'property', name: 'Macuco',            price: 1400, rent: [150, 700, 2000, 5500, 7500, 9500], color: RULES.COLORS.PINK, group: 'pink', housePrice: 1000 },
    { id: 12, type: 'station',  name: 'Balsa Santos-Guarujá', price: 1500, rent: [50, 100], color: RULES.COLORS.STATION },
    { id: 13, type: 'property', name: 'Estuário',          price: 1400, rent: [150, 700, 2000, 5500, 7500, 9500], color: RULES.COLORS.PINK, group: 'pink', housePrice: 1000 },
    { id: 14, type: 'property', name: 'Encruzilhada',      price: 1600, rent: [180, 800, 2200, 6000, 8000, 10000], color: RULES.COLORS.PINK, group: 'pink', housePrice: 1000 },
    { id: 15, type: 'station',  name: 'VLT Estação Ana Costa', price: 2000, rent: [250, 500, 1000, 2000], color: RULES.COLORS.STATION },
    { id: 16, type: 'property', name: 'Marapé',            price: 1800, rent: [200, 900, 2500, 7000, 8750, 10500], color: RULES.COLORS.ORANGE, group: 'orange', housePrice: 1000 },
    { id: 17, type: 'chest',    name: 'Sorte / Revés' },
    { id: 18, type: 'property', name: 'Campo Grande',      price: 1800, rent: [200, 900, 2500, 7000, 8750, 10500], color: RULES.COLORS.ORANGE, group: 'orange', housePrice: 1000 },
    { id: 19, type: 'property', name: 'Vila Belmiro',      price: 2000, rent: [220, 1000, 3000, 7500, 9250, 11000], color: RULES.COLORS.ORANGE, group: 'orange', housePrice: 1000 },
    
    { id: 20, type: 'parking',  name: 'Emissário Submarino' },
    { id: 21, type: 'property', name: 'Vila Mathias',      price: 2200, rent: [250, 1100, 3300, 8000, 9750, 11500], color: RULES.COLORS.RED, group: 'red', housePrice: 1500 },
    { id: 22, type: 'chest',    name: 'Sorte / Revés' },
    { id: 23, type: 'property', name: 'José Menino',       price: 2200, rent: [250, 1100, 3300, 8000, 9750, 11500], color: RULES.COLORS.RED, group: 'red', housePrice: 1500 },
    { id: 24, type: 'property', name: 'Pompeia',           price: 2400, rent: [280, 1200, 3600, 8500, 10250, 12000], color: RULES.COLORS.RED, group: 'red', housePrice: 1500 },
    { id: 25, type: 'station',  name: 'Rodoviária de Santos', price: 2000, rent: [250, 500, 1000, 2000], color: RULES.COLORS.STATION },
    { id: 26, type: 'property', name: 'Aparecida',         price: 2600, rent: [300, 1300, 3900, 9000, 11000, 12750], color: RULES.COLORS.YELLOW, group: 'yellow', housePrice: 1500 },
    { id: 27, type: 'property', name: 'Embaré',            price: 2600, rent: [300, 1300, 3900, 9000, 11000, 12750], color: RULES.COLORS.YELLOW, group: 'yellow', housePrice: 1500 },
    { id: 28, type: 'station',  name: 'Companhia Docas (CODESP)', price: 1500, rent: [50, 100], color: RULES.COLORS.STATION },
    { id: 29, type: 'property', name: 'Ponta da Praia',    price: 2800, rent: [320, 1400, 4200, 9500, 11500, 13500], color: RULES.COLORS.YELLOW, group: 'yellow', housePrice: 1500 },
    
    { id: 30, type: 'go-jail',  name: 'Vá para a Prisão' },
    { id: 31, type: 'property', name: 'Boqueirão',         price: 3000, rent: [350, 1500, 4500, 10000, 12000, 14000], color: RULES.COLORS.GREEN, group: 'green', housePrice: 2000 },
    { id: 32, type: 'property', name: 'Canal 3',           price: 3000, rent: [350, 1500, 4500, 10000, 12000, 14000], color: RULES.COLORS.GREEN, group: 'green', housePrice: 2000 },
    { id: 33, type: 'chest',    name: 'Sorte / Revés' },
    { id: 34, type: 'property', name: 'Canal 4',           price: 3200, rent: [400, 1700, 5000, 11000, 13000, 15000], color: RULES.COLORS.GREEN, group: 'green', housePrice: 2000 },
    { id: 35, type: 'station',  name: 'Porto de Santos',   price: 2000, rent: [250, 500, 1000, 2000], color: RULES.COLORS.STATION },
    { id: 36, type: 'chest',    name: 'Sorte / Revés' },
    { id: 37, type: 'property', name: 'Gonzaga',           price: 3500, rent: [450, 2000, 6000, 12000, 14500, 17000], color: RULES.COLORS.DARK_BLUE, group: 'dark-blue', housePrice: 2000 },
    { id: 38, type: 'tax',      name: 'Contribuição de Iluminação', amount: 1000 },
    { id: 39, type: 'property', name: 'Av. Ana Costa',     price: 4000, rent: [500, 2500, 7500, 13500, 15500, 18500], color: RULES.COLORS.DARK_BLUE, group: 'dark-blue', housePrice: 2000 },
];
