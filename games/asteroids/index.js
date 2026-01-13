const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const keys = {
	w: { pressed: false },
	a: { pressed: false },
	d: { pressed: false },
};
const asteroids = [];
const missiles = [];
let gameOver = false;
let colorIndex = 0;

//Gameplay Settings
const scoreColors = ["#FFFFFF", "#FFEA19", "#FFEA19"];
const playerSpeed = 5;
const playerTurn = 0.15;
const playerFriction = 0.95;
const playerColors = ["#FFFFFF", "#0000ff", "#0000ff"];
const missileSpeed = 10;
const missileColors = ["#FFFFFF", "#44D62C", "#44D62C"];
let asteroidSpawnRate = 2000;
const asteroidMaxSize = 80;
const asteroidColors = ["#FFFFFF", "#E10600", "#E10600"];
let asteroidSpeed = 1;

//Create game screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Game objects
class Player {
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.rotation = 0;
	}

	draw() {
		ctx.save();
		//Player rotation
		ctx.translate(this.position.x, this.position.y);
		ctx.rotate(this.rotation);
		ctx.translate(-this.position.x, -this.position.y);
		//Player shape
		ctx.beginPath();
		ctx.moveTo(this.position.x + 30, this.position.y);
		ctx.lineTo(this.position.x - 10, this.position.y - 10);
		ctx.lineTo(this.position.x - 10, this.position.y + 10);
		ctx.closePath();
		//Player color
		ctx.strokeStyle = playerColors[colorIndex];
		ctx.stroke();

		ctx.restore();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}

	//Polygon collision library
	getVertices() {
		const cos = Math.cos(this.rotation);
		const sin = Math.sin(this.rotation);

		return [
			{
				x: this.position.x + cos * 30 - sin * 0,
				y: this.position.y + sin * 30 + cos * 0,
			},
			{
				x: this.position.x + cos * -10 - sin * 10,
				y: this.position.y + sin * -10 + cos * 10,
			},
			{
				x: this.position.x + cos * -10 - sin * -10,
				y: this.position.y + sin * -10 + cos * -10,
			},
		];
	}
}

class Missile {
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = 5;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2,
			false
		);
		ctx.closePath();
		ctx.fillStyle = missileColors[colorIndex];
		ctx.fill();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Asteroid {
	constructor({ position, velocity, radius, value, speed }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = radius;
		this.value = value;
		this.speed = speed;
	}

	draw() {
		ctx.beginPath();
		ctx.arc(
			this.position.x,
			this.position.y,
			this.radius,
			0,
			Math.PI * 2,
			false
		);
		ctx.closePath();
		ctx.strokeStyle = asteroidColors[colorIndex];
		ctx.stroke();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Score {
	constructor(value) {
		this.value = value;
	}

	draw() {
		ctx.fillStyle = scoreColors[colorIndex];
		ctx.font = "24px Arial";
		ctx.textAlign = "right";
		ctx.fillText(`${this.value}`, canvas.width - 50, 50);
	}

	update() {
		this.draw();
		this.value += this.value;
	}
}

function objectCollision(obj1, obj2) {
	const xDifference = obj2.position.x - obj1.position.x;
	const yDifference = obj2.position.y - obj1.position.y;

	//The distance between two objects is the value of the hypotenuse of a right triangle. a2 + b2 = c2
	const distance = Math.sqrt(
		xDifference * xDifference + yDifference * yDifference
	);

	if (distance <= obj1.radius + obj2.radius) {
		return true;
	}
	return false;
}

function breakAsteroid(asteroid, missile, value) {
	return new Asteroid({
		position: {
			x: asteroid.position.x,
			y: asteroid.position.y,
		},
		velocity: {
			x: missile.velocity.x / missileSpeed + value,
			y: missile.velocity.y / missileSpeed + value,
		},
		radius: Math.max(20, asteroid.radius / 1.9),
		value: asteroid.value + 50,
		speed: asteroid.speed - 2,
	});
}

//Polygon collision library
function circleTriangleCollision(circle, triangle) {
	// Check if the circle is colliding with any of the triangle's edges
	for (let i = 0; i < 3; i++) {
		let start = triangle[i];
		let end = triangle[(i + 1) % 3];

		let dx = end.x - start.x;
		let dy = end.y - start.y;
		let length = Math.sqrt(dx * dx + dy * dy);

		let dot =
			((circle.position.x - start.x) * dx +
				(circle.position.y - start.y) * dy) /
			Math.pow(length, 2);

		let closestX = start.x + dot * dx;
		let closestY = start.y + dot * dy;

		if (!isPointOnLineSegment(closestX, closestY, start, end)) {
			closestX = closestX < start.x ? start.x : end.x;
			closestY = closestY < start.y ? start.y : end.y;
		}

		dx = closestX - circle.position.x;
		dy = closestY - circle.position.y;

		let distance = Math.sqrt(dx * dx + dy * dy);

		if (distance <= circle.radius) {
			return true;
		}
	}

	// No collision
	return false;
}
//Polygon collision library
function isPointOnLineSegment(x, y, start, end) {
	return (
		x >= Math.min(start.x, end.x) &&
		x <= Math.max(start.x, end.x) &&
		y >= Math.min(start.y, end.y) &&
		y <= Math.max(start.y, end.y)
	);
}

function spawnLogic(objects, colliders, player) {
	//Create objects
	for (let i = objects.length - 1; i >= 0; i--) {
		const object = objects[i];
		object.update();

		//Handle player collisions
		if (player && circleTriangleCollision(object, player.getVertices())) {
			gameOver = true;
		}

		//Handle spawn collisions
		for (let i = colliders.length - 1; i >= 0; i--) {
			const collider = colliders[i];

			if (objectCollision(object, collider)) {
				if (collider.hasOwnProperty("value")) {
					score.value += collider.value;

					if (collider.radius > 30) {
						asteroids.push(breakAsteroid(collider, object, 1));
						asteroids.push(breakAsteroid(collider, object, -1));
					}
				}

				objects.splice(i, 1);
				colliders.splice(i, 1);
			}
		}

		//Garbage collection
		if (
			object.position.x + object.radius < 0 ||
			object.position.x - object.radius > canvas.width ||
			object.position.y + object.radius < 0 ||
			object.position.y - object.radius > canvas.height
		) {
			objects.splice(i, 1);
		}
	}
}

function playerLogic() {
	player.update();

	if (keys.w.pressed) {
		player.velocity.x = Math.cos(player.rotation) * playerSpeed;
		player.velocity.y = Math.sin(player.rotation) * playerSpeed;
	} else if (!keys.w.pressed) {
		player.velocity.x *= playerFriction;
		player.velocity.y *= playerFriction;
	}
	if (keys.d.pressed) player.rotation += playerTurn;
	if (keys.a.pressed) player.rotation -= playerTurn;

	if (
		player.position.x < 0 ||
		player.position.x > canvas.width ||
		player.position.y < 0 ||
		player.position.y > canvas.height
	) {
		player.position.x = Math.max(
			30,
			Math.min(player.position.x, canvas.width - 30)
		);
		player.position.y = Math.max(
			30,
			Math.min(player.position.y, canvas.height - 30)
		);
	}
}

function asteroidLogic() {
	const index = Math.floor(Math.random() * 4);
	let x, y;
	let vx, vy;
	let value;
	let speed = asteroidSpeed;
	let radius = asteroidMaxSize * Math.random() + 10;

	//Smaller asteroids are faster and worth more points
	if (radius < 30) {
		speed += 1;
		value = 300;
	} else if (radius > 30 && radius < 60) {
		speed += 0.5;
		value = 200;
	} else {
		speed = speed;
		value = 100;
	}

	//Spawn asteroids at random edges of the screen
	switch (index) {
		case 0: //left side of screen
			x = 0 - radius;
			y = Math.random() * canvas.height;
			vx = speed;
			vy = 0;
			break;
		case 1: //bottom side of screen
			x = Math.random() * canvas.width;
			y = canvas.height + radius;
			vx = 0;
			vy = -speed;
			break;
		case 2: //right side of screen
			x = canvas.width + radius;
			y = Math.random() * canvas.height;
			vx = -speed;
			vy = 0;
			break;
		case 3: //top side of screen
			x = Math.random() * canvas.width;
			y = 0 - radius;
			vx = 0;
			vy = speed;
			break;
	}

	return { x, y, vx, vy, radius, value, speed };
}

//Animate game objects
function animate() {
	//Create animation loop
	const animationId = window.requestAnimationFrame(animate);
	//Draw/clear background on each frame
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	score.draw();
	playerLogic();
	spawnLogic(missiles, asteroids);
	spawnLogic(asteroids, missiles, player);
	asteroids.forEach((asteroid) => {
		asteroid.update();
	});

	if (gameOver) {
		window.cancelAnimationFrame(animationId);
		clearTimeout(timeoutId);

		//Show game over screen
		ctx.fillStyle = "white";
		ctx.font = "48px Arial";
		ctx.textAlign = "center";
		ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
		ctx.font = "24px Arial";
		ctx.fillText(
			"Press ENTER to restart",
			canvas.width / 2,
			canvas.height / 2 + 50
		);
		return;
	}
}

//Receive player input
window.addEventListener("keydown", (e) => {
	switch (e.code) {
		case "KeyW":
			keys.w.pressed = true;
			break;
		case "KeyA":
			keys.a.pressed = true;
			break;
		case "KeyD":
			keys.d.pressed = true;
			break;
		case "Space":
			missiles.push(
				new Missile({
					position: {
						x: player.position.x + Math.cos(player.rotation) * 30,
						y: player.position.y + Math.sin(player.rotation) * 30,
					},
					velocity: {
						x: Math.cos(player.rotation) * missileSpeed,
						y: Math.sin(player.rotation) * missileSpeed,
					},
				})
			);
			break;
		case "Enter":
			if (gameOver) {
				window.location.reload();
			}
			break;
	}
});

window.addEventListener("keyup", (e) => {
	switch (e.code) {
		case "KeyW":
			keys.w.pressed = false;
			break;
		case "KeyA":
			keys.a.pressed = false;
			break;
		case "KeyD":
			keys.d.pressed = false;
			break;
	}
});

//Effect ticker for color change and danger level
setInterval(() => {
	colorIndex = (colorIndex + 1) % 3;
	asteroidSpawnRate = Math.max(100, asteroidSpawnRate - 1);
}, 100);

let timeoutId;

//Spawn asteroids at interval
function spawnAsteroids() {
	const asteroidValues = asteroidLogic();

	asteroids.push(
		new Asteroid({
			position: {
				x: asteroidValues.x,
				y: asteroidValues.y,
			},
			velocity: { x: asteroidValues.vx, y: asteroidValues.vy },
			radius: asteroidValues.radius,
			value: asteroidValues.value,
			speed: asteroidValues.speed,
		})
	);

	timeoutId = setTimeout(spawnAsteroids, asteroidSpawnRate);
}

timeoutId = setTimeout(spawnAsteroids, asteroidSpawnRate);

//Go!
const player = new Player({
	position: { x: canvas.width / 2, y: canvas.height / 2 },
	velocity: { x: 0, y: 0 },
});
const score = new Score(0);
animate();
