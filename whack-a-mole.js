document.addEventListener('DOMContentLoaded', () => {

    const holes = document.querySelectorAll('.hole');
    const moles = document.querySelectorAll('.mole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const pauseButton = document.getElementById('pause-button'); // Added for pause feature
    const soundToggle = document.getElementById('sound-toggle');
    const gameOverTag = document.getElementById('game-over-tag');
    const scorePopup = document.getElementById('score-popup');
    const finalScoreDisplay = document.getElementById('final-score');
    const highScoreDisplay = document.getElementById('high-score');
    
    // Level selection elements
    const levelSelect = document.getElementById('level-select');
    
    // Theme selection elements
    const themeSelect = document.getElementById('theme-select');
    
    let highScore = localStorage.getItem('highScore') || 0;
    highScoreDisplay.textContent = highScore;

    let score = 0;
    let timeLeft = 30;
    let gameTimer;
    let moleTimer;
    let isPlaying = false;
    let isPaused = false; // Added for pause feature
    let currentLevel = 'easy';
    let goldenMoleChance = 0.15; // 15% chance for golden mole
    let bombMoleChance = 0.15;   // 15% chance for bomb mole
    let goldenScoreBonus = 5;
    let bombScorePenalty = 5;
    
    const levelConfig = {
        easy: {
            timeLimit: 30,
            minMoleTime: 800,
            maxMoleTime: 1500,
            label: 'Easy',
            background: '#90ee90'

        },
        medium: {
            timeLimit: 45,
            minMoleTime: 500,
            maxMoleTime: 1000,
            label: 'Medium',
            background: '#fff97eff'
        },
        hard: {
            timeLimit: 60,
            minMoleTime: 300,
            maxMoleTime: 700,
            label: 'Hard',
            background: '#eb9e9e'
        }
    };

    const whackSound = new Audio('sounds/whack.mp3');
    const gameOverSound = new Audio('sounds/game-over.mp3');
    const backgroundMusic = new Audio('sounds/background.mp3');
    
    backgroundMusic.loop = false;
    backgroundMusic.volume = 0.5;
    
    pauseButton.disabled = true; // Added for pause feature

    // Initialize theme
    const savedTheme = localStorage.getItem('gameTheme') || 'classic';
    document.body.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;
    
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        document.body.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('gameTheme', selectedTheme);
    });
    
    levelSelect.addEventListener('change', () => {
        currentLevel = levelSelect.value;
        timeDisplay.textContent = levelConfig[currentLevel].timeLimit;
        document.getElementById('level-select').style.background = levelConfig[currentLevel].background;
        const levelName = levelConfig[currentLevel].label;
        startButton.innerHTML = `<i class="fas fa-play"></i> Start Game (${levelName})`;
    });
    
    function initGame() {
        score = 0;
        timeLeft = levelConfig[currentLevel].timeLimit;
        isPlaying = true;
        isPaused = false; // Added for pause feature
        
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        startButton.disabled = true;
        pauseButton.disabled = false; // Added for pause feature
        pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause'; // Added for pause feature
        gameOverTag.style.display = 'none';
        scorePopup.style.display = 'none';
        levelSelect.disabled = true;
        
        const soundEnabled = soundToggle.checked;
        if (soundEnabled) {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
            setTimeout(() => {
                if (isPlaying) {
                    backgroundMusic.pause();
                }
            }, (timeLeft - 1) * 1000);
        }
        
        gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft === 1) {
                if (soundEnabled) {
                    gameOverSound.currentTime = 0;
                    gameOverSound.load();
                }
            }
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        showMole();
    }
    
    let lastHoleIndex = -1;

    function showMole() {
        moles.forEach(mole => {
            mole.classList.remove('active', 'golden', 'bomb');
        });

        if (!isPlaying || isPaused) return;

        clearTimeout(moleTimer);

        // Pick a random hole different from last hole
        let randomHole;
        if (holes.length === 1) {
            randomHole = 0;
        } else {
            do {
                randomHole = Math.floor(Math.random() * holes.length);
            } while (randomHole === lastHoleIndex);
        }
        lastHoleIndex = randomHole;

        const mole = holes[randomHole].querySelector('.mole');

        const rand = Math.random();
        if (rand < goldenMoleChance) {
            mole.classList.add('golden');
        } else if (rand < goldenMoleChance + bombMoleChance) {
            mole.classList.add('bomb');
        }

        mole.classList.add('active');

        const config = levelConfig[currentLevel];
        const showTime = Math.random() * (config.maxMoleTime - config.minMoleTime) + config.minMoleTime;

        moleTimer = setTimeout(() => {
            mole.classList.remove('active', 'golden', 'bomb');
            if (isPlaying) showMole();
        }, showTime);
    }
    
    function endGame() {
        clearInterval(gameTimer);
        clearTimeout(moleTimer);
        isPlaying = false;
        isPaused = false;
        pauseButton.disabled = true;
        
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        
        levelSelect.disabled = false;
        backgroundMusic.pause();
        
        const soundEnabled = soundToggle.checked;
        if (soundEnabled) {
            gameOverSound.play().catch(error => {
                console.log("Game over sound failed:", error);
            });
        }
        
        gameOverTag.style.display = 'block';
        finalScoreDisplay.textContent = score;
        scorePopup.style.display = 'block';

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
        
        setTimeout(() => {
            startButton.disabled = false;
            const levelName = levelConfig[currentLevel].label;
            startButton.innerHTML = `<i class="fas fa-play"></i> Start Game (${levelName})`;
        }, 3000);
        
        try {
            // Read existing history or initialize empty array
            const historyJSON = localStorage.getItem('whackAMoleHistory');
            const history = historyJSON ? JSON.parse(historyJSON) : [];

            // Create a new record with score and current date/time as ISO string
            const newRecord = {
                score: score,
                timestamp: new Date().toISOString(),
            };

            // Add new record
            history.push(newRecord);

            // Save updated history back to localStorage
            localStorage.setItem('whackAMoleHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save game history:', error);
        }
    }
    
    startButton.addEventListener('click', initGame);
    
    // --- Entire block added for pause feature ---
    pauseButton.addEventListener('click', () => {
        if (!isPlaying) return;

        isPaused = !isPaused;

        if (isPaused) {
            // Pause the game
            clearInterval(gameTimer);
            clearTimeout(moleTimer);
            backgroundMusic.pause();
            pauseButton.innerHTML = '<i class="fas fa-play"></i> Resume';
        } else {
            // Resume the game
            pauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
            if (soundToggle.checked) {
                backgroundMusic.play().catch(error => console.log("Audio play failed:", error));
            }

            const soundEnabled = soundToggle.checked;
            gameTimer = setInterval(() => {
                timeLeft--;
                timeDisplay.textContent = timeLeft;
                if (timeLeft === 1 && soundEnabled) {
                    gameOverSound.currentTime = 0;
                    gameOverSound.load();
                }
                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);

            showMole();
        }
    });
    // --- End of pause feature block ---

    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener('click', function () {
        if (isPlaying) {
            clearInterval(gameTimer);
            clearTimeout(moleTimer);
            backgroundMusic.pause();
            isPlaying = false;
        }
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        levelSelect.disabled = false;
        initGame();
    });

    moles.forEach(mole => {
        mole.addEventListener('click', function () {
            if (!isPlaying || isPaused) return;

            if (mole.classList.contains('active') && !mole.classList.contains('whacked')) {
                const soundEnabled = soundToggle.checked;
                if (soundEnabled) {
                    whackSound.currentTime = 0;
                    whackSound.play().catch(error => {
                        console.log("Audio play failed:", error);
                    });
                }

                if (mole.classList.contains('golden')) {
                    score += goldenScoreBonus;
                } else if (mole.classList.contains('bomb')) {
                    score -= bombScorePenalty;
                    if (score < 0) {
                        endGame();
                        return;
                    }
                } else {
                    score++;
                }

                scoreDisplay.textContent = score;
                mole.classList.add('whacked');

                setTimeout(() => {
                    mole.classList.remove('active', 'whacked', 'golden', 'bomb');
                }, 300);
            }
        });
    });

    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const howToModal = document.getElementById('how-to-modal');
    const closeBtn = document.getElementById('close-modal');

    howToPlayBtn.addEventListener('click', () => {
      howToModal.style.display = 'block';
    });
    closeBtn.addEventListener('click', () => {
      howToModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target === howToModal) {
        howToModal.style.display = 'none';
      }
    });

    soundToggle.addEventListener('change', function() {
        const soundEnabled = this.checked;
        whackSound.volume = soundEnabled ? 1.0 : 0;
        gameOverSound.volume = soundEnabled ? 1.0 : 0;
        backgroundMusic.volume = soundEnabled ? 0.5 : 0;
        
        if (isPlaying && !isPaused && soundEnabled && backgroundMusic.paused) { 
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
        }
        if (isPlaying && !soundEnabled && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    });

    const themeToggleBtn = document.getElementById('theme-toggle');

    if (localStorage.getItem('theme') === 'dark') {
      document.body.classList.add('dark-mode');
      themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Toggle Light Mode';
    }

    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      themeToggleBtn.innerHTML = isDark
        ? '<i class="fas fa-sun"></i> Toggle Light Mode'
        : '<i class="fas fa-moon"></i> Toggle Dark Mode';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    document.getElementById("history-btn").addEventListener("click", () => {
      window.location.href = "history.html";
    });
});