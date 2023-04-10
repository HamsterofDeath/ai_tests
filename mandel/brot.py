import numpy as np
import pygame
import pyopencl as cl

WIDTH, HEIGHT = 800, 800
MAX_ITERATIONS = 1000

kernel_code = """
__kernel void mandelbrot(__global int *image, int width, int height, float zoom, int max_iterations,
                         float offsetX, float offsetY) {
    int x = get_global_id(0);
    int y = get_global_id(1);

    if (x >= width || y >= height) {
        return;
    }

    float real = (x - width / 2.0f) * 4.0f / (width * zoom) + offsetX;
    float imag = (y - height / 2.0f) * 4.0f / (height * zoom) + offsetY;
    float cReal = real;
    float cImag = imag;

    int value;
    for (value = 0; value < max_iterations; ++value) {
        float r2 = real * real;
        float i2 = imag * imag;
        if (r2 + i2 > 4.0f) {
            break;
        }

        float newReal = r2 - i2 + cReal;
        float newImag = 2 * real * imag + cImag;

        real = newReal;
        imag = newImag;
    }

    float color = value == max_iterations ? 0 : value;
    int r = (int)(color / max_iterations * 255);
    int g = (int)(color / (max_iterations / 2.0f) * 255);
    int b = (int)(color / (max_iterations / 4.0f) * 255);

    image[y * width + x] = (r << 16) | (g << 8) | b;
}
"""


class MandelbrotGenerator:
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.ctx = cl.create_some_context()
        print(f"Using device: {self.ctx.devices[0].name}")
        self.queue = cl.CommandQueue(self.ctx)
        self.prg = cl.Program(self.ctx, kernel_code).build()
        self.mandelbrot_kernel = self.prg.mandelbrot

    def generate_mandelbrot_image(self, zoom, max_iterations, offsetX, offsetY):
        image_gpu = cl.Buffer(self.ctx, cl.mem_flags.WRITE_ONLY, self.width * self.height * np.dtype(np.int32).itemsize)
        image_cpu = np.empty((self.height, self.width), dtype=np.int32)

        global_work_size = (self.width, self.height)
        local_work_size = (32, 32)

        self.mandelbrot_kernel(self.queue, global_work_size, local_work_size, image_gpu, np.int32(self.width),
                               np.int32(self.height), np.float32(zoom),
                               np.int32(max_iterations), np.float32(offsetX), np.float32(offsetY))
        cl.enqueue_copy(self.queue, image_cpu, image_gpu)

        return image_cpu


def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    zoom = 1.0
    zoom_speed = 1.01
    offsetX = 0.0
    offsetY = 0.0
    move_speed = 0.05

    mandelbrot_generator = MandelbrotGenerator(WIDTH, HEIGHT)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        keys = pygame.key.get_pressed()

        if keys[pygame.K_w]:
            offsetX -= move_speed / zoom
        if keys[pygame.K_s]:
            offsetX += move_speed / zoom
        if keys[pygame.K_a]:
            offsetY -= move_speed / zoom
        if keys[pygame.K_d]:
            offsetY += move_speed / zoom
        if keys[pygame.K_UP]:
            zoom *= zoom_speed
        if keys[pygame.K_DOWN]:
            zoom /= zoom_speed

        image_cpu = mandelbrot_generator.generate_mandelbrot_image(zoom, MAX_ITERATIONS, offsetX, offsetY)
        pygame.surfarray.blit_array(screen, image_cpu)
        pygame.display.flip()
        clock.tick(30)

    pygame.quit()


if __name__ == "__main__":
    main()
