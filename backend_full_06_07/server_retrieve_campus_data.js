var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var axios = require('axios')

var {Sensor_Schema} = require('./IoT_Campus_Schema_alt.js');
var {Zone_Schema} = require('./IoT_Campus_Schema_alt.js');
var {Floor_Schema} = require('./IoT_Campus_Schema_alt.js');
var {Building_Schema} = require('./IoT_Campus_Schema_alt.js');
var {Campus_Schema} = require('./IoT_Campus_Schema_alt.js');


app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// app.use('/test', (req, res) => {
//     var arr1 = [1,2,3];
//     var arr2 = [4,5,6];
//     arr1.concat(arr2);
//     console.log('after concatenation 1 ' + JSON.stringify(arr1));

//     arr1 = arr1.concat(arr2);
//     console.log('after concatenation 2 ' + JSON.stringify(arr1));

// })

app.use('/getcampusdata', (req, res) => {
    console.log('query: ' + JSON.stringify(req.query));
    Campus_Schema.find((err, matchingCampuses) => {
            if (err)
            {
                console.log("Error is "+err);
            }
            else
            {
                console.log(matchingCampuses);
                // console.log("Building List: "+buildingList)
                var sendingdata = {campusList: matchingCampuses};
                res.json(sendingdata);               
            }
        });
})

app.listen(7000, () => {
    console.log('listening at 7000');
})

