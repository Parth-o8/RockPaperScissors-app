
[...document.querySelectorAll('.nav-link')].forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            if (href === '#about-section') {
                // Scroll to the very bottom of the page
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            } else {
                document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});


const howToPlayBtn = document.getElementById('howToPlayBtn');
if (howToPlayBtn) {
    howToPlayBtn.addEventListener('click', function () {
        document.querySelector('#about-section').scrollIntoView({ behavior: 'smooth' });
    });
}

const introPopup = document.getElementById('intro-popup');
const introTitle = document.querySelector('.intro-title');
const introGetReady = document.querySelector('.intro-getready');
const startGameBtn = document.getElementById('startGameBtn');

startGameBtn.addEventListener('click', function (e) {
    e.preventDefault();
    resetGameState();
    introPopup.style.display = 'flex';
    introTitle.style.animation = 'slideInLeft 1s';
    introGetReady.style.opacity = 0;
    setTimeout(() => {
        introGetReady.style.opacity = 1;
        introGetReady.style.animation = 'getReadyBlink 1s infinite alternate';
    }, 1000);
    setTimeout(() => {
        introPopup.style.opacity = 0;
        setTimeout(() => {
            introPopup.style.display = 'none';
            const section = document.querySelector('#game-section');
            const y = section.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }, 600);
    }, 3000);
});


const moves = ['rock', 'paper', 'scissors'];
const moveImgs = {
    rock: 'ROCK.png',
    paper: 'PAPER.png',
    scissors: 'SCISSORS.png'
};
let round = 1;
let playerScore = 0;
let aiScore = 0;
let isAnimating = false;

const roundIndicator = document.getElementById('round-indicator');
const feedback = document.getElementById('feedback');
const resultText = document.getElementById('result');
const aiThrowReel = document.getElementById('ai-throw-reel');
const aiChoiceText = document.getElementById('ai-choice-text');
const playerForm = document.getElementById('player-form');
const throwBtn = document.getElementById('throwBtn');
const progressDots = document.querySelectorAll('.progress-dot');
const scorePlayer = document.getElementById('score-player');
const scoreAi = document.getElementById('score-ai');

document.querySelectorAll('.player-option').forEach(option => {
    option.addEventListener('click', function () {
        if (isAnimating) return;
        document.querySelectorAll('.player-option').forEach(o => o.classList.remove('selected'));
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
    });
});


playerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isAnimating || round > 5) return;
    const selected = playerForm.querySelector('input[name="player-move"]:checked');
    if (!selected) {
        feedback.textContent = "Pick Rock, Paper, or Scissors!";
        return;
    }
    isAnimating = true;
    throwBtn.disabled = true;
    feedback.textContent = "AI is thinking...";
    resultText.textContent = "";
    aiChoiceText.textContent = "Computer chose: ____";

    let animCount = 0;
    let aiMove = moves[Math.floor(Math.random() * 3)];
    let reelImgs = aiThrowReel.querySelectorAll('.throw-reel-img');
    let interval = setInterval(() => {
        animCount++;
        let idx = animCount % 3;
        reelImgs.forEach((img, i) => {

            img.style.transform = `translateX(${(i - idx) * 80}px) scale(${i === 1 ? 1.15 : 1}) rotate(${(i - idx) * 10}deg)`;
            img.style.filter = i === 1 ? "drop-shadow(0 0 16px #ffeb3b)" : "drop-shadow(0 0 8px #00fff7)";
        });
        if (animCount > 15) {
            clearInterval(interval);

            reelImgs.forEach((img, i) => {
                img.src = moveImgs[moves[(moves.indexOf(aiMove) + i - 1 + 3) % 3]];
                img.alt = moves[(moves.indexOf(aiMove) + i - 1 + 3) % 3];
                img.style.transform = `translateX(${(i - 1) * 80}px) scale(${i === 1 ? 1.25 : 1}) rotate(${(i - 1) * 10}deg)`;
                img.style.filter = i === 1 ? "drop-shadow(0 0 24px #ffeb3b)" : "drop-shadow(0 0 8px #00fff7)";
            });
            setTimeout(() => {

                reelImgs[1].style.transform = `translateX(0) scale(1.15) rotate(0deg)`;
                setTimeout(() => {
                    reelImgs[1].style.transform = `translateX(0) scale(1) rotate(0deg)`;
                }, 180);
            }, 200);

            aiChoiceText.textContent = `Computer chose: ${aiMove.charAt(0).toUpperCase() + aiMove.slice(1)}`;

            setTimeout(() => {
                const playerMove = selected.value;
                let outcome = '';
                if (playerMove === aiMove) {
                    outcome = "It's a Draw!";
                } else if (
                    (playerMove === 'rock' && aiMove === 'scissors') ||
                    (playerMove === 'paper' && aiMove === 'rock') ||
                    (playerMove === 'scissors' && aiMove === 'paper')
                ) {
                    outcome = "You Win!";
                    playerScore++;
                } else {
                    outcome = "You Lose!";
                    aiScore++;
                }
                resultText.textContent = outcome;
                resultText.classList.remove('win', 'lose');
                if (outcome === "You Win!") {
                    resultText.classList.add('win');
                } else if (outcome === "You Lose!") {
                    resultText.classList.add('lose');
                }
                feedback.textContent = `You chose: ${playerMove.charAt(0).toUpperCase() + playerMove.slice(1)}. AI chose: ${aiMove.charAt(0).toUpperCase() + aiMove.slice(1)}.`;

                scorePlayer.textContent = playerScore;
                scoreAi.textContent = aiScore;

                progressDots[round - 1].classList.add('active');
                round++;
                if (round <= 5) {
                    roundIndicator.textContent = `Round ${round} of 5`;
                }
                if (round > 5) {
                    setTimeout(() => {
                        showGameOver(
                            playerScore > aiScore ? "YOU WIN!" : (playerScore < aiScore ? "YOU LOSE!" : "IT'S A DRAW!"),
                            playerScore,
                            aiScore
                        );
                    }, 900);
                } else {
                    setTimeout(() => {
                        feedback.textContent = "Make your move!";
                        resultText.textContent = "";
                        aiChoiceText.textContent = "Computer chose: ____";
                        // Reset reel to default
                        reelImgs.forEach((img, i) => {
                            img.src = moveImgs[moves[i]];
                            img.alt = moves[i];
                            img.style.transform = `translateX(0) scale(1) rotate(0deg)`;
                            img.style.filter = "drop-shadow(0 0 8px #00fff7)";
                        });
                        document.querySelectorAll('.player-option').forEach(o => {
                            o.classList.remove('selected');
                            o.querySelector('input[type="radio"]').checked = false;
                        });
                        throwBtn.disabled = false;
                        isAnimating = false;
                    }, 1800);
                }
            }, 400);
        }
    }, 70);
});


const gameoverPopup = document.getElementById('gameover-popup');
const gameoverTitle = document.getElementById('gameover-title');
const gameoverScore = document.getElementById('gameover-score');
const playAgainBtn = document.getElementById('playAgainBtn');
const backHomeBtn = document.getElementById('backHomeBtn');
const viewScoreboardBtn = document.getElementById('viewScoreboardBtn');


const scoreboardSection = document.getElementById('scoreboard-section');
const scoreboardStatus = document.getElementById('scoreboard-status');
const scoreboardResult = document.getElementById('scoreboard-result');
const scoreboardWins = document.getElementById('scoreboard-wins');
const scoreboardLosses = document.getElementById('scoreboard-losses');
const scoreboardDraws = document.getElementById('scoreboard-draws');
const scoreboardHomeBtn = document.getElementById('scoreboardHomeBtn');
const scoreboardPlayAgainBtn = document.getElementById('scoreboardPlayAgainBtn');

function showGameOver(result, playerScore, aiScore) {
    gameoverTitle.textContent = result;
    gameoverScore.textContent = `Final Score: You ${playerScore} - ${aiScore} AI`;
    gameoverPopup.style.display = 'flex';
    setTimeout(() => { gameoverPopup.style.opacity = 1; }, 10);
}

function hideGameOver() {
    gameoverPopup.style.opacity = 0;
    setTimeout(() => { gameoverPopup.style.display = 'none'; }, 600);
}

function showScoreboard(result, wins, losses, draws) {
    if (scoreboardSection) scoreboardSection.style.display = 'flex';
    if (scoreboardStatus) scoreboardStatus.textContent = result === "YOU WIN!" ? "🎉 You Won the Match!" : (result === "YOU LOSE!" ? "😢 You Lost the Match!" : "🤝 It's a Draw!");
    if (scoreboardResult) scoreboardResult.textContent = result;
    if (scoreboardWins) scoreboardWins.textContent = wins;
    if (scoreboardLosses) scoreboardLosses.textContent = losses;
    if (scoreboardDraws) scoreboardDraws.textContent = draws;
    // Hide other sections
    document.getElementById('game-section').style.display = 'none';
    document.getElementById('landing').style.display = 'none';
    document.getElementById('about-section').style.display = 'none';
}

if (playAgainBtn) {
    playAgainBtn.onclick = function () {
        hideGameOver();
        setTimeout(() => {
            document.querySelector('#game-section').scrollIntoView({ behavior: 'smooth' });
            resetGameState();
        }, 600);
    };
}
if (backHomeBtn) {
    backHomeBtn.onclick = function () {
        hideGameOver();
        setTimeout(() => {
            document.querySelector('#landing').scrollIntoView({ behavior: 'smooth' });
            resetGameState();
        }, 600);
    };
}
if (viewScoreboardBtn) {
    viewScoreboardBtn.onclick = function () {
        hideGameOver();
        setTimeout(() => {
            let wins = playerScore;
            let losses = aiScore;
            let draws = 5 - wins - losses;
            showScoreboard(gameoverTitle.textContent, wins, losses, draws);
            document.querySelector('#scoreboard-section').scrollIntoView({ behavior: 'smooth' });
        }, 600);
    };
}
if (scoreboardHomeBtn) {
    scoreboardHomeBtn.onclick = function () {
        scoreboardSection.style.display = 'none';
        document.getElementById('landing').style.display = '';
        document.getElementById('game-section').style.display = '';
        document.getElementById('about-section').style.display = '';
        document.querySelector('#landing').scrollIntoView({ behavior: 'smooth' });
        resetGameState();
    };
}
if (scoreboardPlayAgainBtn) {
    scoreboardPlayAgainBtn.onclick = function () {
        scoreboardSection.style.display = 'none';
        document.getElementById('game-section').style.display = '';
        document.getElementById('landing').style.display = '';
        document.getElementById('about-section').style.display = '';
        document.querySelector('#game-section').scrollIntoView({ behavior: 'smooth' });
        resetGameState();
    };
}


function resetGameState() {
    round = 1;
    playerScore = 0;
    aiScore = 0;
    isAnimating = false;
    if (roundIndicator) roundIndicator.textContent = "Round 1 of 5";
    if (scorePlayer) scorePlayer.textContent = "0";
    if (scoreAi) scoreAi.textContent = "0";
    if (feedback) feedback.textContent = "Make your move!";
    if (resultText) resultText.textContent = "";
    if (aiChoiceText) aiChoiceText.textContent = "Computer chose: ____";
    if (progressDots) progressDots.forEach(dot => dot.classList.remove('active'));
    document.querySelectorAll('.player-option').forEach(o => {
        o.classList.remove('selected');
        o.querySelector('input[type="radio"]').checked = false;
    });
    const reelImgs = document.querySelectorAll('.throw-reel-img');
    if (reelImgs.length === 3) {
        reelImgs.forEach((img, i) => {
            img.src = moveImgs[moves[i]];
            img.alt = moves[i];
            img.style.transform = `translateX(0) scale(1) rotate(0deg)`;
            img.style.filter = "drop-shadow(0 0 8px #00fff7)";
        });
    }
    if (throwBtn) throwBtn.disabled = false;
}


function toggleNavbarOnScroll() {
    const navbar = document.getElementById('navbar');
    const landing = document.getElementById('landing');
    const rect = landing.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom > 80) {
        navbar.classList.remove('hide-navbar');
    } else {
        navbar.classList.add('hide-navbar');
    }
}
window.addEventListener('scroll', toggleNavbarOnScroll);
window.addEventListener('resize', toggleNavbarOnScroll);
document.addEventListener('DOMContentLoaded', toggleNavbarOnScroll);


window.addEventListener('DOMContentLoaded', function() {
    // Scroll to the top or to the landing section on reload
    const landing = document.getElementById('landing');
    if (landing) {
        landing.scrollIntoView({ behavior: 'auto' });
    } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }
});