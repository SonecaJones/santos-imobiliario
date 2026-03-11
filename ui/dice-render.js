/**
 * @file ui/dice-render.js
 * @description Renderiza os dados visualmente com animação.
 */

export class DiceUI {
    /**
     * Renderiza os dados na área designada.
     * @param {number} val1 
     * @param {number} val2 
     * @param {boolean} animating 
     */
    static render(val1, val2, animating = false) {
        const container = document.getElementById('dice-area');
        if (!container) return;

        container.innerHTML = `
            <div class="dice-wrapper ${animating ? 'rolling' : ''}">
                ${this.getDieHTML(val1)}
                ${this.getDieHTML(val2)}
            </div>
        `;
    }

    static getDieHTML(value) {
        // Mapeamento de posições dos pontos (dots) para cada valor do dado
        const dotPositions = {
            1: [4],
            2: [0, 8],
            3: [0, 4, 8],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 2, 3, 5, 6, 8]
        };

        const dots = Array(9).fill(0).map((_, i) => 
            `<div class="dot ${dotPositions[value].includes(i) ? 'visible' : ''}"></div>`
        ).join('');

        return `<div class="die">${dots}</div>`;
    }

    /**
     * Executa uma animação de rolagem antes de mostrar o resultado final.
     */
    static async animateRoll(finalVal1, finalVal2) {
        const duration = 600; // ms
        const interval = 50;  // ms
        let elapsed = 0;

        return new Promise(resolve => {
            const timer = setInterval(() => {
                const temp1 = Math.floor(Math.random() * 6) + 1;
                const temp2 = Math.floor(Math.random() * 6) + 1;
                this.render(temp1, temp2, true);

                elapsed += interval;
                if (elapsed >= duration) {
                    clearInterval(timer);
                    this.render(finalVal1, finalVal2, false);
                    resolve();
                }
            }, interval);
        });
    }
}
