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


var last_stored_years = [];//array to store timestamps of last stored annual data in queue
var last_stored_months = [];//array to store timestamps of last stored monthly data in queue
var last_stored_dates = [];//array to store timestamps of last stored daily data in queue
var last_stored_hours = [];//array to store timestamps of last stored hourly data in queue
//its structure is {sensorId: , hour, date, month, year}

//****************************** introduce hashing to it later.
//****************************** also flush data if sensor stops working

var working_sensors = []//use this to find and clear data of faulty servers from mongodb

app.use('/removesensor', (req, res) => {
    //pass it sensor id

    var index_is_date_in_cache = is_date_in_cache(current_sensorId);
    var index_is_month_in_cache = is_month_in_cache(current_sensorId);
    var index_is_year_in_cache = is_year_in_cache(current_sensorId);
    combine_hourlyData_to_dailyData(index_is_date_in_cache, current_sensorId);
    combine_dailyData_to_monthlyData(index_is_month_in_cache, current_sensorId);
    combine_monthlyData_to_annualData(index_is_year_in_cache, current_sensorId);

    remove_from_year_cache(current_sensorId);
    remove_from_month_cache(current_sensorId);
    remove_from_date_cache(current_sensorId);
    remove_from_hour_cache(current_sensorId);

})
app.use('/test', (req, res) => {
    var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});
    reading.save(err => {
        if (err)
        {
            console.log('error: ' + err);
        }
        else
        {
            console.log('saved');
        }
    });
    reading.save(err => {
        if (err)
        {
            console.log('error: ' +err);
        }
        else
        {
            console.log('saved');
        }
    });
    reading.save(err => {
        if (err)
        {
            console.log('error: ' + err);
        }
        else
        {
            console.log('saved');
        }
    });
    reading.save(err => {
        if (err)
        {
            console.log('error: ' + err);
        }
        else
        {
            console.log('saved');
        }
    });
    reading.save(err => {
        if (err)
        {
            console.log('error: '+ err);
        }
        else
        {
            console.log('saved');
        }
    });
    reading.save(err => {
        if (err)
        {
            console.log('error: '+err);
        }
        else
        {
            console.log('saved');
        }
    });
})

app.use('/startserver', (req, res) => {
     prepare_server();
     res.send('server started sucessfuly')
})

app.use('/showcache', (req, res) => {
    res.write('this is hourly cache' + JSON.stringify(last_stored_hours));
    res.write('this is daily cache' + JSON.stringify(last_stored_dates));
    res.write('this is monthly cache' + JSON.stringify(last_stored_months));
    res.write('this is annual cache' + JSON.stringify(last_stored_years));
    res.send();
})
app.use('/storereading', (req, res) => {
    var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});

    function storereading(reading)
    {
    // console.log('called storereading functin');
    var current_month = reading.timeStamp.getMonth();
    var current_year = reading.timeStamp.getYear();
    var current_date = reading.timeStamp.getDate();
    var current_hour = reading.timeStamp.getHours();
    var current_sensorId = reading.sensorId;

    // console.log('current_hour: ' + current_hour);
    // console.log('current_date: ' + current_date);
    // console.log('current_month: ' + current_month);
    // console.log('current_year: ' + current_year);

    var index_prev_hour_in_cache = prev_hour_in_cache(current_sensorId);
    var index_prev_date_in_cache = prev_date_in_cache(current_sensorId);
    var index_prev_month_in_cache = prev_month_in_cache(current_sensorId);
    var index_prev_year_in_cache = prev_year_in_cache(current_sensorId);

    // console.log('index_prev_hour_in_cache: ' + index_prev_hour_in_cache);
    // console.log('index_prev_date_in_cache: ' + index_prev_date_in_cache);
    // console.log('index_prev_month_in_cache: ' + index_prev_month_in_cache);
    // console.log('index_prev_year_in_cache: ' + index_prev_year_in_cache);

    //store for previous data not just for last hour
    // console.log('reached here');
    if (index_prev_hour_in_cache != -1  //it's the same hour
        && last_stored_hours[index_prev_hour_in_cache].hour == current_hour    
        && last_stored_hours[index_prev_hour_in_cache].date == current_date
        && last_stored_hours[index_prev_hour_in_cache].month == current_month
        && last_stored_hours[index_prev_hour_in_cache].year == current_year) 
    {
        // console.log('current hour is in cache');
        store_in_existing_hourlyData(current_hour, current_date, current_month, current_year, current_sensorId, reading);
        // console.log('line 98');
        // return;
    }
    else//either data is of new hour/day/month/year or this is a completely new sensor
    {
        // console.log('line 103');        // console.log('current hour is not in cache');
        if (index_prev_hour_in_cache == -1)//means completely new sensor
        {
            // console.log('line 107');
            store_in_new_hourlyDate(current_hour, current_date, current_month, current_year, current_sensorId, reading);
            last_stored_hours.push({
                sensorId: current_sensorId, 
                hour: current_hour, 
                date: current_date, 
                month: current_month, 
                year: current_year
            });
            // return;
        }
        else
        {
            if (index_prev_date_in_cache != -1
                && last_stored_dates[index_prev_date_in_cache].date == current_date
                && last_stored_dates[index_prev_date_in_cache].month == current_month
                && last_stored_dates[index_prev_date_in_cache].year == current_year)//means it's the same date but hour is different
            {
                // console.log('line 124');
                // return;
            }
            else//it's a different date, will check for month and year
            {
                // console.log(' line 129');
                if (index_prev_date_in_cache == -1)//means new sensor, don't have any prev-date data
                {
                    // console.log('line 131');
                    // return;
                }
                else
                { 
                    combine_hourlyData_to_dailyData(index_prev_hour_in_cache, current_sensorId);
                    if (index_prev_month_in_cache != -1
                        && last_stored_months[index_prev_month_in_cache].month == current_month
                        && last_stored_months[index_prev_month_in_cache].year == current_year)//it's the same month, but date is different
                    {
                        // console.log('line 139');
                        // return;
                    }
                    else//it's a different month, will check for year 
                    {
                        if (index_prev_month_in_cache == -1)
                        {
                            // console.log('line 146');
                            // return;
                        }
                        else
                        {
                            combine_dailyData_to_monthlyData(index_prev_date_in_cache, current_sensorId);
                            if (index_prev_year_in_cache != -1
                                && last_stored_years[index_prev_year_in_cache].year == current_year)//it's the same year, but date and  month is different
                            {
                                // console.log('line 152');
                                // return;
                            }
                            else
                            {
                                // console.log('line 158');
                                if (index_prev_year_in_cache == -1)
                                {
                                    // console.log('line 161');
                                    // return;
                                }
                                else
                                {
                                    combine_monthlyData_to_annualData(index_prev_month_in_cache, current_sensorId);
                                    remove_from_year_cache(current_sensorId);
                                    last_stored_years.push({
                                        sensorId: current_sensorId, 
                                        year: current_year
                                    });
                                }
                            }
                    }
                        remove_from_month_cache(current_sensorId);
                        last_stored_months.push({
                            sensorId: current_sensorId, 
                            month: current_month, 
                            year: current_year
                        });
                    }
                }
                remove_from_date_cache(current_sensorId);//remove previous stored date cache data of this sensor
                last_stored_dates.push({    //stor new date cache data of this sensor
                    sensorId: current_sensorId, 
                    date: current_date, 
                    month: current_month, 
                    year: current_year
                });

            }
    }

        store_in_new_hourlyDate(current_hour, current_date, current_month, current_year, current_sensorId, reading);
        remove_from_hour_cache(current_sensorId);
        // console.log('before last_stored_hours');
        last_stored_hours.push({
            sensorId: current_sensorId, 
            hour: current_hour, 
            date: current_date, 
            month: current_month, 
            year: current_year
        });
    }
    // console.log('reaced end of function storereading');
}
var i=0;
var dt = new Date(Date.now());
var createObjs = setInterval(function(){
    dt.setMinutes( dt.getMinutes() + 10);
    var sensorIdToPass = 1 + i%3;
    var humidityToPass = Math.floor(Math.random()*3) + 78;
    var temperatureToPass = Math.floor(Math.random()*13) + 21;
    var luminosityToPass = Math.floor(Math.random()*23001) + 78;
    var reading = new Reading_Schema({timeStamp: dt,
        sensorId: sensorIdToPass,
        temperature: temperatureToPass,
        humidity: humidityToPass,
        luminosity: luminosityToPass})
    storereading(reading);
    i = i + 1;
    if(i==168) {
        clearInterval(createObjs);
}}, 1500);


})
function prev_year_in_cache(current_sensorId)//this checks is current year is stored in cache
{
    for (var i=0;i<last_stored_years.length;i++)
    {
        if (last_stored_years[i].sensorId == current_sensorId)
        {
            return i;
        }
    }
    return -1;
}
function prev_month_in_cache(current_sensorId)//this checks is current month is stored in cache
{
    for (var i=0;i<last_stored_months.length;i++)
    {
        if (last_stored_months[i].sensorId == current_sensorId)
        {
            return i;
        }
    }
    return -1;
}
function prev_date_in_cache(current_sensorId)//this remove current date from stored cache
{
    // console.log('lengt in is_date_in_catch' + last_stored_dates.length);
    // console.log('sensorId: ' + current_sensorId);
    for (var i=0;i<last_stored_dates.length;i++)
    {
        if (last_stored_dates[i].sensorId == current_sensorId)
        {
            return i;
        }
    }
    return -1;
}
function prev_hour_in_cache(current_sensorId)//this remove current hour from stored cache
{
    for (var i=0;i<last_stored_hours.length;i++)
    {
        if (last_stored_hours[i].sensorId == current_sensorId)
        {
            return i;
        }
    }
    return -1;
}

function remove_from_year_cache(current_sensorId)//this remove current year from stored cache
{
    var index = prev_year_in_cache(current_sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_years.splice(index, 1);
}

function remove_from_month_cache(current_sensorId)//this checks is current month is stored in cache
{
    var index =prev_month_in_cache(current_sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_months.splice(index, 1);
}

function remove_from_date_cache(current_sensorId)//this remove current date from stored cache
{
    var index = prev_date_in_cache(current_sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_dates.splice(index, 1);
}

function remove_from_hour_cache(current_sensorId)//this remove current hour from stored cache
{
    var index = prev_hour_in_cache(current_sensorId);
    if (index == -1)
    {
        return;
    }
    last_stored_hours.splice(index, 1);
}

function prepare_server()
{
    Hour_Schema.find({}, (err, hourlyDataArray) => {
        if (err)
        {
            console.log('error in fetching hourly data from mongoDB to start server');
            console.log('error is: ' + err);
        }
        else
        {
            for (var i=0;i<hourlyDataArray.length;i++)
            {
                last_stored_hours.push({
                    sensorId: hourlyDataArray[i].sensorId,
                    hour: hourlyDataArray[i].hour,
                    date: hourlyDataArray[i].date,
                    month: hourlyDataArray[i].month,
                    year: hourlyDataArray[i].year
                });
            }           
        }
    });

    // set daily cache
    Day_Schema.find({}, (err, dailyDataArray) => {
        if (err)
        {
            console.log('error in fetching daily data from mongoDB to start server');
            console.log('error is: ' + err);
        }
        else
        {
            for (var i=0;i<dailyDataArray.length;i++)
            {
                last_stored_dates.push({
                    sensorId: dailyDataArray[i].sensorId,
                    date: dailyDataArray[i].date,
                    month: dailyDataArray[i].month,
                    year: dailyDataArray[i].year
                });
            }           
        }
    });

    //set monthly cache
    Month_Schema.find({}, (err, monthlyDataArray) => {
        if (err)
        {
            console.log('error in fetching monthly data from mongoDB to start server');
            console.log('error is: ' + err);
        }
        else
        {
            for (var i=0;i<monthlyDataArray.length;i++)
            {
                last_stored_months.push({
                    sensorId: monthlyDataArray[i].sensorId,
                    month: monthlyDataArray[i].month,
                    year: monthlyDataArray[i].year
                });
            }           
        }
    });


    //set annual cache
   
    Year_Schema.find({}, (err, annualDataArray) => {
        if (err)
        {
            console.log('error in fetching annual data from mongoDB to start server');
            console.log('error is: ' + err);
        }
        else
        {
            for (var i=0;i<annualDataArray.length;i++)
            {
                last_stored_months.push({
                    sensorId: annualDataArray[i].sensorId,
                    year: annualDataArray[i].year
                });
            }           
        }
    });
    console.log('cache memory restored');
    console.log('server started successfuly');
}

function store_in_existing_hourlyData(current_hour, current_date, current_month, current_year, current_sensorId, reading)
{
    Hour_Schema.findOne({
        hour: current_hour, 
        date: current_date, 
        month:current_month, 
        year:current_year, 
        sensorId: current_sensorId}, 
        (err, hourlyData) => {
        if (err)
        {
            console.log('error in fetching hourly data from queue');
            console.log('error is ' + err);
        }
        else
        {
            hourlyData.readingArray.push(reading);
            // console.log('this is old hourlyData: ' + hourlyData)
            hourlyData.save(err => {
                if (err)
                {
                    console.log('error while saving old hourlyData in queue');
                    console.log('error is : ' + err);
                }
                else
                {
                    console.log('old hour object saved successfuly: ');
                    console.log('hour: ' + reading.timeStamp.getHours());
                    console.log('date: ' + reading.timeStamp.getDate());
                }
            });
        }
    });
}

function store_in_new_hourlyDate(current_hour, current_date, current_month, current_year, current_sensorId, reading)
{
    hourlyData = new Hour_Schema({
        sensorId: current_sensorId, 
        hour: current_hour, 
        date: current_date, 
        month: current_month, 
        year: current_year, 
        readingArray: []
    });
    hourlyData.readingArray.push(reading);
    // console.log('this is new hourlyData: ' + hourlyData);
    hourlyData.save(err => {
        if (err)
        {
            console.log('error while saving new hourlyData');
            console.log('error is: ' + err);
        }
        else
        {
            console.log('new hour object saved successfuly');
            console.log('hour: ' + reading.timeStamp.getHours());
            console.log('date: ' + reading.timeStamp.getDate());
        }
    });  
}

function combine_hourlyData_to_dailyData(index_prev_hour_in_cache, current_sensorId)
{
    // console.log('in combine_hourlyData_to_dailyData' + JSON.stringify(last_stored_hours[index_prev_hour_in_cache]));
    var old_date = last_stored_hours[index_prev_hour_in_cache].date;
    var old_month = last_stored_hours[index_prev_hour_in_cache].month;
    var old_year = last_stored_hours[index_prev_hour_in_cache].year;

    // console.log('index_prev_hour_in_cache: ' + index_prev_hour_in_cache);
    // console.log('old date: ' + old_date);

    dailyData = new Day_Schema({
        sensorId: current_sensorId, 
        date: old_date, 
        month: old_month, 
        year: old_year, 
        hourArray: []
    });

    Hour_Schema.find({sensorId: current_sensorId,
                      date: old_date,
                      month: old_month,
                      year: old_year
                    },
        (err, hourlyDataArray) =>
        {
            if (err)
            {
                console.log('some problem in fetching data');
            }
            else
            {
                // console.log('object from hourlyDataArray ' + JSON.stringify(hourlyDataArray));
                for (var i=0;i<hourlyDataArray.length; i++)
                {
                    dailyData.hourArray.push(hourlyDataArray[i]);
                }
                dailyData.save(err => {
                    if (err)
                    {
                        console.log('error while saving hourlyData to dailyData');
                        console.log('error is ' + err);
                    }
                    else
                    {
                        console.log('before deleting');
                        console.log('sensorId: ' + current_sensorId);
                        console.log('date: ' + old_date);
                        console.log('month: ' + old_month);
                        console.log('year: ' + old_year);
                        Hour_Schema.deleteMany({
                            sensorId: current_sensorId, 
                            date: old_date,
                            month: old_month, 
                            year: old_year}, (err, obj) => {
                               if (err)
                               {
                                   console.log('error in deleting while converting hourlyDAta to dailyData');
                                   console.log('error is : ' +  err);
                               }
                               else
                               {
                                console.log('hourly data combined to daily data');
                               }
                           });
                           
                    }
                })
            }
        });
}

function combine_dailyData_to_monthlyData(index_prev_date_in_cache, current_sensorId)
{
    var old_month = last_stored_dates[index_prev_date_in_cache].month;
    var old_year = last_stored_dates[index_prev_date_in_cache].year;

    monthlyData = new Month_Schema({
        sensorId: current_sensorId, 
        month: old_month, 
        year: old_year , 
        dateArray: []
    });

    Day_Schema.find({sensorId: current_sensorId,
                     month: old_month,
                     year: old_year},
                    (err, dailyDataArray) => {
                        if (err)
                        {
                            console.log('error while fetching dailyDataArray from mongodb');
                            console.log('error is: ' + err);
                        }
                        else
                        {
                            for (var i=0;i<dailyDataArray.length;i++)
                            {
                                monthlyData.dateArray.push(dailyDataArray[i]);
                            }
                            monthlyData.save(err => {
                                if (err)
                                {
                                    console.log('error while saving monthly data');
                                }
                                else
                                {
                                    Day_Schema.deleteMany({sensorId: current_sensorId,
                                                          month: old_month, 
                                                           year: old_year},
                                                           (err, obj) => {
                                                               if (err)
                                                               {
                                                                console.log('error in deleting while converting dailyDAta to monthlyData');
                                                                console.log('error is : ' +  err);
                                                               }
                                                               else
                                                               {
                                                                console.log('daily data combined to monthy data');

                                                               }
                                                           });
                                }
                            })
                        }
                    });
}

function combine_monthlyData_to_annualData(index_prev_month_in_cache, current_sensorId)
{
    var old_year = last_stored_years[index_prev_month_in_cache].year

    annualData = new Year_Schema({
        sensorId: current_sensorId, 
        year: current_year, 
        monthArray: []
    });

    Month_Schema.find({sensorId: current_sensorId,
                       year: old_year},
                       (err, monthlyDataArray) => {
                           if (err)
                           {
                               console.log('error while fetching monthly data from mongodb');
                           }
                           else
                           {
                               for (var i=0;i<monthlyDataArray.length;i++)
                               {
                                   annualData.monthArray.push(monthlyDataArray[i])
                               }
                               annualData.save(err => {
                                   if (err)
                                   {
                                       console.log('error while save annualData');
                                   }
                                   else
                                   {
                                    console.log('monthly data combined to annual data');
                                       Month_Schema.deleteMany({sensorId: current_sensorId,
                                                                year: old_year},
                                                                (err, obj) => {
                                                                    if (err)
                                                                    {
                                                                        console.log('error in deleting while converting monthlyDAta to annualData');
                                                                        console.log('error is : ' +  err);
                                                                    }
                                                                    else
                                                                    {
                                                                        console.log('monthly data combined to annual data');
                                                                    }
                                                                });
                                   }
                               })
                           }
                       });
}

app.listen(3000, () => {
    console.log('listening at 3000');
})
