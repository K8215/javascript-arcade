const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let gameOver = false;
let winCondition = false;
const keys = {
	a: { pressed: false },
	d: { pressed: false },
};
const missiles = [];
let segments = [];
let centipedes = [segments];
const mushrooms = [];

//Draw game screen
canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

//Game Settings
playerSpeed = 5;
playerColor = "#0000ff";
missileSpeed = 15;
segmentColor = "#E10600";
segmentSize = 10;
segmentsTotal = canvas.width / segmentSize / 3;
segmentpeed = 5;
segmentDrop = segmentSize * 3;
mushroomSize = 15;
mushroomTotal = segmentsTotal / 2;

//Game objects
class Player {
	constructor({ position, velocity, radius }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = 20;
	}

	draw() {
		ctx.save();
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		ctx.closePath();
		ctx.fillStyle = playerColor;
		ctx.fill();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
	}
}

class Missile {
	constructor({ position, velocity, radius }) {
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
		ctx.fillStyle = playerColor;
		ctx.fill();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Segment {
	constructor({ position, velocity, radius }) {
		this.position = position;
		this.velocity = velocity;
		this.radius = segmentSize;
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
		ctx.fillStyle = segmentColor;
		ctx.fill();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
	}
}

class Mushroom {
	constructor({ position }) {
		this.position = position;
		this.width = mushroomSize;
		this.height = mushroomSize;
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

function playerLogic() {
	player.update();

	if (keys.a.pressed) {
		player.velocity.x = -playerSpeed;
	} else if (keys.d.pressed) {
		player.velocity.x = playerSpeed;
	} else {
		player.velocity.x = 0;
	}

	//Edge detection
	if (player.position.x - player.radius < 0) {
		player.position.x = player.radius;
	}
	if (player.position.x > canvas.width - player.radius) {
		player.position.x = canvas.width - player.radius;
	}
}

function missileLogic() {
	missiles.forEach((missile) => {
		missile.update();

		//Garbage collection
		if (missile.position.y < 0) {
			missiles.splice(missiles.indexOf(missile), 1);
		}
	});
}

function segmentLogic() {
	segments.forEach((segment) => {
		segment.update();

		if (
			segment.position.x - segment.radius >= canvas.width ||
			segment.position.x + segment.radius <= 0
		) {
			segment.velocity.x *= -1;
			segment.position.y += segmentDrop;
		}
	});

	centipedes.forEach((centipede, index) => {
		if (centipede.length === 0) {
			centipedes.splice(index, 1);
		}
	});
}

function collisions() {
	function sphereDetection(sphere1, sphere2) {
		return (
			Math.hypot(
				sphere1.position.x - sphere2.position.x,
				sphere1.position.y - sphere2.position.y
			) <
			sphere1.radius + sphere2.radius
		);
	}

	function rectDetection(sphere, rect) {
		return (
			Math.hypot(
				sphere.position.x - rect.position.x,
				sphere.position.y - rect.position.y
			) <
			sphere.radius + rect.height
		);
	}

	//Missile/Segment collision
	centipedes.forEach((centipede, centipedeIndex) => {
		centipede.forEach((segment) => {
			missiles.forEach((missile) => {
				if (sphereDetection(segment, missile)) {
					const index = centipede.indexOf(segment);
					const centipede1 = centipede.slice(0, index);
					const centipede2 = centipede.slice(index + 1);

					centipedes.splice(centipedeIndex, 1, centipede1, centipede2);
					segments.splice(segments.indexOf(segment), 1);
					missiles.splice(missiles.indexOf(missile), 1);

					centipede2.forEach((segment) => {
						segment.velocity.x *= -1;
						segment.position.y += segmentDrop;
					});
				}
			});
		});
	});

	//Missile/Mushroom collision
	missiles.forEach((missile) => {
		mushrooms.forEach((mushroom) => {
			if (rectDetection(missile, mushroom)) {
				missiles.splice(missiles.indexOf(missile, 1));
				mushrooms.splice(mushrooms.indexOf(mushroom), 1);
			}
		});
	});

	//Centipede collisions
	segments.forEach((segment) => {
		mushrooms.forEach((mushroom) => {
			if (rectDetection(segment, mushroom)) {
				segment.velocity.x *= -1;
			}
		});

		if (sphereDetection(segment, player)) {
			gameOver = true;
		}
	});

	if (segments.length == 0) {
		winCondition = true;
		gameOver = true;
	}
}

//Inputs
window.addEventListener("keydown", (e) => {
	switch (e.code) {
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
						x: player.position.x,
						y: player.position.y - player.radius,
					},
					velocity: {
						x: 0,
						y: -missileSpeed,
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
	switch (e.key) {
		case "a":
			keys.a.pressed = false;
			break;
		case "d":
			keys.d.pressed = false;
			break;
	}
});

//Run game loop
function animate() {
	const animationId = window.requestAnimationFrame(animate);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	playerLogic();
	missileLogic();
	segmentLogic();
	collisions();
	mushrooms.forEach((mushroom) => {
		mushroom.update();
	});

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
	}
}

//Go!
for (let i = 0; i < segmentsTotal; i++) {
	segments.push(
		new Segment({
			position: { x: segmentSize * 2 * (i + 1), y: 50 },
			velocity: { x: segmentpeed, y: 0 },
		})
	);
}

for (let i = 0; i < mushroomTotal; i++) {
	mushrooms.push(
		new Mushroom({
			position: {
				x: Math.floor(Math.random() * (canvas.width - 50 - 100 + 1)) + 100,
				y: Math.floor(Math.random() * (canvas.height - 150 - 100 + 1)) + 100,
			},
		})
	);
}

const player = new Player({
	position: { x: canvas.width / 2, y: canvas.height - 50 },
	velocity: { x: 0 },
});
animate();
