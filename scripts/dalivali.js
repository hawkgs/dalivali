(function () {
  'use strict';

  /**
   * @typedef {Object} Coordinates
   * @property {number} latitude
   * @property {number} longitude
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

    const URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=is_day,precipitation&forecast_days=1&timezone=auto`;

    return fetch(URL)
      .then((r) => r.json())
      .then((res) => ({
        ...coor,
        precipitation: res.current.precipitation,
        time: res.current.time,
        isDay: res.current.is_day,
      }));
  };

  /**
   * Mock fetch function for testing purposes.
   *
   * @param {Coordinates} coor
   * @returns
   */
  const fetchPrecipitationMock = (coor) =>
    new Promise((r) => {
      const REQUEST_DELAY = 2000;
      setTimeout(() => {
        r({
          ...coor,
          isDay: false,
          precipitation: 10,
          time: new Date().toString(),
        });
      }, REQUEST_DELAY);
    });

  getLocation()
    .then((coor) => fetchPrecipitation(coor))
    .then((r) => {
      const resultCont = document.getElementById('result');
      const dataCont = document.getElementById('data');
      const rainCont = document.getElementById('rain-container');

      // Add time-aware background
      const dayClass = `${r.isDay ? 'day' : 'night'}-${
        r.precipitation > 0 ? 'rain' : 'clear'
      }`;
      rainCont.classList.add(dayClass);

      // Setup rainfall
      if (r.precipitation > 0) {
        Rain.attachToElement(rainCont, {
          width: rainCont.clientWidth,
          height: rainCont.clientHeight,
          // Note(Georgi): Keep rainfall intensity below 6
          rainfallIntensity: Math.min(r.precipitation, 6),
        });
        resultCont.innerHTML = 'ДА';
      } else {
        resultCont.innerHTML = 'НЕ';
      }

      // Display coordinates and time of the forecast
      const dateObj = new Date(r.time);
      const datetime = new Intl.DateTimeFormat('bg-BG', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      }).format(dateObj);

      dataCont.innerHTML = `lat. ${r.latitude} &ensp; long. ${r.longitude} &ensp; ${datetime}`;
    });
})();
