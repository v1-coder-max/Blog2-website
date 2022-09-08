//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const GoogleStrategy = require('passport-google-oauth20').Strategy
// const findOrCreate = require('mongoose-findorcreate');

const homeStartingContent = "Hello Welcome to my Official Blog Website which is develop by Vishal Kumar Nama";
const aboutContent = "Hello this is Vishal Kumar Nama.I live in Jaipur. Currently I am pursuing my B.Tech at SKIT College in CSE Branch.";
const contactContent = "You Can Contact Me Using Below Information";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogDB",{useNewUrlParser:true});

const userSchema = new mongoose.Schema ({
  email:String,
  password:String,
  googleId:String
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate);



const postSchema = {
  title:String,
  content:String
};

const Post = mongoose.model("Post",postSchema);

const commentSchema = {
  name:String,
  commentBody:String
};

const Comment = mongoose.model("Comment",commentSchema);

const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/secrets",
//     // userProfileURL:"https://www.googleapis.com/oauth/v3/userinfo"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     // console.log(profile);
//
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));


app.get("/",function(req,res){
    res.render("template");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.get("/home",function(req,res){
  if(req.isAuthenticated()){
    Post.find({},function(err,posts){
      res.render("home",{homeContent:homeStartingContent,posts:posts});
    })
  }
  else{
    res.redirect("/login");
  }

});

app.get("/about",function(req,res){
  res.render("about",{aboutContent:aboutContent});
});

app.get("/contact",function(req,res){
  res.render("contact",{contactContent:contactContent});
});

app.get("/compose",function(req,res){
  res.render("compose");
});

app.post("/compose",function(req,res){

  title = req.body.postTitle;
  content = req.body.postBody;

  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  })

  post.save(function(err){
    if (!err){
      res.redirect("/home");
    }
 });




});

app.get("/posts/:postId", function(req, res){

  const requestedPostId = req.params.postId;

  Post.findOne({_id: requestedPostId}, function(err, post){

   res.render("post", {

     title: post.title,

     content: post.content

   });
});

});

app.post("/posts/:postId",function(req,res){

  const PostId = req.params.postId;

  console.log(PostId);

  const comment = new Comment({
    name: req.body.name,
    commentBody: req.body.commentBody
  })

  comment.save(function(err){
    if (!err){
      res.redirect("/compose");
  }
});

});

app.post("/register",function(req,res){

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/home");
      });
    }
  })

});

app.post("/login",function(req,res){

  const user = new User({
    username:req.body.username,
    password:req.body.password
  });

  req.login(user,function(err){
    if (err) {
      console.log(err);
    }
    else{
      passport.authenticate("local")(req,res, function(){
        res.redirect("/home");
      });
    }
  })

});







app.listen(3000, function() {
  console.log("Server started on port 3000");
});
