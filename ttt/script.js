const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");

let currentPlayer = "X";

function checkWin() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (
            cells[a].textContent &&
            cells[a].textContent === cells[b].textContent &&
            cells[a].textContent === cells[c].textContent
        ) {
            return true;
        }
    }
    return false;
}

function checkDraw() {
    return [...cells].every(cell => cell.textContent);
}

function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    if (checkWin()) {
        return isMaximizingPlayer ? -1 : 1;
    } else if (checkDraw()) {
        return 0;
    }

    if (isMaximizingPlayer) {
        let bestScore = -Infinity;

        for (const cell of board) {
            if (!cell.textContent) {
                cell.textContent = "O";
                const score = minimax(board, depth + 1, !isMaximizingPlayer, alpha, beta);
                cell.textContent = "";
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return bestScore;
    } else {
        let bestScore = Infinity;

        for (const cell of board) {
            if (!cell.textContent) {
                cell.textContent = "X";
                const score = minimax(board, depth + 1, !isMaximizingPlayer, alpha, beta);
                cell.textContent = "";
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        return bestScore;
    }
}

function getBestMove(board) {
    let bestMove = -1;
    let bestScore = -Infinity;

    for (const [index, cell] of [...board].entries()) {
        if (!cell.textContent) {
            cell.textContent = "O";
            const score = minimax(board, 0, false, -Infinity, Infinity);
            cell.textContent = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
    }

    return bestMove;
}

board.addEventListener("click", event => {
    const cell = event.target;
    if (cell.classList.contains("cell") && !cell.textContent && !checkWin() && !checkDraw()) {
        cell.textContent = currentPlayer;
        if (checkWin()) {
            alert(`${currentPlayer} wins!`);
            location.reload();
        } else if (checkDraw()) {
            alert("It's a draw!");
            location.reload();
        } else {
            currentPlayer = "O";
            const bestMove = getBestMove(cells);
            cells[bestMove].textContent = currentPlayer;
            if (checkWin()) {
                alert(`${currentPlayer} wins!`);
                location.reload();
            } else if (checkDraw()) {
                alert("It's a draw!");
                location.reload
                ();
            }
            currentPlayer = "X";
        }
    }
});