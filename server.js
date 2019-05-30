var express = require('express');
var app = express();
var cors = require('cors');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use('/hello', (req, res) => {
    console.log("recieved hello");
    res.send('received hello');
})

app.use('/', (req, res) => {
    console.log("hello");
    res.send('hello');
});

app.listen(3000, () => {
    console.log('listening at 3000');
})