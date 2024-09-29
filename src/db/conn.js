const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/quizApp")
    .then(() => {
        console.log("Connection Successful");
    })
    .catch((e) => {
        console.error(e);
        console.log("No Connection");
    });