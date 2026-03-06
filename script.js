// logic for the game board
function Gameboard() {
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


function ScreenController(game) {
    
    const p1score = document.querySelector("#player-1-score")
    const p2score = document.querySelector("#player-2-score")
    const screen = document.querySelector("#game-board");
    
    function updateScreen() {
        const boardData = game.getBoard();
        screen.innerHTML = "";
        game.getActivePlayer().mark === "O" ? screen.setAttribute("data-current-player", "O") : screen.setAttribute("data-current-player", "X");
        console.log(screen.dataset.currentPlayer)
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
        const players = game.getPlayers();
        p1score.textContent = players[0].score;
        p2score.textContent = players[1].score;
        
    }
    const dialog = document.querySelector("#new-game-dialog");
    const playAgainHeader = document.querySelector("#play-again-header");

    function playAgain() {
        playAgainHeader.textContent = `${game.getActivePlayer().name} has won! Play again?`
        dialog.showModal(); 
    }

    screen.addEventListener("click", e => {
        const row = e.target.dataset.row;
        const column = e.target.dataset.column;
        if (!row || !column || game.isOver()) return;
        game.playRound(row, column);
        updateScreen();

        if (game.checkWin()) {
            playAgain();
        } else if (game.checkTie()) {
            playAgain();
        }
    })

    
    dialog.addEventListener("submit", e => {
        game.resetBoard();
        updateScreen();
    })
    const closeDialog = document.querySelector("#closeModal");
    closeDialog.addEventListener("click", e => {
        dialog.close();
    })

    const newGameBtn = document.querySelector("#new-match");
    newGameBtn.addEventListener("click", e => {
        game.resetBoard();
        updateScreen();
    })
    updateScreen();

    return {
        updateScreen,
        playAgain
    }
}

// name inputs
const nameForm = document.querySelector("#name-form")
let playerOne = "";
let playerTwo = "";
nameForm.addEventListener("submit", e => {
    e.preventDefault();
    playerOne = document.querySelector("#player-1").value;
    playerTwo = document.querySelector("#player-2").value;
    const game = GameController();
    nameForm.classList.add("hidden");
    const screenControl = ScreenController(game);
    const p1name = document.querySelector("#player-1-name")
    const p2name = document.querySelector("#player-2-name")
    p1name.textContent = playerOne;
    p2name.textContent = playerTwo;
})


// game
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

