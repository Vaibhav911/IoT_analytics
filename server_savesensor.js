
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var axios = require('axios')

var {Campus_Schema} = require('./IoT_Campus_Schema');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/storesensor', (req, res) => {
    console.log('query: ' + JSON.stringify(req.query));
    res.send('request received');
    var sensorinfo= new Campus_Schema(
        {
            campusName: req.query.campusName,
            buildingArray: [
                {
                    campusName: req.query.campusName,
                    buildingId: req.query.buildingId,
                    floorArray:
                    [
                        {
                            campusName: req.query.campusName,
                            buildingId: req.query.buildingId,
                            floorNo: req.query.floorNo,
                            zoneArray:[
                            {
                                campusName: req.query.campusName,
                                buildingId: req.query.buildingId,
                                floorNo: req.query.floorNo,
                                zoneId: req.query.zoneId,
                                sensorArray:
                                [
                                    {
                                        campusName: req.query.campusName,
                                        buildingId: req.query.buildingId,
                                        floorNo: req.query.floorNo,
                                        zoneId: req.query.zoneId,
                                        sensorId: req.query.sensorId
                                    }
                                ]
                            }] 
                        }
                    ]
                }
            ]
        }

    ); // creates a complete object, then later decides which parts to save
    Campus_Schema.findOne({campusName: req.query.campusName}, (err,campusObj) =>
        {
            if (err || campusObj==null) // no such object
            {
                sensorinfo.save(err =>
                    {
                        if (err)
                        {
                            console.log("Error is "+err);
                        }
                        else
                        {
                            console.log("Object saved successfully");
                        }
                    }
                )
            }
            else
            {
                console.log(req.query.campusName + " campus exists")
                var buildingObj=null;
                var bArray = campusObj.buildingArray;
                for (var i=0; i<bArray.length; i++)
                {
                    if (bArray[i].buildingId==req.query.buildingId)
                    {
                        buildingObj=bArray[i];
                    }
                }
                if (!buildingObj)
                {
                    bArray.push(sensorinfo.buildingArray[0]);
                }
                else //there exists such a building
                {
                    console.log(req.query.buildingId + " building exists")
                    var floorObj=null;
                    var fToAdd = sensorinfo.buildingArray[0].floorArray[0];
                    var fArray = buildingObj.floorArray;
                    for (var i=0; i<fArray.length; i++)
                    {
                        if (fArray[i].floorNo==req.query.floorNo)
                        {
                            floorObj=fArray[i];
                        }
                    }
                    if (!floorObj)
                    {
                        buildingObj.floorArray.push(fToAdd);
                    }
                    else //there exists such a floor
                    {
                        console.log(req.query.floorNo + " floor exists")
                        var zoneObj=null;
                        var zToAdd = fToAdd.zoneArray[0];
                        var zArray = floorObj.zoneArray;
                        for (var i=0; i<zArray.length; i++)
                        {
                            if (zArray[i].zoneId==req.query.zoneId)
                            {
                                zoneObj=zArray[i];
                            }
                        }
                        if (!zoneObj)
                        {
                            floorObj.zoneArray.push(zToAdd);
                        }
                        else //there exists such a zone
                        {
                            console.log(req.query.zoneId + " zone exists")
                            var sensorObj=null;
                            var sToAdd = zToAdd.sensorArray[0];
                            var sArray = zoneObj.sensorArray;
                            for (var i=0; i<sArray.length; i++)
                            {
                                if (sArray[i].sensorId==req.query.sensorId)
                                {
                                    sensorObj=sArray[i];
                                }
                            }
                            if (!sensorObj)
                            {
                                zoneObj.sensorArray.push(sToAdd);
                            }
                            else //there exists such a sensor
                            {
                                console.log("Sensor already exists!");
                            }
                        }
                    }
                }
                campusObj.save(err =>
                    {
                        if (err)
                        {
                            console.log("Error is "+err);
                        }
                        else
                        {
                            console.log("Campus object saved successfully");
                        }
                    }
                )
            }
        });
})

app.listen(5000, () => {
    console.log('listening at 5000');
})
