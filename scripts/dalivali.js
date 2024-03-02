(function () {
  'use strict';

  /**
   * @typedef {Object} Coordinates
   * @property {number} latitude
   * @property {Vector} longitude
   */

  const SOFIA_BG_COOR = {
    latitude: 42.75,
    longitude: 23.25,
  };

  const roundTo2ndDec = (x) => Math.round(x * 100) / 100;

  /**
   * Get the current user's location, if they allow access
   * to it. If not, use Sofia, Bulgaria for a default one.
   *
   * @returns A promise that retunrs Coordinates
   */
  const getLocation = () =>
    new Promise((res) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            let { latitude, longitude } = pos.coords;
            latitude = roundTo2ndDec(latitude);
            longitude = roundTo2ndDec(longitude);
            res({ latitude, longitude });
          },
          () => {
            res(SOFIA_BG_COOR);
          },
        );
      } else {
        res(SOFIA_BG_COOR);
      }
    });

  /**
   * Fetch current
   *
   * @param {Coordinates} coor
   * @returns
   */
  const fetchPrecipitation = (coor) => {
    const { latitude, longitude } = coor;

    const URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=is_day,precipitation&forecast_days=1`;

    return fetch(URL)
      .then((r) => r.json())
      .then((res) => ({
        ...coor,
        precipitation: res.current.precipitation,
        time: res.current.time,
        isDay: res.current.is_day,
        time: new Date().toString(),
      }));
  };

  const fetchPrecipitationMock = (coor) =>
    new Promise((r) => {
      setTimeout(() => {
        r({
          ...coor,
          isDay: false,
          precipitation: 0,
        });
      }, 1000);
    });

  getLocation()
    .then((coor) => fetchPrecipitation(coor))
    .then((r) => {
      const resultCont = document.getElementById('result');
      const dataCont = document.getElementById('data');
      const rainCont = document.getElementById('rain-container');

      const dayClass = `${r.isDay ? 'day' : 'night'}-${
        r.precipitation > 0 ? 'rain' : 'clear'
      }`;
      rainCont.classList.add(dayClass);

      if (r.precipitation > 0) {
        Rain.attachToElement(rainCont, {
          width: rainCont.clientWidth,
          height: rainCont.clientHeight,
        });
        resultCont.innerHTML = 'ДА';
      } else {
        resultCont.innerHTML = 'НЕ';
      }

      const dateObj = new Date(r.time);
      const date = dateObj.toLocaleDateString();
      const timeArr = dateObj.toLocaleTimeString().split(':');
      timeArr.pop();
      const time = timeArr.join(':');

      dataCont.innerHTML = `lat. ${r.latitude} &ensp; long. ${r.longitude} &ensp; ${date} ${time}`;
    });
})();
