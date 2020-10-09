var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index");//index.js file as it is created as a default file for js files for visiting in it so ../middleware is also right.

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    // Get all campgrounds from DB
    Campground.find({}, function (err, allCampgrounds) {
        if (err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    });
});

router.get("/campgrounds",function(req,res){
	Campground.find({},function(err,allCampgrounds){
		if(err){
			console.log(err);
		}
		else{
			res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser : req.user});//now they are recieved from the database
		}
	})
});

router.post("/campgrounds", middleware.isLoggedIn , function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id:req.user._id,
		username:req.user.username
	}
	var newCampground = {name:name , price:price , image:image ,description:description ,author:author};
	//create new campground by inputing from user
	Campground.create(newCampground,function(err, newlyCreatedCampground){
		if(err){
			console.log(err);
		}
		else{
			//redirect back to campgrounds
			console.log(newlyCreatedCampground);
			res.redirect("/campgrounds");
		}
	});
});

router.get("/campgrounds/new", middleware.isLoggedIn , function(req,res){
	res.render("campgrounds/new");
});

router.get("/campgrounds/:id",function(req,res){
	Campground.findById(req.params.id).populate("comments likes").exec(function(err,foundCampground){
		if(err || !foundCampground){
			req.flash("error" , "Campground Not Found!");
			res.redirect("back");
		}
		else{
			console.log(foundCampground);
			res.render("campgrounds/show", {campground: foundCampground , currentUser : req.user});
		}
	});
});

// Campground Like Route
router.post("/campgrounds/:id/like", middleware.isLoggedIn, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
        }

        // check if req.user._id exists in foundCampground.likes
        var foundUserLike = foundCampground.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserLike) {
            // user already liked, removing like
            foundCampground.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundCampground.likes.push(req.user);
        }

        foundCampground.save(function (err) {
            if (err) {
                console.log(err);
                return res.redirect("/campgrounds");
            }
            return res.redirect("/campgrounds/" + foundCampground._id);
        });
    });
});


//EDIT CAMPGROUND
router.get("/campgrounds/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
		Campground.findById(req.params.id, function(err, foundCampground){
				res.render("campgrounds/edit",{campground: foundCampground});
	});
});

//UPDATE CAMPGROUND 

router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function (req, res) {
    // find and update the correct campground
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.image = req.body.campground.image;
			campground.price = req.body.campground.price;
            campground.save(function (err) {
                if (err) {
                    console.log(err);
                    res.redirect("/campgrounds");
                } else {
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//DELETE OR DESTROY THE CAMPGROUND

router.delete("/campgrounds/:id",middleware.checkCampgroundOwnership,function(req, res){
	Campground.findByIdAndDelete(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});


module.exports = router;