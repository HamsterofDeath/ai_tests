const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const block = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    size: 30,
    speed: 7,
    movingLeft: false,
    movingRight: false,
    firing: false,
};

let score = 0;
let laser = null;


const asteroids = [];
const asteroidFrequency = 60;

function handleInput() {
    if (block.movingLeft) {
        block.x -= block.speed;
        if (laser && laser.y === block.y - 10) laser.x -= block.speed;
    }
    if (block.movingRight) {
        block.x += block.speed;
        if (laser && laser.y === block.y - 10) laser.x += block.speed;
    }

    if (block.firing && !laser) {
        laser = {
            x: block.x + block.size / 2 - 2.5,
            y: block.y - 10,
            width: 10,
            height: 20,
            speed: 10,
            size: 5,
        };
    }

    if (laser) {
        laser.y -= laser.speed;
        if (laser.y < 0) laser = null;
    }
}

function update() {
    handleInput();

    if (block.x < 0) block.x = 0;
    if (block.x + block.size > canvas.width) block.x = canvas.width - block.size;

    const difficulty = Math.min(1 + score / 100, 5);

    if (asteroids.length < 1 || asteroids[asteroids.length - 1].y > asteroidFrequency / difficulty) {
        const size = 20 + Math.random() * 40 + difficulty;
        asteroids.push({
            x: Math.random() * (canvas.width - size),
            y: -size,
            size: size,
            speed: 1 + Math.random() * difficulty,
            shape: createAsteroidShape(size, size * 0.4),
            rotation: 0,
            rotationSpeed: (Math.random() * 0.02) - 0.01,
        });
    }

    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].y += asteroids[i].speed;
        asteroids[i].rotation += asteroids[i].rotationSpeed;

        const asteroidCenter = {
            x: asteroids[i].x + asteroids[i].size / 2,
            y: asteroids[i].y + asteroids[i].size / 2,
        };

        asteroids[i].rotatedShape = asteroids[i].shape.map((point) =>
            rotatePoint(
                {
                    x: asteroids[i].x + point.x - asteroids[i].size / 2,
                    y: asteroids[i].y + point.y - asteroids[i].size / 2,
                },
                asteroidCenter,
                asteroids[i].rotation
            )
        );
        if (asteroids[i].y - asteroids[i].size > canvas.height + 100) {
            asteroids.shift();
            score++;
        }

        if (laser && checkCollision(laser, asteroids[i], true)) {
            asteroids.splice(i, 1);
            laser = null;
            score += 10;
            continue;
        }


        if (checkCollision(block, asteroids[i])) {
            alert(`Game Over! Your score: ${score}`);
            location.reload();
        }
    }
}

function rotatePoint(point, center, angle) {
    const x = point.x - center.x;
    const y = point.y - center.y;

    const newX = x * Math.cos(angle) - y * Math.sin(angle);
    const newY = x * Math.sin(angle) + y * Math.cos(angle);

    return {x: newX + center.x, y: newY + center.y};
}


function checkPolygonCollision(polygon1, polygon2) {
    const polygons = [polygon1, polygon2];

    for (let polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
        const polygon = polygons[polygonIndex];
        for (let i = 0; i < polygon.length; i++) {
            const p1 = polygon[i];
            const p2 = polygon[i + 1] || polygon[0];

            const normal = {x: p2.y - p1.y, y: p1.x - p2.x};

            let minA = Infinity;
            let maxA = -Infinity;
            for (const p of polygon1) {
                const projection = p.x * normal.x + p.y * normal.y;
                minA = Math.min(minA, projection);
                maxA = Math.max(maxA, projection);
            }

            let minB = Infinity;
            let maxB = -Infinity;
            for (const p of polygon2) {
                const projection = p.x * normal.x + p.y * normal.y;
                minB = Math.min(minB, projection);
                maxB = Math.max(maxB, projection);
            }

            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }

    return true;
}


function drawAsteroid(asteroid) {
    ctx.beginPath();
    ctx.moveTo(asteroid.rotatedShape[0].x, asteroid.rotatedShape[0].y);

    for (let i = 1; i < asteroid.rotatedShape.length; i++) {
        ctx.lineTo(asteroid.rotatedShape[i].x, asteroid.rotatedShape[i].y);
    }

    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
}


function checkCollision(rect, asteroid, laser = false) {
    const rectPolygon = [
        {x: rect.x, y: rect.y},
        {x: rect.x + rect.width, y: rect.y},
        {x: rect.x + rect.width, y: rect.y + rect.height},
        {x: rect.x, y: rect.y + rect.height},
    ];

    const asteroidCenter = {
        x: asteroid.x + asteroid.size / 2,
        y: asteroid.y + asteroid.size / 2,
    };

    const asteroidPolygon = asteroid.rotatedShape;


    if (laser) {
        const laserPolygon = [
            {x: rect.x, y: rect.y},
            {x: rect.x + rect.width, y: rect.y},
            {x: rect.x + rect.width, y: rect.y + rect.height},
            {x: rect.x, y: rect.y + rect.height},
        ];
        return checkPolygonCollision(laserPolygon, asteroidPolygon);
    } else {
        const spaceshipPolygon = [
            {x: rect.x, y: rect.y},
            {x: rect.x + rect.size / 2, y: rect.y - rect.size},
            {x: rect.x + rect.size, y: rect.y},
        ];
        return checkPolygonCollision(spaceshipPolygon, asteroidPolygon);
    }
}


function drawSpaceship(x, y, width, height) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSpaceship(block.x, block.y, block.size, block.size);

    if (laser) {
        ctx.fillStyle = 'green';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }

    for (const asteroid of asteroids) {
        drawAsteroid(asteroid);
    }

    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function createAsteroidShape(size, variance) {
    const numOfVertices = 10;
    const angleStep = (Math.PI * 2) / numOfVertices;
    const shape = [];

    for (let i = 0; i < numOfVertices; i++) {
        const angle = angleStep * i;
        const xPos = size + Math.cos(angle) * (size + Math.random() * variance);
        const yPos = size + Math.sin(angle) * (size + Math.random() * variance);
        shape.push({x: xPos, y: yPos});
    }

    return shape;
}

const desiredFPS = 60;
const timeInterval = 1000 / desiredFPS;

function gameLoop() {
    update();
    draw();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        block.movingLeft = true;
    } else if (e.key === 'ArrowRight') {
        block.movingRight = true;
    } else if (e.key === ' ') {
        block.firing = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        block.movingLeft = false;
    } else if (e.key === 'ArrowRight') {
        block.movingRight = false;
    } else if (e.key === ' ') {
        block.firing = false;
    }
});

setInterval(gameLoop, timeInterval);
