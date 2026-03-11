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

const GameSetup = (function() {
    // private variables (selectors)
    
    const p1NameDiv = document.querySelector("#player-1-name")
    const p2NameDiv = document.querySelector("#player-2-name")
    const gameSelect = document.querySelector("#game-select")
    const nameDiv = document.querySelector("#name");
    const p1MarkO = document.querySelector('input[name="p1-mark"][value="O"]')
    const p2MarkO = document.querySelector('input[name="p2-mark"][value="O"]')
    const p1MarkX = document.querySelector('input[name="p1-mark"][value="X"]')
    const p2MarkX = document.querySelector('input[name="p2-mark"][value="X"]')
    gameSelect.classList.add("hidden");
    const newMatchBtn = document.querySelector("#new-match");
    const directions = document.querySelector("#turn-display");
    


    function getDefaultGame() {    

        directions.textContent = "Please input your name(s)."
        // init default player names
        p1NameDiv.textContent = "Player 1";
        p2NameDiv.textContent = "Player 2";
    }
    // init and hide newMatchBtn
    
    // game select inputs
    // TODO add solo player mode
    // const soloBtn = document.querySelector("#solo");
    // const duoBtn = document.querySelector("#duo");
    // const soloNameForm = document.querySelector("#solo-name-form")
    
    // soloBtn.addEventListener("click", e => {
    //     gameSelect.classList.add("hidden");
    //     nameDiv.classList.remove("hidden");
    //     duoNameForm.classList.add("hidden")
    // })
    
    // duoBtn.addEventListener("click", e => {
    //     gameSelect.classList.add("hidden");
    //     nameDiv.classList.remove("hidden");
    //     soloNameForm.classList.add("hidden")
    // })
    
    function getNameInput() {
        // default/duo player name inputs
        // nameDiv.classList.add("hidden");
        newMatchBtn.classList.add("hidden")
        nameDiv.addEventListener("submit", e => {
            e.preventDefault();
            
            // name and mark handling
            const formData = new FormData(e.target);
            const allValues = Object.fromEntries(formData.entries());
            
            const p1Name = allValues["p1-name"];
            const p2Name = allValues["p2-name"];
            const game = GameController(allValues);
            screenControl = ScreenController(game, newMatchBtn);
            // hide the name input
            nameDiv.classList.add("hidden");
            newMatchBtn.classList.remove("hidden")
            // set the scoreboard names
            p1NameDiv.textContent = p1Name;
            p2NameDiv.textContent = p2Name;
        })
    }
    function getMarkInput() {
        // X or O event logic
        nameDiv.addEventListener("change", e => {

            if (e.target.name === "p1-mark") {
                if (e.target.value == "O") {
                    p2MarkX.checked = true;
                } else if (e.target.value == "X") {
                    p2MarkO.checked = true;
                }
            } else if (e.target.name == "p2-mark") {
                if (e.target.value == "O") {
                    p1MarkX.checked = true;
                } else if (e.target.value == "X") {
                    p1MarkO.checked = true;
                }
            }
        })
    }

    function init() {
        getDefaultGame();
        getNameInput();
        getMarkInput();
    }

    init();
})();


function ScreenController(game, newMatchBtn) {
    // init scores
    const p1score = document.querySelector("#player-1-score")
    const p2score = document.querySelector("#player-2-score")
    const screen = document.querySelector("#game-board");
    const turnDisplay = document.querySelector("#turn-display")
    
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
        turnDisplay.textContent = `${game.getActivePlayer().name}'s turn... (${game.getActivePlayer().mark})`;
        
    }

    // end-round dialog
    const dialog = document.querySelector("#new-round-dialog");
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

    // new round dialog handler
    dialog.addEventListener("submit", e => {
        game.switchPlayerTurn();
        game.resetBoard();
        updateScreen();
        
    })
    // no new game handler
    const closeDialog = document.querySelector("#closeModal");
    closeDialog.addEventListener("click", e => {
        dialog.close();
    })

    // new game btn handler
    newMatchBtn.addEventListener("click", e => {
        game.resetBoard();
        game.resetScores();
        updateScreen();
    })
    updateScreen();

    return {
        turnDisplay,
        updateScreen,
        playAgainWin,
        playAgainTie
    }
}

// game logic
function GameController(allValues) {

    // player logic
    const players = [
        {
            name: allValues['p1-name'],
            mark: allValues['p1-mark'],
            score: 0
        },
        {
            name: allValues['p2-name'],
            mark: allValues['p2-mark'],
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

    const resetScores = () => {
        players[0].score = 0;
        players[1].score = 0;
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
        switchPlayerTurn,
        getActivePlayer,
        getPlayers,
        getBoard: board.getBoard,
        resetScores,
        resetBoard,
        checkWin,
        checkTie,
        isOver
    }

}

