const mongoose = require('mongoose')
const User= require('../models/user')
const Ncc=require('../models/ncc')
const Nss=require("../models/nss")
mongoose.connect('mongodb://localhost:27017/Disaster',{useNewUrlParser:true,useUnifiedTopology:true})
.then( () => {
    console.log("Connection open")
}).catch(err => {
    console.log("OOPS !! ERROR")
})
const g=['Male','Female']

const seeds = async()=>{

    const number =Math.floor(Math.random());
        for(let i=0;i<50;i++){
            const nss=new Nss ({
                gender:g[number],
                proof:'jcpjidco'
            })
            await nss.save();
        }
}

seeds().then(()=>{
    mongoose.connection.close()
})

