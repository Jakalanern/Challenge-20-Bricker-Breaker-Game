const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const canvas = $(".canvas");
const ctx = canvas.getContext("2d");
const lifeScore = $(".lives");
const brickScore = $(".bricks");
const modeBtn = $(".mode-button");
const body = $("body");
const pause = $(".pause");

let lives = 3;
let dark = true;
let score = 0;
let color = "black";
let isPaused = true;
let rightPressed = false;
let leftPressed = false;

let x = canvas.width / 2;
let y = canvas.height - 30;
let startingBallSpeed = 1.25; // Default: 1.25
let maxBallSpeed = startingBallSpeed * 2.5; // DEFAULT: 2.5;
let dx = startingBallSpeed;
let dy = -startingBallSpeed;
let ballRadius = 10; // Default: 10

let paddleHeight = 10; // Default: 10
let paddleWidth = 75; // Default: 75
let paddleSpeed = 3; // Default: 3
let speedUpAmount = 0.25; // Default: 0.25;
let paddleX = (canvas.width - paddleWidth) / 2;

let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

let brickCount = brickColumnCount * brickRowCount;

pause.innerHTML = "Press esc key to start!";

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function collisionDetection() {
  for (var c = 0; c < brickColumnCount; c++) {
    for (var r = 0; r < brickRowCount; r++) {
      var b = bricks[c][r];
      if (b.status == 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          brickCount--;
          score++;
          if (score == brickRowCount * brickColumnCount) {
            body.style.cursor = "initial";
            alert("YOU WIN, CONGRATULATIONS!");
            document.location.reload();
          }
        }
      }
    }
  }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if (new Date().getTime() - start > milliseconds) {
      break;
    }
  }
}

function updateScore() {
  lifeScore.innerHTML = lives;
  brickScore.innerHTML = brickCount;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateScore();
  drawBall();
  drawBricks();
  drawPaddle();
  collisionDetection();

  x += dx;
  y += dy;

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      // SPEED BALL UP EVERY PADDLE HIT UP UNTIL MAX SPEED
      if (dy < maxBallSpeed) {
        dx += speedUpAmount;
        dy += speedUpAmount;
      }
      dy = -dy;
    } else {
      body.style.cursor = "initial";
      lives--;
      if (!lives) {
        alert("GAME OVER");
        document.location.reload();
      } else {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = startingBallSpeed;
        dy = -startingBallSpeed;
        paddleX = (canvas.width - paddleWidth) / 2;
      }
    }
  }

  if (rightPressed) {
    paddleX += paddleSpeed;
    if (paddleX + paddleWidth > canvas.width) {
      paddleX = canvas.width - paddleWidth;
    }
  } else if (leftPressed) {
    paddleX -= paddleSpeed;
    if (paddleX < 0) {
      paddleX = 0;
    }
  }

  if (!isPaused) {
    requestAnimationFrame(draw);
  }
}

// MOUSE LISTENER
// document.addEventListener("mousemove", mouseMoveHandler, false);
// KEY LISTENER
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
modeBtn.addEventListener("click", changeMode);

function changeMode() {
  body.classList.toggle("light");
  canvas.classList.toggle("dark");
  if (dark === true) {
    color = "white";
    dark = false;
    drawBall();
    drawBricks();
    drawPaddle();
    modeBtn.src = "icons/moon-black.png";
  } else {
    dark = true;
    color = "black";
    drawBall();
    drawBricks();
    drawPaddle();
    modeBtn.src = "icons/sun-white.png";
  }
}

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - paddleWidth / 2;
  }
  body.style.cursor = "none";
}

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight" || e.key == "d") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft" || e.key == "a") {
    leftPressed = true;
  } else if (e.key == "Escape") {
    console.log("isPaused is: ", isPaused);
    togglePause();
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight" || e.key == "d") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft" || e.key == "a") {
    leftPressed = false;
  }
}

function togglePause() {
  isPaused = !isPaused;
  pause.style.opacity = 1;
  pause.innerHTML = "Press esc key to resume...";

  if (!isPaused) {
    pause.style.opacity = 0;
    draw();
  }
}

draw();
