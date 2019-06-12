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


//****store all these years persistenly also */
var last_stored_year = new Date().getYear() ; //variable to store last_year
var last_stored_month = new Date().getMonth() ;//array to store timestamps of last stored monthly data in queue
var last_stored_day = new Date().getDate() ;//array to store timestamps of last stored daily data in queue
var last_stored_hours = [];//array to store timestamps of last stored hourly data in queue

//****************************** introduce hashing to it later.
//****************************** also flush data if sensor stops working

var working_sensors = []//use this to find and clear data of faulty servers from mongodb
// var finalSensorDataArr=[];
// var finalSensorLabelsArr=[];

function calculateMeanAndAppend(smallArray,fObj)
{
    var sum = 0;
    for( var i = 0; i < smallArray.length; i++ )
    {
        sum += parseInt( smallArray[i], 10 ); //don't forget to add the base
    }
    var avg = sum/smallArray.length;
    fObj.Array.push(avg);
    // console.log("Final data is: ",finalSensorDataArr);
}
function checkMergeOrCalculate(smallArray, objectForBigArray, frequency, desired_frequency, label, fObj, lObj)
{
    if (frequency==desired_frequency)
    {
        calculateMeanAndAppend(smallArray, fObj);
        //break;
        lObj.Array.push(label);
    }
    else if (frequency<desired_frequency)
    {
        objectForBigArray.bigArray = objectForBigArray.bigArray.concat(smallArray);
    }
    console.log("labels are "+JSON.stringify(lObj.Array));
    console.log("values are "+JSON.stringify(fObj.Array));
}


// var sensorIdFromUser = 0
// var startYear_ = 0;
// var startMonth_ = 0;
// var startDay_= 0;
// var startHour_ = 0;
// var endYear_ = 0;
// var endMonth_ = 0;
// var endDay_= 0;
// var endHour_ = 0;
// var frequencyFromUserInWords = 0;


// app.use('/storequery', (req, res) => {
//     sensorIdFromUser = req.query.sensorId;
//     startYear_ = req.query.startYear;
//     startMonth_ = req.query.startMonth;
//     startDay_= req.query.startDay;
//     startHour_ = req.query.startHour;
//     endYear_ = req.query.endYear;
//     endMonth_ = req.query.endMonth;
//     endDay_= req.query.endDay;
//     endHour_ = req.query.endHour;
//     frequencyFromUserInWords = req.query.frequency;
// })

app.use('/graphdata', (req, res) => {
    // graphtesting();
   var sendingData = {temperatures: [], labels: []};
    async function graphtesting()
    {

    var finalSensorDataArr = {Array: []};
    var finalSensorLabelsArr = {Array: []};
    /*let the user choose sensor id, time interval and y/h/m/d data. 
    For now, focusing on temperature data. Assume the user wants the mean.*/
    var sensorIdFromUser = req.query.sensorId;
    var startYear_ = req.query.startYear;
    var startMonth_ = req.query.startMonth;
    var startDay_= req.query.startDay;
    var startHour_ = req.query.startHour;
    var endYear_ = req.query.endYear;
    var endMonth_ = req.query.endMonth;
    var endDay_= req.query.endDay;
    var endHour_ = req.query.endHour;
    var frequencyFromUserInWords = req.query.frequency;

    var timeBeginForUser = new Date(startYear_,startMonth_,startDay_,startHour_);
    var timeEndForUser = new Date(endYear_,endMonth_,endDay_,endHour_);
     console.log("This is requested: " + JSON.stringify(req.query))   
    console.log("Time begin: "+timeBeginForUser);
    console.log("Time end: "+timeEndForUser);

    var frequencyFromUser;
    switch (frequencyFromUserInWords)
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
        await Year_Schema.find({ 
        year: {$gte: timeBeginForUser.getYear(), $lte: timeEndForUser.getYear()},
        sensorId: sensorIdFromUser, monthArray: {$ne: []}
        },(err,yearsMatchingUserQuery) => {
            if(err)
            {
                console.log('Error in Graph testing'+ err);
            }
            else
            {
                var yearlyTempDataArray = [];
                for (var i=0;i<yearsMatchingUserQuery.length;i++)
                {
                    console.log("Year:"+yearsMatchingUserQuery[i].year+", Sensor: "+
                    yearsMatchingUserQuery[i].sensorId+
                    ", Months: "+yearsMatchingUserQuery[i].monthArray.length);
                    var monthlyTempDataObject = {bigArray: []};
                    for (var j=0;j<yearsMatchingUserQuery[i].monthArray.length;j++)
                    {
                        var dailyTempDataObject = {bigArray: []};
                        let y=yearsMatchingUserQuery[i]; //for brevity
                        if (((y.monthArray[j].month<timeBeginForUser.getMonth()+1)&&         //check if we need to add ti,....getmonth+1
                        (y.year==timeBeginForUser.getYear()))
                        || ((y.monthArray[j].month>timeEndForUser.getMonth()+1)&&            //to skip data outside the time interval
                        (y.year==timeEndForUser.getYear())))
                        {
                            continue;
                        }
                        for (var k=0;k<y.monthArray[j].dayArray.length;k++)
                        {
                            var hourlyTempDataObject = {bigArray: []};
                            let m=yearsMatchingUserQuery[i].monthArray[j];  //for brevity 
                            if (((m.dayArray[k].date<timeBeginForUser.getDate())&&
                            (m.month==timeBeginForUser.getMonth()+1))
                            || ((m.dayArray[k].date>timeEndForUser.getDate())&&
                            (m.month==timeEndForUser.getMonth()+1)))
                            {
                                continue;
                            }
                            for (var l=0;l<m.dayArray[k].hourArray.length; l++)
                            {
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
                                    tempDataArray.push(h.readingArray[z].temperature);
                                }
                                console.log("label passed 188")
                                labelToPass = d.date+"-"+m.month+"-"+(y.year+1900)+", Hour "+d.hourArray[l].hour;
                                checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass, 
                                    finalSensorDataArr, finalSensorLabelsArr);
                            }
                            labelToPass = m.dayArray[k].date+"-"+m.month+"-"+(y.year+1900);
                            checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                                frequencyFromUser,2,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                        }
                        labelToPass = y.monthArray[j].month+"-"+(y.year+1900);
                        checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                            frequencyFromUser,1,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                    }
                    if (frequencyFromUser==0)
                    {
                        calculateMeanAndAppend(monthlyTempDataObject.bigArray, finalSensorDataArr);
                        labelToPass = (yearsMatchingUserQuery[i].year+1900).toString();
                        finalSensorLabelsArr.Array.push(labelToPass);
                    } 
                }               
            }
        });
    }

    let tB=timeBeginForUser, tE=timeEndForUser;
  
    if (tE.getYear()==tB.getYear() && tE.getMonth()>tB.getMonth())
    {  
        var startMonth = new Date(timeBeginForUser);
        
        var p = (tB.getYear()==tE.getYear()) ? tB.getMonth(): -1;
        if (p==-1)
        {
            startMonth.setMonth(0);
            startMonth.setFullYear(tE.getFullYear());
            startMonth.setDate(1);
            startMonth.setHours(0);
        }
        await Month_Schema.find({ month: {$gte: tB.getMonth()+1, $lte: tE.getMonth()+1},
        year: tE.getYear(),
        sensorId: sensorIdFromUser, dayArray: {$ne: []}
        
        },(err,monthsMatchingUserQuery) => {
            if(err)
            {
                console.log('Error in Graph testing'+ err);
            }
            else
            {      
                var monthlyTempDataObject = {bigArray: []};
                for (var j=0;j<monthsMatchingUserQuery.length;j++)
                    {
                        let m=monthsMatchingUserQuery[j];
                       
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
                                    
                                    tempDataArray.push(h.readingArray[z].temperature);
                                }
                                labelToPass = d.date+"-"+m.month+"-"+(m.year+1900)+", Hour "+d.hourArray[l].hour;
                                checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass,
                                    finalSensorDataArr, finalSensorLabelsArr);
                            }
                            labelToPass = m.dayArray[k].date+"-"+m.month+"-"+(m.year+1900);
                            checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                                frequencyFromUser,2,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                        }
                        labelToPass = m.month+"-"+(m.year+1900);
                        checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                            frequencyFromUser,1,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                    }
                    if (frequencyFromUser==0)
                    {
                        calculateMeanAndAppend(monthlyTempDataObject.bigArray, finalSensorDataArr);
                        labelToPass = (tE.getYear()+1900).toString();
                        finalSensorLabelsArr.Array.push(labelToPass);
                    }              
            }
        });
    }
    
    if (tE.getMonth()==tE.getMonth() && tB.getDate()<tE.getDate())
    {
        var startDate = timeBeginForUser;
        
        var p = (tB.getDate()==tE.getDate())? tB.getDate(): -1;
        if (p==-1)
        {
            startDate.setMonth(tE.getMonth());
            startDate.setFullYear(tE.getFullYear());
            startDate.setDate(1);
            startDate.setHours(0);
        }
       
        await Day_Schema.find({ 
        date: {$gte: tB.getDate(), $lte: tE.getDate()},
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
                var monthlyTempDataObject = {bigArray: []};
                var dailyTempDataObject = {bigArray: []};
                for (var k=0;k<daysMatchingUserQuery.length;k++)
                {
                    let d=daysMatchingUserQuery[k];
                    var hourlyTempDataObject = {bigArray: []};
                    for (var l=0;l<daysMatchingUserQuery[k].hourArray.length; l++)
                    {
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
                            tempDataArray.push(h.readingArray[z].temperature);
                        }
                        labelToPass = d.date+"-"+d.month+"-"+(d.year+1900)+", Hour "+d.hourArray[l].hour;
                        checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass,
                            finalSensorDataArr, finalSensorLabelsArr);
                    }
                    labelToPass = d.date+"-"+d.month+"-"+(d.year+1900);
                    checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                    frequencyFromUser,2,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                }
                labelToPass = tE.getMonth()+"-"+(tE.getYear()+1900);
                checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                    frequencyFromUser,1,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                if (frequencyFromUser==0)
                {
                    calculateMeanAndAppend(monthlyTempDataObject.bigArray, finalSensorDataArr);
                    labelToPass = (tE.getYear()+1900).toString();
                    finalSensorLabelsArr.Array.push(labelToPass);
                }       
            }
        });

        console.log("360:"+ JSON.stringify(finalSensorDataArr));
    }
   
    if (tE.getDate()==tB.getDate())
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
        await Hour_Schema.find({ 
        hour: {$gte: tB.getHours(), $lte: tE.getHours()},
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
                var monthlyTempDataObject = {bigArray: []};
                var dailyTempDataObject = {bigArray: []};
                var hourlyTempDataObject = {bigArray: []};
                var tempDataArray = [];
                for (var l=0;l<hoursMatchingUserQuery.length; l++)
                {
                    let h=hoursMatchingUserQuery[l];
                    if (((h.hour<startHour.getHours())&&
                    (h.date==startHour.getDate()))
                    || ((h.hour>timeEndForUser.getHours())&&
                    (h.date==timeEndForUser.getDate())))
                    {
                        continue;
                    }
                    for (var z=0;z<h.readingArray.length; z++)
                    {
                        tempDataArray.push(h.readingArray[z].temperature);
                    }
                    
                    labelToPass = h.date+"-"+h.month+"-"+(h.year+1900)+", Hour "+h.hour;
                    checkMergeOrCalculate(tempDataArray,hourlyTempDataObject,frequencyFromUser,3,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                }
                labelToPass = tE.getDate()+"-"+tE.getMonth()+"-"+(tE.getYear()+1900);
                checkMergeOrCalculate(hourlyTempDataObject.bigArray,dailyTempDataObject,
                    frequencyFromUser,2,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                labelToPass = tE.getMonth()+"-"+(tE.getYear()+1900);
                checkMergeOrCalculate(dailyTempDataObject.bigArray,monthlyTempDataObject,
                    frequencyFromUser,1,labelToPass, finalSensorDataArr, finalSensorLabelsArr);
                if (frequencyFromUser==0)
                {
                    calculateMeanAndAppend(monthlyTempDataObject.bigArray, finalSensorDataArr);
                    labelToPass = (tE.getYear()+1900).toString();
                    finalSensorLabelsArr.Array.push(labelToPass);
                }         
            }
        });
    }
    
    console.log("Final sensor data: "+JSON.stringify(finalSensorDataArr.Array));
    sendingData.temperatures = finalSensorDataArr.Array;
    sendingData.labels = finalSensorLabelsArr.Array;
    // var sendingData = {temperatures: finalSensorDataArr.Array, labels: finalSensorLabelsArr.Array};
    console.log("Sending this: "+JSON.stringify(sendingData))

}

    sender(sendingData);
    async  function sender(sent)
    {
        await graphtesting();
        res.json(sent);    
        console.log("sent:"+JSON.stringify(sent))
    } 

     
});


// app.use('/advanced', (req, res) => {


//     function temp(reading)
//     {
//     // var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});
//     console.log('current hour is ' + reading.timeStamp.getHours());
    

//     var current_month =  reading.timeStamp.getMonth();
//     var current_year = reading.timeStamp.getYear();
//     var current_day = reading.timeStamp.getDate();
//     var current_hour = reading.timeStamp.getHours();
//     var current_sensorId = reading.sensorId;

//     console.log('current sensoer id is ' + current_sensorId);

//     if (-1 != is_hour_in_cache(current_hour, current_day, current_month, current_year, current_sensorId))//hour has not been changed
//     {
//         console.log('current hour is in cache');
//         Hour_Schema.findOne({hour: current_hour, 
//                             date: current_day, 
//                             month:current_month, 
//                             year:current_year, 
//                             sensorId: current_sensorId}, 
//                             (err, hourlyData) => {
//             if (err)
//             {
//                 console.log('some error');
//             }
//             else
//             {
//                 // console.log('document recieved from hour_schmea.fndONe ' + JSON.stringify(hourlyData));
//                 hourlyData.readingArray.push(reading);
//                 console.log('this is old hourlyData: ' + hourlyData)
//                 hourlyData.save(err => {
//                     if (err)
//                     {
//                         console.log('error while saving old hourlyData');
//                         console.log('error is : ' + err);
//                     }
//                     else
//                     {
//                         console.log('old hour object saved successfuly');
//                     }
//                 });
//             }
//         })
//         console.log('done with hour_schema.findOne');
//     }
//     else//means a new hour
//     {
//         console.log('current hour is not in cache');
//         previousHour = last_hour(current_hour, current_day, current_month, current_year)
//         remove_from_hour_cache(previousHour[0], previousHour[1], previousHour[2], previousHour[3], current_sensorId);
       
//         //insert new data into cache
//         last_stored_hours.push({sensorId: current_sensorId, hour: current_hour, day: current_day, month: current_month, year: current_year});
//         hourlyData = new Hour_Schema({
//             sensorId: current_sensorId, hour: current_hour, date: current_day, month: current_month, year: current_year, readingArray: []
//         });
//         hourlyData.readingArray.push(reading);
//         console.log('this is new hourlyData: ' + hourlyData);
//         hourlyData.save(err => {
//             if (err)
//             {
//                 console.log('error while saving new hourlyData');
//                 console.log('error is: ' + err);
//             }
//             else
//             {
//                 console.log('new hour object saved successfuly');
//             }
//         });                
//     }
   

//     if (current_day == last_stored_day)//if day has not changed
//     {
//         //do nothing
//         console.log('day checked');
//     }
//     else//if day has changed
//     {
//         console.log('day checked');
//         //store current day in mongodb also
//         console.log('current day: ' + current_day);
//         console.log('current month: ' + current_month);
//         console.log('current year: ' + current_year);
//         var previousDay = last_day(current_day, current_month, current_year);

//         dailyData = new Day_Schema({
//             sensorId: current_sensorId, date: current_day, month: current_month, year: current_year, hourArray: []
//         });
//         console.log('queryign data');
//         console.log('sensorId: ' +  current_sensorId);
//         console.log('date: ' +  previousDay[0]);
//         console.log('month: ' +  previousDay[1]);
//         console.log('previoiu year: ' +  previousDay[2]);
//         Hour_Schema.find({sensorId: current_sensorId,
//             date: previousDay[0],
//             month: previousDay[1], 
//             year: previousDay[2]}, 
//             (err, hourlyDataArray) =>
//             {
//                 if (err)
//                 {
//                     console.log('some problem in fetching hourly data');
//                 }
//                 else
//                 {
//                     console.log('object from hourlyDataArray ' + JSON.stringify(hourlyDataArray));
//                     for (var i=0;i<hourlyDataArray.length; i++)
//                     {
//                         dailyData.hourArray.push(hourlyDataArray[i]);
//                     }
//                     dailyData.save(err => {
//                         if (err)
//                         {
//                             console.log('error while saving hourlyData to dailyData');
//                             console.log('error is ' + err);
//                         }
//                         else
//                         {
//                             Hour_Schema.deleteMany({sensorId: current_sensorId, 
//                             day: previousDay[0],
//                             month: previousDay[1], 
//                             year: previousDay[2]})
//                         console.log('objects deleted successfully');
//                         }
//                     })
//                 }
//             })
//     }

//     if (current_month == last_stored_month)//it is same month
//     {
//         //do nothing
//     }
//     else//month has changed
//     {
//         var previousMonth = last_month(current_month, current_year);

//         monthlyData = new Month_Schema({
//             sensorId: current_sensorId, month: current_month, year: current_year , dayArray: []
//         });

//         Day_Schema.find({sensorId: current_sensorId, month: previousMonth[0], year: previousMonth[1]},
//                         (err, dailyDataArray) => {
//                             if (err)
//                             {
//                                 console.log('error while fetching dailyDataArray from mongodb');
//                                 console.log('error is: ' + err);
//                             }
//                             else
//                             {
//                                 for (var i=0;i<dailyDataArray.length;i++)
//                                 {
//                                     monthlyData.dayArray.push(dailyDataArray[i]);
//                                 }
//                                 monthlyData.save(err => {
//                                     if (err)
//                                     {
//                                         console.log('error while saving monthly data');
//                                     }
//                                     else
//                                     {
//                                         Day_Schema.deleteMany({sensorId: current_sensorId,
//                                                                month: previousMonth[0], 
//                                                                year: previousMonth[1]});
//                                     }
//                                 })
//                             }
//                         })
//     }

//     if (current_year == last_stored_year)//year has not changed
//     {
//         //do nothing
//     }
//     else//year has changed
//     {
//         var previousYear = last_year(current_year);

//         annualData = new Year_Schema({
//             sensorId: current_sensorId, year: current_year, monthArray: []
//         });

//         Month_Schema.find({sensorId: current_sensorId,
//                            year: previousYear},
//                            (err, monthlyDataArray) => {
//                                if (err)
//                                {
//                                    console.log('error while fetching monthly data from mongodb');
//                                }
//                                else
//                                {
//                                    for (var i=0;i<monthlyDataArray.length;i++)
//                                    {
//                                        annualData.monthArray.push(monthlyDataArray[i])
//                                    }
//                                    annualData.save(err => {
//                                        if (err)
//                                        {
//                                            console.log('error while save annualData');
//                                        }
//                                        else
//                                        {
//                                            Month_Schema.deleteMany({sensorId: current_sensorId,
//                                                                     year: previousYear});
//                                        }
//                                    })
//                                }
//                            })
//         console.log('this is new annualData: ' + annualData); 
//     }  
//     }

// var i;
// var dt = new Date(Date.now());
// // for (i=0; i<10; i++)
// {
//     dt.setHours( dt.getHours() + 20);
//     var sensorIdToPass = Math.floor(Math.random()*3) + 1;
//     var humidityToPass = Math.floor(Math.random()*3) + 78;
//     var temperatureToPass = Math.floor(Math.random()*13) + 21;
//     var luminosityToPass = Math.floor(Math.random()*23001) + 78;
//     var reading = new Reading_Schema({timeStamp: dt,
//         sensorId: sensorIdToPass,
//         temperature: temperatureToPass,
//         humidity: humidityToPass,
//         luminosity: luminosityToPass})
//     console.log('reading is ' + JSON.stringify(reading));
//     temp(reading);
// }


// })






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
        return [23].push(last_day(current_day, current_month, current_year));   
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
            && last_stored_years[i].year == current_year)
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
    // console.log('inside is_hour_in_cache');

    for (var i=0;i<last_stored_hours.length;i++)
    {
        // console.log('sensorId: ' + sensorId);
        // console.log('current_hour: ' + current_hour);
        // console.log('current_day: ' + current_day);
        // console.log('current_month: ' + current_month);
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

// app.use('/', (req, res) => {
    
//     var last_stored_year = null ; //current year to which we are storing value to
//     var last_stored_month = null;//current month to which we are storing value to
//     var last_stored_day = null;//current day to which we are storing value to
//     var last_stored_hour = null;//current hour to which we are storing value to

//     var reading = new Reading_Schema({sensorId: 1, temperature: 1, humidity: 4, luminosity: 5});

//     var current_month =  reading.timeStamp.getMonth() + 1
//     var current_year = reading.timeStamp.getYear();
//     var current_day = reading.timeStamp.getDate();
//     var current_hour = reading.timeStamp.getHours();
//     var current_sensorId = reading.sensorId;

//     console.log('everything fine');
//     console.log("current hour: " + current_hour);
//     var current_hourObj = null;
//     if (current_hour == last_stored_hour)
//     {
//         Hour_Schema.findOne({hour: current_hour, sensorId: current_sensorId}, (err, hourObj) => {
//             if (err)
//             {
//                 console.log('some error');
//             }
//             else
//             {
//                 hourObj.readingArray.push(reading);
//                 console.log('this is old hourObj: ' + hourObj)
//                 hourObj.save(err => {
//                     if (err)
//                     {
//                         console.log('error while saving old hourObj');
//                         console.log('error is : ' + err);
//                     }
//                     else
//                     {
//                         console.log('old hour object saved successfuly');
//                     }
//                 });
//                 current_hourObj = hourObj; 
//                 console.log('existing hour object saved successfuly');
//             }
//         })
//     }
//     else
//     {         
//         hourObj = new Hour_Schema({
//             sensorId: current_sensorId, hour: current_hour, readingArray: []
//         });
//         hourObj.readingArray.push(reading);
//         console.log('this is new hourObj: ' + hourObj);
//         hourObj.save(err => {
//             if (err)
//             {
//                 console.log('error while saving new hourObj');
//                 console.log('error is: ' + err);
//             }
//             else
//             {
//                 console.log('new hour object saved successfuly');
//             }
//         });       
//         current_hourObj = hourObj;           
//     }

//     current_dayObj = null;//retrieve data 
//     if (current_day == last_stored_day)
//     {
//         Day_Schema.findOne({day: current_day, sensorId: current_sensorId}, (err, dayObj) => {
//             if (err)
//             {
//                 console.log('some error');
//             }
//             else
//             {
//                 dayObj.hourArray.push(current_hourObj);
//                 console.log('this is old dayObj: ' + dayObj)
//                 dayObj.save(err => {
//                     if (err)
//                     {
//                         console.log('error while saving old dayObj');
//                         console.log('error is : ' + err);
//                     }
//                     else
//                     {
//                         console.log('old day object saved successfuly');
//                     }
//                 });
//                 current_dayObj = dayObj;
//                 console.log('existing day object saved successfuly');
//             }
//         })
//     }
//     else
//     {
//         Hour_Schema.remove({sensorId: current_sensorId});
//         dayObj = new Day_Schema({
//             sensorId: current_sensorId, date: current_day, hourArray: []
//         });
//         dayObj.hourArray.push(current_hourObj);
//         console.log('this is new dayObj: ' + dayObj);
//         dayObj.save(err => {
//             if (err)
//             {
//                 console.log('error while saving new dayObj');
//                 console.log('error is: ' + err);
//             }
//             else
//             {
//                 console.log('new day object saved successfuly');
//             }
//         });   
//         current_dayObj = dayObj;
//     }


//     current_monthObj = null;
//     if (current_month == last_stored_month)
//     {
//         Month_Schema.findOne({sensorId: current_sensorId, month: current_month}, (err, monthObj) => {
//             if (err)
//             {
//                 console.log('some error');
//             }
//             else
//             {
//                 monthObj.dayArray.push(current_dayObj);
//                 console.log('this is old monthObj: ' + monthObj)
//                 monthObj.save(err => {
//                     if (err)
//                     {
//                         console.log('error while saving old monthObj');
//                         console.log('error is : ' + err);
//                     }
//                     else
//                     {
//                         console.log('old month object saved successfuly');
//                     }
//                 });
//                 current_monthObj = monthObj;
//                 console.log('existing month object saved successfuly');
//             }
//         })
//     }
//     else
//     {
//         Day_Schema.remove({sensorId: current_sensorId});
//         monthObj = new Month_Schema({
//             sensorId: current_sensorId, month: current_month, dayArray: []
//         });
//         monthObj.dayArray.push(current_dayObj);
//         console.log('this is new monthObj: ' + monthObj);
//         monthObj.save(err => {
//             if (err)
//             {
//                 console.log('error while saving new monthObj');
//                 console.log('error is: ' + err);
//             }
//             else
//             {
//                 console.log('new month object saved successfuly');
//             }
//         });   
//         current_monthObj = monthObj;
//     }

//     if (current_year == last_stored_year)
//     {
//         Year_Schema.findOne({sensorId: current_sensorId, year: current_year}, (err, yearObj) => {
//             if (err)
//             {
//                 console.log('some error');
//             }
//             else
//             {
//                 yearObj.monthArray.push(current_monthObj);
//                 console.log('this is old yearObj: ' + yearObj)
//                 yearObj.save(err => {
//                     if (err)
//                     {
//                         console.log('error while saving old yearObj');
//                         console.log('error is : ' + err);
//                     }
//                     else
//                     {
//                         console.log('old year object saved successfuly');
//                     }
//                 });
//                 console.log('existing year object saved successfuly');
//             }
//         })
//     }
//     else
//     {
//         Month_Schema.remove({sensorId: current_sensorId});
//         yearObj = new Year_Schema({
//             sensorId: current_sensorId, year: current_year, monthArray: []
//         });
//         yearObj.monthArray.push(current_monthObj);
//         console.log('this is new yearObj: ' + yearObj);
//         yearObj.save(err => {
//             if (err)
//             {
//                 console.log('error while saving new yearObj');
//                 console.log('error is: ' + err);
//             }
//             else
//             {
//                 console.log('new year object saved successfuly');
//             }
//         });   
//     }
// });

app.listen(5000, () => {
    console.log('listening at 5000');
})
