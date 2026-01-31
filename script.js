let isSignup = false;
let isLoggedIn = false;

const WEATHER_API_KEY = "e37e6f8117ad4a24af860618263001";

//For Modal Login

function openLoginModal() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLoginModal() {
  document.getElementById("loginModal").style.display = "none";
}

function toggleForm() {
  isSignup = !isSignup;

  document.getElementById("formTitle").innerText =
    isSignup ? "Create an Account" : "Login to Your Account";

  document.getElementById("formSubtitle").innerText =
    isSignup ? "Sign up to unlock full features" : "Access personalized weather updates";

  document.getElementById("submitBtn").innerText =
    isSignup ? "Create Account" : "Login";

  document.getElementById("formToggle").innerHTML = isSignup
    ? `Already have an account? <span onclick="toggleForm()">Login</span>`
    : `Don't have an account? <span onclick="toggleForm()">Sign up</span>`;

  toggleVisibility("nameGroup", isSignup);
  toggleVisibility("usernameGroup", isSignup);
  toggleVisibility("confirmPasswordGroup", isSignup);
  toggleVisibility("genderGroup", isSignup);
  toggleVisibility("termsGroup", isSignup);
  toggleVisibility("rememberGroup", !isSignup);
}

function toggleVisibility(id, show) {
  document.getElementById(id).style.display = show ? "block" : "none";
}

function togglePassword() {
  const pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
}

/* PASSWORD STRENGTH */
document.getElementById("password").addEventListener("input", function () {
  const strengthText = document.getElementById("passwordStrength");
  const value = this.value;

  if (value.length < 6) {
    strengthText.innerText = "Weak password";
    strengthText.style.color = "red";
  } else if (/[A-Z]/.test(value) && /\d/.test(value)) {
    strengthText.innerText = "Strong password";
    strengthText.style.color = "green";
  } else {
    strengthText.innerText = "Medium strength";
    strengthText.style.color = "orange";
  }
});

function submitForm() {
  const name = document.getElementById("name").value;
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const gender = document.getElementById("gender").value;
  const terms = document.getElementById("terms")?.checked;

  if (!email || !password) {
    alert("❌ Email and password are required.");
    return;
  }

  if (isSignup) {
    if (!name || !username || !gender) {
      alert("❌ Please complete all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Passwords do not match.");
      return;
    }

    if (!terms) {
      alert("❌ You must agree to the terms and conditions.");
      return;
    }
  }

  isLoggedIn = true;

  alert(
    isSignup
      ? `✅ Registration successful!\nWelcome, ${name}`
      : `✅ Login successful!\nWelcome back!`
  );

  closeLoginModal();

  document
    .getElementById("weather-dashboard")
    .scrollIntoView({ behavior: "smooth" });
}
function checkWeatherAuth() {
  if (!isLoggedIn) {
    alert("🔒 Please login or sign up first to check the weather.");
    openLoginModal();
    return;
  }

  const city = document.getElementById("cityInput").value || "Manila";
  getWeather(city);
}


function sendMessage(event) {
  event.preventDefault();
  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;

  if (!name || !email || !message) {
    alert("Please complete the contact form.");
    return;
  }

  alert("📩 Message sent successfully!\nThank you, " + name);
  event.target.reset();
}

window.onclick = function(event) {
  const modal = document.getElementById("loginModal");
  if (event.target === modal) closeLoginModal();
};

// ============================
// LIVE MOVING CLOCK (FIXED)
// ============================

let clockInterval;
let activeTimezone = "Asia/Manila";

function startClock(timezone) {
  if (timezone) activeTimezone = timezone;

  // Prevent multiple intervals
  if (clockInterval) return;

  const clockEl = document.getElementById("clock");
  if (!clockEl) return;

  clockInterval = setInterval(() => {
    const now = new Date();

    const cityTime = new Date(
      now.toLocaleString("en-US", { timeZone: activeTimezone })
    );

    clockEl.innerText =
      "🕒 Local Time: " +
      cityTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
  }, 1000);
}

// ============================
// WEATHER
// ============================
async function getWeather(city = "Manila") {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`
    );
    const data = await res.json();

    if (data.error) {
      alert(data.error.message);
      return;
    }

    startClock(data.location.tz_id)
    ;

    document.getElementById("cityName").innerText =
      `${data.location.name}, ${data.location.country}`;

    document.getElementById("temp").innerText =
      Math.round(data.current.temp_c);

    document.getElementById("condition").innerText =
      data.current.condition.text;

    document.getElementById("wind").innerText =
      data.current.wind_kph + " kph";

    document.getElementById("humidity").innerText =
      data.current.humidity + "%";

    document.getElementById("precipitation").innerText =
      `🌧 Precipitation: ${data.current.precip_mm || 0} mm`;

    document.getElementById("typhoonAlert").style.display =
      data.current.wind_kph > 60 ? "block" : "none";

    getWeeklyForecast(city);

  } catch (err) {
    alert("Failed to fetch weather data.");
    console.error(err);
  }
}

async function getWeeklyForecast(city) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${city}&days=3`
    );
    const data = await res.json();
    if (data.error) return;

    startClock(data.location.tz_id);

    const forecastDays = document.querySelectorAll(".forecast-day");

    forecastDays.forEach((f, i) => {
      f.querySelector(".day").innerText = "—";
      f.querySelector(".icon").innerText = "⏳";
      f.querySelector(".temp").innerText = "--°C";
      f.style.opacity = i < 3 ? "1" : "0.4";
    });

    data.forecast.forecastday.forEach((day, index) => {
      const f = forecastDays[index];
      const weekday = new Date(day.date).toLocaleDateString("en-US", {
        weekday: "short"
      });

      let icon = "☀️";
      if (day.day.condition.text.includes("Rain")) icon = "🌧️";
      else if (day.day.condition.text.includes("Cloud")) icon = "⛅";
      else if (day.day.condition.text.includes("Thunder")) icon = "⛈️";

      f.querySelector(".day").innerText = weekday;
      f.querySelector(".icon").innerText = icon;
      f.querySelector(".temp").innerText =
        `${Math.round(day.day.avgtemp_c)}°C`;
    });

  } catch (err) {
    console.error(err);
  }
}

// ============================
// MAP
// ============================
let map, marker;

function initMap() {
  map = L.map("map").setView([14.5995, 120.9842], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  marker = L.marker([14.5995, 120.9842]).addTo(map);

  map.on("click", e => {
    marker.setLatLng(e.latlng);
    getWeatherByCoords(e.latlng.lat, e.latlng.lng);
  });
}

async function getWeatherByCoords(lat, lon) {
  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
    );
    const data = await res.json();

    if (data.error) {
      alert(data.error.message);
      return;
    }

    startClock(data.location.tz_id);

    document.getElementById("cityName").innerText =
      `${data.location.name}, ${data.location.country}`;

    document.getElementById("temp").innerText =
      Math.round(data.current.temp_c);

    document.getElementById("condition").innerText =
      data.current.condition.text;

    document.getElementById("wind").innerText =
      data.current.wind_kph + " kph";

    document.getElementById("humidity").innerText =
      data.current.humidity + "%";

    document.getElementById("precipitation").innerText =
      `🌧 Precipitation: ${data.current.precip_mm} mm`;

    document.getElementById("typhoonAlert").style.display =
      data.current.wind_kph > 60 ? "block" : "none";

    getWeeklyForecast(`${lat},${lon}`);

  } catch (err) {
    alert("Map weather fetch failed.");
    console.error(err);
  }
}

// ============================
// INIT
// ============================
window.onload = function() {
  startClock("Asia/Manila"); // start immediately
  getWeather("Manila");
  initMap();
};
