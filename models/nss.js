const mongoose= require('mongoose')
const {Schema}= mongoose

const nssSchema=new Schema({
    gender:{
        type:String,
        enum:['Male','Female']
    },

    state:String,
    district:String,
    certificate:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User',
    }
})

module.exports=mongoose.model("Nss",nssSchema)