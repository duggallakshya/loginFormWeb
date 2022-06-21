require('dotenv').config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
require("./db/conn");
const path = require("path" );
const hbs = require("hbs");
const Register = require("./models/registers"); 
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views")
const partials_path = path.join(__dirname, "../templates/partials")
// console.log(static_path);  
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.get("/",(req,res) => {
    res.render("index");
})  

app.get("/secret", auth ,(req,res) => {
    console.log(req.cookies.jwt);
    res.render("secret");
})  

app.get("/logout", auth ,async(req,res) => {
    try{
        //to log out of this device
        // req.user.tokens = req.user.tokens.filter((element) => {
        //     return element.token !== req.token
        // })

        //to log out of all devices
        req.user.tokens = [];

        res.clearCookie("jwt");
        // console.log("logout");
        req.user.save();
        res.render("register")
    }catch(error){
        res.status(500).send(error);
    }
})  

app.get("/register",(req,res) => {
    res.render("register");
})

app.post("/register",async(req,res) => {
    try{
        const regEmp = new Register(req.body);
        //hash password
        
        const token = await regEmp.generateAuthToken();
        // res.cookie("jwt",token);
        res.cookie("jwt",token,{
            expires: new Date(Date.now() + 6000000),
            httpOnly: true
        });
        const result = await regEmp.save();
        res.status(201).render("index");
    }catch(er){
        res.status(400).send(er);
    }
})
 
app.post("/login",async(req,res) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
        
        const result = await Register.findOne({email:email});
        const isMatch = await bcrypt.compare(password,result.password);
        const token = await result.generateAuthToken();
        res.cookie("jwt",token,{
            expires: new Date(Date.now + 6000000),
            httpOnly: true
        });
        // console.log(res.cookie.jwt); 
        if(isMatch){
            res.status(201).render('index');
        }
        else{
            res.status(400).send("invalid login details");
        }
        
    }catch(er){
        res.status(400).send(er);
    }
})

// const bcrypt = require("bcryptjs");

// const securePassword = async(password) => {

//     const passwordHash = await bcrypt.hash(password, 10);
//     console.log(passwordHash);

//     const passwordMatch = await bcrypt.compare("lakshya123", passwordHash);
//     console.log(passwordMatch);
// }

// securePassword("lakshya123") 

const jwt = require("jsonwebtoken");
const { connect } = require('http2');

const createToken = async() => {
    const token = await jwt.sign({_id:"6218f17a1940c07aa7f5b442"}, "secretkey",{
        expiresIn: "2 seconds"
    });
    // console.log(token);

    const usrVer = await jwt.verify(token, "secretkey");
    // console.log(usrVer);
}

// createToken();

app.listen(port, () => {
    console.log("server running on port "+port);
  })