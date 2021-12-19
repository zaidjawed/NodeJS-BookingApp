var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    mongoose        = require("mongoose"),
    User            = require("./models/user"),
    flash           = require("connect-flash");

var middleware = require("./middleware/middleware");

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rtrevor326@gmail.com',
    pass: 'rtrevor326@#$%123'
  }
});


mongoose.connect("mongodb://localhost/bookingApp" ,  { useNewUrlParser: true , useUnifiedTopology: true  });
mongoose.set('useCreateIndex', true);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(flash() );



app.use(require("express-session")({
    secret: "secret paragraph apparently required!",
    resave : false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy({
    usernameField: 'email',
  },User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});

//landing route
app.get("/" , (req,res) => {
  res.render("index");
});


//register route
app.get("/register" , (req,res) => {
  res.render("register")
});

app.post("/register" , (req,res) => {
  if(req.body.password === req.body.confirmPassword){

    var newUser = new User({username: req.body.email , guide: req.body.guide});
    User.register(newUser, req.body.password, function(err, user)
    {
        if(err)
        {   console.log(err);
            req.flash("error", err.message);
            res.redirect("/");
        }
        else
        {
          var mailOptions = {
            from: 'rtrevor326@gmail.com',
            to: req.body.email,
            subject: 'Registered on Booking App',
            text: `Your password for booking app is ${req.body.password}`
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent');
            }
          });

            passport.authenticate("local")(req, res, function()
            {
                req.flash("success", "Account created");
                res.redirect("/booking");
            });
        }
    });
  }
  else {
    req.flash("error", "Password should match");
    res.redirect("/")
  }
});

//confirm
app.get("/confirm" , (req,res) => {
  res.render("confirm");
})


//booking route
app.get("/booking" , middleware.isLoggedIn , (req,res) => {
  res.render("booking" , {user: req.user});
});

app.post("/booking" , middleware.isLoggedIn , (req,res) => {
  var mailOptions = {
    from: 'rtrevor326@gmail.com',
    to: req.user.username,
    subject: 'Registered on Booking App',
    text: `Booking Confirmed with following details :
            name-${req.body.name}
            Mobile number-${req.body.number}
            guide-${req.user.guide}
            travel location-${req.body.location}
            travel date -
              from-${req.body.startDate}
              to-${req.body.endDate}`
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent');
    }
  });
  res.redirect("/confirm");
});

//login route
app.post("/login", passport.authenticate("local",
{
    successRedirect: "/booking",
    failureRedirect: "/",
    failureFlash: true
}),
        function(req, res){
});



app.listen(3000 , function(){
   console.log("App running");
});
