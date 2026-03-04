function applySmartTheme() {
  const root = document.documentElement;
  const hour = new Date().getHours();
  const isDaytime = hour >= 7 && hour < 18;
  root.setAttribute("data-theme", isDaytime ? "light" : "dark");
}

document.addEventListener("DOMContentLoaded", () => {
  applySmartTheme();
  renderYearProgress();
  setInterval(renderYearProgress, 1000); // 每秒刷新一次
  // 每秒刷新所有倒计时
  setInterval(renderCountdownList, 1000);
  setupCountdown();
  fetchTodayHistory();
  initWeather();
  setupPomodoro();
  initInspiration();
});

