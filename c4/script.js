const boardElement = document.getElementById("board");
const rows = 6;
const columns = 7;
let board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));

function placePiece(col, player) {
    for (let row = rows - 1; row >= 0; row--) {
        if (!board[row][col]) {
            board[row][col] = player;
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
    if (depth === 0) return evaluateBoard(board);

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
    const depth = 8;

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

function evaluateBoard(board) {
    const directions = [
        {dr: 0, dc: 1}, // Horizontal
        {dr: 1, dc: 1}, // Diagonal (top-left to bottom-right)
        {dr: 1, dc: 0}, // Vertical
        {dr: 1, dc: -1} // Diagonal (bottom-left to top-right)
    ];

    let score = 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            if (!board[row][col]) continue;

            const player = board[row][col];
            const multiplier = player === "1" ? -1 : 1;

            for (const {dr, dc} of directions) {
                let consecutivePieces = 0;
                let openEnds = 0;

                for (let i = 0; i < 4; i++) {
                    const newRow = row + dr * i;
                    const newCol = col + dc * i;

                    if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= columns) {
                        break;
                    }

                    if (board[newRow][newCol] === player) {
                        consecutivePieces++;
                    } else {
                        if (!board[newRow][newCol]) {
                            openEnds++;
                        }
                        break;
                    }
                }

                if (consecutivePieces > 0 && openEnds > 0) {
                    score += multiplier * (consecutivePieces + openEnds);
                }
            }
        }
    }

    return score;
}

function renderBoard() {
    let html = "";
    for (let col = 0; col < columns; col++) {
        html += `<div class="column">`;
        for (let row = 0; row < rows; row++) { // Changed the loop order
            const cellValue = board[row][col];
            const cellClass = cellValue ? `player${cellValue}` : "";
            html += `<div class="cell ${cellClass}" data-row="${row}" data-col="${col}"></div>`;
        }
        html += `</div>`;
    }
    boardElement.innerHTML = html;
}

boardElement.addEventListener("click", async (event) => {
    const col = parseInt(event.target.dataset.col);

    if (isNaN(col) || board[0][col]) return;

    const humanRow = placePiece(col, "1");
    renderBoard();
    if (checkWin(humanRow, col)) {
        showPopup("Player 1 wins!");
        return;
    }

    if (checkDraw()) {
        showPopup("It's a draw!");
        return;
    }

    showWaitingDialog();

    setTimeout(() => {
        const aiCol = getBestMove();
        hideWaitingDialog();

        const aiRow = placePiece(aiCol, "2");
        renderBoard();

        if (checkWin(aiRow, aiCol)) {
            showPopup("Player 2 (AI) wins!");
            return;
        }

        if (checkDraw()) {
            showPopup("It's a draw!");
        }
    }, 100);
});


document.getElementById('popup-close').addEventListener('click', () => {
    hidePopup();
    board = new Array(rows).fill(null).map(() => new Array(columns).fill(null));
    renderBoard();
});

function showWaitingDialog() {
    const waitingDialog = document.getElementById("waiting-dialog");
    waitingDialog.style.visibility = "visible";
    waitingDialog.style.opacity = "1";
}

function hideWaitingDialog() {
    const waitingDialog = document.getElementById("waiting-dialog");
    waitingDialog.style.visibility = "hidden";
    waitingDialog.style.opacity = "0";
}

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');

    popupMessage.textContent = message;
    popup.classList.remove('hidden');
}

function hidePopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
}


renderBoard();

