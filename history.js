async function fetchTodayHistory() {
  const statusEl = document.getElementById("history-status");
  const listEl = document.getElementById("history-list");

  if (!statusEl || !listEl) {
    return;
  }

  statusEl.textContent = "正在获取历史信息…";
  listEl.innerHTML = "";

  try {
    if (typeof fetch !== "function") {
      throw new Error("当前环境不支持 fetch");
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    const url = `https://zh.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("网络响应异常");
    }

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];

    if (!events.length) {
      throw new Error("没有返回历史事件");
    }

    const topEvents = events.slice(0, 5);

    const items = topEvents.map((event) => {
      const year = event.year ?? "";
      const title =
        (event.text && String(event.text)) ||
        (event.pages &&
          event.pages[0] &&
          (event.pages[0].displaytitle || event.pages[0].normalizedtitle)) ||
        "（无标题）";

      return `
        <li class="history-item">
          <div class="history-item-header">
            <span class="history-year">${year} 年</span>
            <span class="history-title">${title}</span>
          </div>
        </li>
      `;
    });

    listEl.innerHTML = items.join("");
    statusEl.textContent = "";
  } catch (error) {
    console.error("获取历史上的今天失败：", error);
    statusEl.textContent = "暂时无法获取历史信息";
    listEl.innerHTML = "";
  }
}

