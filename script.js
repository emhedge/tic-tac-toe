// logic for the game board
function Gameboard() {
    // init board setup
    const rows = 3;
    const columns = 3;
    const board = [];
    const newBoard = () => {
        for (let i = 0; i < rows; i++) {
            board[i] = [];
            for (let j = 0; j < columns; j++) {
                board[i].push(Cell());
            }
        }
        
    }
    // pass board
    const getBoard = () => board;
    
    // receives boolean value from setValue(), passes to GameController's playRound
    const placeMark = (row, column, player) => {
        return board[row][column].setValue(player)
    }
    
    
    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()))
        console.table(boardWithCellValues);
    }
    
    newBoard();
    return {newBoard, getBoard, placeMark, printBoard}
}

function Cell() {
    let value = 0;
    // returns boolean value based on whether the cell is filled/not
    const setValue = (player) => {
        if (!value) {
            value = player;
            return true;
        } else {
            return false;
        }
    }
    
    const getValue = () => value;

    return {
        setValue,
        getValue
    }
}

// init and hide newGameBtn
const newGameBtn = document.querySelector("#new-match");
newGameBtn.classList.add("hidden");

// init default player names
const p1name = document.querySelector("#player-1-name")
const p2name = document.querySelector("#player-2-name")
p1name.textContent = "Player 1";
p2name.textContent = "Player 2";

// game select inputs
const soloBtn = document.querySelector("#solo");
const duoBtn = document.querySelector("#duo");
const gameSelect = document.querySelector("#game-select")
const soloNameForm = document.querySelector("#solo-name-form")
const duoNameForm = document.querySelector("#duo-name-form")

soloBtn.addEventListener("click", e => {
    gameSelect.classList.add("hidden");
    nameDiv.classList.remove("hidden");
    duoNameForm.classList.add("hidden")
})

duoBtn.addEventListener("click", e => {
    gameSelect.classList.add("hidden");
    nameDiv.classList.remove("hidden");
    soloNameForm.classList.add("hidden")
})



// duo player name inputs
const nameDiv = document.querySelector("#name");
nameDiv.classList.add("hidden");
let playerOne = "";
let playerTwo = "";
nameDiv.addEventListener("submit", e => {
    e.preventDefault();
    playerOne = document.querySelector("#player-1").value;
    playerTwo = document.querySelector("#player-2").value;
    const game = GameController();
    const screenControl = ScreenController(game);
    nameDiv.classList.add("hidden");
    p1name.textContent = `${playerOne}`;
    p2name.textContent = `${playerTwo}`;
})



function ScreenController(game) {
    // init scores
    const p1score = document.querySelector("#player-1-score")
    const p2score = document.querySelector("#player-2-score")
    const screen = document.querySelector("#game-board");
    newGameBtn.classList.remove("hidden");
    
    function updateScreen() {
        
        const boardData = game.getBoard();
        screen.innerHTML = "";
        
        // set active mark
        game.getActivePlayer().mark === "O" ? screen.setAttribute("data-current-player", "O") : screen.setAttribute("data-current-player", "X");
        
        // gameboard rendering
        boardData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const box = document.createElement("div");
                const cellValue = cell.getValue();
                box.setAttribute("class", "board-box");
                box.dataset.row = rowIndex;
                box.dataset.column = colIndex;
                if (cellValue !== 0){
                    const boxImg = document.createElement("img");
                    boxImg.src = `./images/${cellValue}.svg`;
                    box.appendChild(boxImg);
                }
                screen.appendChild(box);

            })
        })
        // scoreboard scores
        const players = game.getPlayers();
        p1score.textContent = players[0].score;
        p2score.textContent = players[1].score;
        
    }

    // end-game dialog
    const dialog = document.querySelector("#new-game-dialog");
    const playAgainHeader = document.querySelector("#play-again-header");

    function playAgainWin() {
        playAgainHeader.textContent = `${game.getActivePlayer().name} has won! Play again?`
        dialog.showModal(); 
    }
    function playAgainTie() {
        playAgainHeader.textContent = `Looks like a tie! Play again?`
        dialog.showModal(); 
    }
    
    screen.addEventListener("click", e => {
        const row = e.target.dataset.row;
        const column = e.target.dataset.column;
        if (!row || !column || game.isOver()) return;
        game.playRound(row, column);
        updateScreen();

        if (game.checkWin()) {
            playAgainWin();
        } else if (game.checkTie()) {
            playAgainTie();
        }
    })

    // new game dialog handler
    dialog.addEventListener("submit", e => {
        game.resetBoard();
        updateScreen();
    })
    // no new game handler
    const closeDialog = document.querySelector("#closeModal");
    closeDialog.addEventListener("click", e => {
        dialog.close();
    })

    // new game btn handler
    newGameBtn.addEventListener("click", e => {
        game.resetBoard();
        updateScreen();
    })
    updateScreen();

    return {
        updateScreen,
        playAgainWin,
        playAgainTie
    }
}

// game logic
function GameController(
    playerOneName = playerOne,
    playerTwoName = playerTwo
) {

    // player logic
    const players = [
        {
            name: playerOneName,
            mark: "O",
            score: 0
        },
        {
            name: playerTwoName,
            mark: "X",
            score: 0
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];            
    } 
    
    const getActivePlayer = () => activePlayer;
    const getPlayers = () => players;

    // board logic
    const board = Gameboard();
    const resetBoard = board.newBoard;
    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`)
    }

    // game end checks
    function checkWin() {
        // win condition checks
        const isRowWin = board.getBoard().some(row => row.every(cell => cell.getValue() === getActivePlayer().mark))
        
        const getCol = board.getBoard()[0].map((_, colIndex) => 
            board.getBoard().map(row => row[colIndex])
        );
        const isColWin = getCol.some(col => col.every(cell => cell.getValue() === getActivePlayer().mark))
        
        const isDiagonalWin = board.getBoard().every((row, index) => row[index].getValue() === getActivePlayer().mark);
        
        const maxIndex = board.getBoard().length - 1;
        const isAntiDiagonalWin = board.getBoard().every((row, index) => row[(maxIndex) - index].getValue() === getActivePlayer().mark)

        return isRowWin || isColWin || isDiagonalWin || isAntiDiagonalWin;
    }

    function checkTie() {
        // tie condition check
        const isTie = board.getBoard().every(row => row.every(cell => cell.getValue() !== 0))
        return isTie;
    }

    // pass isGameOver to ScreenController to prevent post-game clicks
    function isOver() {
        let isGameOver = false;
        return isGameOver = (checkWin() == true || checkTie == true);
    }

    // play round logic
    const playRound = (row, column) => {
        console.log(
            `Adding ${getActivePlayer().name}'s mark to row ${row}, column ${column}...`
        );

        const success = board.placeMark(row, column, getActivePlayer().mark);

        if (!success) {
            console.log(`That spot is already marked. Pick again.`);
            return;
        }
        
        const win = checkWin();
        const tie = checkTie();

        
        
        if (win) {
            printNewRound();
            console.log(`${getActivePlayer().name} has won! Play again?`)
            activePlayer.score += 1;

        } else if (tie) {
            printNewRound();
            console.log("Looks like a tie. Play again?")

        } else {
            switchPlayerTurn();
            printNewRound();
        }   
          
    }
    printNewRound();

    return {
        playRound,
        getActivePlayer,
        getPlayers,
        getBoard: board.getBoard,
        resetBoard,
        checkWin,
        checkTie,
        isOver
    }

}

