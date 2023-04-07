import struct
import numpy as np
import sklearn.linear_model as lm
import matplotlib.pyplot as plt


with open('data\\train-labels.idx1-ubyte', 'rb') as f:
    magic_number = struct.unpack('>4B', f.read(4))
    num_labels = struct.unpack('>I', f.read(4))[0]
    label_data = np.fromfile(f, dtype=np.uint8)
    label_data = label_data.reshape(num_labels)

with open('data\\train-images.idx3-ubyte', 'rb') as f:
    magic_number = struct.unpack('>4B', f.read(4))
    num_images = struct.unpack('>I', f.read(4))[0]
    num_rows = struct.unpack('>I', f.read(4))[0]
    num_cols = struct.unpack('>I', f.read(4))[0]
    image_data = np.fromfile(f, dtype=np.uint8)
    image_data = image_data.reshape(num_images, num_rows, num_cols)

print(image_data)
print(label_data)
