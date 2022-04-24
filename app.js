const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const canvas = $(".canvas");
const ctx = canvas.getContext("2d");
const lifeScore = $(".lives");
const brickScore = $(".bricks");
const modeBtn = $(".mode-button");
const musicBtn = $(".music-button");
const body = $("body");
const pause = $(".pause");
const hearts = $$(".heart");

let allHearts = [];

hearts.forEach(function (heart) {
  allHearts.push(heart);
});

let lives = 3;
let dark = true;
let score = 0;
let isGameOver = false;
let isGameWon = false;
let color = "black";
let isPaused = true;
let soundsEnabled = true;
let rightPressed = false;
let leftPressed = false;
let pauseCount = 0;

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
let speedUpAmount = 0.5; // Default: 0.25;
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

// SOUNDS
let globalVolume = 0.5;
let musicVolume = 0.5 * globalVolume; // 1 is Defualt
let bounceVolume = 1.25 * globalVolume;
let hitVolume = 1 * globalVolume;
let startVolume = 1 * globalVolume;
let damageVolume = 1 * globalVolume;
let wallVolume = 1 * globalVolume;
let isGameOverVolume = 0.75 * globalVolume;
let winVolume = 1 * globalVolume;

let bounceSound = new Audio("./sounds/bloop3.wav");
let startSound = new Audio("./sounds/win-song.wav");
let hitSound = new Audio("./sounds/hit.wav");
let bgMusic = new Audio("./sounds/music loop 2.wav");
let damageSound = new Audio("./sounds/lose2.wav");
let wallSound = new Audio("./sounds/bloop3.wav");
let isGameOverSound = new Audio("./sounds/lose3.wav");
let winSound = new Audio("./sounds/win-song.wav");

function playBounceSound() {
  console.log("BOUNCE SOUND");
  bounceSound.load();
  bounceSound.volume = bounceVolume;

  bounceSound.play();
}

function playStartSound() {
  console.log("START SOUND");
  startSound.load();
  startSound.volume = startVolume;
  startSound.play();
}

function playHitSound() {
  console.log("HIT SOUND");
  hitSound.load();
  hitSound.volume = hitVolume;
  hitSound.play();
}

function playBGMusic() {
  console.log("BACKGROUND MUSIC START");
  bgMusic.volume = musicVolume;
  bgMusic.load();
  bgMusic.play();
  bgMusic.loop = true;
  soundsEnabled = true;
}

function playDamageSound() {
  console.log("DAMAGE SOUND");
  damageSound.load();
  damageSound.volume = damageVolume;
  damageSound.play();
}

function playWallSound() {
  console.log("WALL SOUND");
  wallSound.load();
  wallSound.volume = wallVolume;
  wallSound.play();
}

function playGameOverSound() {
  console.log("GAME OVER SOUND");
  isGameOverSound.load();
  isGameOverSound.volume = isGameOverVolume;
  isGameOverSound.play();
}

function playWinSound() {
  console.log("GAME OVER SOUND");
  winSound.load();
  winSound.volume = winVolume;
  winSound.play();
}

function gameOver() {
  isGameOver = true;
  playGameOverSound();
  pause.style.opacity = 1;
  pause.innerHTML = "GAME OVER!!";
}

function gameWon() {
  isGameWon = true;
  playWinSound();
  pause.style.opacity = 1;
  pause.innerHTML = "YOU WIN!!";
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
          playHitSound();
          if (score == brickRowCount * brickColumnCount) {
            togglePause();
            gameWon();
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
  // lifeScore.innerHTML = lives;
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
    playWallSound();
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    playWallSound();
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      playBounceSound();
      // SPEED BALL UP EVERY PADDLE HIT UP UNTIL MAX SPEED
      if (dy < maxBallSpeed) {
        dx += speedUpAmount;
        dy += speedUpAmount;
      }
      dy = -dy;
    } else {
      body.style.cursor = "initial";
      lives--;
      allHearts[lives].remove();
      playDamageSound();
      if (!lives) {
        gameOver();
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

// // MOUSE LISTENER
// document.addEventListener("mousemove", mouseMoveHandler, false);
// KEY LISTENER
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
modeBtn.addEventListener("click", changeMode);
musicBtn.addEventListener("click", toggleSounds);

function toggleSounds() {
  console.log("Toggle music()");
  if (globalVolume === 0) {
    soundsEnabled = true;
    globalVolume = 0.5;
    bounceVolume = 1.25 * globalVolume;
    hitVolume = 1 * globalVolume;
    startVolume = 1 * globalVolume;
    damageVolume = 1 * globalVolume;
    bgMusic.volume = musicVolume * globalVolume;
    wallVolume = 1 * globalVolume;
    isGameOverVolume = 0.75 * globalVolume;
    winVolume = 1 * globalVolume;
    if (dark) {
      musicBtn.src = "./icons/sound-off-white.png";
    } else if (!dark) {
      musicBtn.src = "./icons/sound-off-black.png";
    }
  } else {
    soundsEnabled = false;
    globalVolume = 0;
    bounceVolume = 1.25 * globalVolume;
    hitVolume = 1 * globalVolume;
    startVolume = 1 * globalVolume;
    damageVolume = 1 * globalVolume;
    bgMusic.volume = 0;
    wallVolume = 1 * globalVolume;
    isGameOverVolume = 0.75 * globalVolume;
    winVolume = 1 * globalVolume;
    if (dark) {
      musicBtn.src = "./icons/sound-on-white.png";
    } else {
      musicBtn.src = "./icons/sound-on-black.png";
    }
  }
}

function changeMode() {
  body.classList.toggle("light");
  canvas.classList.toggle("dark");
  if (dark === true) {
    color = "white";
    dark = false;
    drawBall();
    drawBricks();
    drawPaddle();
    allHearts.forEach(function (heart) {
      heart.src = "icons/heart-black.png";
    });
    modeBtn.src = "icons/moon-black.png";
    if (soundsEnabled) {
      musicBtn.src = "icons/sound-off-black.png";
    } else if (!soundsEnabled) {
      musicBtn.src = "icons/sound-on-black.png";
    }
  } else {
    dark = true;
    color = "black";
    drawBall();
    drawBricks();
    drawPaddle();
    allHearts.forEach(function (heart) {
      heart.src = "icons/heart-white.png";
    });
    modeBtn.src = "icons/sun-white.png";
    if (soundsEnabled) {
      musicBtn.src = "icons/sound-off-white.png";
    } else if (!soundsEnabled) {
      musicBtn.src = "icons/sound-on-white.png";
    }
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
    if (!isGameOver && !isGameWon) {
      togglePause();
    } else if (isGameOver || isGameWon) {
      document.location.reload();
    }
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
  bgMusic.volume = 0;
  pause.style.opacity = 1;
  pause.innerHTML = "Press esc key to resume...";

  if (pauseCount === 0) {
    pauseCount++;
    playBGMusic();
  }

  if (!isPaused) {
    pause.style.opacity = 0;
    bgMusic.volume = 0.5 * globalVolume;
    draw();
  }
}

draw();
