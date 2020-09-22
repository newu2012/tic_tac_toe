const CROSS = 'X';
const ZERO = 'O';
const EMPTY = ' ';

const container = document.getElementById('fieldWrapper');

const gameField = [[], [], []];
let gameInProgress = false;
let AISwitch = false;
let winnerString = `${EMPTY} победил`;
let clickCounter = 0;
const possibleClicksCount = 3 * 3;

startGame();
addResetListener();
addAIListener();

function initGameField(dimension, gameField) {
    for (let i = 0; i < dimension; i++) {
        gameField[i] = new Array(dimension);
        for (let j = 0; j < dimension; j++) {
            gameField[i][j] = EMPTY;

        }
    }

    gameInProgress = true;
    winnerString = `${EMPTY} победил`;
    clickCounter = 0;
    console.log(gameField, 'Field initialized');
}

function startGame () {
    initGameField(3, gameField);
    renderGrid(3);
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
                setWinner(CROSS);
                paintWinningCells(row, i);
                gameInProgress = false;
                break;
            }
            else if (row === ZERO.repeat(gameField.length)) {
                setWinner(ZERO);
                paintWinningCells(row, i);
                gameInProgress = false;
                break;
            }
        }
    }
    function checkFieldVertically (gameField, index) {
        let flatArray = gameField.flat(2);
        let word = '';
        for (let i = index; i < flatArray.length; i += gameField.length) {
            if (flatArray[i] === EMPTY)
                continue;
            word += flatArray[i];
        }
        if (word === CROSS.repeat(gameField.length)) {
            setWinner(CROSS);
            paintWinningCells(gameField, index, true);
            gameInProgress = false;
            return true;
        }
        else if (word === ZERO.repeat(gameField.length)) {
            setWinner(ZERO);
            paintWinningCells(gameField, index, true);
            gameInProgress = false;
            return true;
        }
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
    }
    function tryAnnounceWinner () {
        console.log(winnerString);
        if (winnerString !== `${EMPTY} победил`)
            alert(winnerString);
    }


    checkFieldHorizontally(gameField);
    for (let i = 0; i < gameField.length; i++)
        if (checkFieldVertically(gameField, i))
            break;
    checkFieldDiagonally(gameField);
    tryAnnounceWinner();
}

function cellClickHandler (row, col) {
    function tryClickOnCell() {
        if (gameField[row][col] === EMPTY) {
            let fieldState = clickCounter % 2 ? ZERO : CROSS;
            gameField[row][col] = fieldState;

            console.log(`Clicked on cell: ${row}, ${col}`);
            console.log(gameField);
            clickCounter++;
            renderSymbolInCell(fieldState, row, col);
        }
    }

    if (gameInProgress) {
        tryClickOnCell();
        checkWinner(gameField);
        if (gameInProgress)
            if (clickCounter === possibleClicksCount)
                alert('Победила дружба');
    }
    else
        alert('Игра уже окончена!');
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
