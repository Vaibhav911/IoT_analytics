var express = require("express");
var app = express();
var cors = require("cors");
var bodyParser = require("body-parser");
var moment = require("moment");
moment().format();
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
// const JSONToCSV = require("json2csv").parse;

var { Year_Schema } = require("./IoT_Data_Schema.js");
var { Month_Schema } = require("./IoT_Data_Schema.js");
var { Day_Schema } = require("./IoT_Data_Schema.js");
var { Hour_Schema } = require("./IoT_Data_Schema.js");
var { Reading_Schema } = require("./IoT_Data_Schema.js");
var { Sensor_Attributes_Schema } = require("./Sensor_Attributes_Schema");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/test", (req, res) => {
  async function getAttributes() {
    var attributes = await get_sensor_attributes("THL");
    console.log("attributes are 28 " + JSON.stringify(attributes));
  }
  getAttributes();
});

app.use("/getdata", (req, res) => {
  console.log("request received");
  console.log(req.body);
  var startTime = req.body.startTime;
  var endTime = req.body.endTime;
  var sensorList_Array = req.body.sensorList_Array;
  var frequency = req.body.frequency;
  console.log("start time" + startTime);
  console.log("end time" + endTime);
  console.log("sensorList array" + JSON.stringify(sensorList_Array));
  console.log("frequency is at 51" + req.body.frequency);
  console.log("sensoer list array " + JSON.stringify(sensorList_Array));
  //   console.log("req received is " + JSON.stringify(req));

  var sensorIds = [];
  for (var i = 0; i < sensorList_Array.length; i++) {
    for (var j = 0; j < sensorList_Array[i].sensorList.length; j++) {
      sensorIds.push(sensorList_Array[i].sensorList[j]);
    }
  }
  console.log("sensorIds are " + JSON.stringify(sensorIds));

  var sensorSet = [];
  for (var i = 0; i < sensorList_Array.length; i++) {
    sensorSet.push(sensorList_Array[i].sensorList);
  }
  console.log("sensorset is " + JSON.stringify(sensorSet));

  var sensorTypes = [];
  for (var i = 0; i < sensorList_Array.length; i++) {
    sensorTypes.push(sensorList_Array[i].sensorType);
  }
  console.log("sensortype is " + JSON.stringify(sensorTypes));

  var spawn = require("child_process").spawn;
  py = spawn("python", ["./read_data.py"]);
  // var data = {name: ['vaibhav', 'yadav']};
  dataString = "";

  py.stdout.on("data", function(data) {
    dataString += data.toString();
  });

  py.stdout.on("end", function() {
    // console.log("data from python is ", dataString);
    // console.log('in js')
    graphData = JSON.parse(dataString);
    console.log("data from python is ", JSON.stringify(graphData));
    // for (var i =0;i<graphData.labels.length;i++)
    // {
    //     if(graphData.labels[i]==null)
    //     {
    //         graphData.labels[i]= '---'
    //     }
    // }
    // res.json(graphData)
    // console.log("response is smnet" + (JSON.stringify(graphData)))
    res.json(graphData);
  });

  async function foo() {
    console.log("sensor type 102 is " + JSON.stringify(sensorTypes));
    var attributesSet = [];
    for (var i = 0; i < sensorTypes.length; i++) {
      console.log("sensor type is 106" + sensorTypes[i]);
      var attributes = await get_sensor_attributes(sensorTypes[i]);
      attributesSet.push(attributes);
    }
    // console.log('attribute set is **' + attributesSet)
    var data = await get_sensor_data(
      sensorIds,
      new Date(startTime),
      new Date(endTime),
      frequency,
      attributesSet,
      sensorSet
    );
    // console.log("data is line 90 " + JSON.stringify(data));
    py.stdin.write(JSON.stringify(data));
    py.stdin.end();
  }
  foo();
});

async function get_sensor_data(
  sensorIds,
  start_time,
  end_time,
  frequency,
  attributesSet,
  sensorSet
) {
  console.log("inside get-sensor-data function");
  var annualDataArray = [];
  var monthlyDataArray = [];
  var dailyDataArray = [];
  var hourlyDataArray = [];
  await Year_Schema.find(
    {
      sensorId: sensorIds,
      year: { $gte: start_time.getYear(), $lte: end_time.getYear() }
    },
    (err, annualDatas) => {
      if (err) {
        console.log("error in fetching annual data from mongodb");
        console.log("error is " + err);
      } else {
        // console.log('annual data received ' + annualDatas);
        // for (var i=0;i<annualDatas.length;i++)
        // {
        //     annualDataArray.push(annualDatas[i]);
        // }
        for (var i = 0; i < annualDatas.length; i++) {
          var dataPushed = false;
          for (var j = 0; j < annualDataArray.length; j++) {
            if (annualDataArray[j][0].sensorId == annualDatas[i].sensorId) {
              annualDataArray[j].push(annualDatas[i]);
              dataPushed = true;
            }
          }
          if (dataPushed == false) {
            annualDataArray.push([annualDatas[i]]);
          }
        }
      }
      console.log("annual data fetched");
    }
  ).lean();
  await Month_Schema.find(
    {
      sensorId: sensorIds,
      month: { $gte: start_time.getMonth(), $lte: end_time.getMonth() },
      year: { $gte: start_time.getYear(), $lte: end_time.getYear() }
    },
    (err, monthlyDatas) => {
      if (err) {
        console.log("error in fetching monthly data from mongodb");
        console.log("error is: " + err);
      } else {
        for (var i = 0; i < monthlyDatas.length; i++) {
          var dataPushed = false;
          for (var j = 0; j < monthlyDataArray.length; j++) {
            if (monthlyDataArray[j][0].sensorId == monthlyDatas[i].sensorId) {
              monthlyDataArray[j].push(monthlyDatas[i]);
              dataPushed = true;
            }
          }
          if (dataPushed == false) {
            monthlyDataArray.push([monthlyDatas[i]]);
          }
        }
        // console.log('lengt of monthly datas', JSON.stringify(monthlyDataArray[0][0]))
      }
      console.log("mothly data fetched");
    }
  ).lean();
  await Day_Schema.find(
    {
      sensorId: sensorIds,
      date: { $gte: start_time.getDate(), $lte: end_time.getDate() },
      month: { $gte: start_time.getMonth(), $lte: end_time.getMonth() },
      year: { $gte: start_time.getYear(), $lte: end_time.getYear() }
    },
    (err, dailyDatas) => {
      if (err) {
        console.log("error while fetching daily data from monogbd");
        console.log("error is: " + err);
      } else {
        //  console.log('daily data received ' + dailyDatas)
        //  for (var i=0;i<dailyDatas.length;i++)
        //  {
        //     dailyDataArray.push(dailyDatas[i]);
        //  }
        for (var i = 0; i < dailyDatas.length; i++) {
          var dataPushed = false;
          for (var j = 0; j < dailyDataArray.length; j++) {
            if (dailyDataArray[j][0].sensorId == dailyDatas[i].sensorId) {
              dailyDataArray[j].push(dailyDatas[i]);
              dataPushed = true;
            }
          }
          if (dataPushed == false) {
            dailyDataArray.push([dailyDatas[i]]);
          }
        }
      }
      console.log("dialy data fetched");
    }
  ).lean();
  await Hour_Schema.find(
    {
      sensorId: sensorIds,
      hour: { $gte: start_time.getHours(), $lte: end_time.getHours() },
      date: { $gte: start_time.getDate(), $lte: end_time.getDate() },
      month: { $gte: start_time.getMonth(), $lte: end_time.getMonth() },
      year: { $gte: start_time.getYear(), $lte: end_time.getYear() }
    },
    (err, hourlyDatas) => {
      if (err) {
        console.log("error while fetching hourly data from mongodb");
        console.log("error is: " + err);
      } else {
        //   console.log('hourly data received'  + hourlyDatas);
        //   for (var i=0;i<hourlyDatas.length;i++)
        //   {
        //       hourlyDataArray.push(hourlyDatas[i]);
        //   }

        for (var i = 0; i < hourlyDatas.length; i++) {
          var dataPushed = false;
          for (var j = 0; j < hourlyDataArray.length; j++) {
            if (hourlyDataArray[j][0].sensorId == hourlyDatas[i].sensorId) {
              hourlyDataArray[j].push(hourlyDatas[i]);
              dataPushed = true;
            }
          }
          if (dataPushed == false) {
            hourlyDataArray.push([hourlyDatas[i]]);
          }
        }
      }
      console.log("houyrly data fetched");
    }
  ).lean();

  // console.log('frequency is 248' + frequency)
  return [
    frequency,
    attributesSet,
    sensorSet,
    start_time,
    end_time,
    annualDataArray,
    monthlyDataArray,
    dailyDataArray,
    hourlyDataArray
  ];
}

async function get_sensor_attributes(sensorType) {
  var attributeArray = [];
  var dataType = "";
  console.log("line 277 sensor type" + sensorType);
  await Sensor_Attributes_Schema.find(
    { type: sensorType },
    (err, sensorAttributes) => {
      if (err) {
        console.log("error is " + JSON.stringify(err));
      } else {
        console.log(
          "attributes are 285 " + JSON.stringify(sensorAttributes[0])
        );
        for (var i = 0; i < sensorAttributes[0].attributeArray.length; i++) {
          attributeArray.push(sensorAttributes[0].attributeArray[i]);
        }
        dataType = sensorAttributes[0].dataType;
      }
    }
  );
  // console.log('attribtes arr in fucntion is ' + JSON.stringify(attributeArray))
  return {
    dataType: dataType,
    attributesArray: attributeArray
  };
}

app.listen(4000, () => {
  console.log("listening at 4000");
});
