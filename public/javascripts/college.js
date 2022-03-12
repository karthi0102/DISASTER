
const csvToJson = require("csvtojson");

exports.getData = async () => {
    let colleges = [];
    const data = await csvToJson({
        trim: true,
    }).fromFile("./db/database.csv");
    data.map(e => {
        colleges.push(e['College Name'])
    })
   
    return colleges;
};