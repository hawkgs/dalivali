(function () {
  'use strict';

  const SOFIA_BG_COOR = {
    latitude: 42.75,
    longitude: 23.25,
  };

  const roundTo2ndDec = (x) => Math.round(x * 100) / 100;

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

  const fetchPrecipitation = (coor) => {
    const { latitude, longitude } = coor;

    const URL = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=precipitation&forecast_days=1`;

    return fetch(URL)
      .then((r) => r.json())
      .then((res) => ({
        precipitation: res.current.precipitation,
        time: res.current.time,
        ...coor,
      }));
  };

  getLocation()
    .then((coor) => fetchPrecipitation(coor))
    .then((r) => {
      const resultCont = document.getElementById('result');
      const dataCont = document.getElementById('data');

      if (r.precipitation > 0) {
        const el = document.getElementById('rain-container');

        Rain.attachToElement(el, {
          width: el.clientWidth,
          height: el.clientHeight,
        });
        resultCont.innerHTML = 'DA';
      } else {
        resultCont.innerHTML = 'NE';
      }

      const dateObj = new Date(r.time);
      const date = dateObj.toLocaleDateString();
      const timeArr = dateObj.toLocaleTimeString().split(':');
      timeArr.pop();
      const time = timeArr.join(':');

      dataCont.innerHTML = `lat. ${r.latitude} &ensp; long. ${r.longitude} &ensp; ${date} ${time}`;
    });
})();
