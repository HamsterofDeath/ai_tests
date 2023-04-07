import struct
import numpy as np
import sklearn.linear_model as lm
import matplotlib.pyplot as plt


with open('C:\Users\imene\Desktop\numberAI\ai_tests\irgendwie\data\train-images.idx3-ubyte', 'rb') as f:
    magic_number = struct.unpack('>4B', f.read(4))
    num_labels = struct.unpack('>I', f.read(4))[0]
label_data = np.fromfile(f, dtype=np.uint8)
label_data = label_data.reshape(num_labels)

print(label_data)
