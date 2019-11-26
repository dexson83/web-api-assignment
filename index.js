//IMPORT LIBRARY
const express = require('express');
const server = express();
const hbs = require('hbs');
var mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

//DB CONNECTION
var con = mysql.createConnection({
    host: "y5s2h87f6ur56vae.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "csy03bfdxgihbhtk",
    password: "iqe0f6o1mbjc9lh1",
    database: "editgeqbm5tttyga"
});

//DECLARATION
var displayData;
var weatherData = [];

//SETTINGS 
server.use(express.static(__dirname + '/public'));
server.use(bodyParser.urlencoded({extended: true}));
server.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/template');
hbs.registerPartials(__dirname + '/views');

//DEFAULT INDEX PAGE or Homepage
server.get('/', (req, res) => {
    res.render('index.hbs');
});

//Records page (History)
server.get('/history', (req, res) => {
    displayData = [];
    con.query("SELECT * FROM weather", function (err, result, fields) {
        if (err) throw err;
        for(var pos = 0; pos < result.length; pos++){
            const cityName = result[pos].w_city_name;
            const countryCode = result[pos].w_country_code;
            const timezone = result[pos].w_timezone;
            const weather = result[pos].w_weather;
            const aqi = result[pos].w_aqi;
            const temperature = result[pos].w_temperature;

            displayData.push({'cityName': cityName, 'timezone': timezone, 'countryCode': countryCode, 'weather': weather, 'temperature': temperature, 'aqi': aqi})
        }
        setTimeout(function(){
            // insertDB(dataArray);
            res.render('history.hbs');
        }, 200)
    });
})

server.get('/about', (req, res) => {
    res.render('about.hbs');
})

//Helper for display info - Block Helper
hbs.registerHelper('list', (items, options) => {
    items = displayData;
    var out ="";

    const length = items.length;

    for(var i=0; i<length; i++){
        out = out + options.fn(items[i]);
    }

    return out;
});

//SEARCH FUNCTION
server.post('/search', (req, res) => {
    //HERE
    var searchQuery = req.body.query;
    displayData = [];
    const querystr1 = `https://api.weatherbit.io/v2.0/current?city=${searchQuery}&key=6460596c75524d5895068cf224d85706`;
    axios.get(querystr1).then((response) => {
        console.log(response.data);
        const cityName = response.data.data[0].city_name;
        const timezone = response.data.data[0].timezone;
        const countryCode = response.data.data[0].country_code;
        const weather = response.data.data[0].weather.description;
        const temperature = response.data.data[0].temp;
        const querystr2 = `https://api.weatherbit.io/v2.0/current/airquality?city=${searchQuery}&key=6460596c75524d5895068cf224d85706`
        axios.get(querystr2).then((response2) => {
            const aqi = response2.data.data[0].aqi;

            weatherData.push([cityName,countryCode, timezone, weather, aqi, temperature]);
            displayData.push({'cityName': cityName, 'timezone': timezone, 'countryCode': countryCode, 'weather': weather, 'temperature': temperature, 'aqi': aqi})
            setTimeout(function(){
                addToDB(weatherData);
                res.render('search.hbs');
            }, 200)
        })
    })
});

//test server connection
server.listen(process.env.PORT || 4000, () => {
    console.log('successful online');
});

//add history record to database
function addToDB(dbData){
    var sql = `INSERT INTO weather (w_city_name, w_country_code, w_timezone, w_weather, w_aqi, w_temperature) VALUES ?`;
    con.query(sql, [dbData],function (err, result) {
        if (err) throw err;
        console.log("Multiple record inserted");
    });
}

server.post('/del', (req, res) => {
    var sql = `DELETE FROM weather`;
    con.query(sql,function (err, result) {
        if (err) throw err;
        console.log('Data has been deleted');
        res.render('index.hbs');
    });
});
