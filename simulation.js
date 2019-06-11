var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var axios = require('axios');

var {Year_Schema} = require('./IoT_Data_Schema.js');
var {Month_Schema} = require('./IoT_Data_Schema.js');
var {Day_Schema} = require('./IoT_Data_Schema.js');
var {Hour_Schema} = require('./IoT_Data_Schema.js');
var {Reading_Schema} = require('./IoT_Data_Schema.js');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

simulate();

// app.use('/test', (req, res) => {
function simulate()
{
    let i=0;
var dt = new Date(Date.now());
// dt.setHours( dt.getHours() + 9);
var createObjs = setInterval(function(){
    dt.setMinutes( dt.getMinutes() + 15);
    var sensorIdToPass = 1 + i%2;
    var humidityToPass = Math.floor(Math.random()*3) + 78;
    var temperatureToPass = Math.floor(Math.random()*13) + 21;
    var luminosityToPass = Math.floor(Math.random()*23001) + 78;

    var link = 'http://localhost:3000/storereading?'
     + 'sensorId=' + sensorIdToPass
     + '&temperature=' + temperatureToPass
     + '&luminosity=' + luminosityToPass
     + '&humidity=' + humidityToPass
     + '&i=' + i
     + '&timeStamp=' + dt;

    //  console.log(i + 'timestamp: ' + dt)
    axios.post(link).then(res => {
        console.log(i + 'timestamp: ' + dt)
        console.log('link: ' + link);
    });


    i = i + 1;
    if(i==200) {
        // res.send('***simulation finished.***');
        clearInterval(createObjs);
        return;
}}, 1000);
}
// });

app.listen(5000, () => {
    console.log('listening at 5000');
})
