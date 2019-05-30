var mongoose = require ("mongoose");

mongoose.connect( "mongodb+srv://vaibhav:vaibhav@cluster0-txbx7.mongodb.net/test?retryWrites=true");

var Schema = mongoose.Schema;


var Reading_Schema = new Schema({
    timeStamp : { type: Date, default: Date.now(), required: true, unique: true},
    //attributes depend on sensor, can be changed
    temperature : { type: Number},
    luminosity : {type: Number},
    humidity : {type: Number}
});

var Day_Schema = new Schema({
    date : { type: Date, required: true, unique: true},
    readingArray : [Reading_Schema]
});

var Month_Schema = new Schema({
    month : { type: String, required: true, unique: true},
    dayArray : [Day_Schema]
});

var Year_Schema = new Schema({
    sensorId : { type: Number, required: true, unique: true},
    year: { type: Number, required: true, unique: true},
    monthArray : [Month_Schema]
});

// const userSchema = mongoose.model('users', user),
// const organizationSchema = mongoose.model('organizations', organization)

// module.exports = { User: userSchema, Organization: organizationSchema }


// module.exports = mongoose.model("Zone",Zone_Schema);
// module.exports = mongoose.model("Floor",Floor_Schema);
// module.exports = mongoose.model("Building",Building_Schema);
// module.exports = mongoose.model("Campus",Campus_Schema);
const Year = mongoose.model("Year_Schema",Year_Schema);
const Month = mongoose.model("Month_Schema",Month_Schema);
const Day = mongoose.model("Day_Schema",Day_Schema);
const Reading = mongoose.model("Reading_Schema",Reading_Schema);
module.exports = {Reading_Schema: Reading, Day_Schema: Day, Month_Schema: Month, Year_Schema: Year};
