var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");//index.js file as it is created as a default file for js files for visiting in it so ../middleware is also right.

router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}
		else{
			res.render("comments/new",{campground: campground , currentUser : req.user});
		}
	});
});

router.post("/campgrounds/:id/comments",middleware.isLoggedIn , function(req, res){
	//lookup campground using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			Comment.create(req.body.comment,function(err, comment){
				if(err){
					req.flash("error","Something Went Wrong !");
					console.log(err);
				}
				else{
					//add username and id to a comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					console.log("A new comment on new campground is : " + req.user.username);
					//save comment
					campground.comments.push(comment);
					campground.save();
					req.flash("success","Successfully Added Comment In Campground !");
					res.redirect('/campgrounds/' + campground._id);
				}
			});
		}
	});
	//create new comments
	//connect new comment to campground
	//redirect campground show page
});

//edit comment get route
router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err || !foundCampground){
			req.flash("error","Campground Not Found!");
			res.redirect("back");
		}
		else{
			Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		}
		else{
			res.render("comments/edit",{campground_id:req.params.id, comment:foundComment});
		}
	   });
		}
	});
});

//edit comment put request by updating it
router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}
		else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DELETING A COMMENT OR DESTROY COMMENT ROUTE
router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req, res){
	Comment.findByIdAndDelete(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		}
		else{
			req.flash("success","Comment Deleted !");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;