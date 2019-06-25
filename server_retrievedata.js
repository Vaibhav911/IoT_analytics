
var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var axios = require('axios')

var {Sensor_Schema} = require('./IoT_Campus_Schema');
var {Zone_Schema} = require('./IoT_Campus_Schema');
var {Floor_Schema} = require('./IoT_Campus_Schema');
var {Building_Schema} = require('./IoT_Campus_Schema');
var {Campus_Schema} = require('./IoT_Campus_Schema');


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/getCampusData', (req, res) => {
    console.log('query: ' + JSON.stringify(req.query));
    Campus_Schema.find((err, matchingCampuses) => {
            if (err)
            {
                console.log("Error is "+err);
            }
            else
            {
                console.log(matchingCampuses.length);
                // console.log("Building List: "+buildingList)
                var sendingdata = {campusList: matchingCampuses};
                res.json(sendingdata);               
            }
        });
})

app.listen(5000, () => {
    console.log('listening at 5000');
})
