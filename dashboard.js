document.addEventListener("DOMContentLoaded", () => {

    // Temporary dashboard data
    const dashboardData = {
        newWords: 15,
        unmastered: 5,
        dueReviews: 10,
        mastered: 75,

        totalWords: 95,
        today: 8,
        thisWeek: 42,
        thisMonth: 120
    };

    // Continue Learning
    document.getElementById("newWords").textContent = dashboardData.newWords;
    document.getElementById("unmastered").textContent = dashboardData.unmastered;
    document.getElementById("dueReviews").textContent = dashboardData.dueReviews;
    document.getElementById("mastered").textContent = dashboardData.mastered;

    // Your Progress
    document.getElementById("totalWords").textContent = dashboardData.totalWords;
    document.getElementById("today").textContent = dashboardData.today;
    document.getElementById("thisWeek").textContent = dashboardData.thisWeek;
    document.getElementById("thisMonth").textContent = dashboardData.thisMonth;


    // Start Learning
    const startLearningBtn = document.getElementById("startLearningBtn");

    if (startLearningBtn) {
        startLearningBtn.addEventListener("click", () => {
            window.location.href = "learning.html";
        });
    }


    // Review Unmastered
    const reviewUnmasteredBtn =
        document.getElementById("reviewUnmasteredBtn");

    if (reviewUnmasteredBtn) {
        reviewUnmasteredBtn.addEventListener("click", () => {
            window.location.href = "learning.html?mode=unmastered";
        });
    }

});
