

import java.util.Scanner;

public class CGPTTicTacToe {

    static char[][] board = new char[3][3];
    static char playerMark = 'X';
    static char aiMark = 'O';
    static boolean isGameOver = false;
    static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        initializeBoard();
        displayBoard();

        while (!isBoardFull() && !isGameOver) {
            playerTurn();
            if (!isBoardFull() && !isGameOver) {
                aiTurn();
            }
        }

        if (!isGameOver) {
            System.out.println("It's a tie game!");
        }
    }

    public static void initializeBoard() {
        // initialize all squares as empty
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                board[row][col] = '-';
            }
        }
    }

    public static void displayBoard() {
        System.out.println("-------------");
        for (int row = 0; row < 3; row++) {
            System.out.print("| ");
            for (int col = 0; col < 3; col++) {
                System.out.print(board[row][col] + " | ");
            }
            System.out.println();
            System.out.println("-------------");
        }
    }

    public static boolean isBoardFull() {
        // check if any square is empty
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                if (board[row][col] == '-') {
                    return false;
                }
            }
        }
        return true;
    }

    public static void playerTurn() {
        System.out.println("Your turn: ");
        int row = -1, col = -1;
        while (row == -1 || col == -1) {
            System.out.print("Enter row: ");
            row = scanner.nextInt();
            System.out.print("Enter column: ");
            col = scanner.nextInt();
            if (board[row][col] != '-') {
                System.out.println("This square is already taken. Try again.");
                row = -1; col = -1;
            }
        }
        board[row][col] = playerMark;
        displayBoard();
        if (checkWin(playerMark)) {
            System.out.println("You win!");
            isGameOver = true;
        }
    }

    public static void aiTurn() {
        System.out.println("AI's turn: ");
        int[] move = aiBestMove();
        board[move[0]][move[1]] = aiMark;
        displayBoard();
        if (checkWin(aiMark)) {
            System.out.println("AI wins!");
            isGameOver = true;
        }
    }

    public static int[] aiBestMove() {
        // AI makes the best possible move (minimax algorithm)
        int bestScore = Integer.MIN_VALUE;
        int[] bestMove = new int[]{-1, -1};
        for (int row = 0; row < 3; row++) {
            for (int col = 0; col < 3; col++) {
                if (board[row][col] == '-') {
                    board[row][col] = aiMark;
                    int score = minimax(false);
                    board[row][col] = '-';
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = new int[]{row, col};
                    }
                }
            }
        }
        return bestMove;
    }

    public static int minimax(boolean isMaximizingPlayer) {
        // returns the score of the best possible move
        if (checkWin(playerMark)) {
            return -1;
        }
        if (checkWin(aiMark)) {
            return 1;
        }
        if (isBoardFull()) {
            return 0;
        }

        if (isMaximizingPlayer) {
            int bestScore = Integer.MIN_VALUE;
            for (int row = 0; row < 3; row++) {
                for (int col = 0; col < 3; col++) {
                    if (board[row][col] == '-') {
                        board[row][col] = aiMark;
                        int score = minimax(false);
                        board[row][col] = '-';
                        bestScore = Math.max(bestScore, score);
                    }
                }
            }
            return bestScore;
        } else {
            int bestScore = Integer.MAX_VALUE;
            for (int row = 0; row < 3; row++) {
                for (int col = 0; col < 3; col++) {
                    if (board[row][col] == '-') {
                        board[row][col] = playerMark;
                        int score = minimax(true);
                        board[row][col] = '-';
                        bestScore = Math.min(bestScore, score);
                    }
                }
            }
            return bestScore;
        }
    }

    public static boolean checkWin(char mark) {
        // check if the given mark has won
        return (checkRows(mark) || checkColumns(mark) || checkDiagonals(mark));
    }

    public static boolean checkRows(char mark) {
        // check each row for a win
        for (int row = 0; row < 3; row++) {
            if (board[row][0] == mark && board[row][1] == mark && board[row][2] == mark) {
                return true;
            }
        }
        return false;
    }

    public static boolean checkColumns(char mark) {
        // check each column for a win
        for (int col = 0; col < 3; col++) {
            if (board[0][col] == mark && board[1][col] == mark && board[2][col] == mark) {
                return true;
            }
        }
        return false;
    }

    public static boolean checkDiagonals(char mark) {
        // check both diagonals for a win
        return (board[0][0] == mark && board[1][1] == mark && board[2][2] == mark)
                || (board[0][2] == mark && board[1][1] == mark && board[2][0] == mark);
    }
}