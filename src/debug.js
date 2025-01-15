import Game from './game.js';

const gameArea = document.querySelector('.game-area');
const timerDisplay = document.getElementById('game-timer');
const scoreDisplay = document.getElementById('game-score');
const startButton = document.getElementById('start-game');

function handleGameEnd(score) {
    alert(`Debug Game Over! Your score: ${score}`);
}

const debugGame = new Game(gameArea, timerDisplay, scoreDisplay, handleGameEnd);

startButton.addEventListener('click', () => {
    debugGame.start();
});