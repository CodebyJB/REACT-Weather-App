import { useEffect, useState } from "react";

const icons = [
  [[0], "☀️"],
  [[1], "🌤️"],
  [[2], "⛅️"],
  [[3], "☁️"],
  [[45, 48], "🌫"],
  [[51, 56, 61, 66, 80], "🌦️"],
  [[53, 55, 63, 65, 57, 67, 81, 82], "🌧️"],
  [[71, 73, 75, 77, 85, 86], "🌨️"],
  [[95], "🌩️"],
  [[96, 99], "⛈️"],
];

export default function App() {
  const [query, setQuery] = useState("");
  const [geoData, setGeoData] = useState({});

  return (
    <div className="app">
      <Header query={query} setQuery={setQuery} geoData={geoData} />
      <WeatherContainer
        query={query}
        geoData={geoData}
        setGeoData={setGeoData}
      />
    </div>
  );
}

function Header({ query, setQuery, geoData }) {
  return (
    <div className="header">
      <h1>☀️ Weather App ☂️</h1>
      <input
        type="text"
        placeholder="Search location ..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="header-location">
        {query ? (
          <h2>
            Weather in {geoData.name}, {geoData.country}
          </h2>
        ) : (
          <h2>Type in your location ...</h2>
        )}
      </div>
    </div>
  );
}

function WeatherContainer({ query, geoData, setGeoData }) {
  const [weather, setWeather] = useState([]);

  function formatDate(inputDate) {
    const dateParts = inputDate.split("-");
    const formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

    return formattedDate;
  }

  function getWeekdayFromDate(dateString) {
    const date = new Date(dateString);

    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekday = weekdays[date.getDay()];

    return weekday;
  }

  useEffect(
    function () {
      const controller = new AbortController();
      async function getGeolocation() {
        try {
          const res = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${query}`,
            { signal: controller.signal }
          );
          const data = await res.json();
          const { latitude, longitude, timezone, name, country } =
            data.results.at(0);
          setGeoData({ latitude, longitude, timezone, name, country });
        } catch (err) {
          if (err.name !== "AbortError") console.error(err.message);
        }
      }
      getGeolocation();
      return function () {
        controller.abort();
      };
    },
    [query, setGeoData]
  );

  useEffect(
    function () {
      const controller = new AbortController();
      async function getWeather() {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&timezone=${geoData.timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`,
            { signal: controller.signal }
          );
          const data = await res.json();
          console.log(data.daily);
          // Combine the separate arrays into an array of objects
          const weatherData = data.daily.time.map((time, index) => ({
            time,
            weathercode: data.daily.weathercode[index],
            temperature_2m_max: data.daily.temperature_2m_max[index],
            temperature_2m_min: data.daily.temperature_2m_min[index],
          }));

          setWeather(weatherData);
        } catch (err) {
          if (err.name !== "AbortError") console.error(err.message);
        }
      }
      getWeather();

      return function () {
        controller.abort();
      };
    },
    [geoData]
  );

  return (
    <div>
      <ul className="weather-container">
        {weather.map((data) => (
          <WeatherCard
            key={data.time}
            time={formatDate(data.time)}
            weathercode={data.weathercode}
            temperature_2m_max={data.temperature_2m_max}
            temperature_2m_min={data.temperature_2m_min}
            weekday={getWeekdayFromDate(data.time)}
          />
        ))}
      </ul>
    </div>
  );
}

function WeatherCard({
  time,
  weathercode,
  temperature_2m_max,
  temperature_2m_min,
  weekday,
}) {
  const getWeatherIcon = (code) => {
    for (const [codes, icon] of icons) {
      if (codes.includes(code)) {
        return icon;
      }
    }
  };

  return (
    <div className="weather-card">
      <li>
        <p className="weather-card-icon">{getWeatherIcon(weathercode)}</p>
        <h2>{weekday}</h2>
        <h3>{time}</h3>
        <p>
          {temperature_2m_min} C° - {temperature_2m_max} C°
        </p>
      </li>
    </div>
  );
}
