var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
var flash = require("connect-flash");
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodOverride = require("method-override");
var passportLocalMongoose = require('passport-local-mongoose');
var Campground = require("./models/campground");
var Comment    = require("./models/comment");
var User = require('./models/user');
var seedDB = require("./seeds");
//requiring routes
var commentsRoutes = require("./routes/comments");
var campgroundsRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");

seedDB(); //seed the database

mongoose.connect('mongodb://localhost:27017/rolling_thunder', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine" , "ejs");

app.use(express.static(__dirname + "/public"));

app.use(methodOverride("_method"));

app.use(flash());
//require moment js
app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret:"Aryan Is Great!",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error     = req.flash("error");
	res.locals.success     = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(campgroundsRoutes);
app.use(commentsRoutes);

app.listen(3000,function(){
	console.log("The Rolling Thunder Has Started .")
});