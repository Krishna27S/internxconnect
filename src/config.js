// config.js

const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Create and export the user model
const User = mongoose.model('User', userSchema);

module.exports = User;

const templateSchema = new mongoose.Schema({
    Title: { type: String, required: true, unique: true },
    description: { type: String, required: true, unique: true},
    requirements: { type: String, required: true, unique: true},
});