var mongoose = require ("mongoose");

mongoose.connect( "mongodb+srv://vaibhav:vaibhav@cluster0-txbx7.mongodb.net/test?retryWrites=true");

var Schema = mongoose.Schema;

var Sensor_Schema = new Schema({
    sensorId : {type: Number, required: true, unique: true},
    zoneId : { type: String, required: true},
    floorNo : { type: Number, required: true},
    buildingId : {type: String, required: true},
    campusName: {type: String, required: true},
});

var Zone_Schema = new Schema({
    zoneId : { type: String, required: true},
    floorNo : { type: Number, required: true},
    buildingId : {type: String, required: true},
    campusName: {type: String, required: true},
    sensorArray : [Sensor_Schema]
});

var Floor_Schema = new Schema({
    floorNo : { type: Number, required: true},
    buildingId : {type: String, required: true},
    campusName: {type: String, required: true},
    zoneArray : [Zone_Schema]
});

var Building_Schema = new Schema({
    buildingId : {type: String, required: true},
    campusName: {type: String, required: true},
    floorArray : [Floor_Schema]
});

var Campus_Schema = new Schema({
    campusName: { type: String, required: true, unique: true},
    buildingArray : [Building_Schema]
});

const Sensor = mongoose.model("Sensor_Schema", Sensor_Schema)
const Zone = mongoose.model("Zone_Schema",Zone_Schema);
const Floor = mongoose.model("Floor_Schema",Month_Schema);
const Building = mongoose.model("Building_Schema",Building_Schema);
const Campus = mongoose.model("Campus_Schema",Campus_Schema);
module.exports = {Sensor_Schema: Sensor, Zone_Schema: Zone, Floor_Schema: Floor, Building_Schema: Building, Campus_Schema: Campus};
