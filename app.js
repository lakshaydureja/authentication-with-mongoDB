require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds=10;

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//we add this plugin before we create mongoose model
//*SECRET IS PASTED IN .ENV //WE CAN USE THEM HERE BY CALLING THEM LIKE
console.log(process.env.API_KEY);

// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });
//.plugin is commented to learn hashing
//.this plugin works as follows
//.it will encrypt when we call save
//.and decrypt when we call find
//.so we dont need to add any thing else in our code.

const User = new mongoose.model("User", userSchema);


app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", function (req, res) {
    // const newUser = new User({
    //     email: req.body.username,
    //     password: req.body.password

    //*     // password: md5(req.body.password)  //.for md5 hashing
    // });
    // newUser.save().then(() => {
    //     res.render("secrets");
    // }).catch((err) => {
    //     console.log(err);
    // })

//*now for hashning and salting with bcrypt
bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
    const newUser = new User({
        email: req.body.username,
        password: hash

        // password: md5(req.body.password)  //.for md5 hashing
    });
    newUser.save().then(() => {
        res.render("secrets");
    }).catch((err) => {
        console.log(err);
    })


    
});


});

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    //. const password = md5(req.body.password);   for md5
    // User.findOne({ email: username }).then((foundUser) => {
    //     if (foundUser.password === password) {
    //         res.render("secrets");
    //     }
    // }).catch((err) => {
    //     console.log(err);
    // })

    //* for bcrypt below

    User.findOne({ email: username }).then((foundUser) => {
        bcrypt.compare(password, foundUser.password, function(err, result) {
            if(result == true) {
              res.render("secrets");

            }

        });
        
    }).catch((err) => {
        console.log(err);
    })

  
})


app.listen(3000, function () {
    console.log("server started on port 3000.");
});