document.addEventListener('DOMContentLoaded', () => {
    
    const holes = document.querySelectorAll('.hole');
    const moles = document.querySelectorAll('.mole');
    const scoreDisplay = document.getElementById('score');
    const timeDisplay = document.getElementById('time');
    const startButton = document.getElementById('start-button');
    const soundToggle = document.getElementById('sound-toggle');
    const gameOverTag = document.getElementById('game-over-tag');
    const scorePopup = document.getElementById('score-popup');
    const finalScoreDisplay = document.getElementById('final-score');
    const highScoreDisplay = document.getElementById('high-score');
    let highScore = localStorage.getItem('highScore') || 0;
    highScoreDisplay.textContent = highScore;


    
    let score = 0;
    let timeLeft = 30;
    let gameTimer;
    let moleTimer;
    let isPlaying = false;
    

    const whackSound = new Audio('sounds/whack.mp3');
    const gameOverSound = new Audio('sounds/game-over.mp3');
    const backgroundMusic = new Audio('sounds/background.mp3');
    
    
    backgroundMusic.loop = false;
    backgroundMusic.volume = 0.5;
    
   
    function initGame() {
        score = 0;
        timeLeft = 30;
        isPlaying = true;
        
      
        scoreDisplay.textContent = score;
        timeDisplay.textContent = timeLeft;
        startButton.disabled = true;
        gameOverTag.style.display = 'none';
        scorePopup.style.display = 'none';
        
        
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
            }, 29000);
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
    
   
    function showMole() {
        
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        
       
        if (!isPlaying) return;
        
       
        const randomHole = Math.floor(Math.random() * holes.length);
        const mole = holes[randomHole].querySelector('.mole');
        
       
        mole.classList.add('active');
        
        
        const showTime = Math.random() * 1000 + 600;
        
        
        moleTimer = setTimeout(() => {
            mole.classList.remove('active');
            if (isPlaying) showMole();
        }, showTime);
    }
    
    
    function endGame() {
        clearInterval(gameTimer);
        clearTimeout(moleTimer);
        isPlaying = false;
        
        
        moles.forEach(mole => {
            mole.classList.remove('active');
        });
        
       
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
        }, 3000);
    }
    
   
    startButton.addEventListener('click', initGame);
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

    
    initGame();
});
 
    
moles.forEach(mole => {
    mole.addEventListener('click', function() {
        if (!isPlaying) return;
        
        if (mole.classList.contains('active') && !mole.classList.contains('whacked')) {
           
            const soundEnabled = soundToggle.checked;
            if (soundEnabled) {
                whackSound.currentTime = 0;
                whackSound.play().catch(error => {
                    console.log("Audio play failed:", error);
                });
            }
            
            
            score++;
            scoreDisplay.textContent = score;
            
            
            mole.classList.add('whacked');
            
           
            setTimeout(() => {
                mole.classList.remove('active');
                mole.classList.remove('whacked');
            }, 300); 
        }
    });
});
    
    
    soundToggle.addEventListener('change', function() {
        const soundEnabled = this.checked;
        
       
        whackSound.volume = soundEnabled ? 1.0 : 0;
        gameOverSound.volume = soundEnabled ? 1.0 : 0;
        backgroundMusic.volume = soundEnabled ? 0.5 : 0;
        
        
        if (isPlaying && soundEnabled && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log("Audio play failed:", error);
            });
        }
        
       
        if (isPlaying && !soundEnabled && !backgroundMusic.paused) {
            backgroundMusic.pause();
        }
    });
});

// LIGHT AND DARK MODE
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

  //  choice
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
