import pycuda.autoinit
import pycuda.driver as cuda
import numpy as np
from pycuda.compiler import SourceModule
import pygame

WIDTH, HEIGHT = 800, 800
MAX_ITERATIONS = 1000

kernel_code = """
__global__ void mandelbrot(int *image, int width, int height, float zoom, int max_iterations) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;

    if (x >= width || y >= height) {
        return;
    }

    float real = (x - width / 2.0) * 4.0 / (width * zoom);
    float imag = (y - height / 2.0) * 4.0 / (height * zoom);
    float cReal = real;
    float cImag = imag;

    int value;
    for (value = 0; value < max_iterations; ++value) {
        float r2 = real * real;
        float i2 = imag * imag;
        if (r2 + i2 > 4.0) {
            break;
        }

        float newReal = r2 - i2 + cReal;
        float newImag = 2 * real * imag + cImag;

        real = newReal;
        imag = newImag;
    }

    image[y * width + x] = value;
}
"""

mandelbrot_kernel = SourceModule(kernel_code).get_function("mandelbrot")

def generate_mandelbrot_image(width, height, zoom, max_iterations):
    image_gpu = cuda.mem_alloc(width * height * np.dtype(np.int32).itemsize)
    image_cpu = np.empty((height, width), dtype=np.int32)

    grid = (width // 32, height // 32, 1)
    block = (32, 32, 1)

    mandelbrot_kernel(image_gpu, np.int32(width), np.int32(height), np.float32(zoom), np.int32(max_iterations), grid=grid, block=block)
    cuda.memcpy_dtoh(image_cpu, image_gpu)

    return image_cpu

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    clock = pygame.time.Clock()
    zoom = 1.0
    zoom_speed = 1.01

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        image_cpu = generate_mandelbrot_image(WIDTH, HEIGHT, zoom, MAX_ITERATIONS)
        pygame.surfarray.blit_array(screen, image_cpu)
        pygame.display.flip()
        clock.tick(30)
        zoom *= zoom_speed

    pygame.quit()

if __name__ == "__main__":
    main()
