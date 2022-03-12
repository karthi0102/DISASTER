const mongoose = require('mongoose')
const {Schema}=mongoose
const passportLocalMongoose = require('passport-local-mongoose');
const opts = { toJSON: { virtuals: true } };
const userSchema = new Schema({
    name:String,
    email:String,
    aadhar:Number,
    phone:Number,
    district:String,
    state:String,
    location:String,
    password:String,
    college:String,
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
    ncc:{
        type:Schema.Types.ObjectId,
        ref:'Ncc'
    },
    nss:{
        type:Schema.Types.ObjectId,
        ref:'Nss'
    },
    officer:{
        type:Schema.Types.ObjectId,
        ref:'Officer',
    },
    ano:{
        type:Schema.Types.ObjectId,
        ref:'Ano'
    }
},opts)

userSchema.plugin(passportLocalMongoose); 
userSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong>${this.username}<strong>`
});
module.exports= mongoose.model('User',userSchema)