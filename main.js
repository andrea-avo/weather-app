const apiKey = "9d92c99208de9294d1dfe1e3668aca70";
const apiUrl =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const searchBox = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const sidebarMain = document.querySelector(".weather-main");
const contentPanel = document.querySelector(".content-panel");
const welcomeMsg = document.querySelector(".welcome-message");

let currentCityTimezone = 0;
let lastSearchedCity = "";

async function checkWeather(city) {
  try {
    const response = await fetch(apiUrl + city + `&appid=${apiKey}`);

    if (response.status == 404) {
      document.querySelector(".error").style.display = "block";
    } else {
      var data = await response.json();

      currentCityTimezone = data.timezone;
      lastSearchedCity = city;

      document.querySelector(".city").innerHTML = data.name;
      document.querySelector(".temp").innerHTML =
        Math.round(data.main.temp) + "°c";
      document.querySelector(".feels-like").innerHTML =
        `Feels like ${Math.round(data.main.feels_like)}°c`;
      document.querySelector(".desc").innerHTML = data.weather[0].description;
      document.querySelector(".humidity").innerHTML = data.main.humidity + "%";
      document.querySelector(".wind").innerHTML =
        Math.round(data.wind.speed) + " km/h";
      document.querySelector(".visibility").innerHTML =
        (data.visibility / 1000).toFixed(1) + " km";
      document.querySelector(".pressure").innerHTML =
        data.main.pressure + " hPa";

      updateTime();
      document.querySelector(".sunrise").innerHTML = formatSunTime(
        data.sys.sunrise,
        data.timezone,
      );
      document.querySelector(".sunset").innerHTML = formatSunTime(
        data.sys.sunset,
        data.timezone,
      );

      const lat = data.coord.lat;
      const lon = data.coord.lon;
      const mapUrl = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
      document.getElementById("gmap_canvas").src = mapUrl;
      const condition = data.weather[0].main;

      weatherIcon.className = "weather-icon fa-solid";

      switch (condition) {
        case "Clear":
          weatherIcon.classList.add("fa-sun");
          weatherIcon.style.color = "#ffd700";
          break;
        case "Clouds":
          weatherIcon.classList.add("fa-cloud");
          weatherIcon.style.color = "#a09fb1";
          break;
        case "Rain":
          weatherIcon.classList.add("fa-cloud-showers-heavy");
          weatherIcon.style.color = "#4a90e2";
          break;
        case "Drizzle":
          weatherIcon.classList.add("fa-cloud-rain");
          weatherIcon.style.color = "#7fb3d5";
          break;
        case "Mist":
        case "Haze":
        case "Fog":
        case "Smoke":
          weatherIcon.classList.add("fa-smog");
          weatherIcon.style.color = "#cfcfcf";
          break;
        case "Snow":
          weatherIcon.classList.add("fa-snowflake");
          weatherIcon.style.color = "#ffffff";
          break;
        case "Thunderstorm":
          weatherIcon.classList.add("fa-bolt");
          weatherIcon.style.color = "#f1c40f";
          break;
        default:
          weatherIcon.classList.add("fa-cloud");
          weatherIcon.style.color = "#a09fb1";
      }

      document.querySelector(".error").style.display = "none";
      welcomeMsg.style.display = "none";

      sidebarMain.classList.add("active");
      contentPanel.classList.add("active");
    }
  } catch (err) {
    console.log(err);
  }
}

function updateTime() {
  if (lastSearchedCity === "") return;

  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utcTime + 1000 * currentCityTimezone);
  const hours = String(cityTime.getHours()).padStart(2, "0");
  const minutes = String(cityTime.getMinutes()).padStart(2, "0");
  const seconds = String(cityTime.getSeconds()).padStart(2, "0");

  document.querySelector(".local-time").innerHTML =
    `${hours}:${minutes}:${seconds}`;

  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  document.querySelector(".date-info").innerHTML = cityTime.toLocaleDateString(
    "en-GB",
    options,
  );
}

function formatSunTime(timestamp, timezone) {
  const localDate = new Date(timestamp * 1000);
  const utcTime = localDate.getTime() + localDate.getTimezoneOffset() * 60000;
  const cityTime = new Date(utcTime + 1000 * timezone);
  return `${String(cityTime.getHours()).padStart(2, "0")}:${String(cityTime.getMinutes()).padStart(2, "0")}`;
}

searchBtn.addEventListener("click", () => {
  checkWeather(searchBox.value);
});

searchBox.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkWeather(searchBox.value);
  }
});

setInterval(updateTime, 1000);
setInterval(() => {
  if (lastSearchedCity !== "") {
    console.log("Auto-refreshing weather data...");
    checkWeather(lastSearchedCity);
  }
}, 300000); // 5 minutes
