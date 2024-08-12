const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;


// const templateSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   Description: {
//     type: String,
//     required: true
//   },
//   Requirements: {
//     type: String,
//     required: true
//   }
// });

// const jobs = mongoose.model('Template', templateSchema);

// module.exports = jobs;