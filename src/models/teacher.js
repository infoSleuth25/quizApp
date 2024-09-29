const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    teacherFirstName :{
        type : String,
        required : true
    },
    teacherMiddleName :{
        type : String,
        required : true
    },
    teacherLastName :{
        type : String,
        required : true
    },
    teacherId :{
        type: String,
        required: true,
        unique: true
    },
    password : {
        type: String,
        required: true
    }
})

const teacherRegister = new mongoose.model("teacherRegistration", teacherSchema);
module.exports = teacherRegister;