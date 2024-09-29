const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Define the Question schema
const questionSchema = new Schema({
    questionText: { type: String, required: true },
    options: [{
        optionText: String,
        isCorrect: Boolean
    }],
});

// Define the Quiz schema
const quizSchema = new Schema({
    quizId: { type: Number, unique: true }, // Add quizId field
    title: { type: String, required: true },
    description: String,
    questions: [questionSchema],
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'teacherRegistration', required: true }, // Reference to the teacher
    studentsTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

// Apply auto-increment plugin to quizId
quizSchema.plugin(AutoIncrement, { inc_field: 'quizId' });

const Quiz = mongoose.model('Quiz', quizSchema);
const Question = mongoose.model('Question', questionSchema);

module.exports = { Quiz, Question };
