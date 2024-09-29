const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studentFirstName :{
        type : String,
        required : true
    },
    studentLastName :{
        type : String,
        required : true
    },
    standard :{
        type : Number,
        required : true
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    },
    quizzesTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
})

const studentRegister = new mongoose.model("studentRegistration", studentSchema);
module.exports = studentRegister;