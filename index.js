const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';
const PLAYER = 'Игрок'
const AI = 'Компьютер'

const container = document.getElementById('fieldWrapper');

const gameField = [[], [], []];
let gameInProgress = false;
let AISwitch = false;
let THIS_TURN_PLAYER = CROSS;
let winnerString = `${EMPTY} победил`;
let clickCounter = 0;
const possibleClicksCount = 3 * 3;

startGame();
addResetListener();
addAIListener();

function initGameField(gameField) {
    let dimension = gameField.length;
    for (let i = 0; i < dimension; i++) {
        gameField[i] = new Array(dimension);
        for (let j = 0; j < dimension; j++)
            gameField[i][j] = EMPTY;
    }

    gameInProgress = true;
    winnerString = `${EMPTY} победил`;
    clickCounter = 0;
}

function startGame () {
    initGameField(gameField);
    renderGrid(gameField.length);
    setTurn();
}

function setTurn() {
    if (AISwitch) {
        THIS_TURN_PLAYER = PLAYER;
    }
    else
        THIS_TURN_PLAYER = CROSS;
}

function changeTurn() {
    if (AISwitch) {
        if (THIS_TURN_PLAYER === PLAYER) {
            THIS_TURN_PLAYER = AI;
            takeABlindMoveAI();
        }
        else
            THIS_TURN_PLAYER = PLAYER;
    }
    else {
        if (THIS_TURN_PLAYER === CROSS)
            THIS_TURN_PLAYER = ZERO;
        else
            THIS_TURN_PLAYER = CROSS;
    }
}

function renderGrid (dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            cell.textContent = EMPTY;
            cell.addEventListener('click', () => cellClickHandler(i, j));
            row.appendChild(cell);
        }
        container.appendChild(row);
    }
}

function checkWinner (gameField) {
    function checkFieldHorizontally (gameField) {
        for (let i = 0; i < gameField.length; i++) {
            let row = gameField[i].join('');
            if (row === CROSS.repeat(gameField.length)) {
                if (AISwitch)
                    setWinner(PLAYER);
                else
                    setWinner(CROSS);
                paintWinningCells(row, i);
                break;
            }
            else if (row === ZERO.repeat(gameField.length)) {
                if (AISwitch)
                    setWinner(AI);
                else
                    setWinner(ZERO);
                paintWinningCells(row, i);
                break;
            }
        }
    }
    function checkFieldVertically (gameField) {
        function checkColumn(gameField, index) {
            let flatArray = gameField.flat(2);
            let word = '';
            for (let i = index; i < flatArray.length; i += gameField.length) {
                if (flatArray[i] === EMPTY)
                    continue;
                word += flatArray[i];
            }
            if (word === CROSS.repeat(gameField.length)) {
                if (AISwitch)
                    setWinner(PLAYER);
                else
                    setWinner(CROSS);
                paintWinningCells(gameField, index, true);
                return true;
            } else if (word === ZERO.repeat(gameField.length)) {
                if (AISwitch)
                    setWinner(AI);
                else
                    setWinner(ZERO);
                paintWinningCells(gameField, index, true);
                return true;
            }
        }
        for (let i = 0; i < gameField.length; i++)
            if (checkColumn(gameField, i))
                break;
    }
    function checkFieldDiagonally (gameField) {
        //TODO Проверка на победу игроков при заполнении всех клеток по любой из диагоналей одним символом
    }
    function paintWinningCells (line, startIndex, col = false) {
        if (col === true)
            for (let i = 0; i < line.length; i++)
                findCell(i, startIndex).style.color = 'Red';
        else
            for (let i = 0; i < line.length; i++)
                findCell(startIndex, i).style.color = 'Red';
    }
    function setWinner (winner) {
        winnerString = `${winner} победил`;
        gameInProgress = false;
    }
    function tryAnnounceWinner () {
        if (winnerString !== `${EMPTY} победил`) {
            console.log(winnerString);
            alert(winnerString);
        }
    }


    checkFieldHorizontally(gameField);
    checkFieldVertically(gameField);
    checkFieldDiagonally(gameField);
    tryAnnounceWinner();
}

function tryClickOnCell(row, col) {
    let fieldState = clickCounter % 2 ? ZERO : CROSS;
    gameField[row][col] = fieldState;
    console.log(`${THIS_TURN_PLAYER} clicked on cell: ${row}, ${col}`);
    console.log(gameField);
    clickCounter++;
    renderSymbolInCell(fieldState, row, col);
}

function turnHandler () {
    if (gameInProgress) {
        checkWinner(gameField);
        if (gameInProgress) {
            if (clickCounter === possibleClicksCount)
                alert('Победила дружба');
            changeTurn();
        }
    }
    else
        alert('Игра уже окончена!');
}

function cellClickHandler (row, col) {
    if (gameField[row][col] === EMPTY)
        tryClickOnCell(row, col);
    turnHandler();
}

function takeABlindMoveAI () {
    function extracted(gameField, index) {
        let flatArray = gameField.flat(2);
        for (let i = index; i < flatArray.length; i += gameField.length) {
            if (flatArray[i] === EMPTY) {
                tryClickOnCell(Math.floor(i / gameField.length), i % gameField.length);
                return true;
            }
        }
    }



    for (let i = 0; i < gameField.length; i++)
        if (extracted(gameField, i)) {
            turnHandler();
            return
        }

}

function renderSymbolInCell (symbol, row, col, color = '#333') {
    const targetCell = findCell(row, col);
    targetCell.textContent = symbol;
    targetCell.style.color = color;

}

function findCell (row, col) {
    const targetRow = container.querySelectorAll('tr')[row];
    return targetRow.querySelectorAll('td')[col];
}

function addResetListener () {
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetClickHandler);
}

function addAIListener () {
    const AISwitch = document.getElementById('AI');
    AISwitch.addEventListener('change', AISwitchChangeHandler);
}

function resetClickHandler () {
    startGame();
    console.log('reset!');
}

function AISwitchChangeHandler () {
    AISwitch = !AISwitch;
    startGame();
    console.log(`AI switched to ${AISwitch}`);
}

/* Test Function */
/* Победа первого игрока */
function testWin () {
    clickOnCell(0, 2);
    clickOnCell(0, 0);
    clickOnCell(2, 0);
    clickOnCell(1, 1);
    clickOnCell(2, 2);
    clickOnCell(1, 2);
    clickOnCell(2, 1);
}

/* Ничья */
function testDraw () {
    clickOnCell(2, 0);
    clickOnCell(1, 0);
    clickOnCell(1, 1);
    clickOnCell(0, 0);
    clickOnCell(1, 2);
    clickOnCell(1, 2);
    clickOnCell(0, 2);
    clickOnCell(0, 1);
    clickOnCell(2, 1);
    clickOnCell(2, 2);
}

function clickOnCell (row, col) {
    findCell(row, col).click();
}
