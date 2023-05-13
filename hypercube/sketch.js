const angle = 0.01;
const scale = 100;
let t = 0;

function setup() {
    createCanvas(800, 800);
}

function draw() {
    background(255);
    translate(width / 2, height / 2);

    // Rotate the 5D space around XW, YW, ZW planes
    const rotationMatrix = [
        [Math.cos(t), 0, 0, 0, Math.sin(t)],
        [0, Math.cos(t), 0, 0, Math.sin(t)],
        [0, 0, Math.cos(t), 0, Math.sin(t)],
        [0, 0, 0, 1, 0],
        [-Math.sin(t), 0, 0, 0, Math.cos(t)]
    ];

    const points = generate5DPoints();
    const projected4DPoints = project5DPoints(points, rotationMatrix);
    const projected3DPoints = project4DPoints(projected4DPoints);
    const projected2DPoints = project3DPoints(projected3DPoints);

    drawEdges(projected2DPoints);
    t += angle;
}

function generate5DPoints() {
    const points = [];
    for (let i = 0; i < 32; i++) {
        const point = [
            (i & 1) ? 1 : -1,
            (i & 2) ? 1 : -1,
            (i & 4) ? 1 : -1,
            (i & 8) ? 1 : -1,
            (i & 16) ? 1 : -1,
        ];
        points.push(point);
    }
    return points;
}

function project5DPoints(points, rotationMatrix) {
    return points.map((point) => {
        let newPoint = new Array(5).fill(0);
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                newPoint[i] += rotationMatrix[i][j] * point[j];
            }
        }
        return newPoint;
    });
}

function project4DPoints(points) {
    return points.map((point) => [
        scale * point[0] / (point[4] + 5),
        scale * point[1] / (point[4] + 5),
        scale * point[2] / (point[4] + 5),
        scale * point[3] / (point[4] + 5),
    ]);
}

function project3DPoints(points) {
    return points.map((point) => [
        scale * point[0] / (point[3] + 5),
        scale *point[1] / (point[3] + 5),
        scale * point[2] / (point[3] + 5),
    ]);
}

function drawEdges(points) {
    stroke(0);
    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            if (isEdge(i, j)) {
                line(points[i][0], points[i][1], points[j][0], points[j][1]);
            }
        }
    }
}

function isEdge(i, j) {
    const xored = i ^ j;
    return xored === 1 || xored === 2 || xored === 4 || xored === 8 || xored === 16;
}
