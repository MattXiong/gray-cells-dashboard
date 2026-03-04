function getYearProgress(date = new Date()) {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const msInDay = 24 * 60 * 60 * 1000;
  const totalMs = startOfNextYear - startOfYear;
  const totalDays = Math.round(totalMs / msInDay);

  const elapsedMs = date - startOfYear;
  const elapsedDays = Math.floor(elapsedMs / msInDay) + 1; // 今天算在内（按天显示）

  const clampedDays = Math.min(Math.max(elapsedDays, 0), totalDays);
  const clampedMs = Math.min(Math.max(elapsedMs, 0), totalMs);
  const percent = (clampedMs / totalMs) * 100; // 百分比按毫秒连续计算

  return {
    year,
    totalDays,
    elapsedDays: clampedDays,
    percent,
  };
}

function formatDateDetail(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const weekdayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdayNames[date.getDay()];
  return `${y}-${m}-${d} · 周${weekday}`;
}

function renderYearProgress() {
  const now = new Date();
  const { year, totalDays, elapsedDays, percent } = getYearProgress(now);

  const dateTextEl = document.getElementById("date-text");
  const todayDetailEl = document.getElementById("today-detail");
  const daysPassedEl = document.getElementById("days-passed");
  const daysTotalEl = document.getElementById("days-total");
  const percentTextEl = document.getElementById("percent-text");
  const progressFillEl = document.getElementById("progress-fill");

  if (!dateTextEl) return;

  dateTextEl.textContent = `今天是 ${year} 年的第 ${elapsedDays} 天`;
  todayDetailEl.textContent = formatDateDetail(now);
  daysPassedEl.textContent = elapsedDays;
  daysTotalEl.textContent = totalDays;

  const displayPercent = percent.toFixed(6); // 更细腻的动态变化
  percentTextEl.textContent = `${displayPercent}%`;

  requestAnimationFrame(() => {
    progressFillEl.style.width = `${Math.min(Math.max(percent, 0), 100)}%`;
  });
}

function getCountdownParts(targetISO) {
  const targetDate = new Date(targetISO);
  if (Number.isNaN(targetDate.getTime())) {
    return {
      isPast: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      targetDate: new Date(),
    };
  }

  const now = new Date();
  const diffMs = targetDate - now;
  const isPast = diffMs <= 0;
  const absMs = Math.abs(diffMs);

  const totalSeconds = Math.floor(absMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { isPast, days, hours, minutes, seconds, targetDate };
}

function formatTargetMeta(targetDate) {
  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, "0");
  const d = String(targetDate.getDate()).padStart(2, "0");
  const hh = String(targetDate.getHours()).padStart(2, "0");
  const mm = String(targetDate.getMinutes()).padStart(2, "0");
  const weekdayNames = ["日", "一", "二", "三", "四", "五", "六"];
  const weekday = weekdayNames[targetDate.getDay()];
  return `${y}-${m}-${d} ${hh}:${mm} · 周${weekday}`;
}

