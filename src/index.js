const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const ObjectId = require('mongoose').Types.ObjectId;
const User = require("./config"); // Renamed from 'collection' to 'User'
const session = require('express-session');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Session configuration
app.use(session({
    secret: 'admin',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 } // Session expiration in milliseconds
}));


// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/newcuvette", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Database connected successfully");
}).catch((err) => {
    console.error("Database connection error:", err);
});

// Define Template Schema and Model
const templateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date }
});

const Template = mongoose.model('Template', templateSchema);



// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).send("Access denied. Admins only.");
    }
}

// Render templates page
app.get('/templates', isAuthenticated, async (req, res) => {
    try {
        const templates = await Template.find();
        res.render('templates', { templates: templates, user: req.session.user });
    } catch (error) {
        console.error("Error fetching templates:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Render form to create a new template (Admin only)
app.get('/newTemplate', isAdmin, (req, res) => {
    res.render('newTemplate', { title: 'Add New Template' });
});

// Create a new template (Admin only)
app.post('/templates', isAdmin, async (req, res) => {
    try {
        const newTemplate = new Template({
            title: req.body.title,
            content: req.body.content
        });
        await newTemplate.save();
        res.redirect('/templates');
    } catch (error) {
        console.error("Error creating new template:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Render form to edit a template (Admin only)
app.get('/templates/:id/edit', isAdmin, async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) {
            return res.status(404).send("Template not found");
        }
        res.render('editTemplate', { template: template });
    } catch (error) {
        console.error("Error fetching template:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Update a template (Admin only)
app.post('/templates/:id', isAdmin, async (req, res) => {
    try {
        const updatedTemplate = await Template.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            content: req.body.content,
            updated_at: Date.now()
        }, { new: true });

        if (!updatedTemplate) {
            return res.status(404).send("Template not found");
        }
        res.redirect('/templates');
    } catch (error) {
        console.error("Error updating template:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Delete a template (Admin only)
app.post('/templates/:id/delete', isAdmin, async (req, res) => {
    try {
        await Template.findByIdAndDelete(req.params.id);
        res.redirect('/templates');
    } catch (error) {
        console.error("Error deleting template:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Render login form
app.get("/", (req, res) => {
    res.render("login");
});

// Render signup form
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Handle signup POST request
app.post("/signup", async (req, res) => {
    try {
        const existingUser = await User.findOne({ name: req.body.username });
        if (existingUser) {
            return res.send("User already exists. Please choose another username.");
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            name: req.body.username,
            password: hashedPassword,
            isAdmin: req.body.secretKey === 'admin' // Admin based on secret key
        });
        await newUser.save();

        res.redirect('/');
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Handle login POST request
app.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ name: req.body.username });
        if (!user) {
            return res.send("Username not found.");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (isPasswordMatch) {
            req.session.user = user; // Store user in session
            res.redirect("/templates");
        } else {
            res.send("Wrong password.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("Internal Server Error");
        }
        res.redirect('/');
    });
});

// Start the server
const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});
