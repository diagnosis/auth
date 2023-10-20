//jshint esversion:6

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;
const app = express();
const mongoose = require('mongoose');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require('passport-local-mongoose');

// const md5 = require("md5")
// const encrypt = require("mongoose-encryption");

app.use(express.static("public"));
app.set('view engine', `ejs`)
app.use(bodyParser.urlencoded({
    extended:true
}));
app.use(flash());
app.use(session({
    secret: "Orospu cocugu Tayyip Erdogan",
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
}
const userSchema = new mongoose.Schema({
    email:String,
    password:String
});
userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});
const User = mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get('/',(req,res)=>{
   res.render('home');
});

app.get('/login',(req,res)=>{
    res.render('login');
});
app.get('/register',(req,res)=>{
    res.render('register');
});
app.get("/secrets",(req,res)=>{
   if(req.isAuthenticated()){
       res.render("secrets") ;
   }
   else{
       res.redirect("/login")
   }

});
app.get('/logout', function(req, res, next){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});
app.post('/register',async (req,res)=>{

        User.register({username:req.body.username,}, req.body.password, (err, user)=>{
        if(err){
            console.log(err.message);
        }
        else{
          passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets")  ;
          });

        }
    });

});
app.post("/login", passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
    failureFlash: true, // You can use flash messages for error handling if needed
}));




app.listen(PORT, ()=>{
   console.log(`Listening app on ${PORT}`)
});