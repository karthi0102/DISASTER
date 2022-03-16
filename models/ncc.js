const mongoose = require('mongoose')
const {Schema} = mongoose

const nccSchema = new Schema({
            group:String,
            gender:{
                type:String,
                enum:['sd','sw']
            },
            battalion:String,
            regimental:String,
            cadet:String,
            verified:{
                type:Number,
            },
            author:{
                type:Schema.Types.ObjectId,
                ref:'User',
            }
})

module.exports= mongoose.model('Ncc',nccSchema)