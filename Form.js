var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var moment = require('moment');
moment().format();
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const JSONToCSV = require("json2csv").parse;

var {Year_Schema} = require('./IoT_Data_Schema.js');
var {Month_Schema} = require('./IoT_Data_Schema.js');
var {Day_Schema} = require('./IoT_Data_Schema.js');
var {Hour_Schema} = require('./IoT_Data_Schema.js');
var {Reading_Schema} = require('./IoT_Data_Schema.js');


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/test1', (req, res) => {
    var spawn = require('child_process').spawn,
    py    = spawn('python', ['hello.py']),
    data = {name: ['vaibhav', 'yadav']},
    dataString = '';

    py.stdout.on('data', function(data){
        dataString += data.toString();
    });
    
    py.stdout.on('end', function(){
        console.log('name is ',dataString);
    });

    py.stdin.write(JSON.stringify(data));
    py.stdin.end();
})

app.use('/test', (req, res) => {


    var spawn = require('child_process').spawn;
    py    = spawn('python', ['hello.py']);
    data = {name: ['vaibhav', 'yadav']};
    dataString = '';

    py.stdout.on('data', function(data){
        dataString += data.toString();
    });
    
    py.stdout.on('end', function(){
        console.log('data from python is ',dataString);
    });

    async function foo()
    {
        var data = await get_sensor_data(1, new Date(2019, 05, 13), new Date(2019, 05, 17), 'monthly');
        py.stdin.write(JSON.stringify(data));
        py.stdin.end();
    }
    foo();


})


app.use('/hello', (req, res) => {
    async function wait()
    {
    // Use child_process.spawn method from  
    // child_process module and assign it 
    // to variable spawn 
    
    var spawn = require("child_process").spawn; 
      
    // Parameters passed in spawn - 
    // 1. type_of_script 
    // 2. list containing Path of the script 
    //    and arguments for the script  
      
    // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will 
    // so, first name = Mike and last name = Will 
    // var data = await get_sensor_data(1, new Date(2019, 05, 13), new Date(2019, 05, 17), 'hourly');
    var process = spawn('python',["./hello.py", 
    JSON.stringify({name:'vaibhav'}), 
    'yadv'] ); 

    // Takes stdout data from script which executed 
    // with arguments and send this data to res object 
    process.stdout.on('data', function(data) { 
    res.send(data.toString()); 
    } )  

    }
    wait();
});

app.use('/getdata', (req, res) => {
    
    async function get_data()
    {
        res.status(200).send('data is ' + await get_sensor_data(1, new Date(2019, 05, 13), new Date(2019, 05, 17), 'monthly'));
    }
    get_data();
    // get_sensor_data(1, new Date(2019, 05, 13), new Date(2019, 05, 17));
});

async function get_sensor_data(sensorId, start_time, end_time, frequency)
{
    // var start_time_moment = moment(start_time);
    // var end_time_moment = moment(end_time);
    console.log('inside get-sensor-data function');
    var annualDataArray = [];
    var monthlyDataArray = [];
    var dailyDataArray = [];
    var hourlyDataArray = [];
    await Year_Schema.find({sensorId: sensorId,
                      year: {$gte: start_time.getYear(), $lte: end_time.getYear()}}, 
                      (err, annualDatas) => {
                            if (err)
                            {
                                console.log('error in fetching annual data from mongodb');
                                console.log('error is ' + err);
                            }
                            else
                            {
                                // console.log('annual data received ' + annualDatas);
                                for (var i=0;i<annualDatas.length;i++)
                                {
                                    annualDataArray.push(annualDatas[i]);
                                }
                            }
                        });
    await Month_Schema.find({sensorId: sensorId,
                        month: {$gte: start_time.getMonth(), $lte: end_time.getMonth()},
                        year: {$gte: start_time.getYear(), $lte: end_time.getYear()}}, 
                        (err, monthlyDatas) =>{
                            if (err)
                            {
                                console.log('error in fetching monthly data from mongodb');
                                console.log('error is: ' + err);
                            }
                            else
                            {
                                // console.log('monthly data received ' + monthlyDatas);
                                for (var i=0;i<monthlyDatas.length;i++)
                                {
                                    monthlyDataArray.push(monthlyDatas[i]);
                                }
                            }
                        });
    await Day_Schema.find({sensorId: sensorId,
                    date: {$gte: start_time.getDate(), $lte: end_time.getDate()},
                     month: {$gte: start_time.getMonth(), $lte: end_time.getMonth()},
                     year: {$gte: start_time.getYear(), $lte: end_time.getYear()}}, 
                     (err, dailyDatas) => {
                         if (err)
                         {
                             console.log('error while fetching daily data from monogbd');
                             console.log('error is: ' + err);
                         }
                         else
                         {
                            //  console.log('daily data received ' + dailyDatas)
                             for (var i=0;i<dailyDatas.length;i++)
                             {
                                dailyDataArray.push(dailyDatas[i]);
                             }
                         }
                     });
    await Hour_Schema.find({sensorId: sensorId,
                      hour: {$gte: start_time.getHours(), $lte: end_time.getHours()},
                      date: {$gte: start_time.getDate(), $lte: end_time.getDate()},
                      month: {$gte: start_time.getMonth(), $lte: end_time.getMonth()},
                      year: {$gte: start_time.getYear(), $lte: end_time.getYear()}},
                      (err, hourlyDatas) => {
                          if (err)
                          {
                              console.log('error while fetching hourly data from mongodb');
                              console.log('error is: ' + err);
                          }
                          else
                          {
                            //   console.log('hourly data received'  + hourlyDatas);
                              for (var i=0;i<hourlyDatas.length;i++)
                              {
                                  hourlyDataArray.push(hourlyDatas[i]);
                              }
                          }
                      });

    return [frequency, annualDataArray, monthlyDataArray, dailyDataArray, hourlyDataArray];
    // if (frequency == 'annual')
    // {
    //     var annualData  = [];
    //     var annualLabels = [];
    //     for (var y=0;y<annualDataArray.length;y++)
    //     {
    //         let index = annualDataArray[y].year - start_time.getYear()
    //         for (var m=0;m<annualDataArray[y].monthArray.length;m++)
    //         {
    //             for (var d=0;d<annualDataArray[y].monthArray[m].dayArray.length;d++)
    //             {
    //                 for (var h=0;h<annualDataArray[y].monthArray[m].dayArray[d].hourArray.length;h++)
    //                 {
    //                     for (var r=0;r<annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].length;r++)
    //                     {
    //                         annualData[index].push(annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].readingArray[r]);
    //                     }
    //                 }
    //             }
    //         }
    //         annualLabels[annualDataArray[y].year - start_time.getYear()].push(annualDataArray[year].year + " year");
    //     }
    //     for (var m=0;m<)

    //     //push monthly, daily, hourlydata also
    // }
    // else if(frequency == 'monthly')
    // {
    //     var monthlyData  = [];
    //     var monthlyLabels = [];
    //     for (var y=0;y<annualDataArray.length;y++)
    //     {
    //         for (var m=0;m<annualDataArray[y].monthArray.length;m++)
    //         {
    //             let index = moment({month: annualDataArray[y].monthlyData[m].month, year: annualDataArray[y]}).diff(moment(start_time, 'months'));
    //             for (var d=0;d<annualDataArray[y].monthArray[m].dayArray.length;d++)
    //             {
    //                 for (var h=0;h<annualDataArray[y].monthArray[m].dayArray[d].hourArray.length;h++)
    //                 {
    //                     for (var r=0;r<annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].length;r++)
    //                     {
    //                         monthlyData[index].push(annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].readingArray[r]);
    //                     }
    //                 }
    //             }
    //             monthlyLabels[index].push(annualDataArray[y].monthArray[m] + " month, " + annualDataArray[year].year + " year");
    //         }
            
    //     }
    // }
    // else if(frequency == 'daily')
    // {
    //     var dailyData  = [];
    //     var dailyLabels = [];
    //     for (var y=0;y<annualDataArray.length;y++)
    //     {
    //         for (var m=0;m<annualDataArray[y].monthArray.length;m++)
    //         {
    //             for (var d=0;d<annualDataArray[y].monthArray[m].dayArray.length;d++)
    //             {
    //                 var index  = moment({day: annualDataArray[y].monthArray[m].dayArray[d],
    //                                     month: annualDataArray[y].monthlyData[m].month, 
    //                                     year: annualDataArray[y]}).diff(moment(start_time, 'days'));
    //                 for (var h=0;h<annualDataArray[y].monthArray[m].dayArray[d].hourArray.length;h++)
    //                 {
    //                     for (var r=0;r<annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].length;r++)
    //                     {
    //                         dailyData[index].push(annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].readingArray[r]);
    //                     }
    //                 }
    //                 dailyLabels[index].push(annualDataArray[y].monthArray[m].dayArray[d] + " day, " + annualDataArray[y].monthArray[m] + " month, " + annualDataArray[year].year + " year");
    //             }
    //         }
    //     }
    // }
    // else if(frequency == 'hourly')
    // {
    //     var hourlyData  = [];
    //     var hourlyLabels = [];
    //     for (var y=0;y<annualDataArray.length;y++)
    //     {
    //         for (var m=0;m<annualDataArray[y].monthArray.length;m++)
    //         {
    //             for (var d=0;d<annualDataArray[y].monthArray[m].dayArray.length;d++)
    //             {
    //                 for (var h=0;h<annualDataArray[y].monthArray[m].dayArray[d].hourArray.length;h++)
    //                 {
    //                     var index  = moment({
    //                         hour: annualDataArray[y].monthArray[m].dayArray[d].hourArray[h],
    //                         day: annualDataArray[y].monthArray[m].dayArray[d],
    //                         month: annualDataArray[y].monthlyData[m].month, 
    //                         year: annualDataArray[y]}).diff(moment(start_time, 'hours'));
    //                     for (var r=0;r<annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].length;r++)
    //                     {
    //                         dailyData[index].push(annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].readingArray[r]);
    //                     }
    //                     dailyLabels[index].push(annualDataArray[y].monthArray[m].dayArray[d].hourArray[h].hour + " hour, " + annualDataArray[y].monthArray[m].dayArray[d].date + " day, " + annualDataArray[y].monthArray[m].month + " month, " + annualDataArray[year].year + " year");
    //                 }
    //             }
    //         }
    //     }
    // }
    // else
    // {
    //     res.send("can't find data for given frequency");
    // }
    
}

app.listen(4000, () => {
    console.log('listening at 4000');
})
