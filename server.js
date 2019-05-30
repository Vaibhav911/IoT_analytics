var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var {Year_Schema} = require('./IoT_Data_Schema.js/index.js');
// var Campus_Schema = require('./IoT_Campus_Schema.js');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/hello', (req, res) => {
    console.log("recieved hello");
    res.send('received hello');
})

app.use('/', (req, res) => {
    console.log("hello");
    // var year_data = new Year_Schema({
    //     sensorId: 2,
    //     year: 2019,
    //     // monthArray: new Month_Schema({month: 'jan'})
    // });
    // year_data.save(err => {
    //     if (err){
    //         // res.type('html').status(500);
    //         // res.write('some error');
    //         console.log('some error');
    //     }
    //     else{
    //         console.log('object saved sucessfuly');
    //     }
    // })
    var obj = new Year_Schema({sensorId: 2, year: 1234});
    obj.save(err => {
        if (err)
        {
            console.log('some error');
        }
        else
        {
            console.log('obj saved successfuly');
        }
    })
    res.send('hello');
});

app.listen(3000, () => {
    console.log('listening at 3000');
})