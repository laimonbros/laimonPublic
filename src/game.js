// src/game.js
export default class Game {
    constructor(gameArea, timerDisplay, scoreDisplay, onGameEnd,gameScreen) {

        this.gameScreen = gameScreen;
        this.gameArea = gameArea; // HTML main game zone
        this.timerDisplay = timerDisplay; // Element to show timer
        this.scoreDisplay = scoreDisplay; // Element to show counter
        this.onGameEnd = onGameEnd; // Callback for game end 

        this.score = 0;
        this.timer = 30;
        this.gameInterval = null;
        this.timerInterval = null;
    }

    // Start game
    start() {
        this.resetGame();
        this.startTimer();
        this.spawnLemons();
        this.gameScreen.style.display = 'flex';
    }

    // Reset settings 
    resetGame() {
        this.score = 0;
        this.timer = 30;
        this.updateScoreDisplay();
        this.updateTimerDisplay();
        this.clearGameArea();
    }

    // Reset timer 
    updateTimerDisplay() {
        this.timerDisplay.innerText = `00:${this.timer < 10 ? '0' + this.timer : this.timer}`;
    }

    // Reset Count 
    updateScoreDisplay() {
        this.scoreDisplay.innerText = this.score.toString();
    }

    // Clean Game Area 
    clearGameArea() {
        this.gameArea.innerHTML = '';
    }

    // Start timer 
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();

            if (this.timer <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    //  Generate Lemons 
    spawnLemons() {
        this.gameInterval = setInterval(() => {
            const lemon = document.createElement('div');
            const type = Math.ceil(Math.random() * 4);
            const isBig = type === 3 || type === 4;

            lemon.className = `lemon type-${type} ${isBig ? 'big' : 'small'}`;
            lemon.style.position = 'absolute';
            lemon.style.left = `${Math.random() * (this.gameArea.offsetWidth - 60)}px`;
            lemon.style.top = '-60px';

            const fallDuration = Math.random() * 1.5 + 1.5;
            lemon.style.transition = `top ${fallDuration}s linear`;

            setTimeout(() => {
                lemon.style.top = `${this.gameArea.offsetHeight + 60}px`;
            }, 0);

            // Click processor 
            lemon.addEventListener('pointerdown', (event) => {
                this.score += isBig ? 5 : 1;
                this.updateScoreDisplay();

                // Add splash 
                const splash = document.createElement('div');
                splash.className = 'lemon-splash';
                splash.style.left = `${event.clientX - 25}px`;
                splash.style.top = `${event.clientY - 25}px`;
                this.gameArea.appendChild(splash);

                // Remove splash 
                setTimeout(() => splash.remove(), 500);

                lemon.remove();
            });

            // Remove lemons on fall 
            lemon.addEventListener('transitionend', () => {
                if (lemon.parentElement) lemon.remove();
            });

            this.gameArea.appendChild(lemon);
        }, 300);
    }



    // Game end
    endGame() {
        clearInterval(this.timerInterval);
        clearInterval(this.gameInterval);
        this.onGameEnd(this.score); // Callback with final result 
        this.gameScreen.style.display = 'none';
    }
}
