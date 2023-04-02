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
    firingPellets: false,
};

let score = 0;
let lasers = [];
let shots = [];


const asteroids = [];
const particles = [];

const ufos = [];

const ufoTemplate = {
    x: 0,
    y: 0,
    width: 40,
    height: 20,
    speed: 3,
};

function drawUFO(ufo) {
    // Draw the main body
    ctx.beginPath();
    ctx.ellipse(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, ufo.width / 2, ufo.height / 2, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw the dome
    ctx.beginPath();
    ctx.ellipse(ufo.x + ufo.width / 2, ufo.y + ufo.height / 4, ufo.width / 3, ufo.height / 4, 0, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.stroke();

    // Draw lights
    const lightColors = ['red', 'yellow', 'blue'];
    const lightRadius = 3;
    const lightSpacing = ufo.width / (lightColors.length + 1);

    for (let i = 0; i < lightColors.length; i++) {
        ctx.beginPath();
        ctx.arc(ufo.x + lightSpacing * (i + 1), ufo.y + ufo.height, lightRadius, 0, 2 * Math.PI);
        ctx.fillStyle = lightColors[i];
        ctx.fill();
    }
}

function spawnUFO() {
    const shouldSpawnUFO = Math.random() * 1750 < difficulty() && difficulty() > 9;

    if (shouldSpawnUFO) {
        const newUfo = Object.assign({}, ufoTemplate);
        newUfo.x = Math.random() * (canvas.width - newUfo.width);
        newUfo.y = -newUfo.height;
        newUfo.speed = 1 + Math.random() * Math.sqrt(difficulty());
        ufos.push(newUfo);
    }
}

function moveUfo(ufo) {
    if (!ufo.hasOwnProperty('direction')) {
        ufo.direction = Math.random() * Math.PI * 2;
    }

    ufo.x += ufo.speed * Math.cos(ufo.direction);
    ufo.y += ufo.speed * Math.sin(ufo.direction);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (
        (ufo.x < 0 && Math.cos(ufo.direction) < 0 && ufo.x < centerX) ||
        (ufo.x + ufo.width > canvas.width && Math.cos(ufo.direction) > 0 && ufo.x > centerX)
    ) {
        ufo.direction = Math.PI - ufo.direction;
    }

    if (
        (ufo.y < 0 && Math.sin(ufo.direction) < 0 && ufo.y < centerY) ||
        (ufo.y + ufo.height > canvas.height && Math.sin(ufo.direction) > 0 && ufo.y > centerY)
    ) {
        ufo.direction = -ufo.direction;
    }
}

function updateShots() {
    for (let i = 0; i < shots.length; i++) {
        shots[i].x += shots[i].speed * shots[i].direction.x;
        shots[i].y += shots[i].speed * shots[i].direction.y;

        // Check for collision with the player
        if (checkCollision(block, shots[i])) {
            alert(`Game Over! Your score: ${score}`);
            location.reload();
        }

        // Remove the shot if it's out of the canvas
        if (shots[i].y > canvas.height || shots[i].y < 0 || shots[i].x < 0 || shots[i].x > canvas.width) {
            shots.splice(i, 1);
            i--; // Adjust the index after removing the shot
        }
    }
}


function updateUFOs(ufosToRemove) {
    if (difficulty() <= 9) {
        return;
    }


    for (let i = 0; i < ufos.length; i++) {
        moveUfo(ufos[i]);

        // UFO shooting logic
        if (Math.random() < 0.001 * difficulty() && ufos[i].y < canvas.height / 2) {
            const dx = block.x - (ufos[i].x + ufos[i].width / 2);
            const dy = block.y - (ufos[i].y + ufos[i].height);
            const distance = Math.sqrt(dx * dx + dy * dy);
            const shot = {
                x: ufos[i].x + ufos[i].width / 2,
                y: ufos[i].y + ufos[i].height,
                width: 2,
                height: 10,
                speed: 5,
                direction: {
                    x: dx / distance,
                    y: dy / distance,
                },
            };
            shots.push(shot);
        }

        let ufoDestroyed = false;
        for (let j = 0; j < lasers.length; j++) {
            if (lasers[j] && checkCollision(lasers[j], ufos[i])) {
                createExplosion(
                    ufos[i].x + ufos[i].width / 2,
                    ufos[i].y + ufos[i].height / 2,
                    ufos[i].width * 2
                );
                ufosToRemove.push(i);
                lasers.splice(j, 1);
                score += 35;
                ufoDestroyed = true;
                break;
            }
        }

        if (!ufoDestroyed && checkCollision(block, ufos[i])) {
            alert(`Game Over! Your score: ${score}`);
            location.reload();
        }
    }
}


function createExplosion(x, y, size) {
    const numParticles = Math.floor(size / 2);
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            speed: Math.random() * 3 + 1,
            angle: Math.random() * Math.PI * 2,
            life: 1,
        });
    }
}

function handleMove() {
    if (block.movingLeft) {
        block.x -= block.speed;
    }
    if (block.movingRight) {
        block.x += block.speed;
    }
}

function handleLaser() {
    if (block.firing && (lasers.length === 0 || Date.now() - lasers[lasers.length - 1].createdAt > 200)) {
        lasers.push({
            x: block.x + block.size / 2 - 2.5,
            y: block.y - 10,
            width: 10,
            height: 20,
            speed: 10,
            size: 5,
            createdAt: Date.now()
        });
    }
}

function handleShotgun() {
    if (block.firingPellets && (lasers.length === 0 || Date.now() - lasers[lasers.length - 1].createdAt > 2000)) {
        const pelletCount = Math.floor(Math.random() * 6) + 5;
        for (let i = 0; i < pelletCount; i++) {
            const angle = (Math.random() * 0.8) - 0.4;
            const speed = 7 + (Math.random() * 6);
            lasers.push({
                x: block.x + block.size / 2 - 2.5,
                y: block.y - 10,
                width: 10,
                height: 20,
                speed: speed,
                size: 5,
                angle: angle,
                createdAt: Date.now(),
                isPellet: true,
            });
        }
    }
}

function handleLasers() {
    for (let i = 0; i < lasers.length; i++) {
        if (lasers[i].isPellet) {
            lasers[i].x += Math.sin(lasers[i].angle) * lasers[i].speed;
        }
        lasers[i].y -= lasers[i].speed;
        if (lasers[i].y < 0) {
            lasers.splice(i, 1);
            i--;
        }
    }
}

function handleInput() {
    handleMove();
    handleLaser();
    handleShotgun();
    handleLasers();
}

function updatePlayer() {
    if (block.x < 0) block.x = 0;
    if (block.x + block.size > canvas.width) block.x = canvas.width - block.size;
}

function difficulty() {
    return 1 + score / 175;
}

function spawnAsteroid() {
    const shouldSpawnAsteroid = Math.random() * 100 < difficulty() && difficulty() <= 9;

    if (shouldSpawnAsteroid) {
        const size = 20 + Math.random() * 40 + difficulty();
        const asteroid = {
            x: Math.random() * (canvas.width - size),
            y: -size,
            size: size,
            speed: 1 + Math.random() * difficulty(),
            shape: createAsteroidShape(size, size * 0.4),
            rotation: 0,
            rotationSpeed: (Math.random() * 0.02) - 0.01,
            craters: createCraters(size),
        };
        asteroids.push(asteroid);
    }
}

function createCraters(size) {
    const craterCount = 2 + Math.floor(Math.random() * (size / 10));
    const craters = [];
    for (let i = 0; i < craterCount; i++) {
        const craterSize = Math.random() * (size * 0.3) + size * 0.15;
        const angle = Math.random() * Math.PI * 2;
        const distanceFromCenter = Math.random() * (size * 0.3) + size * 0.3;
        craters.push({
            size: craterSize,
            angle: angle,
            distanceFromCenter: distanceFromCenter,
        });
    }
    return craters;
}


function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].x += Math.cos(particles[i].angle) * particles[i].speed;
        particles[i].y += Math.sin(particles[i].angle) * particles[i].speed;
        particles[i].life -= 0.01;

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function updateAsteroids(asteroidsToRemove) {
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
            asteroidsToRemove.push(i);
            score++;
        }

        let asteroidDestroyed = false;
        for (let j = 0; j < lasers.length; j++) {
            if (lasers[j] && checkCollision(lasers[j], asteroids[i])) {
                createExplosion(
                    asteroids[i].x + asteroids[i].size / 2,
                    asteroids[i].y + asteroids[i].size / 2,
                    asteroids[i].size * 3
                );
                asteroidsToRemove.push(i);
                lasers.splice(j, 1);
                score += 10;
                asteroidDestroyed = true;
                break;
            }
        }
        if (!asteroidDestroyed && checkCollision(block, asteroids[i])) {
            alert(`Game Over! Your score: ${score}`);
            location.reload();
        }
    }
}

function drawUfos() {
    for (const ufo of ufos) {
        drawUFO(ufo);
    }
}

function update() {
    handleInput();
    updatePlayer();
    spawnAsteroid();
    spawnUFO();

    // Create an array to store the indices of the asteroids to be removed
    const asteroidsToRemove = [];
    const ufosToRemove = [];
    updateParticles();
    updateAsteroids(asteroidsToRemove);
    updateUFOs(ufosToRemove);
    updateShots();

    for (let i = ufosToRemove.length - 1; i >= 0; i--) {
        ufos.splice(ufosToRemove[i], 1);
    }

    // Remove asteroids marked for removal, starting from the end of the array
    for (let i = asteroidsToRemove.length - 1; i >= 0; i--) {
        asteroids.splice(asteroidsToRemove[i], 1);
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
    ctx.fillStyle = createAsteroidGradient(ctx, asteroid.size);
    ctx.fill();

    for (const crater of asteroid.craters) {
        const x = asteroid.x + asteroid.size / 2 + Math.cos(crater.angle + asteroid.rotation) * crater.distanceFromCenter - crater.size / 2;
        const y = asteroid.y + asteroid.size / 2 + Math.sin(crater.angle + asteroid.rotation) * crater.distanceFromCenter - crater.size / 2;

        ctx.beginPath();
        ctx.arc(x, y, crater.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
        ctx.fill();
    }
}


function checkCollision(rect, object) {
    let objectPolygon;

    if (object.hasOwnProperty("rotatedShape")) { // Asteroid
        objectPolygon = object.rotatedShape;
    } else if (object.hasOwnProperty("width") && object.hasOwnProperty("height")) { // UFO
        objectPolygon = [
            {x: object.x, y: object.y},
            {x: object.x + object.width, y: object.y},
            {x: object.x + object.width, y: object.y + object.height},
            {x: object.x, y: object.y + object.height},
        ];
    } else {
        return false; // Unknown object type
    }

    if (rect.hasOwnProperty("width") && rect.hasOwnProperty("height")) { // Laser
        const laserPolygon = [
            {x: rect.x, y: rect.y},
            {x: rect.x + rect.width, y: rect.y},
            {x: rect.x + rect.width, y: rect.y + rect.height},
            {x: rect.x, y: rect.y + rect.height},
        ];
        return checkPolygonCollision(laserPolygon, objectPolygon);
    } else if (rect.hasOwnProperty("size")) { // Spaceship
        const spaceshipPolygon = [
            {x: rect.x, y: rect.y},
            {x: rect.x + rect.size / 2, y: rect.y - rect.size}, {x: rect.x + rect.size, y: rect.y},
        ];
        return checkPolygonCollision(spaceshipPolygon, objectPolygon);
    } else {
        return false; // Unknown rect type
    }
}


function createAsteroidGradient(ctx, size) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size);
    gradient.addColorStop(0, '#606060');
    gradient.addColorStop(1, 'gray');
    return gradient;
}


function drawSpaceship(x, y, width, height) {
    // Main body
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.lineTo(x + width, y);
    ctx.closePath();
    ctx.fillStyle = 'white';
    ctx.fill();

    // Cockpit
    ctx.beginPath();
    ctx.arc(x + width / 2, y - height / 2, height / 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.fill();

    // Wings
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - width / 2, y + height / 2);
    ctx.lineTo(x + width / 2, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width * 1.5, y + height / 2);
    ctx.lineTo(x + width / 2, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
    ctx.fill();
    // Engine exhaust
    ctx.beginPath();
    ctx.moveTo(x + width / 4, y);
    ctx.lineTo(x + width / 2, y + height / 2);
    ctx.lineTo(x + width * 3 / 4, y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
    ctx.fill();
}

function drawParticles() {
    ctx.fillStyle = 'white';
    for (const particle of particles) {
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
}


function drawLasers() {
    for (const laser of lasers) {
        ctx.fillStyle = 'green';
        ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    }
}

function drawAsteroids() {
    for (const asteroid of asteroids) {
        drawAsteroid(asteroid);
    }
}

function drawShots() {
    for (let i = 0; i < shots.length; i++) {
        // Draw the shot
        ctx.fillStyle = 'red';
        ctx.fillRect(shots[i].x, shots[i].y, shots[i].width, shots[i].height);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSpaceship(block.x, block.y, block.size, block.size);
    drawParticles();
    drawShots();
    drawLasers();
    drawUfos();
    drawAsteroids();

    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${Math.floor(difficulty())}`, 10, 55);
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
    } else if (e.key === 'Control') {
        block.firingPellets = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') {
        block.movingLeft = false;
    } else if (e.key === 'ArrowRight') {
        block.movingRight = false;
    } else if (e.key === ' ') {
        block.firing = false;
    } else if (e.key === 'Control') {
        block.firingPellets = false;
    }
});

setInterval(gameLoop, timeInterval);
