var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User     = require("../models/user");

router.get("/",function(req,res){
    res.render("landing")
});

router.get("/register",function(req, res){
	res.render("register", {page: 'register'});
});

router.post("/register",function(req, res){
	var newUser = new User({username: req.body.username});
	// if(req.body.adminCode === 'SecretCode123'){
	// 	newUser.isAdmin = true;
	// }//
	if(req.body.adminCode === "secretcode123"){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password,function(err, user){
		if(err){
			console.log(err);
			return res.render("register", {"error": err.message});
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success","Successfully Signed In ! Welcome To RollingThunder " + user.username);
			res.redirect("/campgrounds");
		});
	});
});

router.get("/login",function(req, res){
	res.render("login", {page: 'login'});
});
//middleware
//login logic
//app.post("page",middleware,callback fxn)
router.post("/login",passport.authenticate("local",{
	successRedirect : "/campgrounds",
	failureRedirect : "/login",
	failureFlash: true,
    successFlash: 'Welcome To RollingThunder!'
   }), function(req, res){
});

router.get("/logout",function(req, res){
	req.logout();
	req.flash("success", "Logged You Out !");
	res.redirect("/campgrounds");
});

function isLoggedIn(req, res ,next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;