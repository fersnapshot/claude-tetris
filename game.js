"use strict";

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

const SKINS = {
  retro: {
    colors: [
      null,
      "#4dd0e1", // I - cyan
      "#ffd54f", // O - yellow
      "#ba68c8", // T - purple
      "#81c784", // S - green
      "#e57373", // Z - red
      "#5b9bd5", // J - pale blue
      "#ffb74d", // L - orange
      "#f06292", // anillo - rosa
    ],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const color = this.colors[colorIndex];
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      context.fillStyle = "rgba(255,255,255,0.12)";
      context.fillRect(x * size + 1, y * size + 1, size - 2, 4);
      context.globalAlpha = 1;
    },
    applyBg() {
      document.documentElement.style.removeProperty("--board-bg");
      document.documentElement.style.removeProperty("--bg");
    },
  },
  neon: {
    colors: [
      null,
      "#00ffff", // I - electric cyan
      "#ffff00", // O - yellow
      "#ff00ff", // T - magenta
      "#00ff66", // S - neon green
      "#ff2244", // Z - bright red
      "#4488ff", // J - bright blue
      "#ff8800", // L - bright orange
      "#ff44cc", // anillo - neon pink
    ],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const color = this.colors[colorIndex];
      const effectiveAlpha = alpha ?? 1;
      context.globalAlpha = effectiveAlpha;
      context.shadowBlur = 14 * effectiveAlpha;
      context.shadowColor = color;
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // inner darker fill — reset glow first to avoid shadow on dark overlay
      context.shadowBlur = 0;
      context.fillStyle = "rgba(0,0,0,0.45)";
      context.fillRect(x * size + 3, y * size + 3, size - 6, size - 6);
      context.globalAlpha = 1;
    },
    applyBg() {
      document.documentElement.style.setProperty("--board-bg", "#000");
      document.documentElement.style.setProperty("--bg", "#000");
    },
  },
  pastel: {
    colors: [
      null,
      "#b3e5fc", // I - light blue
      "#fff9c4", // O - light yellow
      "#e1bee7", // T - light purple
      "#c8e6c9", // S - light green
      "#ffcdd2", // Z - light red
      "#bbdefb", // J - pale blue
      "#ffe0b2", // L - light orange
      "#f8bbd0", // anillo - light pink
    ],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const color = this.colors[colorIndex];
      context.globalAlpha = (alpha ?? 1) * 0.85;
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // soft border instead of highlight
      context.strokeStyle = "rgba(255,255,255,0.5)";
      context.lineWidth = 1;
      context.strokeRect(x * size + 1.5, y * size + 1.5, size - 3, size - 3);
      context.globalAlpha = 1;
    },
    applyBg() {
      document.documentElement.style.removeProperty("--board-bg");
      document.documentElement.style.removeProperty("--bg");
    },
  },
  pixel: {
    colors: [
      null,
      "#4dd0e1",
      "#ffd54f",
      "#ba68c8",
      "#81c784",
      "#e57373",
      "#5b9bd5",
      "#ffb74d",
      "#f06292",
    ],
    drawBlock(context, x, y, colorIndex, size, alpha) {
      if (!colorIndex) return;
      const color = this.colors[colorIndex];
      context.globalAlpha = alpha ?? 1;
      context.fillStyle = color;
      context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);
      // pixel art grid pattern: 3x3 sub-pixels
      const sub = Math.floor((size - 2) / 3);
      context.fillStyle = "rgba(0,0,0,0.25)";
      for (let pr = 0; pr < 3; pr++) {
        for (let pc = 0; pc < 3; pc++) {
          // draw thin border lines between sub-pixels
          if (pc < 2) {
            context.fillRect(
              x * size + 1 + (pc + 1) * sub,
              y * size + 1 + pr * sub,
              1,
              sub
            );
          }
          if (pr < 2) {
            context.fillRect(
              x * size + 1 + pc * sub,
              y * size + 1 + (pr + 1) * sub,
              sub,
              1
            );
          }
        }
      }
      // highlight top-left corner sub-pixel
      context.fillStyle = "rgba(255,255,255,0.22)";
      context.fillRect(x * size + 2, y * size + 2, sub - 1, sub - 1);
      context.globalAlpha = 1;
    },
    applyBg() {
      document.documentElement.style.removeProperty("--board-bg");
      document.documentElement.style.removeProperty("--bg");
    },
  },
};

// Active skin — restored from localStorage
const _storedSkin = localStorage.getItem("tetris-skin");
let activeSkin = (_storedSkin && SKINS[_storedSkin]) ? _storedSkin : "retro";

const PIECES = [
  null,
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ], // I
  [
    [2, 2],
    [2, 2],
  ], // O
  [
    [0, 3, 0],
    [3, 3, 3],
    [0, 0, 0],
  ], // T
  [
    [0, 4, 4],
    [4, 4, 0],
    [0, 0, 0],
  ], // S
  [
    [5, 5, 0],
    [0, 5, 5],
    [0, 0, 0],
  ], // Z
  [
    [6, 0, 0],
    [6, 6, 6],
    [0, 0, 0],
  ], // J
  [
    [0, 0, 7],
    [7, 7, 7],
    [0, 0, 0],
  ], // L
  [
    [8, 8, 8],
    [8, 0, 8],
    [8, 8, 8],
  ], // anillo (hueco)
];

const LINE_SCORES = [0, 100, 300, 500, 800];

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const nextCanvas = document.getElementById("next-canvas");
const nextCtx = nextCanvas.getContext("2d");
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayScore = document.getElementById("overlay-score");
const restartBtn = document.getElementById("restart-btn");

let board,
  current,
  next,
  score,
  lines,
  level,
  paused,
  gameOver,
  lastTime,
  dropAccum,
  dropInterval,
  animId;

function createBoard() {
  return Array.from({ length: ROWS }, () => new Array(COLS).fill(0));
}

function randomPiece() {
  const type = Math.floor(Math.random() * 8) + 1;
  const shape = PIECES[type].map((row) => [...row]);
  return {
    type,
    shape,
    x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
    y: 0,
  };
}

function collide(shape, ox, oy) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (!shape[r][c]) continue;
      const nx = ox + c;
      const ny = oy + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function rotateCW(shape) {
  const rows = shape.length,
    cols = shape[0].length;
  const result = Array.from({ length: cols }, () => new Array(rows).fill(0));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) result[c][rows - 1 - r] = shape[r][c];
  return result;
}

function tryRotate() {
  const rotated = rotateCW(current.shape);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collide(rotated, current.x + kick, current.y)) {
      current.shape = rotated;
      current.x += kick;
      return;
    }
  }
}

function merge() {
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        board[current.y + r][current.x + c] = current.shape[r][c];
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((v) => v !== 0)) {
      board.splice(r, 1);
      board.unshift(new Array(COLS).fill(0));
      cleared++;
      r++;
    }
  }
  if (cleared) {
    lines += cleared;
    score += (LINE_SCORES[cleared] || 0) * level;
    level = Math.floor(lines / 10) + 1;
    dropInterval = Math.max(100, 1000 - (level - 1) * 90);
    updateHUD();
  }
}

function ghostY() {
  let gy = current.y;
  while (!collide(current.shape, current.x, gy + 1)) gy++;
  return gy;
}

function hardDrop() {
  const gy = ghostY();
  score += (gy - current.y) * 2;
  current.y = gy;
  lockPiece();
}

function softDrop() {
  if (!collide(current.shape, current.x, current.y + 1)) {
    current.y++;
    score += 1;
    updateHUD();
  } else {
    lockPiece();
  }
}

function lockPiece() {
  merge();
  clearLines();
  spawn();
}

function spawn() {
  current = next;
  next = randomPiece();
  if (collide(current.shape, current.x, current.y)) {
    endGame();
  }
  drawNext();
}

function updateHUD() {
  scoreEl.textContent = score.toLocaleString();
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function drawBlock(context, x, y, colorIndex, size, alpha) {
  SKINS[activeSkin].drawBlock(context, x, y, colorIndex, size, alpha);
}

function drawGrid() {
  ctx.strokeStyle =
    getComputedStyle(document.body).getPropertyValue("--grid-color").trim() ||
    "#22222e";
  ctx.lineWidth = 0.5;
  for (let c = 1; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * BLOCK, 0);
    ctx.lineTo(c * BLOCK, ROWS * BLOCK);
    ctx.stroke();
  }
  for (let r = 1; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * BLOCK);
    ctx.lineTo(COLS * BLOCK, r * BLOCK);
    ctx.stroke();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  // board
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) drawBlock(ctx, c, r, board[r][c], BLOCK);

  // ghost
  const gy = ghostY();
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      if (current.shape[r][c])
        drawBlock(ctx, current.x + c, gy + r, current.shape[r][c], BLOCK, 0.2);

  // current piece
  for (let r = 0; r < current.shape.length; r++)
    for (let c = 0; c < current.shape[r].length; c++)
      drawBlock(ctx, current.x + c, current.y + r, current.shape[r][c], BLOCK);
}

function drawNext() {
  const NB = 30;
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const shape = next.shape;
  const offX = Math.floor((4 - shape[0].length) / 2);
  const offY = Math.floor((4 - shape.length) / 2);
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[r].length; c++)
      drawBlock(nextCtx, offX + c, offY + r, shape[r][c], NB);
}

function endGame() {
  gameOver = true;
  cancelAnimationFrame(animId);
  overlayTitle.textContent = "GAME OVER";
  overlayScore.textContent = `Puntuación: ${score.toLocaleString()}`;
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (!paused) {
    lastTime = performance.now();
    loop(lastTime);
  } else {
    cancelAnimationFrame(animId);
    overlayTitle.textContent = "PAUSA";
    overlayScore.textContent = "";
    overlay.classList.remove("hidden");
  }
}

function loop(ts) {
  const dt = ts - lastTime;
  lastTime = ts;
  dropAccum += dt;
  if (dropAccum >= dropInterval) {
    dropAccum = 0;
    if (!collide(current.shape, current.x, current.y + 1)) {
      current.y++;
    } else {
      lockPiece();
    }
  }
  if (gameOver) return;
  draw();
  animId = requestAnimationFrame(loop);
}

function init() {
  board = createBoard();
  score = 0;
  lines = 0;
  level = 1;
  paused = false;
  gameOver = false;
  dropInterval = 1000;
  dropAccum = 0;
  lastTime = performance.now();
  next = randomPiece();
  spawn();
  updateHUD();
  overlay.classList.add("hidden");
  cancelAnimationFrame(animId);
  animId = requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyP") {
    togglePause();
    return;
  }
  if (paused || gameOver) return;
  switch (e.code) {
    case "ArrowLeft":
      if (!collide(current.shape, current.x - 1, current.y)) current.x--;
      break;
    case "ArrowRight":
      if (!collide(current.shape, current.x + 1, current.y)) current.x++;
      break;
    case "ArrowDown":
      softDrop();
      break;
    case "ArrowUp":
    case "KeyX":
      tryRotate();
      break;
    case "Space":
      e.preventDefault();
      hardDrop();
      break;
  }
  updateHUD();
});

restartBtn.addEventListener("click", init);

document.getElementById("themeToggle").addEventListener("change", (e) => {
  document.body.classList.toggle("light-mode", e.target.checked);
});

const skinSelect = document.getElementById("skinSelect");
skinSelect.value = activeSkin;
SKINS[activeSkin].applyBg();

skinSelect.addEventListener("change", (e) => {
  activeSkin = e.target.value;
  localStorage.setItem("tetris-skin", activeSkin);
  SKINS[activeSkin].applyBg();
});

init();
