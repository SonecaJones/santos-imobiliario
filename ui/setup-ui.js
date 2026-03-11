/**
 * @file ui/setup-ui.js
 * @description Gerencia a interface de configuração inicial do jogo.
 */

export class SetupUI {
    constructor(onStart) {
        this.onStart = onStart;
        this.players = [
            { name: 'Caiçara 1', color: '#e74c3c', type: 'human', piece: 'car' },
            { name: 'Bot Santista', color: '#3498db', type: 'bot', piece: 'ship' }
        ];
        
        this.init();
    }

    init() {
        this.renderList();
        
        document.getElementById('add-player-btn').onclick = () => this.addPlayer();
        document.getElementById('start-game-btn').onclick = () => this.startGame();
    }

    addPlayer() {
        if (this.players.length >= 6) return;
        
        const colors = ['#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
        const pieces = ['hat', 'car', 'ship'];
        
        this.players.push({
            name: `Jogador ${this.players.length + 1}`,
            color: colors[this.players.length % colors.length],
            type: 'bot',
            piece: pieces[this.players.length % pieces.length]
        });
        
        this.renderList();
    }

    removePlayer(index) {
        if (this.players.length <= 2) return;
        this.players.splice(index, 1);
        this.renderList();
    }

    renderList() {
        const container = document.getElementById('player-setup-list');
        container.innerHTML = '';

        this.players.forEach((p, i) => {
            const item = document.createElement('div');
            item.className = 'player-setup-item';
            
            item.innerHTML = `
                <input type="text" value="${p.name}" data-index="${i}" class="setup-name">
                <select data-index="${i}" class="setup-type">
                    <option value="human" ${p.type === 'human' ? 'selected' : ''}>👤 Humano</option>
                    <option value="bot" ${p.type === 'bot' ? 'selected' : ''}>🤖 Bot</option>
                </select>
                <select data-index="${i}" class="setup-piece">
                    <option value="car" ${p.piece === 'car' ? 'selected' : ''}>🚗 Carro</option>
                    <option value="ship" ${p.piece === 'ship' ? 'selected' : ''}>🚢 Navio</option>
                    <option value="hat" ${p.piece === 'hat' ? 'selected' : ''}>🎩 Chapéu</option>
                </select>
                <input type="color" value="${p.color}" data-index="${i}" class="setup-color">
                <button class="remove-player-btn" data-index="${i}">${i < 2 ? '🔒' : '✖'}</button>
            `;

            container.appendChild(item);
        });

        // Bind events
        container.querySelectorAll('.setup-name').forEach(el => el.onchange = (e) => this.players[e.target.dataset.index].name = e.target.value);
        container.querySelectorAll('.setup-type').forEach(el => el.onchange = (e) => this.players[e.target.dataset.index].type = e.target.value);
        container.querySelectorAll('.setup-piece').forEach(el => el.onchange = (e) => this.players[e.target.dataset.index].piece = e.target.value);
        container.querySelectorAll('.setup-color').forEach(el => el.onchange = (e) => this.players[e.target.dataset.index].color = e.target.value);
        container.querySelectorAll('.remove-player-btn').forEach(el => el.onclick = (e) => this.removePlayer(e.target.dataset.index));
    }

    startGame() {
        document.getElementById('setup-overlay').style.display = 'none';
        if (this.onStart) this.onStart(this.players);
    }
}
