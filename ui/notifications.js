/**
 * @file ui/notifications.js
 * @description Gerencia modais de decisão e notificações do sistema.
 */

export class NotificationUI {
    /**
     * Exibe um modal de confirmação (Sim/Não).
     * @param {string} title 
     * @param {string} message 
     * @returns {Promise<boolean>}
     */
    static async confirm(title, message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            
            overlay.innerHTML = `
                <div class="modal-content">
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="modal-actions">
                        <button id="modal-yes" class="action-button modal-btn">SIM</button>
                        <button id="modal-no" class="action-button modal-btn secondary">NÃO</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const handleDecision = (decision) => {
                overlay.remove();
                resolve(decision);
            };

            document.getElementById('modal-yes').onclick = () => handleDecision(true);
            document.getElementById('modal-no').onclick = () => handleDecision(false);
        });
    }

    /**
     * Exibe uma carta de Sorte ou Revés com animações especiais.
     * @param {object} card 
     */
    static async showLuckCard(card) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay card-modal';
            
            const isLuck = card.isPositive;
            
            overlay.innerHTML = `
                <div class="modal-content">
                    <div class="luck-card ${isLuck ? 'luck' : 'bad-luck'}" id="current-luck-card">
                        <!-- Partículas serão injetadas aqui -->
                        <div class="card-title">${card.title}</div>
                        <div class="card-body">
                            <p>${card.text}</p>
                            ${card.type === 'money' ? `<div class="card-value">${card.value > 0 ? '+' : ''}${card.value} Mangos</div>` : ''}
                        </div>
                        <div class="card-footer">SANTOS IMOBILIÁRIO</div>
                    </div>
                    <button id="modal-ok" class="action-button modal-btn" style="margin-top: 20px; display: none;">ENTENDIDO</button>
                </div>
            `;

            document.body.appendChild(overlay);

            // Injeta partículas
            const cardEl = document.getElementById('current-luck-card');
            const particleCount = 15;
            for (let i = 0; i < particleCount; i++) {
                const p = document.createElement('div');
                p.className = `particle ${isLuck ? 'sparkle' : 'rain-drop'}`;
                p.style.left = Math.random() * 100 + '%';
                p.style.top = Math.random() * 100 + '%';
                p.style.animationDelay = Math.random() * 2 + 's';
                cardEl.appendChild(p);
            }

            // Mostra o botão OK com atraso para forçar a leitura
            setTimeout(() => {
                const btn = document.getElementById('modal-ok');
                btn.style.display = 'block';
                btn.onclick = () => {
                    overlay.remove();
                    resolve();
                };
            }, 1500);
        });
    }

    /**
     * Exibe o título de posse (deed) de uma propriedade.
     * @param {object} property 
     * @param {string} ownerName 
     * @param {object} actions { canBuild, canMortgage, canUnmortgage, onBuild, onMortgage, onUnmortgage }
     */
    static showDeed(property, ownerName = 'Sem dono', actions = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        
        const isProperty = property.type === 'property';
        const isStation = property.type === 'station';

        overlay.innerHTML = `
            <div class="modal-content deed-modal">
                <div class="deed-card">
                    <div class="deed-header" style="background-color: ${property.color || '#95a5a6'}">
                        TÍTULO DE POSSE
                        <div class="deed-name">${property.name}</div>
                    </div>
                    <div class="deed-body">
                        ${isProperty ? `
                            <div class="rent-row">Aluguel: <span>M$ ${property.rent[0]}</span></div>
                            <div class="rent-row">Com 1 casa: <span>M$ ${property.rent[1]}</span></div>
                            <div class="rent-row">Com 2 casas: <span>M$ ${property.rent[2]}</span></div>
                            <div class="rent-row">Com 3 casas: <span>M$ ${property.rent[3]}</span></div>
                            <div class="rent-row">Com 4 casas: <span>M$ ${property.rent[4]}</span></div>
                            <div class="rent-row rent-hotel">Com HOTEL: <span>M$ ${property.rent[5]}</span></div>
                            <hr>
                            <div class="deed-footer">
                                <p>Custo da Casa: M$ ${property.housePrice}</p>
                                <p>Custo do Hotel: M$ ${property.housePrice}</p>
                                <p>Valor da Hipoteca: M$ ${property.price / 2}</p>
                            </div>
                        ` : isStation ? `
                            <p>Se você possui 1 serviço: M$ 250</p>
                            <p>Se você possui 2 serviços: M$ 500</p>
                            <p>Se você possui 3 serviços: M$ 1000</p>
                            <p>Se você possui 4 serviços: M$ 2000</p>
                            <hr>
                            <div class="deed-footer">
                                <p>Valor da Hipoteca: M$ ${property.price / 2}</p>
                            </div>
                        ` : '<p>Propriedade especial.</p>'}
                    </div>
                </div>
                <div class="deed-info">
                    <p>Dono atual: <strong>${ownerName}</strong> ${property.mortgaged ? '<span class="status-tag jail">Hipotecado</span>' : ''}</p>
                    <p>Construções: <strong>${property.houses === 5 ? '1 Hotel' : (property.houses || 0) + ' Casas'}</strong></p>
                    <div class="modal-actions" style="margin-top:10px; flex-wrap: wrap;">
                        ${actions.canBuild ? `<button id="modal-build" class="action-button modal-btn">CONSTRUIR (M$ ${property.housePrice})</button>` : ''}
                        ${actions.canMortgage ? `<button id="modal-mortgage" class="action-button modal-btn secondary">HIPOTECAR (+M$ ${property.price / 2})</button>` : ''}
                        ${actions.canUnmortgage ? `<button id="modal-unmortgage" class="action-button modal-btn">DESIPOTECAR (-M$ ${(property.price / 2 * 1.1).toFixed(0)})</button>` : ''}
                        <button id="modal-close" class="action-button modal-btn secondary">FECHAR</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        if (actions.canBuild) document.getElementById('modal-build').onclick = () => { actions.onBuild(property.id); overlay.remove(); };
        if (actions.canMortgage) document.getElementById('modal-mortgage').onclick = () => { actions.onMortgage(property.id); overlay.remove(); };
        if (actions.canUnmortgage) document.getElementById('modal-unmortgage').onclick = () => { actions.onUnmortgage(property.id); overlay.remove(); };

        document.getElementById('modal-close').onclick = () => overlay.remove();
        overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    }
}
