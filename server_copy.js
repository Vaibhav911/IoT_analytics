var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var moment = require('moment');


var {Year_Schema} = require('./IoT_Data_Schema.js');
var {Month_Schema} = require('./IoT_Data_Schema.js');
var {Day_Schema} = require('./IoT_Data_Schema.js');
var {Hour_Schema} = require('./IoT_Data_Schema.js');
var {Reading_Schema} = require('./IoT_Data_Schema.js');

// var Campus_Schema = require('./IoT_Campus_Schema.js');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var test_var = 0;
function test_func(i)
{
    console.log('variable passed is ' + i);
};

var last_stored_years = [] ; //array to store timestamps of last stored annual data in queue
var last_stored_months = [];//array to store timestamps of last stored monthly data in queue
var last_stored_days = [];//array to store timestamps of last stored daily data in queue
var last_stored_hours = [];//array to store timestamps of last stored hourly data in queue

//****************************** introduce hashing to it later.
//****************************** also flush data if sensor stops working

app.use('/advanced', (req, res) => {
    var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});

    var current_month =  reading.timeStamp.getMonth();
    var current_year = reading.timeStamp.getYear();
    var current_day = reading.timeStamp.getDate();
    var current_hour = reading.timeStamp.getHours();
    var current_sensorId = reading.sensorId;
   
    if (true == is_hour_in_cache(current_hour, current_day, current_month, current_year, current_sensorId))
    {
        Hour_Schema.findOne({hour: current_hour, 
                            date: current_day, 
                            month:current_month, 
                            year:current_year, 
                            sensorId: current_sensorId}, 
                            (err, hourlyData) => {
            if (err)
            {
                console.log('some error');
            }
            else
            {
                hourlyData.readingArray.push(reading);
                console.log('this is old hourlyData: ' + hourlyData)
                hourlyData.save(err => {
                    if (err)
                    {
                        console.log('error while saving old hourlyData');
                        console.log('error is : ' + err);
                    }
                    else
                    {
                        console.log('old hour object saved successfuly');
                    }
                });
                console.log('existing hour object saved successfuly');
            }
        })
    }
    else//means a new hour
    {
        previousHour = last_hour(current_hour, current_day, current_month, current_year)
        remove_from_hour_cache(previousHour[0], previousHour[1], previousHour[2], previousHour[3], current_sensorId);
        //insert new data into cache
        last_stored_hours.push({sensorId: current_sensorId, hour: current_hour, day: current_day, month: current_month, year: current_year});

        hourlyData = new Hour_Schema({
            sensorId: current_sensorId, hour: current_hour, date: current_day, month: current_month, year: current_year, readingArray: []
        });
        hourlyData.readingArray.push(reading);
        console.log('this is new hourlyData: ' + hourlyData);
        hourlyData.save(err => {
            if (err)
            {
                console.log('error while saving new hourlyData');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new hour object saved successfuly');
            }
        });                
    }
   

    if (true == is_day_in_cache(current_day, current_month, current_year, current_sensorId))
    {
        //do nothing
    }
    else
    {
        var previousDay = last_day(current_day, current_month, current_year);
        remove_from_day_cache(previousDay[0], previousDay[1], previousDay[2], current_sensorId);
        //insert into cache
        last_stored_days.push({sensorId: current_sensorId, day: current_day, month: current_month, year: current_year});
       //remove hour obejcts from mongodb and put them into day object
        // Hour_Schema.remove({sensorId: current_sensorId}); //remove hour objects from mongodb;
        dailyData = new Day_Schema({
            sensorId: current_sensorId, date: current_day, month: current_month, year: current_year, hourArray: []
        });
        console.log('this is new dailyData: ' + dailyData);
        dailyData.save(err => {
            if (err)
            {
                console.log('error while saving new dailyData');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new day object saved successfuly');
            }
        });   
    }

    if (true == is_month_in_cache(current_month, current_year, current_sensorId))
    {
        //do nothing
    }
    else
    {
        var previousMonth = last_month(current_month, current_year);
        remove_from_month_cache(previousMonth[0], previousMonth[1], current_sensorId);
        //insert into cache
        last_stored_months.push({sensorId: current_sensorId, month: current_month, year: current_year});
        //remove daily data from mongodb and store it in previous month object
        // Day_Schema.remove({sensorId: current_sensorId});
        monthlyData = new Month_Schema({
            sensorId: current_sensorId, month: current_month, year: current_year , dayArray: []
        });
        // get all daily objects of this month and this sensorId and store them in month
        // and remove them from daily data queue in mongodb
        console.log('this is new monthlyData: ' + monthlyData);
        monthlyData.save(err => {
            if (err)
            {
                console.log('error while saving new monthlyData');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new month object saved successfuly');
            }
        });   
    }

    if (true == is_year_in_cache(current_year, current_sensorId))
    {
        //do nothing
    }
    else
    {
        //remove monthly data from mongodb and put it here
        var previousYear = last_year(current_year);
        remove_from_year_cache(previousYear,current_sensorId);
        Month_Schema.remove({sensorId: current_sensorId});
        annualData = new Year_Schema({
            sensorId: current_sensorId, year: current_year, monthArray: []
        });
        // annualData.monthArray.push(current_monthObj);
        console.log('this is new annualData: ' + annualData);
        annualData.save(err => {
            if (err)
            {
                console.log('error while saving new annualData');
                console.log('error is: ' + err);
            }
            else
            {
                console.log('new year object saved successfuly');
            }
        });   
    }


})
function last_year(current_year)
{
    return current_year-1;
}
function last_month(current_month, current_year)
{
    if (current_month == 0)
    {
        return [11, current_year-1];
    }
    else
    {
        return [current_month-1, current_year];
    }
}
function last_day(current_day, current_month, current_year)
{
    if (current_year%4 == 0 && current_year%100 != 0)
    {
        if (current_month == 0 && current_day == 1)
        {
            return [31, 11, current_year-1];
        }
        if (current_month == 2 && current_day == 1)
        {
            return [29, 1, current_year];
        }
        else if (current_month%2 == 0 && current_day == 1)
        {
            return [30, current_month-1, current_year];
        }
        else if (current_month%2 == 1 && current_day == 1)
        {
            return [31, current_month-1, current_year];
        }
        else
        {
            return [current_day-1, current_month, current_year];
        }
    }
    else
    {
        if (current_month == 0 && current_day == 1)
        {
            return [31, 11, current_year-1];
        }
        if (current_month == 2 && current_day == 1)
        {
            return [28, 1, current_year];
        }
        else if (current_month%2 == 0 && current_day == 1)
        {
            return [30, current_month-1, current_year];
        }
        else if (current_month%2 == 1 && current_day == 1)
        {
            return [31, current_month-1, current_year];
        }
        else
        {
            return [current_day-1, current_month, current_year];
        }
    }
}
function last_hour(current_hour, current_day, current_month, current_year)
{
    if (current_hour == 0)
    {
        return [23].append(last_day(current_day, current_month, current_year));   
    }
    else
    {
        return [last_hour-1, current_day, current_month, current_year];
    }
}

function remove_from_year_cache(current_year, sensorId)//this remove current year from stored cache
{
    var index = is_year_in_cache(current_year, sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_years.splice(index, 1);
}

function remove_from_month_cache(current_month, current_year, sensorId)//this checks is current month is stored in cache
{
    var index = is_month_in_cache(current_month, current_year, sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_months.splice(index, 1);
}

function remove_from_day_cache(current_day, current_month, current_year, sensorId)//this remove current day from stored cache
{
    var index = is_day_in_cache(current_day, current_month, current_year, sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_days.splice(index, 1);
}

function remove_from_hour_cache(current_hour, current_day, current_month, current_year, sensorId)//this remove current hour from stored cache
{
    var index = is_hour_in_cache(current_hour, current_day, current_month, current_year, sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_hours.splice(index, 1);
}

function is_year_in_cache(current_year, sensorId)//this checks is current year is stored in cache
{
    for (var i=0;i<last_stored_years.length;i++)
    {
        if (sensorId == last_stored_years[i].sensorId
            && last_stored_years[i].year == current_year.getYear())
        {
            return i;
        }
    }
    return -1;
}

function is_month_in_cache(current_month, current_year, sensorId)//this checks is current month is stored in cache
{
    for (var i=0;i<last_stored_months.length;i++)
    {
        if (sensorId == last_stored_months[i].sensorId
            && last_stored_months[i].month == current_month
            && last_stored_months[i].year == current_year)
        {
            return i;
        }
    }
    return -1;
}

function is_day_in_cache(current_day, current_month, current_year, sensorId)//this checks is current day is stored in cache
{
    for (var i=0;i<last_stored_days.length;i++)
    {
        if (sensorId == last_stored_days[i].sensorId
            && last_stored_days[i].day == current_day
            && last_stored_days[i].month == current_month
            && last_stored_days[i].year == current_year)
        {
            return i;
        }
    }
    return -1;
}

function is_hour_in_cache(current_hour, current_day, current_month, current_year, sensorId)//this checks is current hour is stored in cache
{
    for (var i=0;i<last_stored_hours.length;i++)
    {
        if (sensorId == last_stored_hours[i].sensorId
            && last_stored_hours[i].hour == current_hour
            && last_stored_hours[i].day == current_day
            && last_stored_hours[i].month == current_month
            && last_stored_hours[i].year == current_year)
        {
            return i;
        }
    }
    return -1;
}

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
