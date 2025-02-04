document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("rulesModal");
    const closeModalBtn = document.getElementById("startGameButton");
    const gameContainer = document.getElementById("container");
    const roundLabel = document.getElementById("roundLabel");
    const turnBtn = document.getElementById("turnBtn");
    const cells = document.querySelectorAll('[data-cell]');
    const player1Rounds = document.getElementById("player1Rounds");
    const player2Rounds = document.getElementById("player2Rounds");
    const displayPlayer1Name = document.getElementById("displayPlayer1Name");
    const displayPlayer2Name = document.getElementById("displayPlayer2Name");
    const moveSound = document.getElementById("moveSound");
    const roundWinSound = document.getElementById("roundWinSound");
    const gameWinSound = document.getElementById("gameWinSound");
    const backgroundMusic = document.getElementById("backgroundMusic");
    const gameLoseSound =document.getElementById("loseSound");

    let currentTurn = 'X';
    let board = Array(9).fill(null);
    let isMultiplayer = false;
    let currentRound = 1;
    let player1Wins = 0;
    let player2Wins = 0;
    let allowPlayerClicks = true;

    // Show modal and start background music
    modal.classList.add("show");
    gameContainer.classList.add("blurry");

    closeModalBtn.addEventListener("click", () => {
        backgroundMusic.play();

        modal.style.transition = "opacity 0.5s";
        modal.style.opacity = "0";
        setTimeout(() => {
            modal.classList.remove("show");
            gameContainer.classList.remove("blurry");
            modal.style.opacity = "1";
        }, 500);

        isMultiplayer = document.getElementById("player2").style.display !== 'none';
        displayPlayer1Name.textContent = document.getElementById('player1Name').value || "Player 1";
        displayPlayer2Name.textContent = isMultiplayer ? document.getElementById('player2Name').value || "Player 2" : "Bot";

        // Randomly determine first turn for the first round
        roundLabel.innerHTML = `Round ${currentRound}`;
        
        setTimeout(() => {
            resetBoard();
            currentTurn = Math.random() < 0.5 ? 'X' : 'O';
            turnBtn.textContent = `YOUR TURN: ${currentTurn}`;

            // If it's the bot's turn to start, trigger bot's move
            if (!isMultiplayer && currentTurn === 'O') {
                allowPlayerClicks = false; // Disable player clicks during bot's turn
                setTimeout(botMove, 600); // Delay bot's move for better UX
            }
        }, 1500); // Adjust delay as needed
    });

    const handleClick = (e) => {
        if(!isMultiplayer){
            if (!allowPlayerClicks || currentTurn !== 'X') return;
        }
        else{
            if (!allowPlayerClicks) return;
        } // Prevent player clicks during bot's turn

        const cell = e.target;
        const cellIndex = Array.from(cells).indexOf(cell);

        if (board[cellIndex] !== null || checkWinner()) return;

        cell.textContent = currentTurn;
        board[cellIndex] = currentTurn;
        moveSound.play(); // Play move sound

        if (checkWinner()) {
            handleRoundEnd(currentTurn === 'X' ? 'player1' : 'player2');
        } else if (board.every(cell => cell !== null)) {
            handleRoundEnd('draw');
        } else {
            currentTurn = currentTurn === 'X' ? 'O' : 'X';
            turnBtn.textContent = `YOUR TURN: ${currentTurn}`;

            if (!isMultiplayer && currentTurn === 'O') {
                allowPlayerClicks = false; // Disable player clicks during bot's turn
                setTimeout(botMove, 600); // Delay bot's move for better UX
            }
        }
    };

    const handleRoundEnd = (winner) => {
        let roundResult;

        if (winner === 'player1') {
            player1Wins++;
            player1Rounds.textContent = `Win Rounds: ${player1Wins}`;
            roundResult = `${displayPlayer1Name.textContent} wins the round!`;
            roundWinSound.play(); // Play round win sound
        } else if (winner === 'player2') {
            player2Wins++;
            player2Rounds.textContent = `Win Rounds: ${player2Wins}`;
            roundResult = `${displayPlayer2Name.textContent} wins the round!`;
            roundWinSound.play(); // Play round win sound
        } else {
            roundResult = `It's a draw for this round.`;
        }

        // Update turnBtn with round result
        turnBtn.textContent=roundResult;
      
        // Check if any player has won enough rounds to determine overall winner
        if (player1Wins >= 3 || player2Wins >= 3) {
            determineOverallWinner();
        } else {
            // Prepare for the next round
            setTimeout(() => {
                currentRound++; // Increment the round number
                resetBoard();
                roundLabel.innerHTML = `Round ${currentRound}`;
                currentTurn = Math.random() < 0.5 ? 'X' : 'O';
                turnBtn.textContent = `YOUR TURN: ${currentTurn}`;

                // If it's the bot's turn to start, trigger bot's move
                if (!isMultiplayer && currentTurn === 'O') {
                    allowPlayerClicks = false; // Disable player clicks during bot's turn
                    setTimeout(botMove, 600);
                }
            }, 1500); 
        }
    };

    const determineOverallWinner = () => {
        if (player1Wins > player2Wins) {
            turnBtn.textContent = `${displayPlayer1Name.textContent} Wins the Game!`;
            gameWinSound.play(); // Play game win sound
            triggerConfetti(); // Trigger confetti effect
        } else if (player2Wins > player1Wins) {
            turnBtn.textContent = `${displayPlayer2Name.textContent} Wins the Game!`;
            if (!isMultiplayer) {
                gameLoseSound.play(); // Play game lose sound if bot wins
            } else {
                gameWinSound.play(); 
                triggerConfetti();
            } 
        } else {
            turnBtn.textContent = `The Game is a Draw!`;
        }
        backgroundMusic.pause();
        turnBtn.disabled = true;

        
        document.getElementById("playAgainBtn").style.display = "block";
                
    }


    document.getElementById("playAgainBtn").addEventListener("click", () => {
        // Reset game state here
        player1Wins = 0;
        player2Wins = 0;
        currentRound = 1;
        currentTurn = 'X';
        resetBoard();
        player2Rounds.textContent = `Win Rounds: ${player2Wins}`;
        player1Rounds.textContent = `Win Rounds: ${player1Wins}`;
        roundLabel.innerHTML = `Round ${currentRound}`;
        turnBtn.textContent = `YOUR TURN: ${currentTurn}`;
        determineOverallWinner();
        modal.classList.add("show");
        gameContainer.classList.add("blurry");
        document.getElementById("playAgainBtn").style.display = "none"; 
    });
    

    
    const triggerConfetti = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
    
        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
    
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            }));
            confetti(Object.assign({}, defaults, {
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            }));
        }, 250);
    };


    const resetBoard = () => {
        document.getElementById("playAgainBtn").style.display="none";
        board.fill(null);
        cells.forEach(cell => cell.textContent = '');
        currentTurn = 'X';
        allowPlayerClicks = true;
    };

    const botMove = () => {
        const bestMove = getBestMove();
        board[bestMove.index] = 'O';
        cells[bestMove.index].textContent = 'O';

        if (checkWinner()) {
            handleRoundEnd('player2');
        } else if (board.every(cell => cell !== null)) {
            handleRoundEnd('draw');
        } else {
            currentTurn = 'X';
            turnBtn.textContent = `YOUR TURN: ${currentTurn}`;
            allowPlayerClicks = true; // Enable player clicks after bot's move
        }
    };

    const getBestMove = () => {
        let bestScore = -Infinity;
        let bestMove;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        return { index: bestMove };
    };

    const minimax = (board, depth, isMaximizing) => {
        if (checkWinner()) {
            return isMaximizing ? -10 + depth : 10 - depth;
        } else if (board.every(cell => cell !== null)) {
            return 0;
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
                    board[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, true);
                    board[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const checkWinner = () => {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });
    };


    cells.forEach(cell => cell.addEventListener('click', handleClick));
});

const validateInputFields = (mode) => {
    const player1Name = document.getElementById("player1Name").value.trim();
    const player2Name = document.getElementById("player2Name").value.trim();
    if (mode === "player") {
        return player1Name !== "" && player2Name !== "";
    } else {
        return player1Name !== "";
    }
};

function showInputFields(mode) {
    const inputFields = document.getElementById('inputFields');
    const player1Field = document.getElementById('player1');
    const player2Field = document.getElementById('player2');
    const startGameContainer = document.getElementById('start-game-container');

    inputFields.style.display = 'block';
    startGameContainer.style.display = 'flex';

    if (mode === 'player') {
        player1Field.style.display = 'block';
        player2Field.style.display = 'block';
    } else {
        player1Field.style.display = 'block';
        player2Field.style.display = 'none';
    }

    //event listener to validate inputs and enable/disable start button
    document.getElementById("player1Name").addEventListener("input", () => {
        startGameButton.disabled = !validateInputFields(mode);
    });
    document.getElementById("player2Name").addEventListener("input", () => {
        startGameButton.disabled = !validateInputFields(mode);
    });

    startGameButton.disabled = !validateInputFields(mode);
}

