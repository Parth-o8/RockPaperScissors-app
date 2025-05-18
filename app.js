// --- NAVIGATION ---
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#about-section') {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        } else if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// --- LANDING BUTTONS ---
const startGameBtn = document.getElementById('startGameBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
if (howToPlayBtn) {
    howToPlayBtn.addEventListener('click', function() {
        const aboutSection = document.querySelector('#about-section');
        if (aboutSection) aboutSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// --- INTRO POPUP LOGIC ---
const introPopup = document.getElementById('intro-popup');
const introTitle = document.querySelector('.intro-title');
const introGetReady = document.querySelector('.intro-getready');
const introBegin = document.getElementById('intro-begin');

if (startGameBtn && introPopup && introTitle && introGetReady && introBegin) {
    startGameBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetGameState();
        introPopup.style.display = 'flex';
        introPopup.style.opacity = 1;
        introTitle.style.animation = 'slideInLeft 1s';
        introGetReady.style.display = 'block';
        introGetReady.style.opacity = 0;
        introBegin.style.display = 'none';

        setTimeout(() => {
            introGetReady.style.opacity = 1;
            introGetReady.style.animation = 'getReadyBlink 1s infinite alternate';
        }, 400);

        setTimeout(() => {
            introGetReady.style.display = 'none';
            introBegin.style.display = 'block';
            introBegin.style.animation = 'beginPop 0.7s cubic-bezier(.4,2,.6,1)';
        }, 1400);

        setTimeout(() => {
            introPopup.style.opacity = 0;
            setTimeout(() => {
                introPopup.style.display = 'none';
                const arenaContainer = document.querySelector('.arena-container');
                if (arenaContainer) {
                    const y = arenaContainer.getBoundingClientRect().top + window.pageYOffset - 10;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, 400);
        }, 2400);
    });
}

// --- GAME LOGIC ---
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
        const radio = this.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    });
});

if (playerForm && throwBtn && aiThrowReel && aiChoiceText && feedback && resultText && roundIndicator && scorePlayer && scoreAi) {
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
        // Animate sideways reel
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
                // Show AI's actual move in the center
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
                // Evaluate result
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
                    feedback.textContent = `You chose: ${playerMove.charAt(0).toUpperCase() + playerMove.slice(1)}. AI chose: ${aiMove.charAt(0).toUpperCase() + aiMove.slice(1)}.`;
                    // Update scores
                    scorePlayer.textContent = playerScore;
                    scoreAi.textContent = aiScore;
                    // Progress dots
                    if (progressDots[round - 1]) progressDots[round - 1].classList.add('active');
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
                                const radio = o.querySelector('input[type="radio"]');
                                if (radio) radio.checked = false;
                            });
                            throwBtn.disabled = false;
                            isAnimating = false;
                        }, 1800);
                    }
                }, 400);
            }
        }, 70);
    });
}

// --- GAME OVER POPUP ---
const gameoverPopup = document.getElementById('gameover-popup');
const gameoverTitle = document.getElementById('gameover-title');
const gameoverScore = document.getElementById('gameover-score');
const playAgainBtn = document.getElementById('playAgainBtn');
const backHomeBtn = document.getElementById('backHomeBtn');
const viewScoreboardBtn = document.getElementById('viewScoreboardBtn');

// --- SCOREBOARD LOGIC ---
const scoreboardSection = document.getElementById('scoreboard-section');
const scoreboardStatus = document.getElementById('scoreboard-status');
const scoreboardWins = document.getElementById('scoreboard-wins');
const scoreboardLosses = document.getElementById('scoreboard-losses');
const scoreboardDraws = document.getElementById('scoreboard-draws');
const scoreboardHomeBtn = document.getElementById('scoreboardHomeBtn');
const scoreboardPlayAgainBtn = document.getElementById('scoreboardPlayAgainBtn');

function showGameOver(result, playerScore, aiScore) {
    if (gameoverTitle) gameoverTitle.textContent = result;
    if (gameoverScore) gameoverScore.textContent = `Final Score: You ${playerScore} - ${aiScore} AI`;
    if (gameoverPopup) {
        gameoverPopup.style.display = 'flex';
        setTimeout(() => { gameoverPopup.style.opacity = 1; }, 10);
    }
}

function hideGameOver() {
    if (gameoverPopup) {
        gameoverPopup.style.opacity = 0;
        setTimeout(() => { gameoverPopup.style.display = 'none'; }, 600);
    }
}

function showScoreboard(result, wins, losses, draws) {
    if (scoreboardSection) scoreboardSection.style.display = 'flex';
    if (scoreboardStatus) scoreboardStatus.textContent = result === "YOU WIN!" ? "🎉 You Won the Match!" : (result === "YOU LOSE!" ? "😢 You Lost the Match!" : "🤝 It's a Draw!");
    if (scoreboardWins) scoreboardWins.textContent = wins;
    if (scoreboardLosses) scoreboardLosses.textContent = losses;
    if (scoreboardDraws) scoreboardDraws.textContent = draws;
    // Hide other sections
    const gameSection = document.getElementById('game-section');
    const landing = document.getElementById('landing');
    const aboutSection = document.getElementById('about-section');
    if (gameSection) gameSection.style.display = 'none';
    if (landing) landing.style.display = 'none';
    if (aboutSection) aboutSection.style.display = 'none';
}

if (playAgainBtn) {
    playAgainBtn.onclick = function() {
        hideGameOver();
        setTimeout(() => {
            const gameSection = document.getElementById('game-section');
            if (gameSection) gameSection.style.display = '';
            gameSection?.scrollIntoView({behavior:'smooth'});
            resetGameState();
        }, 600);
    };
}
if (backHomeBtn) {
    backHomeBtn.onclick = function() {
        hideGameOver();
        setTimeout(() => {
            const landing = document.getElementById('landing');
            if (landing) landing.style.display = '';
            landing?.scrollIntoView({behavior:'smooth'});
            resetGameState();
        }, 600);
    };
}
if (viewScoreboardBtn) {
    viewScoreboardBtn.onclick = function() {
        hideGameOver();
        setTimeout(() => {
            let wins = playerScore;
            let losses = aiScore;
            let draws = 5 - wins - losses;
            showScoreboard(gameoverTitle ? gameoverTitle.textContent : '', wins, losses, draws);
            const scoreboardSection = document.getElementById('scoreboard-section');
            scoreboardSection?.scrollIntoView({behavior:'smooth'});
        }, 600);
    };
}
if (scoreboardHomeBtn) {
    scoreboardHomeBtn.onclick = function() {
        if (scoreboardSection) scoreboardSection.style.display = 'none';
        const landing = document.getElementById('landing');
        const gameSection = document.getElementById('game-section');
        const aboutSection = document.getElementById('about-section');
        if (landing) landing.style.display = '';
        if (gameSection) gameSection.style.display = '';
        if (aboutSection) aboutSection.style.display = '';
        landing?.scrollIntoView({behavior:'smooth'});
        resetGameState();
    };
}
if (scoreboardPlayAgainBtn) {
    scoreboardPlayAgainBtn.onclick = function() {
        if (scoreboardSection) scoreboardSection.style.display = 'none';
        const gameSection = document.getElementById('game-section');
        const landing = document.getElementById('landing');
        const aboutSection = document.getElementById('about-section');
        if (gameSection) gameSection.style.display = '';
        if (landing) landing.style.display = '';
        if (aboutSection) aboutSection.style.display = '';
        gameSection?.scrollIntoView({behavior:'smooth'});
        resetGameState();
    };
}

// --- RESET GAME STATE ---
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
        const radio = o.querySelector('input[type="radio"]');
        if (radio) radio.checked = false;
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

// --- NAVBAR SHOW/HIDE ON SCROLL ---
function toggleNavbarOnScroll() {
    const navbar = document.getElementById('navbar');
    const landing = document.getElementById('landing');
    if (!navbar || !landing) return;
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