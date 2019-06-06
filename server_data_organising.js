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


var last_stored_years = [] ; //array to store timestamps of last stored annual data in queue
var last_stored_months = [];//array to store timestamps of last stored monthly data in queue
var last_stored_days = [];//array to store timestamps of last stored daily data in queue
var last_stored_hours = [];//array to store timestamps of last stored hourly data in queue

//****************************** introduce hashing to it later.
//****************************** also flush data if sensor stops working

var working_sensors = []//use this to find and clear data of faulty servers from mongodb

var finalSensorDataArr = []; // final list of readings for user
var finalSensorLabelsArr = [];
function calculateMeanAndAppend(smallArray)
{
    var sum = 0;
    for( var i = 0; i < smallArray.length; i++ )
    {
        sum += parseInt( smallArray[i], 10 ); //don't forget to add the base
    }
    var avg = sum/smallArray.length;
    finalSensorDataArr.push(avg);
}
function checkMergeOrCalculate(smallArray, objectForBigArray, frequency, desired_frequency, label)
{
    if (frequency==desired_frequency)
    {
        calculateMeanAndAppend(smallArray);
        //break;
        finalSensorLabelsArr.push(label);
    }
    else if (frequency<desired_frequency)
    {
        objectForBigArray.bigArray = objectForBigArray.bigArray.concat(smallArray);
    }
    else
    {
        console.log("Mismatch!");
    }
}

app.use('/test', (req, res) => {
    console.log('req.name: '+ req.query.name);
})

app.use('/graphtesting', (req, res) => {
    //var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});

    // var current_month =  reading.timeStamp.getMonth();
    // var current_year = reading.timeStamp.getYear();
    // var current_day = reading.timeStamp.getDate();
    // var current_hour = reading.timeStamp.getHours();
    // var current_sensorId = reading.sensorId;
    var labelToPass;
    //let the user choose sensor id, time interval and y/h/m/d data. For now, focusing on temperature data. Assume the user wants the mean.
    var sensorIdFromUser = 1;
    var timeBeginForUser = new Date(Date.now());
    var timeEndForUser = new Date(Date.now());
    timeEndForUser.setDate(timeEndForUser.getDate()+1);
    var frequencyFromUserInWords = "hourly";
    var frequencyFromUser;
    switch (frequencyInWords)
    {
        case "hourly":
            frequencyFromUser = 3;
            break;
        case "daily":
            frequencyFromUser = 2;
            break;
        case "monthly":
            frequencyFromUser = 1;
            break;
        case "yearly":
            frequencyFromUser = 0;
            break;
        default:
            frequencyFromUser = -1;
            break;
    }
    
    Year_Schema.find({ 
            // date: current_day, 
            // month:current_month, 
            // year: {$gte: timeBeginForUser.getYear(), $lte: timeEndForUser.getYear()},
            // sensorId: sensorIdFromUser, monthArray: {$ne: []}
            },(err,yearsMatchingUserQuery) => {
                if(err)
                {
                    console.log('Error in Graph testing'+ err);
                }
                else
                {
                    console.log("result llength:" + yearsMatchingUserQuery.length);
                    // console.log("Hourly data:" + JSON.stringify(data.readingArray[0]));
                    // console.log("Hourly data:" + JSON.stringify(data.readingArray[0].timeStamp.getHours()));
                    // console.log("Temperature:" + JSON.stringify(data.readingArray[0].temperature)); 
                    // console.log('lenght of data' + data.readingArray.length);
                    var yearlyTempDataArray = [];
                    for (var i=0;i<yearsMatchingUserQuery.length;i++)
                    {
                        console.log("Year:"+yearsMatchingUserQuery[i].year+", Sensor: "+yearsMatchingUserQuery[i].sensorId+
                        ", Months: "+yearsMatchingUserQuery[i].monthArray.length);
                        var monthlyTempDataObject = {bigArray: []};
                        // dataArr.push({hour: JSON.stringify(i+1) + " hour", dataValue: data.readingArray[i].temperature});
                        for (var j=0;j<yearsMatchingUserQuery[i].monthArray.length;j++)
                        {
                            console.log("Traversing months:");
                            var dailyTempDataObject = {bigArray: []};
                            if (((yearsMatchingUserQuery[i].monthArray[j].month<timeBeginForUser.getMonth()+1)&&
                            (yearsMatchingUserQuery[i].year==timeBeginForUser.getYear()))
                            || ((yearsMatchingUserQuery[i].monthArray[j].month>timeEndForUser.getMonth()+1)&&
                            (yearsMatchingUserQuery[i].year==timeEndForUser.getYear())))
                            {
                                console.log("hit continue"+timeBeginForUser.getMonth());
                                continue;
                            }
                            for (var k=0;k<yearsMatchingUserQuery[i].monthArray[j].dayArray.length;k++)
                            {
                                var hourlyTempDataObject = {bigArray: []};
                                if (((yearsMatchingUserQuery[i].monthArray[j].dayArray[k].date<timeBeginForUser.getDate())&&
                                (yearsMatchingUserQuery[i].monthArray[j]==timeBeginForUser.getMonth()+1))
                                || ((yearsMatchingUserQuery[i].monthArray[j].dayArray[k].date>timeEndForUser.getDate())&&
                                (yearsMatchingUserQuery[i].monthArray[j]==timeEndForUser.getMonth()+1)))
                                {
                                    continue;
                                }
                                for (var l=0;l<yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray.length; l++)
                                {

                                    var tempDataArray = [];
                                    if (((yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l]<timeBeginForUser.getHours())&&
                                    (yearsMatchingUserQuery[i].dayArray[j]==timeBeginForUser.getDate()))
                                    || ((yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l]>timeEndForUser.getHours())&&
                                    (yearsMatchingUserQuery[i].dayArray[j]==timeEndForUser.getDate())))
                                    {
                                        continue;
                                    }
                                    for (var m=0;m<yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l].readingArray.length; m++)
                                    {
                                        console.log("readings: "+yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l].readingArray[m]);
                                        tempDataArray.push(yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l].readingArray[m].temperature);
                                    }
                                    labelToPass = yearsMatchingUserQuery[i].monthArray[j].dayArray[k].date+"-"+yearsMatchingUserQuery[i].monthArray[j].month
                                    +"-"+(yearsMatchingUserQuery[i].year+1900)+", Hour "+yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l].hour;
                                    checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass);
                                }
                                labelToPass = yearsMatchingUserQuery[i].monthArray[j].dayArray[k].date+"-"+yearsMatchingUserQuery[i].monthArray[j].month
                                    +"-"+(yearsMatchingUserQuery[i].year+1900);
                                checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,frequencyFromUser,2,labelToPass);
                            }
                            labelToPass = yearsMatchingUserQuery[i].monthArray[j].month
                            +"-"+(yearsMatchingUserQuery[i].year+1900);
                            checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,frequencyFromUser,1,labelToPass);
                        }
                        if (frequencyFromUser==0)
                        {
                            calculateMeanAndAppend(monthlyTempDataObject.bigArray);
                            labelToPass = (yearsMatchingUserQuery[i].year+1900).toString();
                            finalSensorLabelsArr.push(labelToPass);

                        }
                        // else
                        // {
                        //     console.log("Invalid value of frequency!");
                        // }
                    }
            // console.log('printing obj' + JSON.stringify(obj));
                    sendingData = {temperatures: finalSensorDataArr, labels: finalSensorLabelsArr};
                    res.json(sendingData);    
                    console.log("Final sensor data: "+JSON.stringify(finalSensorDataArr)); 
                    console.log("Final labels array: "+JSON.stringify(finalSensorLabelsArr));             
                }
                
            })
            
      
})
