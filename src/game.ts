import * as PIXI from 'pixi.js';

interface Card extends PIXI.Container {
    value: string;
}

class MemoryGame {
    private app: PIXI.Application;
    private cards: Card[];
    private flippedCards: Card[];
    private matchedPairs: number;
    private moves: number;
    private isLocked: boolean;
    private startTime: number | null;
    private timerInterval: number | null;

    constructor() {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1099bb,
        });
        document.body.appendChild(this.app.view as HTMLCanvasElement);

        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.isLocked = false;
        this.startTime = null;
        this.timerInterval = null;

        this.init();
    }

    private init(): void {
        this.createCards();
        this.shuffleCards();
        this.startTimer();
    }

    private createCards(): void {
        const cardValues: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const pairs: string[] = [...cardValues, ...cardValues];
        const startX = 150;
        const startY = 100;
        const cardWidth = 100;
        const cardHeight = 150;
        const padding = 20;

        pairs.forEach((value, index) => {
            const card = this.createCard(value);
            const row = Math.floor(index / 4);
            const col = index % 4;
            
            card.x = startX + col * (cardWidth + padding);
            card.y = startY + row * (cardHeight + padding);
            
            this.cards.push(card);
            this.app.stage.addChild(card);
        });
    }

    private createCard(value: string): Card {
        const card = new PIXI.Container() as Card;
        card.value = value;
        card.interactive = true;
        // buttonMode is deprecated, use cursor='pointer' instead
        card.cursor = 'pointer';

        // Create card back (blue rectangle)
        const back = new PIXI.Graphics();
        back.beginFill(0x0000ff);
        back.drawRoundedRect(0, 0, 100, 150, 10);
        back.endFill();

        // Create card front (white rectangle with text)
        const front = new PIXI.Graphics();
        front.beginFill(0xffffff);
        front.drawRoundedRect(0, 0, 100, 150, 10);
        front.endFill();

        const text = new PIXI.Text(value, {
            fontFamily: 'Arial',
            fontSize: 60,
            fill: 0x000000,
        });
        text.x = 35;
        text.y = 45;

        front.addChild(text);
        front.visible = false;

        card.addChild(back);
        card.addChild(front);

        card.on('pointerdown', () => this.flipCard(card));

        return card;
    }

    private flipCard(card: Card): void {
        if (this.isLocked || this.flippedCards.includes(card) || card.children[1].visible) {
            return;
        }

        if (!this.startTime) {
            this.startTime = Date.now();
        }

        card.children[0].visible = false;
        card.children[1].visible = true;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            const movesElement = document.getElementById('moves');
            if (movesElement) {
                movesElement.textContent = this.moves.toString();
            }
            this.checkMatch();
        }
    }

    private checkMatch(): void {
        this.isLocked = true;
        const [card1, card2] = this.flippedCards;

        if (card1.value === card2.value) {
            this.matchedPairs++;
            this.flippedCards = [];
            this.isLocked = false;

            if (this.matchedPairs === 8) {
                this.endGame();
            }
        } else {
            setTimeout(() => {
                card1.children[0].visible = true;
                card1.children[1].visible = false;
                card2.children[0].visible = true;
                card2.children[1].visible = false;
                this.flippedCards = [];
                this.isLocked = false;
            }, 1000);
        }
    }

    private shuffleCards(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tempX = this.cards[i].x;
            const tempY = this.cards[i].y;
            
            this.cards[i].x = this.cards[j].x;
            this.cards[i].y = this.cards[j].y;
            this.cards[j].x = tempX;
            this.cards[j].y = tempY;
        }
    }

    private startTimer(): void {
        this.timerInterval = window.setInterval(() => {
            if (this.startTime) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                const timerElement = document.getElementById('timer');
                if (timerElement) {
                    timerElement.textContent = 
                        `${minutes}:${seconds.toString().padStart(2, '0')}`;
                }
            }
        }, 1000);
    }

    private endGame(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        setTimeout(() => {
            alert(`Congratulations! You won in ${this.moves} moves!`);
        }, 500);
    }
}

// Start the game when the page loads
window.onload = () => {
    new MemoryGame();
}; 