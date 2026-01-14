const STAR_COUNT = 200;
const MIN_SIZE = 5;
const MAX_SIZE = 8;
const TWINKLE_SPEED = 0.0075;

const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

class Star {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    this.opacity = Math.random();
    this.direction = Math.random() < 0.5 ? -1 : 1;
  }
  update() {
    this.opacity += this.direction * TWINKLE_SPEED;
    if (this.opacity <= 0) {
      this.opacity = 0;
      this.direction = 1;
    } else if (this.opacity >= 1) {
      this.opacity = 1;
      this.direction = -1;
    }
  }
  draw() {
    ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

const stars = [];
for (let i = 0; i < STAR_COUNT; i++) {
  stars.push(new Star());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const star of stars) {
    star.update();
    star.draw();
  }
  requestAnimationFrame(animate);
}
animate();
