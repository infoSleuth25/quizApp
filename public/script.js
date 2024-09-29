document.addEventListener('DOMContentLoaded', () => {
    const createQuizBtn = document.getElementById('createQuizBtn');
    const viewQuizzesBtn = document.getElementById('viewQuizzesBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const contentDiv = document.getElementById('content');

    createQuizBtn.addEventListener('click', () => {
        contentDiv.innerHTML = `
            <h2>Create a New Quiz</h2>
            <form id="createQuizForm">
                <label for="quizTitle">Quiz Title:</label>
                <input type="text" id="quizTitle" name="quizTitle" required>
                <label for="quizQuestions">Questions:</label>
                <textarea id="quizQuestions" name="quizQuestions" rows="5" required></textarea>
                <button type="submit">Create Quiz</button>
            </form>
        `;
    });

    viewQuizzesBtn.addEventListener('click', () => {
        contentDiv.innerHTML = `
            <h2>Previous Quizzes</h2>
            <p>Here you can view all the previous quizzes created.</p>
            <!-- Add logic to fetch and display quizzes from server here -->
        `;
    });

    logoutBtn.addEventListener('click', () => {
        // Add logic for logout here
        alert('Logging out...');
        // Example redirect to login page (modify as needed)
        window.location.href = '/login';
    });
});
