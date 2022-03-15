if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
  }
const express=require('express')
const app = express()
const swal=require('sweetalert')
const college = require('./public/javascripts/college')
const sendEmail = require('./public/javascripts/mail')
const path = require('path');
const sendMail=require('./public/javascripts/nodemail')
const mongoose = require('mongoose');
const methodOverride=require('method-override');
const ejsMate = require('ejs-mate');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const session = require('express-session');
const flash = require('connect-flash');
const Ncc = require('./models/ncc')
const Nss =require('./models/nss')
const Ano = require('./models/ano')
const Officer = require('./models/officer')
const Event = require('./models/events')
const User = require('./models/user')
const passport = require('passport');
const LocalStrategy = require('passport-local');
const fast2sms=require('fast-two-sms')
const ExpressError=require('./utils/ExpressError')
const Disaster = require("./models/disaster");
mongoose.connect('mongodb://localhost:27017/Disaster',{useNewUrlParser:true,useUnifiedTopology:true})
.then( () => {
    console.log("Connection open")
}).catch(err => {
    console.log("OOPS !! ERROR")
})

const sessionConfig = {
    
    name: 'Disaster',
    secret:"nomoresecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        // httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.use(methodOverride('_method'))

app.use(express.static(path.join(__dirname,'public')) )
app.set('views', path.join(__dirname, 'views'))
app.use(session(sessionConfig));
app.use(flash());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})
app.get('/',(req,res)=>{
    
    res.render('home')
})

app.get('/disaster',async(req,res)=>{  
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
        const id = req.user._id;
        const user = await User.findById(id).populate('ncc').populate('nss').populate('officer').populate('ano');
        
        res.render("index.ejs",{user})
    
})
app.get('/verify',async(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login');
    }
    const id=req.user._id
    const user = await User.findById(id);
   let college=user.college
  const nUser= await User.find({college}).populate('ncc')
  let nccUser=[]
  for(let u of nUser){
      if(u.verified==0){
          nccUser.push(u)
      }
  }
  res.render('verify',{user,nccUser})
    
})
app.get('/verified/:id',async(req,res)=>{
    const {id}=req.params
    const ncc = await Ncc.findById(id)
    ncc.verified=1;
    console.log(ncc)
    await ncc.save()
    res.redirect('/verify')
})
app.get('/officer',(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    res.render('officerreg')
})
app.post('/officer',async(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }else{
    const id=req.user._id;
    const user = await User.findById(id);
    const officer = new Officer(req.body.ncc);
    officer.verified=0;
    officer.author=user._id;
    user.officer=officer._id;
    await officer.save();
    await user.save();
    res.redirect('/disaster');
    }
})
app.get('/ano',(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    res.render('anoreg')
})

app.post('/ano',async(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }else{
    const id=req.user._id;
    const user = await User.findById(id);
    const ano = new Ano(req.body.ncc);
    ano.verified=0;
    ano.author=user._id;
    user.ano=ano._id;
    await ano.save();
    await user.save();
    res.redirect('/disaster');
    }
})

app.get('/events',async(req,res)=>{
    const events = await Event.find({});
    res.render('events',{events})
})
app.post('/events',async(req,res)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.event.location,
        limit: 1
    }).send()
    const event = new Event(req.body.event);
    event.geometry = geoData.body.features[0].geometry;
    await event.save();
    res.redirect('/events')
})
app.get('/events/new',(req,res)=>{
    res.render('eventnew');
})
app.get('/events/:id',async(req,res)=>{
        const {id}=req.params;
        const event = await Event.findById(id);
        res.render("eventshow",{event})
})
app.get('/events/:id/edit',async(req,res)=>{
    const {id}=req.params;
    const event = await Event.findById(id)
    res.render('eventedit',{event})
})

app.put('/events/:id',async(req,res)=>{
    const {id}=req.params;
    const event= await Event.findByIdAndUpdate(id, { ...req.body.event});
    await event.save();
    res.render(`/events/${id}`);

})


app.get('/admin',async(req,res)=>{
        const user = await User.find();
        const arr=[]
          for(let u of user){
        arr.push(u.district)
        }
    let states = [...new Set(arr)]
        res.render('admin.ejs',{states,user})
       
})
app.post('/admin',async(req,res)=>{
    const {district}=req.body
    const user = await User.find({district})
    const arr=[];
    const arr1=[]
    for(let u  of user){
        arr.push(u.phone)
        arr1.push(u.email)
        }
        
        let phone = [...new Set(arr)]
        let email =[...new Set(arr1)]
        res.render('message',{phone,email})
})
app.get('/dashboard',async(req,res)=>{
    const users = await User.find({}).populate('ncc').populate('nss').populate('officer').populate('ano');
    const ncc = await Ncc.find({}).populate('author');
    const nss=await Nss.find({}).populate('author');
    const officer=await Officer.find({}).populate("author")
    const ano =await Ano.find({}).populate('author')
    let sw=0
    let sd=0
    let male=0
    let female=0
    let display=0
    for(let o of officer){
        if(o.gender=='sw'){
            sw+=1;
        }else{
            sd+=1;
        }
    }
    for(let a of ano){
        if(a.gender=='sw'){
            sw+=1;
        }else{
            sd+=1;
        }
    }
    for(let n of ncc){
        if(n.gender=='sw'){
            sw+=1
        }else{
            sd+=1;
        }
    }
    for(let n of nss){
        if(n.gender=='Male'){
            male+=1;
        }else{
            female+=1;
        }
    }

    res.render("dashboard.ejs",{users,ncc,nss,officer,ano,sw,sd,male,female,display})
})

app.post('/dashboard',async(req,res)=>{
        const {state,district}=req.body;
        const users = await User.find({state,district})
        const ncc = await Ncc.find({state,district})
        const nss=await Nss.find({state,district})
        const officer=await Officer.find({}).populate("author")
        const ano =await Ano.find({}).populate('author')
        let display=1
        res.render('dashboard',{users,display,ncc,nss,officer,ano})
})
app.post('/mail',async(req,res)=>{
    const {feedback,email} = req.body;

    console.log('Data: ', req.body);

    sendEmail(email,feedback, function(err, data) {
        if (err) {
            console.log('ERROR: ', err);
            return res.status(500).json({ message: err.message || 'Internal Error' });
        }
        req.flash("success",'Feedback sent successfully')
        return res.redirect('/disaster');
    });
})

app.get('/calamity',async(req,res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }
    const disaster = await Disaster.find({}).populate('appliers');
    res.render('disaster',{disaster})
})

app.get("/calamity/new",(req,res)=>{
    res.render("calamityNew")
})

app.post('/calamity',async(req,res)=>{
    const disaster = new Disaster(req.body.calamity);
    await disaster.save();
    res.redirect('/calamity')
})
app.get('/calamity/:id',async(req,res)=>{
    const {id}=req.params;
    const disaster = await Disaster.findById(id)
    res.render('disasterShow',{disaster})
})
app.get('/apply/:id',async(req,res)=>{
    const {id}=req.params;
    const uId=req.user._id;
    const disaster = await Disaster.findById(id);
    disaster.appliers.push(uId)
    await disaster.save();
    res.redirect('/disaster')
})

app.delete('/calamity/:id',async(req,res)=>{
    const {id}=req.params;
    const disaster =await Disaster.findByIdAndDelete(id);
    res.redirect('/calamity')
})
app.get('/view/:id',async(req,res)=>{
    const {id} =req.params;
    const disaster =await Disaster.findById(id).populate('appliers');
    res.render('view',{disaster})
})
app.get('/ncc',(req,res)=>{
    res.render('ncc')
})

app.post("/ncc",async(req,res)=>{
    if(req.isAuthenticated()){
    const id=req.user._id;
    const user = await User.findById(id);
    const ncc = new Ncc(req.body.ncc);
    ncc.verified=0;
    ncc.author=req.user._id;
    user.ncc=ncc._id;
    await ncc.save();
    await user.save();
    res.redirect('/');
    }else{
        res.redirect('/login')
    }
})
app.get('/nss',(req,res)=>[
    res.render('nss')
])
app.post('/nss',async(req,res)=>{
    if(req.isAuthenticated()){
    const id= req.user._id;
    const user= await User.findById(id)
    const nss = new Nss(req.body.nss)
    nss.author=req.user._id;
    nss.verified=1;
    user.nss=nss._id;
    await nss.save()
    await user.save()
    res.redirect('/')
    }else{
        res.redirect('/login');
    }

})
app.post("/message/e/:email",async(req,res)=>{
    const email=req.params.email;
    const message=req.body.message
    sendMail.sendMail(email,message);
    res.redirect('/');
})
app.post('/message/:phone',async (req,res)=>{
    try{
    const {phone} = req.params;
    console.log(phone,req.body.message)
    const response=await fast2sms.sendMessage({authorization:process.env.API, message:req.body.message, numbers:[phone] })
    console.log(response)
    }
    catch(e){
        console.log(e);
    }
   
    res.redirect('/admin')
})
app.get('/map',async(req,res)=>{
    const user = await User.find({})
    res.render('map', { user})
})
app.get('/login',(req,res)=>{
    res.render('login.ejs')
})

app.get('/register',(req,res)=>{
   
    college.getData().then(data=>{
        res.render("register.ejs",{data});
    })
    
})

app.post('/register',async(req,res)=>{

    
    try{
        const {name,username,image,email,aadhar,phone,state,district,college,password,cpassword}=req.body;
        const geoData = await geocoder.forwardGeocode({
            query: `${state},${district}`,
            limit: 1
        }).send()

        if(cpassword!=password){
            req.flash('error',"Confirm your password");
            return res.redirect('/register')
        }
        const user = new User({name,username,image,email,aadhar,phone,state,college,district})
        user.geometry = geoData.body.features[0].geometry;
        const newUser=await User.register(user,password);
        req.login(newUser,err =>{
            if(err) return next(err);
            req.flash('success','Welcome to Disaster');
            return res.redirect('/disaster');
        })
        }catch(e){
            req.flash('error',e.message);
            res.redirect('/register')
        }
})





app.get('/login',(req,res)=>{
    res.render("login.ejs")
})

app.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),(req,res)=>{
    req.flash('success',`Welcome Back`);
    res.redirect('/disaster');
})

app.get('/logout',(req,res)=>{
    req.logOut();
    req.flash('success',"GOODBYE ");
    res.redirect('/');
})



app.all('*',(req,res,next) => {
    next(new ExpressError('Page Not Found',404))
})
app.use((err,req,res,next) => {
    const {statusCode=500} = err;
    if(!err.message) err.message='something went wrong';
    res.status(statusCode).render('error.ejs',{err});
})

app.listen(8080,()=>{
    console.log("Server is running on port 8080")
})

