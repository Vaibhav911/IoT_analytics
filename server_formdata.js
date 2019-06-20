
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var axios = require('axios')

var {Sensor_Info_Schema} = require('./IoT_Campus_Schema');


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/campusData', (req, res) => {
    console.log('query: ' + JSON.stringify(req.query));
    var campusList = [];
    Sensor_Info_Schema.find((err, matchingSensors) => {
            if (err)
            {
                console.log("Error is "+err);
            }
            else
            {
                console.log(matchingSensors.length);
                // var buildingLookup = {};
                for (var i=0;i<matchingSensors.length; i++)
                {
                    var isThere = false;
                    for (var j=0;j<campusList.length; j++)
                    {
                        if (campusList[j]==[matchingSensors[i].campusName])
                        {
                            isThere=true;
                            break;
                        }
                    }
                    if (!isThere)
                    {
                        // console.log("New building: "+matchingSensors[i].buildingId);
                        campusList.push(matchingSensors[i].campusName);
                    }
                }
                campusList.sort();
                console.log("Campus List: "+campusList)
                var sendingdata = {campusList: campusList};
                res.json(sendingdata);
            }
        });
})

app.use('/buildingData', (req, res) => {
    console.log('query: ' + JSON.stringify(req.query));
    var buildingList = [];
    Sensor_Info_Schema.find({campusName: req.query.campusName},
        (err, matchingSensors) => {
            if (err)
            {
                console.log("Error is "+err);
            }
            else
            {
                console.log(matchingSensors.length)
                var buildingLookup = {};
                for (var i=0;i<matchingSensors.length; i++)
                {
                    var isThere = false;
                    for (var j=0;j<buildingList.length; j++)
                    {
                        if (buildingList[j]==[matchingSensors[i].buildingId])
                        {
                            isThere=true;
                            break;
                        }
                    }
                    if (!isThere)
                    {
                        // console.log("New building: "+matchingSensors[i].buildingId);
                        buildingList.push(matchingSensors[i].buildingId);
                    }
                }
                buildingList.sort();
                console.log("Building List: "+buildingList)
                var sendingdata = {buildingList: buildingList};
                res.json(sendingdata);
            }
        });
})


app.listen(5000, () => {
    console.log('listening at 5000');
})
