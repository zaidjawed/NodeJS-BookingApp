var Users = require("../models/user");
//all the middleware goes here
var middlewareObj = {};


//middleware for loggedin
middlewareObj.isLoggedIn = function(req, res, next)
{
    if(req.isAuthenticated())
    {
        return next();
    }
    req.flash("error", "Please Login to do that!");
    res.redirect("/");
}




module.exports = middlewareObj;
