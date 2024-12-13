// Canvas-Setup
const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;
canvas.width = 600;
canvas.height = 400;

// Spielfeld- und Spielvariablen
const paddleWidth = 100;
const paddleHeight = 10;
const ballSize = 10;

let playerX = (canvas.width - paddleWidth) / 2;
let computerX = (canvas.width - paddleWidth) / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballDX = 3;
let ballDY = 3;

const computerSpeed = { light: 1, medium: 2, heavy: 3 };
let currentSpeed = computerSpeed.medium;

let isPaused = false;
let playerScore = 0;
let computerScore = 0;

// Popup-Elemente
const popup = document.getElementById("popup")!;
const popupMessage = document.getElementById("popup-message")!;
const popupRestartButton = document.getElementById("popup-restart")!;

// Zeichne Rechteck
function drawRect(x: number, y: number, width: number, height: number, color: string) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Zeichne Ball
function drawBall(x: number, y: number, size: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}

// Spiel zurücksetzen
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballDX = Math.random() > 0.5 ? 3 : -3;
    ballDY = Math.random() > 0.5 ? 3 : -3;
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    resetBall();
    updateScore();
    isPaused = false;
    document.getElementById("pause")!.innerText = "Pause";
    highlightActiveButton(); // Highlight den aktiven Schwierigkeitsbutton
}

// Aktualisiere Punktestand
function updateScore() {
    document.getElementById("you-score")!.innerText = playerScore.toString();
    document.getElementById("computer-score")!.innerText = computerScore.toString();
}

// Highlight den aktiven Schwierigkeits-Button
function highlightActiveButton() {
    const buttons = document.querySelectorAll("#controls button");
    buttons.forEach((button) => button.classList.remove("active"));

    if (currentSpeed === computerSpeed.light) {
        document.getElementById("light")!.classList.add("active");
    } else if (currentSpeed === computerSpeed.medium) {
        document.getElementById("medium")!.classList.add("active");
    } else if (currentSpeed === computerSpeed.heavy) {
        document.getElementById("heavy")!.classList.add("active");
    }
}

// Popup-Anzeige
function showPopup(message: string) {
    popupMessage.textContent = message;
    popup.classList.remove("hidden");
    isPaused = true; // Spiel pausieren
}

// Popup schließen und Spiel neu starten
popupRestartButton.addEventListener("click", () => {
    popup.classList.add("hidden");
    resetGame();
});

// Hauptspiel-Update
function updateGame() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Spieler-Paddle
    drawRect(playerX, canvas.height - 20, paddleWidth, paddleHeight, "white");

    // Computer-Paddle
    computerX += (ballX - (computerX + paddleWidth / 2)) * currentSpeed * 0.05;
    drawRect(computerX, 10, paddleWidth, paddleHeight, "white");

    // Ball
    ballX += ballDX;
    ballY += ballDY;
    drawBall(ballX, ballY, ballSize, "white");

    // Kollision mit Wänden
    if (ballX <= 0 || ballX >= canvas.width) ballDX *= -1;

    // Kollision mit Spieler-Paddle
    if (
        ballY >= canvas.height - 20 &&
        ballX >= playerX &&
        ballX <= playerX + paddleWidth
    ) {
        ballDY *= -1;
    }

    // Kollision mit Computer-Paddle
    if (
        ballY <= 20 &&
        ballX >= computerX &&
        ballX <= computerX + paddleWidth
    ) {
        ballDY *= -1;
    }

    // Punktestand aktualisieren
    if (ballY <= 0) {
        playerScore++;
        resetBall();
    } else if (ballY >= canvas.height) {
        computerScore++;
        resetBall();
    }

    updateScore();

    // Siegbedingungen prüfen
    if (
        (playerScore === 3 && computerScore < 3) ||
        (playerScore === 4 && computerScore === 3)
    ) {
        showPopup("You Win!");
    } else if (
        (computerScore === 3 && playerScore < 3) ||
        (computerScore === 4 && playerScore === 3)
    ) {
        showPopup("Computer Wins!");
    }
}

// Steuerung
document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    playerX = e.clientX - rect.left - paddleWidth / 2;
});

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") playerX -= 15;
    if (e.key === "ArrowRight") playerX += 15;
});

// Schwierigkeitsstufen
function setDifficulty(difficulty: keyof typeof computerSpeed) {
    currentSpeed = computerSpeed[difficulty];
    highlightActiveButton();
}

document.getElementById("light")!.addEventListener("click", () => setDifficulty("light"));
document.getElementById("medium")!.addEventListener("click", () => setDifficulty("medium"));
document.getElementById("heavy")!.addEventListener("click", () => setDifficulty("heavy"));

// Pause-Button
document.getElementById("pause")!.addEventListener("click", () => {
    isPaused = !isPaused;
    const pauseButton = document.getElementById("pause")!;
    pauseButton.innerText = isPaused ? "Resume" : "Pause";
});

// Restart-Button
document.getElementById("restart")!.addEventListener("click", () => resetGame());

// Highlight den Standard-Schwierigkeitsbutton (Medium)
highlightActiveButton();

// Spiel starten
setInterval(updateGame, 1000 / 60);