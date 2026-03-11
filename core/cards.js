/**
 * @file core/cards.js
 * @description Definição do deck de cartas Sorte ou Revés com temática santista.
 */

export const LUCK_CARDS = [
    { title: '🍀 SORTE', text: 'Você encontrou uma nota de 50 mangos perdida na areia do Gonzaga.', type: 'money', value: 50 },
    { title: '⚓ SORTE', text: 'O Porto de Santos bateu recorde de movimentação. Como acionista, receba dividendos.', type: 'money', value: 1000 },
    { title: '🚢 REVÉS', text: 'A balsa Santos-Guarujá quebrou. Você perdeu o dia de trabalho. Pague M$ 200.', type: 'money', value: -200 },
    { title: '⚽ SORTE', text: 'O Santos FC ganhou o clássico na Vila Belmiro! Você ganhou a aposta. Receba M$ 500.', type: 'money', value: 500 },
    { title: '🚲 REVÉS', text: 'Você foi multado por andar de bicicleta no calçadão fora da ciclovia. Pague M$ 150.', type: 'money', value: -150 },
    { title: '🍦 SORTE', text: 'Dia de sol escaldante! Sua sorveteria no canal 3 bombou. Receba M$ 800.', type: 'money', value: 800 },
    { title: '🌧️ REVÉS', text: 'Chuva torrencial e maré alta! Seu carro ficou ilhado na Av. Nossa Senhora de Fátima. Conserto: M$ 600.', type: 'money', value: -600 },
    { title: '🎭 SORTE', text: 'Você ganhou ingressos para o Teatro Coliseu. Economizou no lazer. Receba M$ 100.', type: 'money', value: 100 },
    { title: '🚓 REVÉS', text: 'Vá direto para a Prisão sem passar pelo Ponto de Partida.', type: 'move', value: 10 },
    { title: '🏗️ SORTE', text: 'A prefeitura revitalizou a área do seu imóvel no Valongo. Valorização imediata! Receba M$ 1500.', type: 'money', value: 1500 },
    { title: '📉 REVÉS', text: 'Imposto predial aumentou acima da inflação. Pague M$ 400.', type: 'money', value: -400 },
    { title: '☕ SORTE', text: 'Você herdou uma antiga corretora de café no Centro Histórico. Receba M$ 2000.', type: 'money', value: 2000 },
    { title: '🍤 REVÉS', text: 'Comer pastel com caldo de cana no Mercado Municipal te fez mal. Gastos com farmácia: M$ 100.', type: 'money', value: -100 },
    { title: '🏃 SORTE', text: 'Você completou os 10km da Tribuna! Patrocinadores te pagaram M$ 300.', type: 'money', value: 300 },
    { title: '🛑 REVÉS', text: 'Você avançou o sinal no cruzamento da Ana Costa. Multa de M$ 250.', type: 'money', value: -250 },
    { title: '🌅 SORTE', text: 'Sua foto do pôr do sol no Quebra-Mar viralizou. Ganhou um prêmio de fotografia. Receba M$ 400.', type: 'money', value: 400 },
    { title: '🏨 REVÉS', text: 'O prédio torto onde você tem um apto precisou de manutenção urgente. Taxa extra: M$ 1000.', type: 'money', value: -1000 },
    { title: '🎉 SORTE', text: 'É aniversário de Santos! A cidade está em festa e você ganhou um bônus de M$ 200.', type: 'money', value: 200 },
    { title: '🏢 REVÉS', text: 'Sua loja no Shopping Balneário precisou de reforma. Pague M$ 500.', type: 'money', value: -500 },
    { title: '🚶 SORTE', text: 'Avance até o Ponto de Partida e receba M$ 2000.', type: 'move', value: 0 }
];
