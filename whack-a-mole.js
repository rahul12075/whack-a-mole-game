document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const holes = document.querySelectorAll('.hole');
    const moles = document.querySelectorAll('.mole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const soundToggle = document.getElementById('sound-toggle');
    const gameOverTag = document.getElementById('game-over-tag');
    const scorePopup = document.getElementById('score-popup');
    const finalScoreDisplay = document.getElementById('final-score');
    
    // Game variables
    let score = 0;
    let timeLeft = 30;
    let gameTimer;
    let moleTimer;
    let isPlaying = false;
    
    // Sound effects
    const whackSound = new Audio('sounds/whack.mp3');
    const gameOverSound = new Audio('sounds/game-over.mp3');
    const backgroundMusic = new Audio('sounds/background.mp3');
    
    // Configure background music
    backgroundMusic.loop = false; // Don't loop since we want it to play for exactly 29 seconds
    backgroundMusic.volume = 0.5;
    
    // Initialize game
    function initGame() {
        score = 0;
        timeLeft = 30;
        isPlaying = true;
        
        // Reset displays
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        startButton.disabled = true;
        gameOverTag.style.display = 'none';
        scorePopup.style.display = 'none';
        
        // Play background music if sound is enabled
        const soundEnabled = soundToggle.checked;
        if (soundEnabled) {
            // Set the background music to play for 29 seconds
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
            
            // Set a timeout to stop the background music after 29 seconds
            setTimeout(() => {
                if (isPlaying) {
                    backgroundMusic.pause();
                }
            }, 29000);
        }
        
        // Start the game timer
        gameTimer = setInterval(() => {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            
            // When there's 1 second left, prepare for game over
            if (timeLeft === 1) {
                // Prepare to play game over sound at exactly 30 seconds
                if (soundEnabled) {
                    gameOverSound.currentTime = 0;
                    gameOverSound.load();
                }
            }
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        
        // Start showing moles
        showMole();
    }
    
    // Show a random mole
    function showMole() {
        // Hide all moles first
        moles.forEach(mole => {
            mole.classList.remove('active');
            mole.classList.remove('whacked');
        });
        
        // If game is over, don't show more moles
        if (!isPlaying) return;
        
        // Select a random hole
        const randomHole = Math.floor(Math.random() * holes.length);
        const mole = holes[randomHole].querySelector('.mole');
        
        // Show the mole
        mole.classList.add('active');
        
        // Set a random time for the mole to appear
        const showTime = Math.random() * 1000 + 600; // Between 600ms and 1600ms
        
        // Hide the mole after the random time
        moleTimer = setTimeout(() => {
            mole.classList.remove('active');
            if (isPlaying) showMole();
        }, showTime);
    }
    
    // End the game
    function endGame() {
        clearInterval(gameTimer);
        clearTimeout(moleTimer);
        isPlaying = false;
        
        // Hide all moles
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        
        // Stop background music
        backgroundMusic.pause();
        
        // Play game over sound if sound is enabled
        const soundEnabled = soundToggle.checked;
        if (soundEnabled) {
            gameOverSound.play().catch(error => {
                console.log("Game over sound failed:", error);
            });
        }
        
        // Show GAME-OVER tag
        gameOverTag.style.display = 'block';
        
        // Show score popup
        finalScoreDisplay.textContent = score;
        scorePopup.style.display = 'block';
        
        // Enable start button after a delay
        setTimeout(() => {
            startButton.disabled = false;
        }, 3000);
    }
    
    // Event listeners
    startButton.addEventListener('click', initGame);
    
    // Add click event to each mole
    moles.forEach(mole => {
        mole.addEventListener('click', function() {
            if (!isPlaying) return;
            
            if (mole.classList.contains('active') && !mole.classList.contains('whacked')) {
                // Play whack sound if sound is enabled
                const soundEnabled = soundToggle.checked;
                if (soundEnabled) {
                    whackSound.currentTime = 0;
                    whackSound.play().catch(error => {
                        console.log("Audio play failed:", error);
                    });
                }
                
                // Increase score
                score++;
                scoreDisplay.textContent = score;
                
                // Mark mole as whacked
                mole.classList.add('whacked');
                
                // Hide mole after a short delay
                setTimeout(() => {
                    mole.classList.remove('active');
                    mole.classList.remove('whacked');
                }, 200);
            }
        });
    });
    
    // Sound toggle functionality
    soundToggle.addEventListener('change', function() {
        const soundEnabled = this.checked;
        
        // Set volume for all sounds based on checkbox
        whackSound.volume = soundEnabled ? 1.0 : 0;
        gameOverSound.volume = soundEnabled ? 1.0 : 0;
        backgroundMusic.volume = soundEnabled ? 0.5 : 0;
        
        // If game is in progress and sounds are enabled, play background music
        if (isPlaying && soundEnabled && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
        }
        
        // If game is in progress and sounds are disabled, pause background music
        if (isPlaying && !soundEnabled && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    });
});
