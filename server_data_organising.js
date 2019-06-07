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
    /*let the user choose sensor id, time interval and y/h/m/d data. 
    For now, focusing on temperature data. Assume the user wants the mean.*/
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
    if (timeBeginForUser.getYear()<timeEndForUser.getYear())
    {
        Year_Schema.find({ 
        year: {$gte: timeBeginForUser.getYear(), $lte: timeEndForUser.getYear()},
        sensorId: sensorIdFromUser, monthArray: {$ne: []}
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
                    console.log("Year:"+yearsMatchingUserQuery[i].year+", Sensor: "+
                    yearsMatchingUserQuery[i].sensorId+
                    ", Months: "+yearsMatchingUserQuery[i].monthArray.length);
                    var monthlyTempDataObject = {bigArray: []};
                    // dataArr.push({hour: JSON.stringify(i+1) + " hour", dataValue: data.readingArray[i].temperature});
                    for (var j=0;j<yearsMatchingUserQuery[i].monthArray.length;j++)
                    {
                        // console.log("Traversing months:");
                        var dailyTempDataObject = {bigArray: []};
                        let y=yearsMatchingUserQuery[i]; //for brevity
                        if (((y.monthArray[j].month<timeBeginForUser.getMonth()+1)&&
                        (y.year==timeBeginForUser.getYear()))
                        || ((y.monthArray[j].month>timeEndForUser.getMonth()+1)&&
                        (y.year==timeEndForUser.getYear())))
                        {
                            console.log("hit continue"+timeBeginForUser.getMonth());
                            continue;
                        }
                        for (var k=0;k<y.monthArray[j].dayArray.length;k++)
                        {
                            var hourlyTempDataObject = {bigArray: []};
                            let m=yearsMatchingUserQuery[i].monthArray[j];
                            if (((m.dayArray[k].date<timeBeginForUser.getDate())&&
                            (m.month==timeBeginForUser.getMonth()+1))
                            || ((m.dayArray[k].date>timeEndForUser.getDate())&&
                            (m.month==timeEndForUser.getMonth()+1)))
                            {
                                continue;
                            }
                            for (var l=0;l<m.dayArray[k].hourArray.length; l++)
                            {
                                //here
                                var tempDataArray = [];
                                let d=yearsMatchingUserQuery[i].monthArray[j].dayArray[k];
                                if (((d.hourArray[l].hour<timeBeginForUser.getHours())&&
                                (d.date==timeBeginForUser.getDate()))
                                || ((d.hourArray[l].hour>timeEndForUser.getHours())&&
                                (d.date==timeEndForUser.getDate())))
                                {
                                    continue;
                                }
                                for (var z=0;z<d.hourArray[l].readingArray.length; z++)
                                {
                                    let h=yearsMatchingUserQuery[i].monthArray[j].dayArray[k].hourArray[l];
                                    /* console.log("readings: "+yearsMatchingUserQuery[i].monthArray[j]
                                    .dayArray[k].hourArray[l].readingArray[z]);*/
                                    tempDataArray.push(h.readingArray[z].temperature);
                                }
                                labelToPass = d.date+"-"+m.month+"-"+(y.year+1900)+", Hour "+d.hourArray[l].hour;
                                checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass);
                            }
                            labelToPass = m.dayArray[k].date+"-"+m.month+"-"+(y.year+1900);
                            checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                                frequencyFromUser,2,labelToPass);
                        }
                        labelToPass = y.monthArray[j].month+"-"+(y.year+1900);
                        checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                            frequencyFromUser,1,labelToPass);
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
    }
    let tB=timeBeginForUser, tE=timeEndForUser;
    if (tE.getYear()==Date.now().getYear())
    {
        var startMonth = new Date(timeBeginForUser);
        var p = (tB.getYear()==tE.getYear)? tB.getMonth(): 0;
        if (p==0)
        {
            startMonth.setMonth(0);
            startMonth.setFullYear(tE.getFullYear());
            startMonth.setDate(1);
            startMonth.setHours(0);
        }
        Month_Schema.find({ 
        month: {$gte: startMonth.getMonth(), $lte: tE.getMonth()},
        year: tE.getYear(),
        sensorId: sensorIdFromUser, dayArray: {$ne: []}
        },(err,monthsMatchingUserQuery) => {
            if(err)
            {
                console.log('Error in Graph testing'+ err);
            }
            else
            {
                console.log("result llength:" + monthsMatchingUserQuery.length);
                // console.log("Hourly data:" + JSON.stringify(data.readingArray[0]));
                // console.log("Hourly data:" + JSON.stringify(data.readingArray[0].timeStamp.getHours()));
                // console.log("Temperature:" + JSON.stringify(data.readingArray[0].temperature)); 
                // console.log('lenght of data' + data.readingArray.length);
                // var yearlyTempDataArray = [];
                var monthlyTempDataObject = {bigArray: []};
                for (var j=0;j<monthsMatchingUserQuery.length;j++)
                    {
                        let m=monthsMatchingUserQuery[j];
                        console.log("Traversing months:");
                        var dailyTempDataObject = {bigArray: []};
                        for (var k=0;k<monthsMatchingUserQuery[j].dayArray.length;k++)
                        {
                            var hourlyTempDataObject = {bigArray: []};
                            if (((monthsMatchingUserQuery[j].dayArray[k].date<startMonth.getDate())&&
                            (monthsMatchingUserQuery[j].month==startMonth.getMonth()+1))
                            || ((monthsMatchingUserQuery[j].dayArray[k].date>tE.getDate())&&
                            (monthsMatchingUserQuery[j].month==tE.getMonth()+1)))
                            {
                                continue;
                            }
                            for (var l=0;l<m.dayArray[k].hourArray.length; l++)
                            {
                                //here
                                var tempDataArray = [];
                                let d=m.dayArray[k];
                                if (((d.hourArray[l].hour<startMonth.getHours())&&
                                (d.date==startMonth.getDate()))
                                || ((d.hourArray[l].hour>timeEndForUser.getHours())&&
                                (d.date==timeEndForUser.getDate())))
                                {
                                    continue;
                                }
                                for (var z=0;z<d.hourArray[l].readingArray.length; z++)
                                {
                                    let h=d.hourArray[l];
                                    /* console.log("readings: "+yearsMatchingUserQuery[i].monthArray[j]
                                    .dayArray[k].hourArray[l].readingArray[z]);*/
                                    tempDataArray.push(h.readingArray[z].temperature);
                                }
                                labelToPass = d.date+"-"+m.month+"-"+(m.year+1900)+", Hour "+d.hourArray[l].hour;
                                checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass);
                            }
                            labelToPass = m.dayArray[k].date+"-"+m.month+"-"+(m.year+1900);
                            checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                                frequencyFromUser,2,labelToPass);
                        }
                        labelToPass = m.month+"-"+(m.year+1900);
                        checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                            frequencyFromUser,1,labelToPass);
                    }
                    if (frequencyFromUser==0)
                    {
                        calculateMeanAndAppend(monthlyTempDataObject.bigArray);
                        labelToPass = (tE.getYear()+1900).toString();
                        finalSensorLabelsArr.push(labelToPass);
                    }
                    // else
                    // {
                    //     console.log("Invalid value of frequency!");
                    // }
        // console.log('printing obj' + JSON.stringify(obj));
                sendingData = {temperatures: finalSensorDataArr, labels: finalSensorLabelsArr};
                res.json(sendingData);    
                console.log("Final sensor data: "+JSON.stringify(finalSensorDataArr)); 
                console.log("Final labels array: "+JSON.stringify(finalSensorLabelsArr));             
            }
        })
    }
    if (tE.getMonth()==Date.now().getMonth())
    {
        var startDate = new Date(timeBeginForUser);
        var p = (tB.getDate()==tE.getDate())? tB.getDate(): 1;
        if (p==1)
        {
            startDate.setMonth(tE.getMonth());
            startDate.setFullYear(tE.getFullYear());
            startDate.setDate(1);
            startDate.setHours(0);
        }
        Day_Schema.find({ 
        date: {$gte: startDate.getDate(), $lte: tE.getDate()},
        month: tE.getMonth(),
        year: tE.getYear(),
        sensorId: sensorIdFromUser, hourArray: {$ne: []}
        },(err,daysMatchingUserQuery) => {
            if(err)
            {
                console.log('Error in Graph testing'+ err);
            }
            else
            {
                console.log("result llength:" + daysMatchingUserQuery.length);
                // console.log("Hourly data:" + JSON.stringify(data.readingArray[0]));
                // console.log("Hourly data:" + JSON.stringify(data.readingArray[0].timeStamp.getHours()));
                // console.log("Temperature:" + JSON.stringify(data.readingArray[0].temperature)); 
                // console.log('lenght of data' + data.readingArray.length);
                // var yearlyTempDataArray = [];
                var monthlyTempDataObject = {bigArray: []};
                var dailyTempDataObject = {bigArray: []};
                for (var k=0;k<daysMatchingUserQuery.length;k++)
                {
                    let d=daysMatchingUserQuery[k];
                    var hourlyTempDataObject = {bigArray: []};
                    for (var l=0;l<daysMatchingUserQuery[k].hourArray.length; l++)
                    {
                        //here
                        var tempDataArray = [];
                        if (((d.hourArray[l].hour<startDate.getHours())&&
                        (d.date==startDate.getDate()))
                        || ((d.hourArray[l].hour>timeEndForUser.getHours())&&
                        (d.date==timeEndForUser.getDate())))
                        {
                            continue;
                        }
                        for (var z=0;z<d.hourArray[l].readingArray.length; z++)
                        {
                            let h=d.hourArray[l];
                            /* console.log("readings: "+yearsMatchingUserQuery[i].monthArray[j]
                            .dayArray[k].hourArray[l].readingArray[z]);*/
                            tempDataArray.push(h.readingArray[z].temperature);
                        }
                        labelToPass = d.date+"-"+d.month+"-"+(d.year+1900)+", Hour "+d.hourArray[l].hour;
                        checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass);
                    }
                    labelToPass = d.date+"-"+d.month+"-"+(d.year+1900);
                    checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                    frequencyFromUser,2,labelToPass);
                }
                labelToPass = tE.getMonth()+"-"+(tE.getYear()+1900);
                checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                    frequencyFromUser,1,labelToPass);
                if (frequencyFromUser==0)
                {
                    calculateMeanAndAppend(monthlyTempDataObject.bigArray);
                    labelToPass = (tE.getYear()+1900).toString();
                    finalSensorLabelsArr.push(labelToPass);
                }
                    // else
                    // {
                    //     console.log("Invalid value of frequency!");
                    // }
        // console.log('printing obj' + JSON.stringify(obj));
                sendingData = {temperatures: finalSensorDataArr, labels: finalSensorLabelsArr};
                res.json(sendingData);    
                console.log("Final sensor data: "+JSON.stringify(finalSensorDataArr)); 
                console.log("Final labels array: "+JSON.stringify(finalSensorLabelsArr));             
            }
            
        })
    }
    if (tE.getDate()==Date.now().getDate())
    {
        var startHour = new Date(timeBeginForUser);
        var p = (tB.getHours()==tE.getHours())? 0: 1;
        if (p==1)
        {
            startHour.setMonth(tE.getMonth());
            startHour.setFullYear(tE.getFullYear());
            startHour.setDate(tE.getDate());
            startHour.setHours(0);
        }
        Hour_Schema.find({ 
        hour: {$gte: startHour.getHours(), $lte: tE.getHours()},
        date: tE.getDate(),
        month: tE.getMonth(),
        year: tE.getYear(),
        sensorId: sensorIdFromUser, readingArray: {$ne: []}
        },(err,hoursMatchingUserQuery) => {
            if(err)
            {
                console.log('Error in Graph testing'+ err);
            }
            else
            {
                console.log("result llength:" + hoursMatchingUserQuery.length);
                // console.log("Hourly data:" + JSON.stringify(data.readingArray[0]));
                // console.log("Hourly data:" + JSON.stringify(data.readingArray[0].timeStamp.getHours()));
                // console.log("Temperature:" + JSON.stringify(data.readingArray[0].temperature)); 
                // console.log('lenght of data' + data.readingArray.length);
                // var yearlyTempDataArray = [];
                var monthlyTempDataObject = {bigArray: []};
                var dailyTempDataObject = {bigArray: []};
                var hourlyTempDataObject = {bigArray: []};
                for (var l=0;l<hoursMatchingUserQuery.length; l++)
                {
                    //here
                    let h=hoursMatchingUserQuery[l];
                    var tempDataArray = [];
                    if (((h.hour<startHour.getHours())&&
                    (h.date==startHour.getDate()))
                    || ((h.hour>timeEndForUser.getHours())&&
                    (h.date==timeEndForUser.getDate())))
                    {
                        continue;
                    }
                    for (var z=0;z<h.readingArray.length; z++)
                    {
                        /* console.log("readings: "+yearsMatchingUserQuery[i].monthArray[j]
                        .dayArray[k].hourArray[l].readingArray[z]);*/
                        tempDataArray.push(h.readingArray[z].temperature);
                    }
                    labelToPass = h.date+"-"+h.month+"-"+(h.year+1900)+", Hour "+h.hour;
                    checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass);
                }
                labelToPass = tE.getDate()+"-"+tE.getMonth()+"-"+(tE.getYear()+1900);
                checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                    frequencyFromUser,2,labelToPass);
                labelToPass = tE.getMonth()+"-"+(tE.getYear()+1900);
                checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                    frequencyFromUser,1,labelToPass);
                if (frequencyFromUser==0)
                {
                    calculateMeanAndAppend(monthlyTempDataObject.bigArray);
                    labelToPass = (tE.getYear()+1900).toString();
                    finalSensorLabelsArr.push(labelToPass);
                }
                    // else
                    // {
                    //     console.log("Invalid value of frequency!");
                    // }
        // console.log('printing obj' + JSON.stringify(obj));
                sendingData = {temperatures: finalSensorDataArr, labels: finalSensorLabelsArr};
                res.json(sendingData);    
                console.log("Final sensor data: "+JSON.stringify(finalSensorDataArr)); 
                console.log("Final labels array: "+JSON.stringify(finalSensorLabelsArr));             
            }
            
        })
    }   
      
})
