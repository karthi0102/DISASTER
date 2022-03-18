const mongoose = require('mongoose')
const {Schema} = mongoose

const officerSchema = new Schema({
    group:String,
    gender:{
        type:String,
        enum:['sd','sw']
    },
    state:String,
    district:String,
    battalion:String,
    regimental:Number,
    cadet:String,
    verified:Number,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
    }
})


module.exports = mongoose.model('Ano',officerSchema);
