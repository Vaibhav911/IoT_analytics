var mongoose = require ("mongoose");

mongoose.connect(...);

var Schema = mongoose.Schema;

var Reading_Schema = new Schema({
    timeStamp : { type: Timestamp, required: true, unique: true},
    //attributes depend on sensor, can be changed
    temperature : { type: Integer},
    luminosity : {type: Integer},
    humidity : {type: Integer}
});

var Day_Schema = new Schema({
    date : { type: Date, required: true, unique: true},
    readingArray : [Reading_Schema]
});

var Month_Schema = new Schema({
    month : { type: String, required: true, unique: true},
    dayArray : [Day_Schema];
});

var Year_Schema = new Schema({
    sensorId : { type: Integer, required: true, unique: true},
    year: { type: Integer, required: true, unique: true},
    monthArray : [Month_Schema];
});

//---------FOR ORGANISING WITHIN A CAMPUS-------------------

var Zone_Schema = new Schema({
    zoneId : { type: Integer, required: true, unique: true},
    zoneName: { type: String, required: true},
    sensorId : {type: Integer};
});

var Floor_Schema = new Schema({
    floorNo : { type: Integer, required: true, unique: true},
    zoneArray : [Zone_Schema];
});

var Building_Schema = new Schema({
    buildingId : { type: Integer, required: true, unique: true},
    buildingName: { type: String, required: true},
    floorArray : [Floor_Schema];
});

var Campus_Schema = new Schema({
    campusName: { type: String, required: true, unique: true},
    buildingArray : [Building_Schema];
});

module.exports = mongoose.model("Zone",Zone_Schema);
module.exports = mongoose.model("Floor",Floor_Schema);
module.exports = mongoose.model("Building",Building_Schema);
module.exports = mongoose.model("Campus",Campus_Schema);
module.exports = mongoose.model("Reading",Reading_Schema);
module.exports = mongoose.model("Day",Day_Schema);
module.exports = mongoose.model("Month",Month_Schema);
module.exports = mongoose.model("Year",Year_Schema);
