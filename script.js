// logic for the game board

function Gameboard() {
    const rows = 3;
    const columns = 3;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
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


    return {getBoard, placeMark, printBoard}
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

function GameController(
    playerOneName = "Player One",
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            mark: "O"
        },
        {
            name: playerTwoName,
            mark: "X"
        }
    ];

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];            
    } 
    
    const getActivePlayer = () => activePlayer;

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`)
    }
    
    const playRound = (row, column) => {
        console.log(
            `Adding ${getActivePlayer().name}'s mark to row ${row}, column ${column}...`
        );

        const success = board.placeMark(row, column, getActivePlayer().mark);
        
        // win condition checks
        const isRowWin = board.getBoard().some(row => row.every(cell => cell.getValue() === getActivePlayer().mark))

        const getCol = board.getBoard()[0].map((_, colIndex) => 
            board.getBoard().map(row => row[colIndex])
        );
        const isColWin = getCol.some(col => col.every(cell => cell.getValue() === getActivePlayer().mark))

        const isDiagonalWin = board.getBoard().every((row, index) => row[index].getValue() === getActivePlayer().mark);

        const maxIndex = board.getBoard().length - 1;
        const isAntiDiagonalWin = board.getBoard().every((row, index) => row[(maxIndex) - index].getValue() === getActivePlayer().mark)

        // tie condition check
        const isTie = board.getBoard().every(row => row.every(cell => cell.getValue() !== 0))

        if (success) {
            if ((isRowWin === true) || (isColWin === true) || (isDiagonalWin === true) || (isAntiDiagonalWin === true)) {
                printNewRound();
                console.log("A player has won! Play again?")
                } else if (isTie === true) {
                    printNewRound();
                    console.log("Looks like a tie. Play again?")
                } else {
                    switchPlayerTurn();
                    printNewRound();
                }   
            }  else {
                console.log(`That spot is already marked. Pick again.`)    
            }
        }
    printNewRound();

    return {
        playRound,
        getActivePlayer,
    }


}

const game = GameController();