var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

var {Year_Schema} = require('./IoT_Data_Schema.js');
var {Month_Schema} = require('./IoT_Data_Schema.js');
var {Day_Schema} = require('./IoT_Data_Schema.js');
var {Hour_Schema} = require('./IoT_Data_Schema.js');
var {Reading_Schema} = require('./IoT_Data_Schema.js');

// var Campus_Schema = require('./IoT_Campus_Schema.js');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var server_restart_count = 0;


var last_stored_years = [];//array to store timestamps of last stored annual data in queue
var last_stored_months = [];//array to store timestamps of last stored monthly data in queue
var last_stored_dates = [];//array to store timestamps of last stored daily data in queue
var last_stored_hours = [];//array to store timestamps of last stored hourly data in queue

var temp_reading_storage = [];//this stores reading the mongodb can't store


//its structure is {sensorId: , hour, date, month, year}

//****************************** introduce hashing to it later.
//****************************** also flush data if sensor stops working

var working_sensors = []//use this to find and clear data of faulty servers from mongodb

start_server();                                                                 //****also clear last_stored_years, etc */

app.use('/test', (req, res) => {
    // const fs = require('fs');
    // fs.writeFile("./test.txt", "Hey there!", function(err) {
    // if(err) {
    //     return console.log(err);
    // }

    // console.log("The file was saved!");
    // }); 
    // Hour_Schema.find({sensorId: 1}, {"sort" : [['timestamp', 'asc']]}, (err, data) => 
    // {
    //     if (err)
    //     {
    //         console.log('some error');
    //         console.log('error is: '+ err);
    //     }
    //     else
    //     {
    //         console.log('data is: ' + JSON.stringify(data[0]));
    //     }
    // });
// Hour_Schema.find({sensorId: 1, date: {$not: 11}/*, month: {5}, year: {current_year}*/}, (err, data) => {
//         if (err)
//         {
//             console.log('some error');
//             console.log('error is: ' + err);
//         }
//         else
//         {
//             console.log('data is: ' + JSON.stringify(data));
//         }
//     })
// leftover_data(1);
// var obj = new Reading_Schema({sensorId: 1, temperature: 2, humidity: 3, luminosity: 34});
//     function deletecity(obj)
//     {
//         delete obj.sensorId;
//     }
//     // var obj = {name: 'vaibhav', age: 18, city: 'kanpur'};
//     deletecity(obj);
//     console.log('obj after deleteion' + JSON.stringify(obj));
})

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

app.use('/showcache', (req, res) => {
    res.write('this is hourly cache' + JSON.stringify(last_stored_hours));
    res.write('this is daily cache' + JSON.stringify(last_stored_dates));
    res.write('this is monthly cache' + JSON.stringify(last_stored_months));
    res.write('this is annual cache' + JSON.stringify(last_stored_years));
    res.send();
});

app.use('/storereading', (req, res) => {
    sensorId = req.query.sensorId;
    temperature = req.query.temperature;
    humidity = req.query.humidity;
    luminosity = req.query.luminosity;
    timeStamp = req.query.timeStamp;
    i = req.query.i;
    var reading = new Reading_Schema({sensorId: sensorId, temperature: temperature, humidity: humidity, luminosity: luminosity, timeStamp: timeStamp});
    async function storefinally()
    {
        await storereading(reading);
        res.send('reading stored');
    }
    storefinally();
async function storereading(reading)
{
    // console.log('called storereading functin');
    var current_month = reading.timeStamp.getMonth();
    var current_year = reading.timeStamp.getYear();
    var current_date = reading.timeStamp.getDate();
    var current_hour = reading.timeStamp.getHours();
    var current_sensorId = reading.sensorId;

    console.log('index: ' + i);
    console.log('current reading hour: ' + current_hour);
    console.log('current reading date: ' + current_date);
    console.log('hour cache: ' + JSON.stringify(last_stored_hours));

    var index_prev_hour_in_cache = prev_hour_in_cache(current_sensorId);
    var index_prev_date_in_cache = prev_date_in_cache(current_sensorId);
    var index_prev_month_in_cache = prev_month_in_cache(current_sensorId);
    var index_prev_year_in_cache = prev_year_in_cache(current_sensorId);

    // console.log('index_prev_hour_in_cache: ' + index_prev_hour_in_cache);
    // console.log('index_prev_date_in_cache: ' + index_prev_date_in_cache);
    // console.log('index_prev_month_in_cache: ' + index_prev_month_in_cache);
    // console.log('index_prev_year_in_cache: ' + index_prev_year_in_cache);

    if (index_prev_hour_in_cache != -1  //it's the same hour
        && last_stored_hours[index_prev_hour_in_cache].hour == current_hour    
        && last_stored_hours[index_prev_hour_in_cache].date == current_date
        && last_stored_hours[index_prev_hour_in_cache].month == current_month
        && last_stored_hours[index_prev_hour_in_cache].year == current_year) 
    {
        // console.log('current hour  in cache');
        store_in_existing_hourlyData(current_hour, current_date, current_month, current_year, current_sensorId, reading);
    }
    else//either data is of new hour/day/month/year or this is a completely new sensor
    {
        // console.log('current hour reading not in cache')
        if (index_prev_hour_in_cache == -1)//means completely new sensor
        {
            //do nothing
        }
        else//old sensor, but hour changed
        {
            if (index_prev_date_in_cache != -1
                && last_stored_dates[index_prev_date_in_cache].date == current_date
                && last_stored_dates[index_prev_date_in_cache].month == current_month
                && last_stored_dates[index_prev_date_in_cache].year == current_year)//means it's the same date but hour is different
            {
                //do nothing
            }
            else//it's a different date, will check for month and year
            {
                if (index_prev_date_in_cache == -1)//means new sensor, don't have any prev-date data
                {
                    // do nothing
                }
                else
                { 
                    await combine_hourlyData_to_dailyData(index_prev_hour_in_cache, current_sensorId);
                    if (index_prev_month_in_cache != -1
                        && last_stored_months[index_prev_month_in_cache].month == current_month
                        && last_stored_months[index_prev_month_in_cache].year == current_year)//it's the same month, but date is different
                    {
                        //do nothing
                    }
                    else//it's a different month, will check for year 
                    {
                        if (index_prev_month_in_cache == -1)
                        {
                            //do nothing
                        }
                        else
                        {
                            await combine_dailyData_to_monthlyData(index_prev_date_in_cache, current_sensorId);
                            if (index_prev_year_in_cache != -1
                                && last_stored_years[index_prev_year_in_cache].year == current_year)//it's the same year, but date and  month is different
                            {
                                //do nothing
                            }
                            else
                            {
                                if (index_prev_year_in_cache == -1)
                                {
                                    //do nothing
                                }
                                else
                                {
                                    await combine_monthlyData_to_annualData(index_prev_month_in_cache, current_sensorId);
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
        last_stored_hours.push({
            sensorId: current_sensorId, 
            hour: current_hour, 
            date: current_date, 
            month: current_month, 
            year: current_year
        });
    }
}

// var i=0;
// var dt = new Date(Date.now());
// let i=0;
// var dt = new Date(Date.now());
// // dt.setHours( dt.getHours() + 9);
// var createObjs = setInterval(function(){
//     dt.setMinutes( dt.getMinutes() + 10);
//     var sensorIdToPass = 1;
//     var humidityToPass = Math.floor(Math.random()*3) + 78;
//     var temperatureToPass = Math.floor(Math.random()*13) + 21;
//     var luminosityToPass = Math.floor(Math.random()*23001) + 78;
//     var reading = new Reading_Schema({timeStamp: dt,
//         sensorId: sensorIdToPass,
//         temperature: temperatureToPass,
//         humidity: humidityToPass,
//         luminosity: luminosityToPass})
//     storereading(reading);
//     // console.log('reading is ' + reading);
//     var current_month = reading.timeStamp.getMonth();
//     var current_year = reading.timeStamp.getYear();
//     var current_date = reading.timeStamp.getDate();
//     var current_hour = reading.timeStamp.getHours();
//     var current_sensorId = reading.sensorId;

//     console.log('current reading hour: ' + current_hour);
//     console.log('current reading date: ' + current_date);
//     i = i + 1;
//     if(i==168) {
//         clearInterval(createObjs);
// }}, 3000);


});

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

async function start_server()
{ 
    try
    {
        await prepare_server();
        console.log('***Server started sucessfuly.***');
    }
    catch(err)
    {
        if (server_restart_count < 2)
        {
            log_error(err, 'Some error in starting server');
            console.log('Some error in starting server');
            console.log('Error is: ' + err);
            console.log('Restarting server... ' + (server_restart_count+1) +  '/2 Attempts');
            server_restart_count++;
            last_stored_years.length = 0;
            last_stored_months.length = 0;
            last_stored_dates.length = 0;
            last_stored_hours.length = 0;
            await start_server();
        }
    }
}

async function prepare_server()
{
    async function  restore_hourlyData_cache()
    {
        await Hour_Schema.find({}, (err, hourlyDataArray) => {
            if (err)
            {
                log_error(err, 'error in fetching hourly data from mongoDB to start server');
                console.log('error in fetching hourly data from mongoDB to start server');
                console.log('error is: ' + err);
                throw err;
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
        console.log('Hourly data cache restored.'); 
    }
    
    async function restored_dailyData_cache()
    {
        await Day_Schema.find({}, (err, dailyDataArray) => {
            if (err)
            {
                log_error(err, 'error in fetching daily data from mongoDB to start server');
                console.log('error in fetching daily data from mongoDB to start server');
                console.log('error is: ' + err);
                throw err;
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
        console.log('Daily data cache restored.');   
    }

    async function restore_monthlyData_cache()
    {
        await Month_Schema.find({}, (err, monthlyDataArray) => {
            if (err)
            {
                log_error(err, 'error in fetching monthly data from mongoDB to start server');
                console.log('error in fetching monthly data from mongoDB to start server');
                console.log('error is: ' + err);
                throw err;
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
        console.log('Monthly data cache restored.');
    }
    async function restore_annualData_cache()
    {
        await Year_Schema.find({}, (err, annualDataArray) => {
            if (err)
            {
                log_error(err, 'error in fetching annual data from mongoDB to start server');
                console.log('error in fetching annual data from mongoDB to start server');
                console.log('error is: ' + err);
                throw err;
            }
            else
            {
                for (var i=0;i<annualDataArray.length;i++)
                {
                    last_stored_years.push({
                        sensorId: annualDataArray[i].sensorId,
                        year: annualDataArray[i].year
                    });
                }                    
            }
        });
        console.log('Annual data cache restored.');  
    }
    try
    {
        var [hourlyData, dailyData, monthlyData, annualData] = await Promise.all([restore_hourlyData_cache(),
                                                                                restored_dailyData_cache(),
                                                                                restore_monthlyData_cache(),
                                                                                restore_annualData_cache()]);
        console.log('Cache memory restored successfuly.');
    }
    catch(err)
    {
        log_error(err, 'error in restoring cache memory');
        console.log('error in restoring cache memory');
        console.log('error is: ' + err);
        throw err;

    }
    
}

async function store_in_existing_hourlyData(current_hour, current_date, current_month, current_year, current_sensorId, reading)
{
    // console.log('in store_in_existing_hourly_data');
    await Hour_Schema.findOneAndUpdate({
        hour: current_hour, 
        date: current_date, 
        month:current_month, 
        year:current_year, 
        sensorId: current_sensorId},
        {$addToSet: {readingArray: reading}}, 
        (err, hourlyData) => {
        if (err)
        {
            temp_reading_storage.push(reading);
            log_error(err, 'error in fetching hourly data from queue, sensorId: ' + current_sensorId);
            console.log('error in fetching hourly data from queue, sensorId: ' + current_sensorId);
            console.log('error is ' + err);
        }
        else
        {
            console.log('OLD hour object saved successfuly, hour: ' + current_hour + ', date: ' + current_date);
        }
    });
}

async function store_in_new_hourlyDate(current_hour, current_date, current_month, current_year, current_sensorId, reading)
{
    hourlyData = new Hour_Schema({
        sensorId: current_sensorId, 
        hour: current_hour, 
        date: current_date, 
        month: current_month, 
        year: current_year, 
        readingArray: [reading]
    });
    await hourlyData.save(err => {
        if (err)
        {
            temp_reading_storage.push(reading);
            log_error(err, 'error while saving new hourlyData, sensorId: ' + current_sensorId);
            console.log('error while saving new hourlyData, sensorId: ' + current_sensorId);
            console.log('error is: ' + err);
        }
        else
        {
            console.log('NEW hour object saved successfuly, hour: ' + current_hour + ', date: ' + current_date);
            console.log('');
            console.log('');
        }
    });  
}

async function combine_hourlyData_to_dailyData(index_prev_hour_in_cache, current_sensorId)
{
    var old_date = last_stored_hours[index_prev_hour_in_cache].date;
    var old_month = last_stored_hours[index_prev_hour_in_cache].month;
    var old_year = last_stored_hours[index_prev_hour_in_cache].year;

    await Hour_Schema.find({sensorId: current_sensorId,
                      date: old_date,
                      month: old_month,
                      year: old_year
                    },
        (err, hourlyDataArray) =>
        {
            if (err)
            {
                log_error(err, 'some problem in fetching data in combine_hourlyData_to_DailyData, sensorId: ' + current_sensorId);
                console.log('some problem in fetching data in combine_hourlyData_to_DailyData, sensorId: ' + current_sensorId);
                console.log('error is: ' + err);
            }
            else
            {
                dailyData = new Day_Schema({
                    sensorId: current_sensorId, 
                    date: old_date, 
                    month: old_month, 
                    year: old_year, 
                    hourArray: hourlyDataArray
                });

                async function save_hourlyData_to_dailyData()
                {
                    await dailyData.save(err => {
                        if (err)
                        {
                            log_error(err, 'error while saving hourlyData to dailyData, sensorId: ' + current_sensorId);
                            console.log('error while saving hourlyData to dailyData, sensorId: ' + current_sensorId);
                            console.log('error is ' + err);
                        }
                        else
                        {
                            async function delete_hourlyData()
                            {
                                await Hour_Schema.deleteMany({
                                    sensorId: current_sensorId, 
                                    date: old_date,
                                    month: old_month, 
                                    year: old_year}, (err, obj) => {
                                    if (err)
                                    {
                                        log_error(err, 'error in deleting while converting hourlyDAta to dailyData, sensorId: ' + current_sensorId);
                                        console.log('error in deleting while converting hourlyDAta to dailyData, sensorId: ' + current_sensorId);
                                        console.log('error is : ' +  err);
                                    }
                                    else
                                    {
                                        console.log('hourly data combined to daily data, sensorId: ' + current_sensorId);
                                    }
                                });   
                            }
                            delete_hourlyData();
                        }
                    })
                }
                save_hourlyData_to_dailyData();
            }
        });
}

async function combine_dailyData_to_monthlyData(index_prev_date_in_cache, current_sensorId)
{
    var old_month = last_stored_dates[index_prev_date_in_cache].month;
    var old_year = last_stored_dates[index_prev_date_in_cache].year;

    await Day_Schema.find({sensorId: current_sensorId,
                     month: old_month,
                     year: old_year},
                    (err, dailyDataArray) => {
                        if (err)
                        {
                            log_error(err, 'error while fetching dailyDataArray from mongodb, sensorId: ' + current_sensorId);
                            console.log('error while fetching dailyDataArray from mongodb, sensorId: ' + current_sensorId);
                            console.log('error is: ' + err);
                        }
                        else
                        {
                            monthlyData = new Month_Schema({
                                sensorId: current_sensorId, 
                                month: old_month, 
                                year: old_year , 
                                dateArray: dailyDataArray
                            });
                            async function save_dailyData_to_monthlyData()
                            {
                                await monthlyData.save(err => {
                                    if (err)
                                    {
                                        log_error(err, 'error while saving monthly data, sensorId: ' + current_sensorId);
                                        console.log('error while saving monthly data, sensorId: ' + current_sensorId);
                                        console.log('error is: ' + err);
                                    }
                                    else
                                    {
                                        async function delete_dailyData()
                                        {
                                            await Day_Schema.deleteMany({sensorId: current_sensorId,
                                                                month: old_month, 
                                                                year: old_year},
                                                                (err, obj) => {
                                                                    if (err)
                                                                    {
                                                                        log_error(err, 'error in deleting while converting dailyData to monthlyData, sensorId: ' + current_sensorId);
                                                                        console.log('error in deleting while converting dailyData to monthlyData, sensorId: ' + current_sensorId);
                                                                        console.log('error is : ' +  err);
                                                                    }
                                                                    else
                                                                    {
                                                                        console.log('daily data combined to monthy data, sensorId: ' + current_sensorId);

                                                                    }
                                                                });
                                        }
                                        delete_dailyData();
                                    }
                                });
                            }
                            save_dailyData_to_monthlyData();
                        }
                    });
}

async function combine_monthlyData_to_annualData(index_prev_month_in_cache, current_sensorId)
{
    var old_year = last_stored_months[index_prev_month_in_cache].year

    await Month_Schema.find({sensorId: current_sensorId,
                       year: old_year},
                       (err, monthlyDataArray) => {
                           if (err)
                           {
                               log_error(err, 'error while fetching monthly data in combine_monthlyData_to_annualData, sensorId: ' + current_sensorId);
                               console.log('error while fetching monthly data in combine_monthlyData_to_annualData, sensorId: ' + current_sensorId);
                               console.log('error is: ' + err);
                           }
                           else
                           {
                                annualData = new Year_Schema({
                                    sensorId: current_sensorId, 
                                    year: current_year, 
                                    monthArray: monthlyDataArray
                                });
                                async function save_monthlyData_to_annualData()
                                {
                                    await annualData.save(err => {
                                        if (err)
                                        {
                                            log_error(err, 'error while save annualData, sensorId: ' + current_sensorId);
                                            console.log('error while save annualData, sensorId: ' + current_sensorId);
                                            console.log('error is: ' + err);
                                        }
                                        else
                                        {
                                            console.log('monthly data combined to annual data, sensorId: ' + current_sensorId);
                                            async function delete_monthlyData()
                                            {
                                                await Month_Schema.deleteMany({sensorId: current_sensorId,
                                                                            year: old_year},
                                                                            (err, obj) => {
                                                                                if (err)
                                                                                {
                                                                                    log_error(err, 'error in deleting while converting monthlyDAta to annualData, sensorId: ' + current_sensorId);
                                                                                    console.log('error in deleting while converting monthlyDAta to annualData, sensorId: ' + current_sensorId);
                                                                                    console.log('error is : ' +  err);
                                                                                }
                                                                                else
                                                                                {
                                                                                    console.log('monthly data combined to annual data, sensorId: ' + current_sensorId);
                                                                                }
                                                                            });
                                            }
                                            delete_monthlyData();
                                        }
                                    });
                                }
                                save_monthlyData_to_annualData();
                           }
                       });
}

async function leftover_data(current_sensorId)
{
    var leftover_hourlyData = [];
    var leftover_dailyData = [];
    var leftover_monthlyData = [];

    var index_prev_hour_in_cache = prev_hour_in_cache(current_sensorId);
    var index_prev_date_in_cache = prev_date_in_cache(current_sensorId);
    var index_prev_month_in_cache = prev_month_in_cache(current_sensorId);

    Hour_Schema.find({sensorId: current_sensorId}, (err, allHourlyData) => {
        if (err)
        {
            log_error(err, 'error while fetching data to clear previous hourly values');
            console.log('error while fetching data to clear previous hourly values');
            console.log('Error is: ' + err);
        }
        else
        {
            for (var i=0;i<allHourlyData.length;i++)
            {
                if (allHourlyData[i].date == last_stored_hours[index_prev_hour_in_cache].date
                    && allHourlyData[i].month == last_stored_hours[index_prev_hour_in_cache].month
                    && allHourlyData[i].year == last_stored_hours[index_prev_hour_in_cache].year)
                {
                    //do nothing
                }
                else
                {
                    leftover_hourlyData.push(allHourlyData[i]);
                }
            }
            console.log('leftover_hourlyData: ' + leftover_hourlyData);
        }
    });
    Day_Schema.find({sensorId: current_sensorId}, (err, allDailyData) => {
        if (err)
        {
            log_error(err, 'error while fetching data to clear previous daily values');
            console.log('error while fetching data to clear previous daily values');
            console.log('Error is: ' + err);
        }
        else
        {
            for (var i=0;i<allDailyData.length;i++)
            {
                if (allDailyData[i].month == last_stored_dates[index_prev_date_in_cache].month
                    && allDailyData[i].year == last_stored_dates[index_prev_date_in_cache].year)
                {
                    //do nothing
                }
                else
                {
                    leftover_dailyData.push(allDailyData[i]);
                }
            }
            console.log('leftover_dailyData: ' + leftover_dailyData);
        }
    });
    Month_Schema.find({sensorId: current_sensorId}, (err, allMonthlyData) => {
        if (err)
        {
            log_error(err, 'error while fetching data to clear previous monthly values');
            console.log('error while fetching data to clear previous monthly values');
            console.log('Error is: ' + err);
        }
        else
        {
            for (var i=0;i<allMonthlyData.length;i++)
            {
                if (allMonthlyData[i].year == last_stored_months[index_prev_month_in_cache].year)
                {
                    //do nothing
                }
                else
                {
                    leftover_monthlyData.push(allMonthlyData[i]);
                }
            }
        }
        console.log('leftover_monthlyData: ' + leftover_monthlyData);
    });
}

function log_error(err, message)
{
    const fs = require('fs');
    var error = new Date() + "\nMessage: " + message  + "\nError: " + JSON.stringify(err) + '\n';
    fs.appendFile("./errorlog.txt", error, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Error logged");
    });

}

app.listen(3000, () => {
    console.log('listening at 3000');
    console.log('Starting server. Please wait...');
})
