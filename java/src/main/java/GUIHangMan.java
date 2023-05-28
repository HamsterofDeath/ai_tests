
import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.Random;

public class GUIHangMan extends JFrame {
    private String[] words = {"hello", "world", "java", "hangman", "game"};
    private String word = words[new Random().nextInt(words.length)];
    private char[] wordChars = new char[word.length()];
    private int attempts = 10;

    private JLabel wordLabel = new JLabel();
    private JTextField textField = new JTextField(1);
    private JLabel attemptsLabel = new JLabel("Attempts left: " + attempts);

    public GUIHangMan() {
        setLayout(new BoxLayout(getContentPane(), BoxLayout.Y_AXIS));
        for (int i = 0; i < wordChars.length; i++) wordChars[i] = '*';
        wordLabel.setText(new String(wordChars));
        add(wordLabel);
        add(textField);
        add(attemptsLabel);
        textField.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                checkLetter(textField.getText().charAt(0));
                textField.setText("");
            }
        });

        setSize(200, 200);
        setDefaultCloseOperation(EXIT_ON_CLOSE);
        setVisible(true);
    }

    private void checkLetter(char letter) {
        boolean correct = false;
        for (int i = 0; i < word.length(); i++) {
            if (word.charAt(i) == letter) {
                wordChars[i] = letter;
                correct = true;
            }
        }
        if (!correct) {
            attempts--;
            attemptsLabel.setText("Attempts left: " + attempts);
        }
        wordLabel.setText(new String(wordChars));
        if (new String(wordChars).equals(word)) {
            JOptionPane.showMessageDialog(this, "You win!");
            System.exit(0);
        }
        if (attempts == 0) {
            JOptionPane.showMessageDialog(this, "You lose! The word was: " + word);
            System.exit(0);
        }
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                new GUIHangMan();
            }
        });
    }
}
