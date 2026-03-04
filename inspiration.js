const INSPIRATION_KEY = "life-progress-inspiration";

const FALLBACK_QUOTES = [
  {
    quoteText: "你所热爱的事情，正是你的生活。",
    author: "村上春树",
  },
  {
    quoteText: "要么出众，要么出局。",
    author: "匿名",
  },
  {
    quoteText: "此刻的一小步，比永远不开始的一大步更重要。",
    author: "James Clear",
  },
  {
    quoteText: "把时间花在进步上，而不是焦虑上。",
    author: "匿名",
  },
  {
    quoteText: "种一棵树最好的时间是十年前，其次是现在。",
    author: "中国谚语",
  },
];

function getTodayISODate() {
  return new Date().toISOString().split("T")[0];
}

function loadInspiration() {
  try {
    const raw = localStorage.getItem(INSPIRATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (
      typeof parsed.quoteText !== "string" ||
      typeof parsed.author !== "string" ||
      typeof parsed.lastFetchDate !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveInspiration(data) {
  try {
    localStorage.setItem(
      INSPIRATION_KEY,
      JSON.stringify({
        quoteText: data.quoteText,
        author: data.author,
        lastFetchDate: getTodayISODate(),
      })
    );
  } catch {
    // ignore
  }
}

function renderInspiration(data) {
  const textEl = document.getElementById("inspiration-text");
  const authorEl = document.getElementById("inspiration-author");
  if (!textEl || !authorEl) return;

  textEl.textContent = data.quoteText || "愿你今天也在路上。";
  authorEl.textContent = data.author ? `— ${data.author}` : "— 未知";
}

async function fetchRemoteQuote() {
  if (typeof fetch !== "function") {
    throw new Error("当前环境不支持 fetch");
  }

  const resp = await fetch("https://api.quotable.io/random?tags=inspirational|motivational");
  if (!resp.ok) {
    throw new Error("语录接口响应异常");
  }
  const data = await resp.json();
  const quoteText = typeof data.content === "string" ? data.content : "";
  const author = typeof data.author === "string" ? data.author : "匿名";
  if (!quoteText) {
    throw new Error("语录内容为空");
  }
  return { quoteText, author };
}

function pickFallbackQuote() {
  const idx = Math.floor(Math.random() * FALLBACK_QUOTES.length);
  return FALLBACK_QUOTES[idx];
}

async function initInspiration() {
  const card = document.getElementById("inspiration-card");
  const statusEl = document.getElementById("inspiration-status");
  if (!card || !statusEl) return;

  const today = getTodayISODate();
  const cached = loadInspiration();

  if (cached && cached.lastFetchDate === today) {
    statusEl.textContent = "今日灵感";
    renderInspiration(cached);
    return;
  }

  statusEl.textContent = "正在唤醒今日灵感…";

  try {
    const quote = await fetchRemoteQuote();
    const payload = {
      quoteText: quote.quoteText,
      author: quote.author,
      lastFetchDate: today,
    };
    saveInspiration(payload);
    statusEl.textContent = "今日灵感";
    renderInspiration(payload);
  } catch (err) {
    console.error("获取每日一语失败：", err);
    const fallback = pickFallbackQuote();
    const payload = {
      ...fallback,
      lastFetchDate: today,
    };
    saveInspiration(payload);
    statusEl.textContent = "离线灵感";
    renderInspiration(payload);
  }
}

