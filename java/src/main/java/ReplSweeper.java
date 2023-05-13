import java.util.Arrays;
import java.util.Random;
import java.util.Scanner;

public class ReplSweeper {
    public static class SimpleMinesweeper {
        private enum CellStatus {
            EMPTY, BOMB
        }

        private CellStatus[][] field;
        private boolean[][] revealed;
        private boolean[][] marked;

        public void newGame(int width, int height, int bombs) {
            if(bombs > width * height) {
                throw new IllegalArgumentException("The number of bombs cannot be more than the number of cells");
            }
            this.field = new CellStatus[height][width];
            this.revealed = new boolean[height][width];
            this.marked = new boolean[height][width];

            // Initialize the field
            for (CellStatus[] row : this.field)
                Arrays.fill(row, CellStatus.EMPTY);

            // Randomly add bombs
            Random rand = new Random();
            for (int i = 0; i < bombs; i++) {
                int x, y;
                do {
                    x = rand.nextInt(width);
                    y = rand.nextInt(height);
                } while (this.field[y][x] == CellStatus.BOMB);
                this.field[y][x] = CellStatus.BOMB;
            }
        }

        public void printGameState() {
            for (int i = 0; i < field.length; i++) {
                for (int j = 0; j < field[i].length; j++) {
                    if (revealed[i][j]) {
                        if (field[i][j] == CellStatus.BOMB) {
                            System.out.print("B ");
                        } else {
                            System.out.print(countAdjacentbombs(j, i) + " ");
                        }
                    } else if (marked[i][j]) {
                        System.out.print("F ");
                    } else {
                        System.out.print("* ");
                    }
                }
                System.out.println();
            }
        }

        // Count adjacent bombs
        private int countAdjacentbombs(int x, int y) {
            int count = 0;
            for (int i = Math.max(0, y - 1); i <= Math.min(field.length - 1, y + 1); i++) {
                for (int j = Math.max(0, x - 1); j <= Math.min(field[i].length - 1, x + 1); j++) {
                    if (i == y && j == x) continue; // Skip the current cell
                    if (field[i][j] == CellStatus.BOMB) {
                        count++;
                    }
                }
            }
            return count;
        }

        // Mark a cell
        public void markCell(int x, int y) {
            this.marked[y][x] = true;
        }

        // Unmark a cell
        public void unmarkCell(int x, int y) {
            this.marked[y][x] = false;
        }

        // Reveal a cell
        public void revealCell(int x, int y) {
            this.revealed[y][x] = true;
        }

        public boolean checkWin() {
            for (int i = 0; i < field.length; i++) {
                for (int j = 0; j < field[i].length; j++) {
                    if (field[i][j] == CellStatus.EMPTY && !revealed[i][j]) {
                        return false; // There's still a non-bomb cell that hasn't been revealed
                    }
                }
            }
            return true; // All non-bomb cells have been revealed
        }


        public boolean checkLose(int x, int y) {
            return field[y][x] == CellStatus.BOMB && revealed[y][x]; // You lose if you reveal a bomb
        }
    }


    private static final String NEW_GAME_COMMAND = "NEWGAME";
    private static final String MARK_COMMAND = "MARK";
    private static final String UNMARK_COMMAND = "UNMARK";
    private static final String REVEAL_COMMAND = "REVEAL";
    private static final String QUIT_COMMAND = "QUIT";


    public static void main(String[] args) {
        SimpleMinesweeper game = new SimpleMinesweeper();
        Scanner scanner = new Scanner(System.in);
        String input;

        System.out.println("Welcome to Simple Minesweeper! Enter your commands.");

        while (true) {
            System.out.print("> ");
            input = scanner.nextLine().trim().toUpperCase();

            String[] tokens = input.split("\\s+");
            String command = tokens[0];

            try {
                switch (command) {
                    case NEW_GAME_COMMAND -> {
                        int width = Integer.parseInt(tokens[1]);
                        int height = Integer.parseInt(tokens[2]);
                        int bombs = Integer.parseInt(tokens[3]);
                        game.newGame(width, height, bombs);
                        System.out.println("Started a new game.");
                    }
                    case MARK_COMMAND -> {
                        int markX = Integer.parseInt(tokens[1]);
                        int markY = Integer.parseInt(tokens[2]);
                        game.markCell(markX, markY);
                        System.out.println("Marked the cell.");
                    }
                    case UNMARK_COMMAND -> {
                        int unmarkX = Integer.parseInt(tokens[1]);
                        int unmarkY = Integer.parseInt(tokens[2]);
                        game.unmarkCell(unmarkX, unmarkY);
                        System.out.println("Unmarked the cell.");
                    }
                    case REVEAL_COMMAND -> {
                        int revealX = Integer.parseInt(tokens[1]);
                        int revealY = Integer.parseInt(tokens[2]);
                        game.revealCell(revealX, revealY);
                        if (game.checkLose(revealX, revealY)) {
                            System.out.println("Oh no, you revealed a bomb! Game over.");
                            return;
                        } else {
                            System.out.println("Revealed the cell.");
                        }
                    }
                    case QUIT_COMMAND -> {
                        System.out.println("Exiting game.");
                        return;
                    }
                    default -> System.out.println("Invalid command.");
                }


                // Print current game state after each command
                game.printGameState();
                if (game.checkWin()) {
                    System.out.println("Congratulations, you've found all the bombs! You win.");
                    return;
                }

            } catch (Exception e) {
                System.out.println("Invalid command or arguments.");
            }
        }
    }
}

