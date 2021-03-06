var express = require("express");
var router = express.Router({
    mergeParams: true
});
var Yoga = require("../models/yoga");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//Comments New
router.get("/new", middleware.isLoggedIn, function (req, res) {
    // find campground by id
    console.log(req.params.id);
    Yoga.findById(req.params.id, function (err, yoga) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", {
                yoga: yoga
            });
        }
    });
});

//Comments Create
router.post("/", middleware.isLoggedIn, function (req, res) {
    //var rating = req.body.rating;

    console.log("req.body.rating-----" + req.body.rating);

    //lookup campground using ID
    Yoga.findById(req.params.id, function (err, yoga) {
        if (err) {
            console.log(err);
            res.redirect("/yoga");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.rating = req.body.rating;
                    //save comment
                    comment.save();
                    yoga.comments.push(comment);


                    // console.log("Old Rating: " + yoga.rating);

                    // var totalNumberOfRatings = yoga.comments.length;
                    // console.log("totalNumberOfRatings: " + totalNumberOfRatings);
                    // var previousAvgRating = yoga.rating;
                    // console.log("previousAvgRating :" + previousAvgRating);
                    // var previousTotalRating = previousAvgRating * (totalNumberOfRatings - 1)
                    // var newAvgRating = ((previousTotalRating + parseInt(req.body.rating)) / totalNumberOfRatings);
                    // console.log("newAvgRating :" + newAvgRating);
                    // yoga.rating = newAvgRating;
                    yoga.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect('/yoga/' + yoga._id);
                }
            });
        }
    });
});

router.get("/:commentId/edit", middleware.isLoggedIn, function (req, res) {
    // find campground by id
    Comment.findById(req.params.commentId, function (err, comment) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/edit", {
                yoga_id: req.params.id,
                comment: comment
            });
        }
    });
});

router.put("/:comment_id", function (req, res) {

    console.log("new ----rating---new: " + req.body.comment);
    console.log(req.body.comment);

    var updateValue = {
        'text': req.body.comment,
        'rating': parseInt(req.body.rating),
    };

    Comment.findOneAndUpdate({
        "_id": req.params.comment_id
    }, {
        $set: updateValue
    }).exec(function (err, comment) {
        if (err) {
            console.log(err);
            res.send(err)
            //res.render("edit");
        } else {
            console.log('new rating:   ' + comment.rating);
            console.log('new text:  ' + comment.text);

            res.redirect("/yoga/" + req.params.id);
        }
    });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            res.redirect("/yoga");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/yoga/" + req.params.id);
        }
    });
});

module.exports = router;