require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect("mongodb://127.0.0.1:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema( {
    email: String,
    password: String
});

//we add this plugin before we create mongoose model
//*SECRET IS PASTED IN .ENV //WE CAN USE THEM HERE BY CALLING THEM LIKE
console.log(process.env.API_KEY);

userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]});
//this plugin works as follows
//it will encrypt when we call save
//and decrypt when we call find
//so we dont need to add any thing else in our code.

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
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save().then(() => {
        res.render("secrets");
    }).catch((err) => {
        console.log(err);
    })

}
);

app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).then((foundUser) => {
        if (foundUser.password === password) {
            res.render("secrets");
        }
    }).catch((err) => {
        console.log(err);
    })

    // User.findOne({email: username}, function(err, foundUser){
    //     if(err){
    //         console.lof(err);
    //     }else{
    //         if(foundUser){
    //            if(foundUser.password === password){
    //                 res.render("secrets");
    //            }
    //         }
    //     }
    // })
})


app.listen(3000, function () {
    console.log("server started on port 3000.");
});