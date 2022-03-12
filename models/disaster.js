const mongoose = require("mongoose")

const {Schema} = mongoose

const disasterSchema = new Schema({
    message:String,
    assemble:String,
    location:String,
    persons:Number,
    appliers:[
        {
        type:Schema.Types.ObjectId,
        ref:'User',
        }
    ],
})

module.exports = mongoose.model('Disaster',disasterSchema);
