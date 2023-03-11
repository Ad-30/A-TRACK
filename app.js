const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
var path = require('path');
const nodemailer = require("nodemailer");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const multer = require('multer');
const FormData = require('form-data');
require('dotenv').config();
const PDFDocument = require('pdfkit');
const storage = multer.memoryStorage();
const app = express();
mongoose.connect(process.env.MONGO);
const LocalStrategy = require('passport-local');
let mail_id = "";
let useremail = "";
let lecattend = "";
let labattend = "";
let isumattend = "";
let lectotal = "";
let labtotal = "";
let isumtotal = "";
let current2 = "";
let total2 = "";
let details = {
  fname : "",
  lname : "",
  college : "",
  course : "",
  branch : "",
  sem : "",
  startDate : "",
  endDate : "",
  subjects : "",
  lecture : "",

  labs : "",
  lecat : "",
  labat : "",
  minper : ""
};
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID1,
    pass: process.env.MAIL_PASSWORD
  }
});
passport.use(new LocalStrategy(function verify(username, password, cb) {
  useremail = username;
  db.get('SELECT * FROM users WHERE username = ?', [username], function(err, user) {
    if (err) {
      return cb(err);
    }
    if (!user) {
      return cb(null, false, {
        message: 'Incorrect username or password.'
      });
    }

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) {
        return cb(err);
      }
      if (!crypto.timingSafeEqual(user.hashed_password, hashedPassword)) {
        return cb(null, false, {
          message: 'Incorrect username or password.'
        });
      }
      return cb(null, user);
    });
  });
}));


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_ID1,
    pass: process.env.MAIL_PASSWORD
  }
});
mongoose.set('strictQuery', true);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false,

}));
app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
const detailSchema = {
  username : String,
  fname : String,
  // lname : String,
  email : String,
  date : String,
  // college : String,
  // course : String,
  // branch : String,
  sem : Number,
  // startDate : Date,
  // endDate : Date,
  // subjects : Number,
  // lecture : Number,
  //
  // labs : Number,
  // lecat : Number,
  // labat : Number,
  minper : Number,
  total : Number,
  current : Number
}
const Details = mongoose.model("Details", detailSchema);

app.get("/", function(req, res) {
  if (req.isAuthenticated()) {
    res.redirect('/home');
  } else {
    res.render("login");
  }
});
app.get("/home", function(req, res) {
  if (req.isAuthenticated()) {
    const now = new Date();
  const options = {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  };
  const today = now.toLocaleDateString('en-IN', options);
    const date = new Date();
    const query = Details.findOne({username:req.user.username});
    const promise = query.exec();
    promise.then(function(results){

      current2 = results.current;
      total2 = results.total;

      res.render('home',{
        percent : (parseInt(current2)/parseInt(total2))*100,
        data : results,
        date : date,
        date1: today
      });
    });

    // Details.find({username:req.user.username},function(err, results){
    //   current2 = results.current;
    //   total2 = results.total;
    // });


  } else {
    res.render("login");
  }
});
app.get("/signup", function(req, res) {
  res.render('signup', { message: null });
});
app.get("/details", function(req, res) {
  res.render("details");
});
app.post('/login', passport.authenticate('local', {

  successRedirect: '/home',
  failureRedirect: '/login'
}));
app.get("/login",function(req,res){
  res.render("login");
});


app.post("/signup", function(req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {

      res.render('signup', { message: 'E-mail already registered' });
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/details");
      });
    }
  });
});

app.post("/details", function(req, res) {
  const now = new Date();
const options = {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
};
const today = now.toLocaleDateString('en-IN', options);
  details = new Details({
    username : req.user.username,
    fname : req.body.fname,
    // lname : req.body.lname,
    email : req.body.email,
    date : today,
    // college : req.body.college,
    // course : req.body.course,
    // branch : req.body.branch,
    sem : req.body.semester,
    // startDate : req.body.startDate,
    // endDate : req.body.endDate,
    // subjects : req.body.subjects,
    // lecture : req.body.lecture,
    //
    // labs : req.body.labs,
    // lecat : req.body.lecat,
    // labat : req.body.labat,
    minper : req.body.minper,
    total : req.body.total,
    current : req.body.current
  });
  details.save().then(() => res.redirect("/home"));
  // details.save(function saving(err) {
  //
  //   if (!err) {
  //
  //
  //     fname = details.fname;
  //     lname = details.lname;
  //     mail_id = details.email;
  //
  //
  //     var mailOptions = {
  //       from: '"A-track" <process.env.MAIL_ID1>',
  //       to: mail_id,
  //       subject: 'Registered',
  //       text: '' + '' + "Hy" + ' .',
  //       html: '<h3>Dear ' + fname + ' ' + lname + ',</h3><br>You have successfully registered at A-track' + '<h3 style="color:red">' + "" + '</h3>'
  //     };
  //
  //     transporter.sendMail(mailOptions, function(error, info) {
  //       if (error) {
  //         console.log(error);
  //       } else {
  //         console.log('Email sent: ' + info.response);
  //       }
  //     });
  //   }
  // });

  // console.log(details);

});

app.post("/home",function(req,res){
  let lec1 = req.body.lecture;
  let lab1 = req.body.lab;
  let i1 = req.body.i;
  let lec2 = req.body.lecture2;
  let lab2 = req.body.lab2;
  let i2 = req.body.ii;
  let total1 = parseInt(lec2)+parseInt(lab2*2)+parseInt(i2*3)
  let current1 = parseInt(lec1)+parseInt(lab1*2)+parseInt(i1*3)

  const now = new Date();
const options = {
  timeZone: 'Asia/Kolkata',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
};
const today = now.toLocaleDateString('en-IN', options);

  const query = Details.updateOne({username: req.user.username},{$inc: { total: total1 , current : current1},$set: { date: today}});
  const promise = query.exec();
  promise.then(() => res.redirect("/home"));
    // function(err){
    // if(err){
    //   console.log(err);
    // }
    // else{
    //   res.redirect("/home");
    // }
  // });
  // Details.updateOne({username: req.user.username},{$inc: { total: total1 , current : current1}},function(err,result){
  //   if(err){
  //     console.log(err);
  //   }
  //   else{
  //     res.redirect("/home");
  //   }
  // })
});


app.get("/details2", function(req, res) {
  res.render("details2");
});

app.get("/see", function(req, res) {
  res.render("see");
});
app.post("/see",function(req,res){
   useremail = req.body.email;
   res.redirect("/see2");
});
app.get("/see2", function(req, res) {
  Details.find().then((datas)=>{

    res.render("see2", {
      id: useremail,
      data: datas

    });
  });
});
app.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



app.use(function(req, res, next) {
  res.status(404).send("Sorry, that route doesn't exist. Have a nice day :)");
});

app.listen(3056, function() {
  console.log("Server started on port 3056");
});
