// js/analysis.js

document.addEventListener('DOMContentLoaded', () => {
    const loadingAnimation = document.getElementById('loadingAnimation');
    const analysisResult = document.getElementById('analysisResult');
    const analysisTitle = document.getElementById('analysisTitle');
    const analysisDescription = document.getElementById('analysisDescription');

    // نمایش انیمیشن لودینگ
    loadingAnimation.classList.remove('hidden');
    analysisResult.classList.add('hidden');

    // تأخیر کوچکی برای نمایش انیمیشن قبل از پردازش
    setTimeout(() => {
        let userInfo = {};
        let userAnswers = {};

        try {
            userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
            userAnswers = JSON.parse(localStorage.getItem('userAnswers')) || {};
        } catch (e) {
            console.error("Error parsing data from localStorage:", e);
            // در صورت بروز خطا، می‌توان یک تحلیل پیش‌فرض نمایش داد
            userInfo = { name: 'کاربر گرامی' };
            userAnswers = {};
        }

        const userName = userInfo.name || 'کاربر گرامی';
        let foundAnalysis = null;

        // Iterate through analysis models to find a matching analysis
        // Note: The order of analysisModels in data.js might matter if multiple triggers could be true.
        // You might want to sort them by specificity or priority.
        for (const analysis of analysisModels) {
            if (analysis.trigger(userAnswers, userInfo)) {
                foundAnalysis = analysis;
                break; // Found the first matching analysis, exit loop
            }
        }

        // If no specific analysis is found, use the default one
        if (!foundAnalysis) {
            foundAnalysis = defaultAnalysis;
        }

        // Display the analysis
        analysisTitle.textContent = foundAnalysis.title(userInfo); // Pass userInfo to title function
        analysisDescription.innerHTML = foundAnalysis.description(userInfo); // Pass userInfo to description function

        // Hide loading and show results
        loadingAnimation.classList.add('hidden');
        analysisResult.classList.remove('hidden');

        // Clear localStorage after displaying results to prevent stale data
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userAnswers');

    }, 1500); // 1.5 ثانیه تأخیر برای نمایش انیمیشن
});
