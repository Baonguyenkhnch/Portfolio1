let lastScrollTop = 0;
const header = document.querySelector("header");
const timeText = document.querySelector(".time")

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }

  lastScrollTop = scrollTop;
});

const now = new Date();
const jakartaTime = now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
const [date, time] = jakartaTime.split(", ");
timeText.textContent = `${time} GMT+7`

const yearText = document.getElementById("year");
const year = new Date().getFullYear();

yearText.textContent = year;


// WEATHER
// ========== WEATHER APP (Open-Meteo API) ==========
const geocodeUrl = "https://geocoding-api.open-meteo.com/v1/search?name=";
const weatherUrl = "https://api.open-meteo.com/v1/forecast";

// Lấy element
const input = document.getElementById("city");
const btn = document.getElementById("getWeather");
const weatherInfo = document.getElementById("weather-info");
const weatherLocation = document.getElementById("weather-location");

// Mã thời tiết theo Open-Meteo
const weatherCodes = {
  0: "☀️ Trời quang đãng",
  1: "🌤️ Chủ yếu quang đãng",
  2: "⛅ Trời có mây",
  3: "☁️ Nhiều mây",
  45: "🌫️ Sương mù",
  48: "🌫️ Sương giá",
  51: "🌦️ Mưa phùn nhẹ",
  53: "🌧️ Mưa phùn vừa",
  55: "🌧️ Mưa phùn dày",
  61: "🌦️ Mưa nhỏ",
  63: "🌧️ Mưa vừa",
  65: "🌧️ Mưa lớn",
  71: "❄️ Tuyết nhẹ",
  73: "🌨️ Tuyết vừa",
  75: "❄️ Tuyết dày",
  80: "🌦️ Mưa rào nhẹ",
  81: "🌧️ Mưa rào vừa",
  82: "⛈️ Mưa rào mạnh",
  95: "⛈️ Dông nhẹ",
  96: "⛈️ Dông có mưa đá nhỏ",
  99: "🌩️ Dông kèm mưa đá lớn"
};

// Khi bấm “Xem thời tiết”
btn.addEventListener("click", async () => {
  const city = input.value.trim();
  if (!city) {
    weatherInfo.textContent = "❗ Vui lòng nhập địa điểm.";
    return;
  }

  weatherInfo.textContent = "⏳ Đang tải dữ liệu...";
  weatherLocation.textContent = "";

  try {
    // 1️⃣ Lấy tọa độ từ tên thành phố
    const geoRes = await fetch(`${geocodeUrl}${encodeURIComponent(city)}&count=1`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      weatherInfo.textContent = "⚠️ Không tìm thấy địa điểm.";
      return;
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // 2️⃣ Lấy dữ liệu thời tiết từ Open-Meteo
    const weatherRes = await fetch(
      `${weatherUrl}?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`
    );

    const data = await weatherRes.json();

    const current = data.current_weather;
    const daily = data.daily;

    const todayMax = daily.temperature_2m_max[0];
    const todayMin = daily.temperature_2m_min[0];
    const code = current.weathercode;

    // 3️⃣ Hiển thị kết quả
    weatherLocation.textContent = `${name}, ${country}`;
    weatherInfo.innerHTML = `
      <p><b>Thời tiết hiện tại:</b> ${weatherCodes[code] || "Không xác định"}</p>
      <p><b>Nhiệt độ:</b> ${current.temperature}°C</p>
      <p><b>Gió:</b> ${current.windspeed} km/h</p>
      <p><b>Hôm nay:</b> Từ ${todayMin}°C đến ${todayMax}°C</p>
    `;
  } catch (err) {
    console.error(err);
    weatherInfo.textContent = "⚠️ Lỗi khi tải dữ liệu thời tiết!";
  }
});


// CURRENCY EXCHANGE
document.getElementById("convert-btn").addEventListener("click", async () => {
  const from = document.getElementById("from-currency").value;
  const to = document.getElementById("to-currency").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const resultEl = document.getElementById("result");

  if (!amount || amount <= 0) {
    resultEl.textContent = "Vui lòng nhập số tiền hợp lệ!";
    return;
  }

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
    const data = await res.json();
    const rate = data.rates[to];
    const converted = (amount * rate).toFixed(2);
    resultEl.textContent = `${amount} ${from} = ${converted} ${to}`;
  } catch (e) {
    resultEl.textContent = "Không thể tải dữ liệu tỉ giá.";
  }
});
