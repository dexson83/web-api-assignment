const axios = require('axios');
axios.get('https://api.weatherbit.io/v2.0/current?key=6460596c75524d5895068cf224d85706&city=Putrajaya')
  .then(function (response) {
    // handle success
    console.log(response["data"]["data"][0]["slp"]);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });