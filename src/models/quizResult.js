const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, // Reference to the Student
        ref: 'studentRegistration', // Name of the Student model
        required: true 
    },
    quiz: { 
        type: mongoose.Schema.Types.ObjectId, // Reference to the Quiz
        ref: 'Quiz', // Name of the Quiz model
        required: true 
    },
    score: { 
        type: Number, 
        required: true 
    },
    totalScore: {  // New field to store total score
        type: Number,
        required: true
    },
    dateTaken: { 
        type: Date, 
        default: Date.now 
    }
});

const QuizResult = mongoose.model('QuizResult', quizResultSchema);
module.exports = QuizResult;
