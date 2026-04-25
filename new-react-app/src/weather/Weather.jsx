import React from "react";
import CurrentLocation from "./currentLocation";
import "./Weather.css";
function Weather() {
  return (
    <React.Fragment>
      <div className="containerWeather">
        <CurrentLocation />
      </div>
    </React.Fragment>
  );
}

export default Weather;
