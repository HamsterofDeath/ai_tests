const boardElement = document.getElementById("board");
const rows = 6;
const columns = 7;
let board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));

function placePiece(column, player) {
    for (let row = rows - 1; row >= 0; row--) {
        if (!board[row][column]) {
            board[row][column] = player;
            return row;
        }
    }
    return -1;
}

function checkWin(row, col) {
    const player = board[row][col];

    // Check horizontal
    let count = 0;
    for (let c = 0; c < columns; c++) {
        count = board[row][c] === player ? count + 1 : 0;
        if (count === 4) return true;
    }

    // Check vertical
    count = 0;
    for (let r = 0; r < rows; r++) {
        count = board[r][col] === player ? count + 1 : 0;
        if (count === 4) return true;
    }

    // Check diagonal (top-left to bottom-right)
    let startRow = row - Math.min(row, col);
    let startCol = col - Math.min(row, col);
    count = 0;
    for (let i = 0; i < rows; i++) {
        if (startRow + i >= rows || startCol + i >= columns) break;
        count = board[startRow + i][startCol + i] === player ? count + 1 : 0;
        if (count === 4) return true;
    }

    // Check diagonal (bottom-left to top-right)
    startRow = row + Math.min(rows - row - 1, col);
    startCol = col - Math.min(rows - row - 1, col);
    count = 0;
    for (let i = 0; i < rows; i++) {
        if (startRow - i < 0 || startCol + i >= columns) break;
        count = board[startRow - i][startCol + i] === player ? count + 1 : 0;
        if (count === 4) return true;
    }

    return false;
}

function checkDraw() {
    return board[0].every(cell => cell);
}

function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    if (depth === 0) return 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            if (board[row][col] && checkWin(row, col)) {
                // AI tries to maximize survival by minimizing the opponent's score
                return isMaximizingPlayer ? -(depth + 1) : depth + 1;
            }
        }
    }

    if (checkDraw()) return 0;

    const validColumns = [];
    for (let col = 0; col < columns; col++) {
        if (!board[0][col]) validColumns.push(col);
    }

    if (isMaximizingPlayer) {
        let bestScore = -Infinity;

        for (const col of validColumns) {
            const row = placePiece(col, "2");
            const score = minimax(board, depth - 1, false, alpha, beta);
            board[row][col] = null;

            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);

            if (alpha >= beta) break;
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (const col of validColumns) {
            const row = placePiece(col, "1");
            const score = minimax(board, depth - 1, true, alpha, beta);
            board[row][col] = null;

            bestScore = Math.min(bestScore, score);
            beta = Math.min(beta, bestScore);

            if (alpha >= beta) break;
        }

        return bestScore;
    }
}

function getBestMove() {
    let bestScore = -Infinity;
    let bestColumn = -1;
    const depth = 4;

    for (let col = 0; col < columns; col++) {
        if (!board[0][col]) {
            const row = placePiece(col, "2");
            const score = minimax(board, depth, false, -Infinity, Infinity);
            board[row][col] = null;
            if (score > bestScore) {
                bestScore = score;
                bestColumn = col;
            }
        }

    }

    return bestColumn;
}

function renderBoard() {
    boardElement.innerHTML = "";

    for (let row = 0; row < rows; row++) {
        const rowElement = document.createElement("div");
        rowElement.classList.add("row");
        rowElement.dataset.row = row;
        for (let col = 0; col < columns; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.col = col;

            if (board[row][col]) {
                cell.dataset.player = board[row][col];
            }

            rowElement.appendChild(cell);
        }

        boardElement.appendChild(rowElement);
    }
}

boardElement.addEventListener("click", event => {
    const col = parseInt(event.target.dataset.col);

    if (isNaN(col) || board[0][col]) return;

    const humanRow = placePiece(col, "1");
    renderBoard();

    if (checkWin(humanRow, col)) {
        alert("Player 1 wins!");
        board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));
        renderBoard();
        return;
    }

    if (checkDraw()) {
        alert("It's a draw!");
        board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));
        renderBoard();
        return;
    }

    const aiCol = getBestMove();
    const aiRow = placePiece(aiCol, "2");
    renderBoard();

    if (checkWin(aiRow, aiCol)) {
        alert("Player 2 (AI) wins!");
        board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));
        renderBoard();
        return;
    }

    if (checkDraw()) {
        alert("It's a draw!");
        board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));
        renderBoard();
        return;
    }
});

renderBoard();

