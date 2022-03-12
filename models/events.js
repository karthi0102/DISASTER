const mongoose = require("mongoose")
const {Schema} = mongoose

const eventSchema = new Schema({
    title:String,
    image:String,
    desc:String,
    location:String,
    days:String,
    phone:Number,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
})

module.exports=mongoose.model('Event',eventSchema)