const STORAGE_KEY_LIST = "life-progress-countdowns";

let countdownItems = [];

function loadCountdownList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIST);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        if (!item || !item.id || !item.eventName || !item.targetISO) return null;
        const t = new Date(item.targetISO);
        if (Number.isNaN(t.getTime())) return null;
        return {
          id: String(item.id),
          eventName: String(item.eventName),
          targetISO: t.toISOString(),
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function saveCountdownList() {
  localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(countdownItems));
}

function renderCountdownList() {
  const listEl = document.getElementById("countdown-list");
  const countEl = document.getElementById("countdown-count");
  if (!listEl) return;

  if (countEl) {
    countEl.textContent = `${countdownItems.length} 个`;
  }

  if (countdownItems.length === 0) {
    listEl.innerHTML = '<div class="countdown-empty">尚未添加任何倒计时</div>';
    return;
  }

  const fragments = countdownItems.map((item) => {
    const parts = getCountdownParts(item.targetISO);
    const prefix = parts.isPast ? "已经过去" : "还剩";
    const meta = formatTargetMeta(parts.targetDate);

    return `
      <article class="countdown-item" data-id="${item.id}">
        <div class="countdown-item-main">
          <div class="countdown-item-title">${item.eventName}</div>
          <div class="countdown-item-meta">${prefix} · ${meta}</div>
        </div>
        <div class="countdown-item-time">
          <span class="time-part"><strong>${parts.days}</strong><span>天</span></span>
          <span class="time-part"><strong>${String(parts.hours).padStart(2, "0")}</strong><span>时</span></span>
          <span class="time-part"><strong>${String(parts.minutes).padStart(2, "0")}</strong><span>分</span></span>
          <span class="time-part"><strong>${String(parts.seconds).padStart(2, "0")}</strong><span>秒</span></span>
        </div>
        <div class="countdown-item-footer">
          <button class="countdown-delete" data-role="delete-countdown" data-id="${item.id}">删除</button>
        </div>
      </article>
    `;
  });

  listEl.innerHTML = fragments.join("");
}

function setupCountdown() {
  const form = document.getElementById("countdown-form");
  const nameInput = document.getElementById("event-name");
  const dateInput = document.getElementById("event-date");
  const listEl = document.getElementById("countdown-list");

  if (!form || !nameInput || !dateInput || !listEl) return;

  // 初始化列表
  countdownItems = loadCountdownList();
  renderCountdownList();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const rawName = nameInput.value.trim() || "我的事件";
    const rawDate = dateInput.value;
    if (!rawDate) {
      return;
    }

    const target = new Date(rawDate);
    if (Number.isNaN(target.getTime())) {
      return;
    }

    const item = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      eventName: rawName,
      targetISO: target.toISOString(),
    };

    countdownItems.push(item);
    saveCountdownList();
    renderCountdownList();

    nameInput.value = "";
    dateInput.value = "";
  });

  // 删除倒计时（事件委托）
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-role='delete-countdown']");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    if (!id) return;
    countdownItems = countdownItems.filter((item) => item.id !== id);
    saveCountdownList();
    renderCountdownList();
  });
}

