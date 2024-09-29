const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const Strategy = require('passport-local');

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(session({
    secret: "TOPSECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
    }
}));

app.use(passport.initialize());
app.use(passport.session());

require('./src/db/conn');
const studentRegister = require('./src/models/student');
const teacherRegister = require('./src/models/teacher');
const { Quiz } = require('./src/models/quiz');
const QuizResult = require('./src/models/quizResult');

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

passport.use(new Strategy(async (username, password, done) => {
    try {
        // Check in student register
        let userDetails = await studentRegister.findOne({ email: username });
        if (userDetails) {
            const isMatch = await bcrypt.compare(password, userDetails.password);
            return isMatch ? done(null, { role: 'student', user: userDetails }) : done(null, false);
        }

        // Check in teacher register if student not found
        userDetails = await teacherRegister.findOne({ teacherId: username });
        if (userDetails) {
            const isMatch = await bcrypt.compare(password, userDetails.password);
            return isMatch ? done(null, { role: 'teacher', user: userDetails }) : done(null, false);
        }

        // If neither student nor teacher is found
        return done(null, false);
    } catch (error) {
        return done(error);
    }
}));

// Serialize user to the session
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.get('/', (req, res) => {
    res.render("index");
});

app.get('/studentForm', function (req, res) {
    res.render("studentForm");
});

app.get('/teacherForm', function (req, res) {
    res.render("teacherForm");
});

app.get('/student/:studentemail/pendingQuiz', async (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'student' && req.params.studentemail === req.user.user.email) {
        res.set('Cache-Control', 'no-store');
        const username = req.session.username;
        // Find quizzes that the student has NOT taken
        const student = await studentRegister.findById(req.user.user._id);
        const quizzesTaken = student.quizzesTaken || [];

        // Fetch quizzes that the student has NOT taken
        const quizzes = await Quiz.find({
            _id: { $nin: quizzesTaken } // Exclude quizzes taken by the student
        });
        res.render("pendingQuiz", { username, quizzes });
    } else {
        res.redirect('/');
    }
});

app.get('/student/:studentemail/pastQuiz', async function(req, res) {
    if (req.isAuthenticated() && req.user.role === 'student' && req.params.studentemail === req.user.user.email) {
        try {
            const results = await QuizResult.find({ student: req.user.user._id }).populate('quiz');
            const username = req.session.username;
            res.render('pastQuiz', { username, results }); // Create a quizResults.ejs template
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/');
    }
});


app.get('/teacher/:teacherid/createQuiz', (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'teacher' && req.params.teacherid === req.user.user.teacherId) {
        const username = req.session.username;
        res.render("createQuiz",{username});
    } else {
        res.redirect('/');
    }
});

app.get('/teacher/:teacherid/pastQuizzes', async (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'teacher' && req.params.teacherid === req.user.user.teacherId) {
        try {
            // Find quizzes created by the logged-in teacher
            const quizzes = await Quiz.find({ teacher: req.user.user._id });

            res.render('teacherQuizzes', { username: req.session.username, quizzes });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.get('/teacher/:teacherid/quiz/:quizId/leaderboard', async (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'teacher' && req.params.teacherid === req.user.user.teacherId) {
        try {
            const quizId = req.params.quizId;

            // Find quiz results for the specified quiz
            const results = await QuizResult.find({ quiz: quizId }).populate('student'); // Populate student details

            // Render leaderboard page with the quiz results
            res.render('leaderboard', { username: req.session.username, results });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/');
    }
});



app.get('/student/:studentemail/quiz/:quizId/start', async function (req, res) {
    if (req.isAuthenticated() && req.user.role === 'student' && req.params.studentemail === req.user.user.email) {
        try {
            const quiz = await Quiz.findById(req.params.quizId);
            if (!quiz) {
                return res.status(404).send('Quiz not found');
            }
            const username = req.session.username;
            res.render('startQuiz', { username, quiz, timer: 15 * 60 }); // 15 minutes in seconds
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/');
    }
});

app.post('/student/:studentemail/quiz/:quizId/submit', async function (req, res) {
    if (req.isAuthenticated() && req.user.role === 'student' && req.params.studentemail === req.user.user.email) {
        const { quizId } = req.params;
        const answers = req.body;

        try {
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                return res.status(404).send('Quiz not found');
            }

            let score = 0;
            quiz.questions.forEach(question => {
                const studentAnswer = answers[question._id];
                const correctOption = question.options.find(option => option.isCorrect);
                if (studentAnswer === correctOption.optionText) {
                    score++;
                }
            });

            // Save the quiz result in the database
            const quizResult = new QuizResult({
                student: req.user.user._id, // Use the student ID
                quiz: quizId,
                score: score,
                totalScore: quiz.questions.length // Total score is the number of questions
            });

            await quizResult.save();

            // Log the current state before updating
            const student = await studentRegister.findById(req.user.user._id);

            // Add the quiz ID to the student's quizzesTaken array
            student.quizzesTaken.push(quizId);
            await student.save();

            const username = req.session.username;
            res.render('resultQuiz', { username, score, total: quiz.questions.length });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/');
    }
});


app.post('/login', passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: false
}), (req, res) => {
    // Store username/ID in session
    req.session.username = req.user.role === 'student' ? req.user.user.email : req.user.user.teacherId;

    // Redirect based on user role
    if (req.user.role === 'student') {
        return res.redirect(`/student/${req.user.user.email}/pendingQuiz`);
    } else if (req.user.role === 'teacher') {
        return res.redirect(`/teacher/${req.user.user.teacherId}/createQuiz`);
    }
});

app.post('/studentForm', async (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    try {
        const user = await studentRegister.findOne({ email: email });
        if (user) {
            res.send("User is already signed up");
        } else {
            bcrypt.hash(pass, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                } else {
                    const registerStudent = new studentRegister({
                        studentFirstName: req.body.firstname,
                        studentLastName: req.body.lastname,
                        standard: req.body.standard,
                        email: req.body.email,
                        password: hash
                    });
                    await registerStudent.save();
                    res.status(201).render("index");
                }
            });
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/teacherForm', async (req, res) => {
    const teacherId = req.body.teacherid;
    const pass = req.body.password;
    try {
        const user = await teacherRegister.findOne({ teacherId: teacherId });
        if (user) {
            res.send("User is already signed up");
        } else {
            bcrypt.hash(pass, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                } else {
                    const registerTeacher = new teacherRegister({
                        teacherFirstName: req.body.firstname,
                        teacherMiddleName: req.body.middlename,
                        teacherLastName: req.body.lastname,
                        teacherId: req.body.teacherid,
                        password: hash
                    });
                    await registerTeacher.save();
                    res.status(201).render("index");
                }
            });
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post('/create-quiz', async (req, res) => {
    if (req.isAuthenticated() && req.user.role === 'teacher') {
        try {
            const { title, description, questions } = req.body;
            if (!questions) {
                return res.status(400).send('Questions field is missing');
            }

            let parsedQuestions = [];
            try {
                if (typeof questions === 'string') {
                    parsedQuestions = JSON.parse(questions);
                } else {
                    parsedQuestions = questions;
                }

                parsedQuestions.forEach(question => {
                    question.options.forEach(option => {
                        option.isCorrect = option.isCorrect === 'on';
                    });
                });
            } catch (err) {
                console.error('Error parsing JSON:', err);
                return res.status(400).send('Invalid JSON format in questions');
            }

            const quiz = new Quiz({
                title,
                description,
                questions: parsedQuestions,
                teacher: req.user.user._id // Store the teacher's ID in the quiz
            });

            await quiz.save();
            res.redirect(`/teacher/${req.user.user.teacherId}/createQuiz`);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    } else {
        res.redirect('/');
    }
});


app.listen(port, () => {
    console.log(`App is listening on the port no ${port}.`);
});
