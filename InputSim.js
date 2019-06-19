// var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5})
//initialising sensor data
//import Sensor_Info_Schema from Campus_Schema
var i;
for (i=1; i<=9; i++)
{
    var sensorObj = new Sensor_Info_Schema({
    sensorId  : i,
    zoneId : ((i/3)+1),
    floorNo : ((i/8)+1),
    buildingId : 100,
    campusName: 'ABC'});
    console.log('this is new sensorObj: ' + sensorObj);
    sensorObj.save(err => {
        if (err)
        {
            console.log('error while saving new sensorObj');
            console.log('error is: ' + err);
        }
        else
        {
            console.log('new sensor object saved successfuly');
        }
    });
}

//replace the reading object instantiation in server.js with this:
var i=0;
var dt = new Date(Date.now());
dt.setMonth(4);
var createObjs = setInterval(function(){
    dt.setHours( dt.getHours() + i);
    var sensorIdToPass = 1 + i%3;
    var humidityToPass = Math.floor(Math.random()*30) + 50;
    var temperatureToPass = (sensorIdToPass==3)? null : Math.floor(Math.random()*40) + 7;
    var luminosityToPass = Math.floor(Math.random()*23001);
    var reading = new Reading_Schema({timeStamp: dt,
        sensorId: sensorIdToPass,
        temperature: temperatureToPass,
        humidity: humidityToPass,
        luminosity: luminosityToPass})
    i = i + 1;
    if(i==90*24) {
        clearInterval(createObjs);
    }}, 2000);
