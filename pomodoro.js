let pomodoroTimerId = null;
let pomodoroRemaining = 25 * 60; // seconds
let pomodoroRunning = false;

function formatPomodoro(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function setFocusBackground(active) {
  const root = document.documentElement;
  if (active) {
    root.setAttribute("data-focus", "on");
  } else {
    root.removeAttribute("data-focus");
  }
}

function updatePomodoroDisplay() {
  const display = document.getElementById("pomodoro-display");
  const button = document.getElementById("pomodoro-toggle");
  if (!display || !button) return;

  display.textContent = formatPomodoro(pomodoroRemaining);
  button.textContent = pomodoroRunning ? "暂停" : "开始 25 分钟";
}

function clearPomodoroTimer() {
  if (pomodoroTimerId !== null) {
    clearInterval(pomodoroTimerId);
    pomodoroTimerId = null;
  }
}

function handlePomodoroFinished() {
  clearPomodoroTimer();
  pomodoroRunning = false;
  setFocusBackground(false);
  updatePomodoroDisplay();

  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  } else {
    alert("25 分钟专注结束，可以稍作休息了。");
  }
}

function startPomodoro() {
  if (pomodoroRunning) return;
  pomodoroRunning = true;
  setFocusBackground(true);
  updatePomodoroDisplay();

  pomodoroTimerId = setInterval(() => {
    if (pomodoroRemaining > 0) {
      pomodoroRemaining -= 1;
      updatePomodoroDisplay();
    } else {
      handlePomodoroFinished();
    }
  }, 1000);
}

function pausePomodoro() {
  pomodoroRunning = false;
  clearPomodoroTimer();
  setFocusBackground(false);
  updatePomodoroDisplay();
}

function resetPomodoroIfNeeded() {
  if (pomodoroRemaining <= 0) {
    pomodoroRemaining = 25 * 60;
  }
}

function resetPomodoro() {
  clearPomodoroTimer();
  pomodoroRunning = false;
  pomodoroRemaining = 25 * 60;
  setFocusBackground(false);
  updatePomodoroDisplay();
}

function setupPomodoro() {
  const button = document.getElementById("pomodoro-toggle");
  const resetButton = document.getElementById("pomodoro-reset");
  const display = document.getElementById("pomodoro-display");
  if (!button || !display || !resetButton) return;

  pomodoroRemaining = 25 * 60;
  updatePomodoroDisplay();

  button.addEventListener("click", () => {
    resetPomodoroIfNeeded();
    if (pomodoroRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  });

  resetButton.addEventListener("click", () => {
    resetPomodoro();
  });
}

