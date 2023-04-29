// code 1

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.util.HashSet;
import java.util.Random;
import java.util.Set;

public class Hangman {
    private static final String[] WORDS = {"programming", "java", "swing", "codemonkey"};
    private JFrame frame;
    private JLabel wordLabel;
    private JTextField inputField;
    private JButton submitButton;
    private JLabel resultLabel;
    private String currentWord;
    private String currentMaskedWord;
    private Set<Character> usedCharacters;

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Hangman().createAndShowGUI());
    }

    private void createAndShowGUI() {
        frame = new JFrame("Hangman Game");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        initUI();

        frame.pack();
        frame.setVisible(true);

        usedCharacters = new HashSet<>(); // Initialize usedCharacters set here
        startNewGame();
    }

    private void initUI() {
        JPanel panel = new JPanel();
        frame.add(panel);

        wordLabel = new JLabel();
        panel.add(wordLabel);

        inputField = new JTextField(1);
        panel.add(inputField);

        submitButton = new JButton("Guess");
        panel.add(submitButton);
        submitButton.addActionListener(this::onSubmit);

        resultLabel = new JLabel(" ");
        panel.add(resultLabel);
    }

    private void onSubmit(ActionEvent event) {
        String input = inputField.getText();
        if (input.isEmpty() || usedCharacters.contains(input.toLowerCase().charAt(0)) || input.length() > 1) {
            return;
        }

        usedCharacters.add(input.toLowerCase().charAt(0));
        currentMaskedWord = maskCurrentWord();
        wordLabel.setText(currentMaskedWord);
        inputField.setText(null);

        if (currentMaskedWord.equals(currentWord)) {
            resultLabel.setText("You won!");
            submitButton.setEnabled(false);
        }
    }

    private void startNewGame() {
        currentWord = randomWord();
        currentMaskedWord = maskCurrentWord();
        usedCharacters = new HashSet<>();
        wordLabel.setText(currentMaskedWord);
        submitButton.setEnabled(true);
        resultLabel.setText(" ");
    }

    private String randomWord() {
        return WORDS[new Random().nextInt(WORDS.length)];
    }

    private String maskCurrentWord() {
        StringBuilder sb = new StringBuilder();
        for (char ch : currentWord.toCharArray()) {
            if (usedCharacters.contains(ch)) {
                sb.append(ch);
            } else {
                sb.append('*');
            }
        }

        return sb.toString();
    }
}
