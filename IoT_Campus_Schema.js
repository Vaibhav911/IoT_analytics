var mongoose = require ("mongoose");

mongoose.connect( "mongodb+srv://vaibhav:vaibhav@cluster0-txbx7.mongodb.net/test?retryWrites=true");

var Schema = mongoose.Schema;

var Zone_Schema = new Schema({
    zoneId : { type: Number, required: true, unique: true},
    zoneName: { type: String, required: true},
    sensorId : {type: Number}
});

var Floor_Schema = new Schema({
    floorNo : { type: Number, required: true, unique: true},
    zoneArray : [Zone_Schema]
});

var Building_Schema = new Schema({
    buildingId : { type: Number, required: true, unique: true},
    buildingName: { type: String, required: true},
    floorArray : [Floor_Schema]
});

var Campus_Schema = new Schema({
    campusName: { type: String, required: true, unique: true},
    buildingArray : [Building_Schema]
});

const Zone = mongoose.model("Zone_Schema",Zone_Schema);
const Floor = mongoose.model("Floor_Schema",Month_Schema);
const Building = mongoose.model("Building_Schema",Building_Schema);
const Campus = mongoose.model("Campus_Schema",Campus_Schema);
module.exports = {Zone_Schema: Zone, Floor_Schema: Floor, Building_Schema: Buidling, Campus_Schema: Campus};