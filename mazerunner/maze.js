const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const mazeSizeInput = document.getElementById('mazeSize');
const generateMazeButton = document.getElementById('generateMaze');
const startButton = document.getElementById('start');
const appleCountInput = document.getElementById('appleCount');

canvas.width = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
canvas.height = canvas.width;

let maze;
let mazeSize = parseInt(mazeSizeInput.value);
let cellSize;

generateMazeButton.addEventListener('click', () => {
    mazeSize = parseInt(mazeSizeInput.value);
    const numberOfApples = parseInt(appleCountInput.value);
    maze = generateMaze(mazeSize, numberOfApples);
    cellSize = canvas.width / mazeSize;
    drawMaze();
});

startButton.addEventListener('click', () => {
    if (maze) {
        animateDot();
    }
});

// ... (the rest of the JavaScript code)


function createFilledMaze(size) {
    const maze = new Array(size);

    for (let row = 0; row < size; row++) {
        maze[row] = new Array(size).fill(null).map(() => ({
            value: 1,
            inOpenSet: false,
        }));
    }

    // Set the start cell to be a free cell
    maze[1][1].value = 0;

    return maze;
}

function generateMaze(size, numberOfApples) {
    const maze = createFilledMaze(size);

    // Start with the top-left corner cell and mark it as visited
    maze[1][1].value = 0;
    const frontierCells = [{row: 1, col: 1}];

    const directions = [
        {row: -2, col: 0},
        {row: 2, col: 0},
        {row: 0, col: -2},
        {row: 0, col: 2},
    ];

    while (frontierCells.length > 0) {
        const currentIdx = Math.floor(Math.random() * frontierCells.length);
        const current = frontierCells[currentIdx];

        const validNeighbors = directions
            .map(direction => ({
                row: current.row + direction.row,
                col: current.col + direction.col,
            }))
            .filter(
                neighbor =>
                    neighbor.row >= 1 && neighbor.row < size - 1 &&
                    neighbor.col >= 1 && neighbor.col < size - 1 &&
                    maze[neighbor.row][neighbor.col].value === 1 &&
                    directions.some(
                        direction =>
                            neighbor.row + direction.row >= 1 &&
                            neighbor.row + direction.row < size - 1 &&
                            neighbor.col + direction.col >= 1 &&
                            neighbor.col + direction.col < size - 1 &&
                            maze[neighbor.row + direction.row][neighbor.col + direction.col].value === 0
                    )
            );

        if (validNeighbors.length > 0) {
            const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
            const newRow = current.row + (randomNeighbor.row - current.row) / 2;
            const newCol = current.col + (randomNeighbor.col - current.col) / 2;

            maze[newRow][newCol].value = 0;
            maze[randomNeighbor.row][randomNeighbor.col].value = 0;

            frontierCells.push(randomNeighbor);
        } else {
            frontierCells.splice(currentIdx, 1);
        }
    }
    placeApples(maze, numberOfApples);
    return maze;
}

function placeApples(maze, numberOfApples) {
    const size = maze.length;
    let applesPlaced = 0;

    while (applesPlaced < numberOfApples) {
        const row = Math.floor(Math.random() * (size - 2)) + 1;
        const col = Math.floor(Math.random() * (size - 2)) + 1;

        if (maze[row][col].value === 0 && !(row === 1 && col === 1)) {
            maze[row][col].value = applesPlaced + 2;
            applesPlaced++;
        }
    }
}


function drawMaze() {
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            const cellValue = maze[row][col].value;
            ctx.fillStyle = cellValue === 1 ? 'black' : 'white';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);

            if (cellValue >= 2) {
                ctx.fillStyle = 'green';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

function animateDot() {
    const startPosition = {row: 1, col: 1};
    const apples = getApplesPositions(maze);
    const path = tsp(maze, startPosition, apples);
    animatePath(path);
}

function getApplesPositions(maze) {
    const apples = [];
    for (let row = 0; row < maze.length; row++) {
        for (let col = 0; col < maze[row].length; col++) {
            if (maze[row][col].value >= 2) {
                apples.push({row, col});
            }
        }
    }
    return apples;
}

class MinBinaryHeap {
    constructor() {
        this.elements = [];
    }

    add(element, priority) {
        this.elements.push({element, priority});
        this.bubbleUp(this.elements.length - 1);
    }

    removeMin() {
        const min = this.elements[0];
        const last = this.elements.pop();

        if (this.elements.length > 0) {
            this.elements[0] = last;
            this.bubbleDown(0);
        }

        return min;
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.elements[parentIndex];
            const current = this.elements[index];

            if (parent.priority <= current.priority) {
                break;
            }

            this.elements[parentIndex] = current;
            this.elements[index] = parent;
            index = parentIndex;
        }
    }

    bubbleDown(index) {
        const length = this.elements.length;
        const current = this.elements[index];

        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
            let smallestChildIndex;

            if (leftChildIndex < length) {
                smallestChildIndex = leftChildIndex;
                if (rightChildIndex < length && this.elements[rightChildIndex].priority < this.elements[leftChildIndex].priority) {
                    smallestChildIndex = rightChildIndex;
                }

                if (this.elements[smallestChildIndex].priority < current.priority) {
                    this.elements[index] = this.elements[smallestChildIndex];
                    this.elements[smallestChildIndex] = current;
                    index = smallestChildIndex;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }
}

class PriorityQueue {
    constructor() {
        this.heap = new MinBinaryHeap();
    }

    enqueue(element, priority) {
        this.heap.add(element, priority);
    }

    dequeue() {
        return this.heap.removeMin().element;
    }

    isEmpty() {
        return this.heap.isEmpty();
    }

    contains(element) {
        return this.heap.elements.some(queueElement => queueElement.element === element);
    }
}

function tsp(maze, startPosition, apples) {
    const shortestPath = {
        path: [],
        distance: Infinity,
    };

    const path = [startPosition];
    const visited = new Set();
    const cache = new Map();

    function getDistance(pos1, pos2) {
        const key = `${pos1.row}-${pos1.col}-${pos2.row}-${pos2.col}`;
        if (!cache.has(key)) {
            const distance = aStar(maze, pos1, pos2).length;
            cache.set(key, distance);
        }
        return cache.get(key);
    }

    function dfs(currentPosition) {
        if (path.length === apples.length + 1) {
            const pathDistance = path.slice(1).reduce((acc, pos, idx) => {
                const prevPos = path[idx];
                const distance = getDistance(prevPos, pos);
                return acc + distance;
            }, 0);

            if (pathDistance < shortestPath.distance) {
                shortestPath.path = [...path];
                shortestPath.distance = pathDistance;
            }
            return;
        }

        for (const [index, apple] of apples.entries()) {
            if (!visited.has(index)) {
                visited.add(index);
                path.push(apple);
                dfs(apple);
                path.pop();
                visited.delete(index);
            }
        }
    }

    dfs(startPosition);

    return shortestPath.path;
}


function aStar(maze, start, end) {
    const openSet = new PriorityQueue();
    openSet.enqueue(start, 0);

    const gScore = new Map();
    gScore.set(`${start.row}-${start.col}`, 0);

    const cameFrom = new Map();

    const hScore = (cell) => Math.abs(cell.row - end.row) + Math.abs(cell.col - end.col);

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();
        if (current.row === end.row && current.col === end.col) {
            const path = [current];
            let parent = cameFrom.get(`${current.row}-${current.col}`);

            while (parent) {
                path.unshift(parent);
                parent = cameFrom.get(`${parent.row}-${parent.col}`);
            }

            return path;
        }

        const neighbors = [
            {row: current.row - 1, col: current.col},
            {row: current.row + 1, col: current.col},
            {row: current.row, col: current.col - 1},
            {row: current.row, col: current.col + 1},
        ];

        for (const neighbor of neighbors) {
            if (neighbor.row >= 0 && neighbor.row < maze.length &&
                neighbor.col >= 0 && neighbor.col < maze[0].length &&
                maze[neighbor.row][neighbor.col].value !== 1) {

                const tentativeGScore = gScore.get(`${current.row}-${current.col}`) + 1;

                if (!gScore.has(`${neighbor.row}-${neighbor.col}`) || tentativeGScore < gScore.get(`${neighbor.row}-${neighbor.col}`)) {
                    cameFrom.set(`${neighbor.row}-${neighbor.col}`, current);
                    gScore.set(`${neighbor.row}-${neighbor.col}`, tentativeGScore);
                    const fScore = tentativeGScore + hScore(neighbor);

                    if (!openSet.contains(neighbor)) {
                        openSet.enqueue(neighbor, fScore);
                    }
                }
            }
        }
    }

    return [];
}

async function animatePath(path) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    ctx.fillStyle = 'blue';

    for (let i = 0; i < path.length - 1; i++) {
        const aStarPath = aStar(maze, path[i], path[i + 1]);

        for (const cell of aStarPath) {
            ctx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
            await delay(50);

            if (maze[cell.row][cell.col].value < 2) {
                ctx.fillStyle = 'white';
                ctx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
                ctx.fillStyle = 'blue';
            } else {
                maze[cell.row][cell.col].value = 0; // Remove the apple after it is touched
                ctx.fillStyle = 'white';
                ctx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
                ctx.fillStyle = 'blue';
            }
        }
    }
}


