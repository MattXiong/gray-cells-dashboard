const STORAGE_KEY_WEATHER = "life-progress-weather";

function loadWeatherCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WEATHER);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (
      typeof parsed.timestamp !== "number" ||
      typeof parsed.cityName !== "string" ||
      typeof parsed.weatherDesc !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveWeatherCache(payload) {
  try {
    localStorage.setItem(STORAGE_KEY_WEATHER, JSON.stringify(payload));
  } catch {
    // ignore quota / privacy errors
  }
}

function renderWeatherFromData(data, { cityEl, tempEl, descEl, mainEl, statusEl }) {
  const { cityName, temp, weatherDesc } = data;
  cityEl.textContent = cityName || "未知地点";
  if (typeof temp === "number") {
    tempEl.textContent = `${temp.toFixed(1)}°C`;
  } else {
    tempEl.textContent = "--°C";
  }
  descEl.textContent = weatherDesc || "未知天气";
  if (statusEl) statusEl.textContent = "";
  mainEl.hidden = false;
}

async function initWeather() {
  const statusEl = document.getElementById("weather-status");
  const mainEl = document.getElementById("weather-main");
  const cityEl = document.getElementById("weather-city");
  const tempEl = document.getElementById("weather-temp");
  const descEl = document.getElementById("weather-desc");

  if (!statusEl || !mainEl || !cityEl || !tempEl || !descEl) {
    return;
  }

  const cached = loadWeatherCache();
  const now = Date.now();
  const THIRTY_MIN_MS = 30 * 60 * 1000;

  if (cached && now - cached.timestamp < THIRTY_MIN_MS) {
    renderWeatherFromData(cached, { cityEl, tempEl, descEl, mainEl, statusEl });
    return;
  }

  const apiKey =
    window.APP_CONFIG && typeof window.APP_CONFIG.OPEN_WEATHER_KEY === "string"
      ? window.APP_CONFIG.OPEN_WEATHER_KEY
      : null;

  if (!apiKey) {
    statusEl.textContent = "未配置天气服务";
    return;
  }

  if (!("geolocation" in navigator)) {
    statusEl.textContent = "当前设备不支持定位";
    return;
  }

  statusEl.textContent = "正在获取定位…";

  const getPosition = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    });

  try {
    const pos = await getPosition();
    const { latitude, longitude } = pos.coords;

    statusEl.textContent = "正在加载天气…";

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
      latitude
    )}&lon=${encodeURIComponent(
      longitude
    )}&appid=${encodeURIComponent(apiKey)}&units=metric&lang=zh_cn`;

    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error("天气接口响应异常");
    }

    const data = await resp.json();
    const cityName =
      (data.name && String(data.name)) ||
      (data.sys && data.sys.country ? String(data.sys.country) : "未知地点");
    const temp =
      data.main && typeof data.main.temp === "number" ? data.main.temp : null;
    const weatherDesc =
      Array.isArray(data.weather) && data.weather[0]
        ? data.weather[0].description || data.weather[0].main
        : "未知天气";

    const payload = {
      cityName,
      temp,
      weatherDesc,
      timestamp: Date.now(),
    };
    saveWeatherCache(payload);
    renderWeatherFromData(payload, { cityEl, tempEl, descEl, mainEl, statusEl });
  } catch (err) {
    console.error("获取天气失败：", err);
    const hadCache = !!cached;
    let message = hadCache ? "暂时无法更新天气" : "无法更新天气";
    if (!hadCache && err && err.code === 1) {
      message = "定位被拒绝，无法更新天气";
    }
    statusEl.textContent = message;
  }
}

