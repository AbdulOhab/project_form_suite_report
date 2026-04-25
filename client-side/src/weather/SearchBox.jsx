import React, { useEffect, useState } from "react";

import apiKeys from "./apiKeys";
import ReactAnimatedWeather from "react-animated-weather";

function SearchBox() {
  const [cityName, setCityName] = useState("");
  const [error, setError] = useState("");
  const [weather, setWeather] = useState(null);
  const [weatherIcon, setWeatherIcon] = useState();
  // console.log(weather);
  const defaults = {
    color: "white",
    size: 112,
    animate: true,
  };
  function searchDataClose() {
    setWeather(null);
    setCityName(null);
    setError(null);
  }
  useEffect(() => {
    switch (weather?.weather[0]?.main) {
      case "Haze":
        setWeatherIcon("CLEAR_DAY");
        break;
      case "Clouds":
        setWeatherIcon("CLOUDY");
        break;
      case "Rain":
        setWeatherIcon("RAIN");
        break;
      case "Snow":
        setWeatherIcon("SNOW");
        break;
      case "Dust":
        setWeatherIcon("WIND");
        break;
      case "Drizzle":
        setWeatherIcon("SLEET");
        break;
      case "Fog":
        setWeatherIcon("FOG");
        break;
      case "Smoke":
        setWeatherIcon("FOG");
        break;
      case "Tornado":
        setWeatherIcon("WIND");
        break;
      default:
        setWeatherIcon("CLEAR_DAY");
    }
  }, [weather]);

  async function handleSearchData(e) {
    e.preventDefault();

    try {
      const response = await fetch(
        `${apiKeys?.base}/weather?q=${encodeURIComponent(
          cityName
        )}&units=metric&APPID=${apiKeys?.key}`
      );
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
        setCityName("");
        setError(null);
      } else {
        setWeather(null);
        setCityName("");
        setError({
          message: "Your are now outside the Earth",
          cityName: cityName,
        });
      }
    } catch (error) {
      console.error(error);
      setWeather(null);
      setCityName("");
      setError({ message: "Not Found", cityName: cityName });
    }
  }

  const getTimeFromUnixTimeStamp = (unixTimeStamp) => {
    const date = new Date(unixTimeStamp * 1000);
    const hours = date.getHours();
    const minutes = `0${date.getMinutes()}`.slice(-2);
    const ampm = hours >= 12 ? "PM" : "AM";
    const time = `${hours % 12}:${minutes} ${ampm}`;
    return `${time}`;
  };

  return (
    <div className="forecast">
      <div className="today-weather">
        <form action="" onSubmit={handleSearchData}>
          <div className="search-item">
            <input
              type="text"
              className="search-bar"
              placeholder="Search any city"
              onChange={(e) => setCityName(e.target.value)}
              value={cityName}
            />
          </div>
          <div className="img-box">
            <button className="bg-transparent border-0 text-light fw-bold fs-3">
              <i className="fas fa-search" aria-hidden="true"></i>
            </button>
          </div>
        </form>

        <div className={`search-data`}>
          <ul>
            {typeof weather?.main !== "undefined" ? (
              <div
                className={`${weather ? "d-block" : "d-none"} weather-forecast`}
              >
                <button
                  className="border border-secondary rounded text-light bg-transparent"
                  type="button"
                  onClick={searchDataClose}
                >
                  <i className="fa fa-close" aria-hidden="true"></i>
                </button>
                <div className="forecast-icon">
                  <ReactAnimatedWeather
                    icon={weatherIcon}
                    color={defaults.color}
                    size={defaults.size}
                    animate={defaults.animate}
                  />
                  <p>{weather.weather[0].description}</p>
                </div>
                <div className="forecast-data">
                  {" "}
                  <li className="cityHead">
                    <p>
                      {weather.name}, {weather.sys.country}
                    </p>

                    <img
                      className="temp"
                      src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                      alt=""
                    />
                  </li>
                  <li>
                    Temperature{" "}
                    <span className="temp">
                      {Math.round(weather.main?.temp)}°c
                    </span>
                  </li>
                  <li>
                    Feels Like{" "}
                    <span className="temp">
                      {Math.round(weather.main?.feels_like)}°c
                    </span>
                  </li>
                  <li>
                    Temperature Max{" "}
                    <span className="temp">
                      {Math.round(weather.main?.temp_max)}°c
                    </span>
                  </li>
                  <li>
                    Temperature Min{" "}
                    <span className="temp">
                      {Math.round(weather.main?.temp_min)}°c
                    </span>
                  </li>
                  <li>
                    Humidity{" "}
                    <span className="temp">
                      {Math.round(weather.main.humidity)}%
                    </span>
                  </li>
                  <li>
                    Visibility{" "}
                    <span className="temp">
                      {Math.round(weather.visibility)} mi
                    </span>
                  </li>
                  <li>
                    Wind Speed{" "}
                    <span className="temp">
                      {Math.round(weather.wind.speed)} Km/h
                    </span>
                  </li>
                  <li>
                   Sun Rise{" "}
                    <span className="temp">
                    {getTimeFromUnixTimeStamp(weather?.sys.sunrise)}
                    </span>
                  </li>
                  <li>
                    Sun Set{" "}
                    <span className="temp">
                    {getTimeFromUnixTimeStamp(weather?.sys.sunset)}
                    </span>
                  </li>
                  
                </div>
              </div>
            ) : (
              <li className={`text-center ${!error ? "border-0" : ""}`}>
                {error?.message}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default SearchBox;
