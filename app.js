// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    // Shared state
    let userInfo = {};
    let selectedQuestionCategory = '';
    let numberOfQuestions = 0;
    let currentQuestionIndex = 0;
    let userAnswers = {}; // Store answers as { questionId: selectedOptionId }
    let questionsToAsk = []; // Randomly selected questions for the current session

    // Helper to get elements
    const getEl = (id) => document.getElementById(id);

    // --- Index Page Logic ---
    const startButton = getEl('startSurveyButton');
    if (startButton) {
        startButton.addEventListener('click', () => {
            userInfo.name = getEl('userName').value.trim();
            userInfo.age = parseInt(getEl('userAge').value, 10);
            userInfo.gender = getEl('userGender').value;
            userInfo.maritalStatus = getEl('userMaritalStatus').value;
            userInfo.education = getEl('userEducation').value;
            userInfo.occupation = getEl('userOccupation').value.trim();
            userInfo.relationshipStatus = getEl('userRelationshipStatus').value;
            userInfo.purpose = getEl('userPurpose').value;

            selectedQuestionCategory = getEl('questionCategory').value;
            numberOfQuestions = parseInt(getEl('numQuestions').value, 10);

            // Basic validation
            if (!userInfo.name || !userInfo.age || !selectedQuestionCategory || !numberOfQuestions) {
                alert('لطفاً تمام فیلدهای ستاره‌دار را پر کنید.');
                return;
            }

            // Store user info in localStorage to pass between pages
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            localStorage.setItem('selectedQuestionCategory', selectedQuestionCategory);
            localStorage.setItem('numberOfQuestions', numberOfQuestions);

            // Redirect to questions page
            window.location.href = 'questions.html';
        });
    }

    // --- Questions Page Logic ---
    const questionTextEl = getEl('questionText');
    const optionsGridEl = getEl('optionsGrid');
    const prevButton = getEl('prevQuestion');
    const nextButton = getEl('nextQuestion');
    const progressBar = getEl('progressBar');

    if (questionTextEl && optionsGridEl) { // Check if elements exist (i.e., we are on questions.html)
        // Load stored data
        userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        selectedQuestionCategory = localStorage.getItem('selectedQuestionCategory');
        numberOfQuestions = parseInt(localStorage.getItem('numberOfQuestions'), 10);
        userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');

        if (Object.keys(userInfo).length === 0 || !selectedQuestionCategory || !numberOfQuestions) {
            alert('اطلاعات کاربر و تنظیمات سوالات یافت نشد. به صفحه اصلی بازگردانده می‌شوید.');
            window.location.href = 'index.html';
            return;
        }

        // Initialize questions if not already done
        if (!localStorage.getItem('questionsToAsk')) {
            const allQuestions = questionsData[selectedQuestionCategory];
            if (!allQuestions || allQuestions.length === 0) {
                alert('سوالاتی برای دسته انتخاب شده یافت نشد.');
                window.location.href = 'index.html';
                return;
            }

            // Shuffle questions and select the required number
            questionsToAsk = allQuestions.sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);
            localStorage.setItem('questionsToAsk', JSON.stringify(questionsToAsk));
        } else {
            questionsToAsk = JSON.parse(localStorage.getItem('questionsToAsk'));
        }

        currentQuestionIndex = parseInt(localStorage.getItem('currentQuestionIndex') || '0', 10);

        const updateProgressBar = () => {
            if (progressBar && numberOfQuestions > 0) {
                const progress = ((currentQuestionIndex + 1) / numberOfQuestions) * 100;
                progressBar.style.width = `${progress}%`;
            }
        };

        const renderQuestion = () => {
            if (currentQuestionIndex >= questionsToAsk.length) {
                // All questions answered, redirect to analysis
                localStorage.setItem('userAnswers', JSON.stringify(userAnswers)); // Save final answers
                window.location.href = 'analysis.html';
                return;
            }

            const question = questionsToAsk[currentQuestionIndex];
            if (!question) {
                console.error("Question not found at index:", currentQuestionIndex);
                return;
            }

            questionTextEl.textContent = `${currentQuestionIndex + 1}. ${question.text}`;
            optionsGridEl.innerHTML = ''; // Clear previous options

            // Shuffle options and pick 4
            const shuffledOptions = question.options.sort(() => 0.5 - Math.random()).slice(0, 4);

            shuffledOptions.forEach(option => {
                const button = document.createElement('button');
                button.classList.add('option-button');
                button.textContent = option.text;
                button.dataset.optionId = option.id;
                button.dataset.questionId = question.id;

                if (userAnswers[question.id] === option.id) {
                    button.classList.add('selected');
                }

                button.addEventListener('click', () => {
                    // Remove 'selected' from all other options for this question
                    Array.from(optionsGridEl.children).forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    // Add 'selected' to the clicked option
                    button.classList.add('selected');
                    // Store the answer
                    userAnswers[question.id] = option.id;
                    localStorage.setItem('userAnswers', JSON.stringify(userAnswers)); // Save answers immediately

                    // Automatically go to next question after selecting
                    // This creates a smoother flow, remove if manual "Next" click is preferred
                    setTimeout(() => {
                        currentQuestionIndex++;
                        localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
                        renderQuestion();
                        updateProgressBar();
                    }, 300); // Small delay for visual feedback
                });
                optionsGridEl.appendChild(button);
            });

            // Update navigation button states
            prevButton.disabled = currentQuestionIndex === 0;
            nextButton.disabled = !userAnswers[question.id] && currentQuestionIndex < questionsToAsk.length - 1; // Can't go next if not answered, unless it's the last question

            updateProgressBar();
        };

        prevButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
                renderQuestion();
            }
        });

        nextButton.addEventListener('click', () => {
            // If the current question is answered, proceed
            if (userAnswers[questionsToAsk[currentQuestionIndex].id]) {
                currentQuestionIndex++;
                localStorage.setItem('currentQuestionIndex', currentQuestionIndex.toString());
                renderQuestion();
            } else if (currentQuestionIndex === questionsToAsk.length - 1) {
                // Allow finishing on last question even if not answered (though it should be)
                // In a real scenario, you'd force an answer or alert the user
                localStorage.setItem('userAnswers', JSON.stringify(userAnswers));
                window.location.href = 'analysis.html';
            } else {
                alert('لطفاً قبل از رفتن به سوال بعدی، پاسخ خود را انتخاب کنید.');
            }
        });

        renderQuestion();
    }

    // --- Analysis Page Logic ---
    const analysisContentEl = getEl('analysisContent');
    const returnHomeButton = getEl('returnHomeButton');

    if (analysisContentEl) { // Check if elements exist (i.e., we are on analysis.html)
        userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        userAnswers = JSON.parse(localStorage.getItem('userAnswers') || '{}');

        if (Object.keys(userInfo).length === 0) {
            analysisContentEl.innerHTML = '<p>اطلاعات کاربر یافت نشد. لطفاً از صفحه اصلی شروع کنید.</p>';
            returnHomeButton.style.display = 'block';
            return;
        }

        const generateAnalysis = () => {
            let foundAnalysis = null;

            // Simple scoring based on collected answers for demonstration.
            // In a real scenario, you'd need a more robust scoring system
            // that maps specific answer IDs to certain traits/scores.
            const calculateAnswerWeight = (answerId) => {
                // This is a placeholder. You'd assign weights to each option in data.js
                // For now, return 1 if option is selected, 0 otherwise for demonstration trigger logic
                return 1;
            };

            const simulatedScores = {};
            for (const qId in userAnswers) {
                const answerId = userAnswers[qId];
                // For demonstration, map actual answer IDs back to a generic score
                // In reality, each option would have a specific 'weight' towards a trait
                simulatedScores[answerId] = (simulatedScores[answerId] || 0) + calculateAnswerWeight(answerId);
            }

            for (const analysis of analysisModels) {
                try {
                    // Pass simulatedScores and userInfo to the trigger function
                    if (analysis.trigger(simulatedScores, userInfo)) {
                        foundAnalysis = analysis;
                        break;
                    }
                } catch (e) {
                    console.error("Error in analysis trigger for", analysis.id, e);
                }
            }

            if (!foundAnalysis) {
                foundAnalysis = defaultAnalysis;
            }

            analysisContentEl.innerHTML = `
                <h2>${foundAnalysis.title(userInfo)}</h2>
                <p>${foundAnalysis.description(userInfo)}</p>
                <div style="margin-top: 30px;">
                    <h3>توصیه‌های ما:</h3>
                    <ul>
                        <li>برای درک عمیق‌تر و راهنمایی شخصی، رزرو نوبت مشاوره حضوری در کلینیک ما را به شدت توصیه می‌کنیم.</li>
                        <li>مشاوران متخصص ما آماده‌اند تا در فضایی امن و خصوصی به شما کمک کنند.</li>
                        <li>برای تعیین وقت، لطفاً با شماره تماس کلینیک تماس بگیرید یا از بخش <a href="#">تماس با ما</a> دیدن کنید.</li>
                    </ul>
                </div>
            `;
        };

        generateAnalysis();

        returnHomeButton.addEventListener('click', () => {
            // Clear localStorage for a new session
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }
});

// Utility function to get random items from an array (can be placed in a separate util file)
function getRandomElements(arr, num) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
}
