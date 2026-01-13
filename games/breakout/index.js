const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let gameOver = false;
let winCondition = false;
let ballReleased = false;
const keys = {
	a: { pressed: false },
	d: { pressed: false },
};
const brickRows = {};

//Draw game screen
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

//Game Settings
playerWidth = 150;
playerSpeed = 3;
playerFriction = 0.65;
ballRadius = 12;
ballSpeed = 5;
brickNumber = 21; //This number should be divisible by brickNumberRows
brickNumberRows = 3;
brickWidth = (canvas.width - 35) / (brickNumber / brickNumberRows);
brickHeight = 40;

//Objects
class Player {
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.width = playerWidth;
		this.height = 20;
	}

	draw() {
		ctx.beginPath();
		ctx.rect(this.position.x, this.position.y, this.width, this.height);
		ctx.closePath();
		ctx.fillStyle = "blue";
		ctx.fill();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
	}
}

class Ball {
	constructor({ position, velocity }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = ballRadius;
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
		ctx.fillStyle = "white";
		ctx.fill();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Brick {
	constructor({ position }) {
		this.position = position;
		this.width = brickWidth;
		this.height = brickHeight;
	}

	draw() {
		ctx.beginPath();
		ctx.rect(this.position.x, this.position.y, this.width, this.height);
		ctx.closePath();
		ctx.fillStyle = "white";
		ctx.fill();
	}

	update() {
		this.draw();
	}
}

//Functions
const playerLogic = () => {
	player.update();

	if (keys.a.pressed) {
		player.velocity.x -= playerSpeed;
	} else if (keys.d.pressed) {
		player.velocity.x += playerSpeed;
	} else {
		player.velocity.x *= playerFriction;
	}

	// Ensure the player stops completely when velocity is very low
	if (Math.abs(player.velocity.x) < 0.1) {
		player.velocity.x = 0;
	}

	//Edge detection with bounce
	if (player.position.x <= 0) {
		player.velocity.x *= -0.5;
		player.position.x += 10;
	}
	if (player.position.x + player.width >= canvas.width) {
		player.velocity.x *= -0.5;
		player.position.x -= 10;
	}
};

const ballLogic = () => {
	ball.update();

	let ballStartPosition = player.position.x + playerWidth / 2;

	if (!ballReleased) {
		ball.position.x = ballStartPosition;
	} else {
		// Set the ball's initial velocity based on the player's velocity when released
		if (ball.velocity.y === 0) {
			ball.velocity.x = player.velocity.x / ballSpeed;
			ball.velocity.y = -ballSpeed;
		}

		// Update the ball's position based on its velocity
		ball.position.x += ball.velocity.x;
		ball.position.y += ball.velocity.y;
	}

	//Edge Detection
	if (
		ball.position.x - ball.radius < 0 ||
		ball.position.x - ball.radius > canvas.width
	) {
		ball.velocity.x *= -1;
	}

	if (ball.position.y - ball.radius < 0) {
		ball.velocity.y *= -1;
	}

	if (ball.position.y - ball.radius > canvas.height) {
		gameOver = true;
	}
};

const brickLogic = () => {
	//brickRows is an object, not an array, so we have to use the length of the keys to get the correct limit.
	for (let i = 0; i < Object.keys(brickRows).length; i++) {
		brickRows[`bricks${i}`].forEach((brick) => {
			brick.update();
		});
	}

	if (Object.keys(brickRows).length === 0) {
		winCondition = true;
		gameOver = true;
	}
};

const collisions = () => {
	const ballEdge = ball.position.y - ball.radius;

	//Ball to player collision
	if (
		ballEdge > player.position.y - player.height &&
		ballEdge < player.position.y &&
		player.position.x < ball.position.x &&
		ball.position.x < player.position.x + player.width
	) {
		ball.velocity.y *= -1;
		ball.velocity.x = player.velocity.x / ballSpeed;
	}

	function brickDetection(ball, brick) {
		const ballLeft = ball.position.x - ball.radius;
		const ballRight = ball.position.x + ball.radius;
		const ballTop = ball.position.y - ball.radius;
		const ballBottom = ball.position.y + ball.radius;

		const brickLeft = brick.position.x;
		const brickRight = brick.position.x + brick.width;
		const brickTop = brick.position.y;
		const brickBottom = brick.position.y + brick.height;

		if (
			ballRight > brickLeft &&
			ballLeft < brickRight &&
			ballBottom > brickTop &&
			ballTop < brickBottom
		) {
			const overlapLeft = ballRight - brickLeft;
			const overlapRight = brickRight - ballLeft;
			const overlapTop = ballBottom - brickTop;
			const overlapBottom = brickBottom - ballTop;

			const minOverlap = Math.min(
				overlapLeft,
				overlapRight,
				overlapTop,
				overlapBottom
			);

			if (minOverlap === overlapLeft || minOverlap === overlapRight) {
				// Horizontal collision
				ball.velocity.x *= -1;
			} else if (minOverlap === overlapTop || minOverlap === overlapBottom) {
				// Vertical collision
				ball.velocity.y *= -1;
			}

			return true;
		}

		return false;
	}

	//Ball to brick vertical
	for (let i = 0; i < Object.keys(brickRows).length; i++) {
		brickRows[`bricks${i}`].forEach((brick) => {
			if (brickDetection(ball, brick)) {
				brickRows[`bricks${i}`].splice(
					brickRows[`bricks${i}`].indexOf(brick),
					1
				);
				//console.log(brickRows);
			}
		});

		if (brickRows[`bricks${i}`].length == 0) {
			delete brickRows[`bricks${i}`];
		}
	}
};

//Controls
window.addEventListener("keydown", (e) => {
	switch (e.key) {
		case "a":
			keys.a.pressed = true;
			break;
		case "d":
			keys.d.pressed = true;
			break;
		case " ":
			ballReleased = true;
			break;
		case "Enter":
			if (gameOver) {
				window.location.reload();
			}
			break;
	}
});

window.addEventListener("keyup", (e) => {
	switch (e.key) {
		case "a":
			keys.a.pressed = false;
			break;
		case "d":
			keys.d.pressed = false;
			break;
	}
});

//Animation loop
const animate = () => {
	//Draw the screen
	const animationId = window.requestAnimationFrame(animate);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//Draw objects
	playerLogic();
	ballLogic();
	brickLogic();
	collisions();

	//Win/Lose
	if (gameOver) {
		window.cancelAnimationFrame(animationId);

		//Game over screen
		ctx.fillStyle = "white";
		ctx.font = "48px Arial";
		ctx.textAlign = "center";
		if (winCondition) {
			ctx.fillText("Victory!", canvas.width / 2, canvas.height / 2);
		} else {
			ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
		}
		ctx.font = "24px Arial";
		ctx.fillText(
			"Press ENTER to restart",
			canvas.width / 2,
			canvas.height / 2 + 50
		);
		return;
	}
};

//Init
const player = new Player({
	position: { x: canvas.width / 2 - playerWidth / 2, y: canvas.height - 50 },
	velocity: { x: 0 },
});

const ball = new Ball({
	position: {
		x: player.position.x + playerWidth / 2,
		y: canvas.height - 50 - player.height / 2,
	},
	velocity: {
		x: 0,
		y: 0,
	},
});

for (let i = 0; i < brickNumberRows; i++) {
	brickRows[`bricks${i}`] = [];
	//Divide the total number of bricks by the number of rows and insert a number of bricks equal to the result into each row.
	for (let j = 0; j < brickNumber / brickNumberRows; j++) {
		brickRows[`bricks${i}`].push(
			new Brick({
				position: {
					x: 5 + (brickWidth + 5) * j,
					y: 50 + (brickHeight + 5) * i,
				},
			})
		);
	}
}

animate();
