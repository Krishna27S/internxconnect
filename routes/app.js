const express = require('express');
const bcrypt = require("bcrypt");
const collection = require('../config'); // Use your user schema here

const router = express.Router();


router.get("/", (req, res) => {
    res.render("login");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.post("/signup", async (req, res) => {
    let userExist = false;
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    const existingUser = await collection.find();
    console.log(existingUser);
    existingUser.forEach(element => {
        if (element.name === data.name) userExist = true;
    });

    if (userExist) {
        res.send("User already exists. Please choose another username.");
    } else {
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashPassword;
        const userdata = await collection.insertMany(data);
        console.log(userdata);
        res.redirect('/'); // Redirect to login page after successful signup
    }
});

router.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            return res.send("Username not found");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            req.isAuthenticated = true;
            res.render("home");
        } else {
            res.send("Wrong Password");
        }
    } catch {
        res.send("Wrong Details");
    }
});

module.exports = router;
