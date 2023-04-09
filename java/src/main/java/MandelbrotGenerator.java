import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import javax.swing.JFrame;
import javax.swing.JPanel;

public class MandelbrotGenerator extends JPanel implements Runnable {
    private static final int WIDTH = 800;
    private static final int HEIGHT = 800;
    private static final int MAX_ITERATIONS = 1000;
    private static final int NUM_THREADS = 16;

    private BufferedImage image;
    private double zoom = 1;
    private double zoomSpeed = 1.01;

    private final ExecutorService executor;
    private final BlockingQueue<RowData> rowQueue;

    public MandelbrotGenerator() {
        image = new BufferedImage(WIDTH, HEIGHT, BufferedImage.TYPE_INT_RGB);
        executor = Executors.newFixedThreadPool(NUM_THREADS);
        rowQueue = new LinkedBlockingQueue<>();
        new Thread(this).start();
    }

    @Override
    public void run() {
        while (true) {
            for (int y = 0; y < HEIGHT; y++) {
                final int currentY = y;
                executor.execute(() -> generateRow(currentY));
            }

            for (int y = 0; y < HEIGHT; y++) {
                try {
                    RowData rowData = rowQueue.take();
                    for (int x = 0; x < WIDTH; x++) {
                        image.setRGB(x, rowData.y, rowData.colors[x]);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }

            repaint();
            zoom *= zoomSpeed;

            try {
                Thread.sleep(50);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    private void generateRow(int y) {
        int[] colors = new int[WIDTH];
        double xOffset = -0.75;
        double yOffset = 0.1;

        for (int x = 0; x < WIDTH; x++) {
            double real = xOffset + (x - WIDTH / 2.0) * 4.0 / (WIDTH * zoom);
            double imag = yOffset + (y - HEIGHT / 2.0) * 4.0 / (HEIGHT * zoom);

            int value = mandelbrot(real, imag);
            int color = value == MAX_ITERATIONS ? 0 : Color.HSBtoRGB(value / 256f, 1, value / (value + 8f));
            colors[x] = color;
        }

        try {
            rowQueue.put(new RowData(y, colors));
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    private int mandelbrot(double real, double imag) {
        double cReal = real;
        double cImag = imag;
        int value;

        for (value = 0; value < MAX_ITERATIONS; value++) {
            double r2 = real * real;
            double i2 = imag * imag;
            if (r2 + i2 > 4.0) {
                break;
            }

            double newReal = r2 - i2 + cReal;
            double newImag = 2 * real * imag + cImag;

            real = newReal;
            imag = newImag;
        }

        return value;
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        g.drawImage(image, 0, 0, this);
    }

    public static void main(String[] args) {
        JFrame frame = new JFrame("Mandelbrot Set Generator");
        MandelbrotGenerator generator = new MandelbrotGenerator();
        frame.add(generator);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(new Dimension(WIDTH, HEIGHT));
        frame.setResizable(false);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }
}

class RowData {
    int y;
    int[] colors;

    public RowData(int y, int[] colors) {
        this.y = y;
        this.colors = colors;
    }
}

