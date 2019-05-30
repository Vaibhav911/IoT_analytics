var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var {Year_Schema} = require('./IoT_Data_Schema.js');
var {Month_Schema} = require('./IoT_Data_Schema.js');
var {Day_Schema} = require('./IoT_Data_Schema.js');
var {Hour_Schema} = require('./IoT_Data_Schema.js');
var {Reading_Schema} = require('./IoT_Data_Schema.js');

// var Campus_Schema = require('./IoT_Campus_Schema.js');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/', (req, res) => {
    
    var last_stored_year = null ; //current year to which we are storing value to
    var last_stored_month = null;//current month to which we are storing value to
    var last_stored_day = null;//current day to which we are storing value to
    var last_stored_hour = null;//current hour to which we are storing value to

    var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});

    var current_month =  reading.timeStamp.getMonth() + 1
    var current_year = reading.timeStamp.getYear();
    var current_day = reading.timeStamp.getDate();
    var current_hour = reading.timeStamp.getHours();
    var current_sensorId = reading.sensorId;

    console.log('everything fine');
    console.log("current hour: " + current_hour);
    var current_hourObj = null;
    if (current_hour == last_stored_hour)
    {
        Hour_Schema.findOne({hour: current_hour, sensorId: current_sensorId}, (err, hourObj) => {
            if (err)
            {
                console.log('some error');
            }
            else
            {
                hourObj.readingArray.push(reading);
                console.log('this is old hourObj: ' + hourObj)
                hourObj.save(err => {
                    if (err)
                    {
                        console.log('error while saving old hourObj');
                        console.log('error is : ' + err);
                    }
                    else
                    {
                        console.log('old hour object saved successfuly');
                    }
                });
                current_hourObj = hourObj; 
                console.log('existing hour object saved successfuly');
            }
        })
    }
    else
    {         
        hourObj = new Hour_Schema({
            sensorId: current_sensorId, hour: current_hour, readingArray: []
        });
        hourObj.readingArray.push(reading);
        console.log('this is new hourObj: ' + hourObj);
        hourObj.save(err => {
            if (err)
            {
                console.log('error while saving new hourObj');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new hour object saved successfuly');
            }
        });       
        current_hourObj = hourObj;           
    }

    current_dayObj = null;//retrieve data 
    if (current_day == last_stored_day)
    {
        Day_Schema.findOne({day: current_day, sensorId: current_sensorId}, (err, dayObj) => {
            if (err)
            {
                console.log('some error');
            }
            else
            {
                dayObj.hourArray.push(current_hourObj);
                console.log('this is old dayObj: ' + dayObj)
                dayObj.save(err => {
                    if (err)
                    {
                        console.log('error while saving old dayObj');
                        console.log('error is : ' + err);
                    }
                    else
                    {
                        console.log('old day object saved successfuly');
                    }
                });
                current_dayObj = dayObj;
                console.log('existing day object saved successfuly');
            }
        })
    }
    else
    {
        Hour_Schema.remove({sensorId: current_sensorId});
        dayObj = new Day_Schema({
            sensorId: current_sensorId, date: current_day, hourArray: []
        });
        dayObj.hourArray.push(current_hourObj);
        console.log('this is new dayObj: ' + dayObj);
        dayObj.save(err => {
            if (err)
            {
                console.log('error while saving new dayObj');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new day object saved successfuly');
            }
        });   
        current_dayObj = dayObj;
    }


    current_monthObj = null;
    if (current_month == last_stored_month)
    {
        Month_Schema.findOne({sensorId: current_sensorId, month: current_month}, (err, monthObj) => {
            if (err)
            {
                console.log('some error');
            }
            else
            {
                monthObj.dayArray.push(current_dayObj);
                console.log('this is old monthObj: ' + monthObj)
                monthObj.save(err => {
                    if (err)
                    {
                        console.log('error while saving old monthObj');
                        console.log('error is : ' + err);
                    }
                    else
                    {
                        console.log('old month object saved successfuly');
                    }
                });
                current_monthObj = monthObj;
                console.log('existing month object saved successfuly');
            }
        })
    }
    else
    {
        Day_Schema.remove({sensorId: current_sensorId});
        monthObj = new Month_Schema({
            sensorId: current_sensorId, month: current_month, dayArray: []
        });
        monthObj.dayArray.push(current_dayObj);
        console.log('this is new monthObj: ' + monthObj);
        monthObj.save(err => {
            if (err)
            {
                console.log('error while saving new monthObj');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new month object saved successfuly');
            }
        });   
        current_monthObj = monthObj;
    }

    if (current_year == last_stored_year)
    {
        Year_Schema.findOne({sensorId: current_sensorId, year: current_year}, (err, yearObj) => {
            if (err)
            {
                console.log('some error');
            }
            else
            {
                yearObj.monthArray.push(current_monthObj);
                console.log('this is old yearObj: ' + yearObj)
                yearObj.save(err => {
                    if (err)
                    {
                        console.log('error while saving old yearObj');
                        console.log('error is : ' + err);
                    }
                    else
                    {
                        console.log('old year object saved successfuly');
                    }
                });
                console.log('existing year object saved successfuly');
            }
        })
    }
    else
    {
        Month_Schema.remove({sensorId: current_sensorId});
        yearObj = new Year_Schema({
            sensorId: current_sensorId, year: current_year, monthArray: []
        });
        yearObj.monthArray.push(current_monthObj);
        console.log('this is new yearObj: ' + yearObj);
        yearObj.save(err => {
            if (err)
            {
                console.log('error while saving new yearObj');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new year object saved successfuly');
            }
        });   
    }
});

app.listen(3000, () => {
    console.log('listening at 3000');
})