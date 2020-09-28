const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';
const PLAYER = 'Игрок'
const AI = 'Компьютер'

const container = document.getElementById('fieldWrapper');

const GAMEFIELD_LENGTH = 3;

let gameField;
let gameInProgress = false;

let AISwitch = false;
let AIHardDifficulty = true;
let thisTurnPlayer = CROSS;
let winnerString = `${EMPTY} победил`;

let clickCounter = 0;
let possibleClicksCount;

startGame();
addResetListener();
addAIListener();

function makeNewEmptyArray(gameField) {
    let dimension = gameField.length;
    for (let i = 0; i < dimension; i++) {
        gameField[i] = new Array(dimension);
        for (let j = 0; j < dimension; j++)
            gameField[i][j] = EMPTY;
    }
}

function initGameField(dimension) {
    gameField = [];
    for (let i = 0; i < dimension; i++)
        gameField.push(new Array(dimension));
    makeNewEmptyArray(gameField);

    gameInProgress = true;
    winnerString = `${EMPTY} победил`;
    clickCounter = 0;
    possibleClicksCount = gameField.length * gameField.length;
}

function enlargeGameField(gameField) {
    let lastRow = [];
    for (let i = 0; i < gameField.length; i++) {
        gameField[i].push(EMPTY);
        lastRow.push(EMPTY);
    }
    lastRow.push(EMPTY);
    gameField.push(lastRow);

    console.log(`Enlarged Array: ${gameField}`);
    updatePossibleClicksCount();
    reRenderGrid(gameField.length);
}

function updatePossibleClicksCount () {
    possibleClicksCount = gameField.length * gameField.length;
}

function startGame () {
    initGameField(GAMEFIELD_LENGTH);
    renderGrid(gameField.length);
    setTurn();
}

function setTurn() {
    if (AISwitch)
        thisTurnPlayer = PLAYER;
    else
        thisTurnPlayer = CROSS;
}

function changeTurn() {
    if (AISwitch)
        if (thisTurnPlayer === PLAYER) {
            thisTurnPlayer = AI;
            if (AIHardDifficulty)
                forceAIToASmartMove();
            else
                forceAIToABlindMove();
        }
        else
            thisTurnPlayer = PLAYER;
    else
        if (thisTurnPlayer === CROSS)
            thisTurnPlayer = ZERO;
        else
            thisTurnPlayer = CROSS;
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

function reRenderGrid (dimension) {
    container.innerHTML = '';

    for (let i = 0; i < dimension; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < dimension; j++) {
            const cell = document.createElement('td');
            switch (gameField[i][j]){
                case EMPTY:
                    cell.textContent = EMPTY;
                    break;
                case CROSS:
                    cell.textContent = CROSS;
                    break;
                case ZERO:
                    cell.textContent = ZERO;
                    break;
            }
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
        let leftDiagonal = '';
        let rightDiagonal = '';
        let l = gameField.length;

        for (let i = 0; i < l; i++) {
            leftDiagonal += gameField[i][i];
            rightDiagonal += gameField[i][l - 1 - i];
        }
        let leftDiagPlayerWins = leftDiagonal === CROSS.repeat(l);
        let rightDiagPlayerWins = rightDiagonal === CROSS.repeat(l);
        let leftDiagAIWins = leftDiagonal === ZERO.repeat(l);
        let rightDiagAIWins = rightDiagonal === ZERO.repeat(l);

        if (leftDiagPlayerWins || rightDiagPlayerWins) {
            if (AISwitch)
                setWinner(PLAYER);
            else
                setWinner(CROSS);
            if (leftDiagPlayerWins)
                paintWinningCells(1, 1, false, 'left');
            else
                paintWinningCells(1, 1, false, 'right');
        }
        else if (leftDiagAIWins || rightDiagAIWins) {
            if (AISwitch)
                setWinner(AI);
            else
                setWinner(ZERO);
            if (leftDiagAIWins)
                paintWinningCells(1, 1, false, 'left');
            else
                paintWinningCells(1, 1, false, 'right');
        }

    }
    function paintWinningCells (line, startIndex, col = false, diag = 'none') {
        if (diag === 'left')
            for (let i = 0; i < gameField.length; i++)
                findCell(i, i).style.color = 'Red';
        else if (diag === 'right')
            for (let i = 0; i < gameField.length; i++)
                findCell(i, gameField.length - 1 - i).style.color = 'Red';
        else if (col === true)
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
    console.log(`${thisTurnPlayer} clicked on cell: ${row}, ${col}`);
    console.log(gameField);
    clickCounter++;
    renderSymbolInCell(fieldState, row, col);
}

function turnHandler () {
    if (gameInProgress) {
        checkWinner(gameField);
        if (gameInProgress) {
            if (clickCounter > possibleClicksCount / 2)
                enlargeGameField(gameField);
            if (clickCounter === possibleClicksCount)
                alert('Победила дружба');
            changeTurn();
        }
    }
    else
        alert('Игра уже окончена!');
}

function cellClickHandler (row, col) {
    if (gameField[row][col] === EMPTY) {
        tryClickOnCell(row, col);
        turnHandler();
    }
    else
        alert('Нажмите на пустую клетку');
}

function forceAIToABlindMove () {
    function findEmptyCell(gameField, index) {
        let flatArray = gameField.flat(2);
        for (let i = index; i < flatArray.length; i += gameField.length) {
            if (flatArray[i] === EMPTY) {
                tryClickOnCell(Math.floor(i / gameField.length), i % gameField.length);
                return true;
            }
        }
    }

    for (let i = 0; i < gameField.length; i++)
        if (findEmptyCell(gameField, i)) {
            turnHandler();
            return
        }
}

function forceAIToASmartMove () {
    let rowPlayerCount = new Array(gameField.length).fill(0);
    let rowAICount = new Array(gameField.length).fill(0);

    let columnPlayerCount = new Array(gameField.length).fill(0);
    let columnAICount = new Array(gameField.length).fill(0);

    let lDiagonalAICount = new Array(gameField.length).fill(0);
    let rDiagonalAICount = new Array(gameField.length).fill(0);
    let lDiagonalPlayerCount = new Array(gameField.length).fill(0);
    let rDiagonalPlayerCount = new Array(gameField.length).fill(0);

    for (let i = 0; i < gameField.length; i++)
        for (let j = 0; j < gameField.length; j++) {
            if (gameField[i][j] === CROSS) {
                rowPlayerCount[i]++;
                columnPlayerCount[j]++;
            }
            if (gameField[i][j] === ZERO) {
                rowAICount[i]++;
                columnAICount[j]++;
            }
            if (rowPlayerCount[i] + rowAICount[i] === gameField.length)
                rowPlayerCount[i] = 0;
            if (columnPlayerCount[j] + columnAICount[j] === gameField.length)
                columnPlayerCount[j] = 0;
        }
    for (let i = 0; i < gameField.length; i++) {
        if (gameField[i][i] === CROSS)
            lDiagonalAICount[i] = 1;
        if (gameField[i][gameField.length - i] === CROSS)
            rDiagonalAICount[i] = 1;
        if (gameField[i][i] === ZERO)
            lDiagonalPlayerCount[i] = 1;
        if (gameField[i][gameField.length - i] === ZERO)
            rDiagonalPlayerCount[i] = 1;
    }

    console.log(`[${rowPlayerCount}, ${columnPlayerCount}]`);

    let maxCountInRows = Math.max.apply(null, rowPlayerCount);
    let maxCountInColumns = Math.max.apply(null, columnPlayerCount);

    if (maxCountInRows > maxCountInColumns) {
        for (let i = 0; i < gameField.length; i++) {
            if (maxCountInRows === rowPlayerCount[i])
                for (let j = 0; j < gameField.length; j++){
                    if (gameField[i][j] === EMPTY) {
                        tryClickOnCell(i, j);
                        turnHandler();
                        return;
                    }
                }
        }
    }
    else if (maxCountInRows <= maxCountInColumns) {
        for (let i = 0; i < gameField.length; i++) {
            if (maxCountInColumns === columnPlayerCount[i])
                for (let j = 0; j < gameField.length; j++){
                    if (gameField[j][i] === EMPTY) {
                        tryClickOnCell(j, i);
                        turnHandler();
                        return;
                    }
                }
        }
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
