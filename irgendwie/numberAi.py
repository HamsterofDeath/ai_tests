import struct

import numpy as np


def load_data():
    with open('data\\train-labels.idx1-ubyte', 'rb') as f:
        magic_number = struct.unpack('>4B', f.read(4))
        num_labels = struct.unpack('>I', f.read(4))[0]
        labels = np.fromfile(f, dtype=np.uint8)

    with open('data\\train-images.idx3-ubyte', 'rb') as f:
        magic_number = struct.unpack('>4B', f.read(4))
        num_images = struct.unpack('>I', f.read(4))[0]
        num_rows = struct.unpack('>I', f.read(4))[0]
        num_cols = struct.unpack('>I', f.read(4))[0]
        images = np.fromfile(f, dtype=np.uint8)
        images = images.reshape(num_images, num_rows * num_cols)

    return images, labels


def train_perceptron(X, y, num_classes, learning_rate=0.001, epochs=10):
    num_features = X.shape[1]
    weights = np.zeros((num_classes, num_features))

    for epoch in range(epochs):
        for i in range(X.shape[0]):
            true_label = y[i]
            input_vector = X[i]

            # Forward pass
            output = np.dot(weights, input_vector)
            predicted_label = np.argmax(output)

            # Update weights if the prediction is incorrect
            if predicted_label != true_label:
                weights[true_label] += learning_rate * input_vector
                weights[predicted_label] -= learning_rate * input_vector

    return weights


def evaluate_perceptron(X, y, weights):
    correct = 0
    for i in range(X.shape[0]):
        true_label = y[i]
        input_vector = X[i]

        # Forward pass
        output = np.dot(weights, input_vector)
        predicted_label = np.argmax(output)

        if predicted_label == true_label:
            correct += 1

    return correct / X.shape[0]


# Load and preprocess data
X, y = load_data()
X = X / 255.0

# Train the perceptron
num_classes = 10
weights = train_perceptron(X, y, num_classes)

# Evaluate the perceptron
accuracy = evaluate_perceptron(X, y, weights)
print("Accuracy:", accuracy)
