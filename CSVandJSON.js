const CSVToJSON = require("csvtojson");
const JSONToCSV = require("json2csv").parse;
const FileSystem = require("fs");

CSVToJSON().fromFile("./source.csv").then(source => {
    source.push({
        "sku": "34890",
        "title": "Fortnite",
        "hardware": "Nintendo Switch",
        "price": "00.00"
    });
    var csv = JSONToCSV(source, { fields: ["sku", "title", "hardware", "price" ]});
    FileSystem.writeFileSync("./destination.csv", csv);
});
