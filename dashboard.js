// =====================================================
// English Learning - Dashboard
// =====================================================

// =====================================================
// Supabase configuration
// Use the SAME values from auth.js
// =====================================================
const SUPABASE_URL = "000000000";
const SUPABASE_KEY = "00000000";

// Create Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// Learning Progress Statistics
// Decision 9D
// =====================================================
async function loadProgressStats(userId) {

    try {

        // -------------------------------------------------
        // Get user's word progress
        // -------------------------------------------------
        const {
            data: progressRows,
            error: progressError
        } = await supabaseClient
            .from("word_progress")
            .select("id, last_review")
            .eq("user_id", userId);

        if (progressError) {
            throw progressError;
        }

        const rows = progressRows || [];


        // -------------------------------------------------
        // Current local date and time
        // -------------------------------------------------
        const now = new Date();


        // -------------------------------------------------
        // Today
        // 00:00:00 → 23:59:59
        // -------------------------------------------------
        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const startOfTomorrow = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
        );


        // -------------------------------------------------
        // This Week
        // Sunday → Saturday
        // -------------------------------------------------
        const dayOfWeek = now.getDay();

        const startOfWeek = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() - dayOfWeek
        );

        const startOfNextWeek = new Date(
            startOfWeek.getFullYear(),
            startOfWeek.getMonth(),
            startOfWeek.getDate() + 7
        );


        // -------------------------------------------------
        // This Month
        // First day → last day
        // -------------------------------------------------
        const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1
        );

        const startOfNextMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            1
        );


        // -------------------------------------------------
        // Total Words
        // -------------------------------------------------
        const totalWords = rows.length;


        // -------------------------------------------------
        // Review counts
        // -------------------------------------------------
        let todayWords = 0;
        let weekWords = 0;
        let monthWords = 0;


        rows.forEach(row => {

            if (!row.last_review) {
                return;
            }


            const lastReview =
                new Date(row.last_review);


            // Today
            if (
                lastReview >= startOfToday &&
                lastReview < startOfTomorrow
            ) {
                todayWords++;
            }


            // This Week
            if (
                lastReview >= startOfWeek &&
                lastReview < startOfNextWeek
            ) {
                weekWords++;
            }


            // This Month
            if (
                lastReview >= startOfMonth &&
                lastReview < startOfNextMonth
            ) {
                monthWords++;
            }

        });


        // -------------------------------------------------
        // Update Dashboard
        // -------------------------------------------------
        const totalWordsElement =
            document.getElementById("totalWords");

        const todayWordsElement =
            document.getElementById("todayWords");

        const weekWordsElement =
            document.getElementById("weekWords");

        const monthWordsElement =
            document.getElementById("monthWords");


        if (totalWordsElement) {
            totalWordsElement.textContent =
                totalWords;
        }

        if (todayWordsElement) {
            todayWordsElement.textContent =
                todayWords;
        }

        if (weekWordsElement) {
            weekWordsElement.textContent =
                weekWords;
        }

        if (monthWordsElement) {
            monthWordsElement.textContent =
                monthWords;
        }


        // -------------------------------------------------
        // Debug
        // -------------------------------------------------
        console.log(
            "Learning progress:",
            {
                totalWords,
                todayWords,
                weekWords,
                monthWords
            }
        );


    } catch (error) {

        console.error(
            "Learning progress error:",
            error
        );
    }
}


// =====================================================
// Continue Learning Statistics
// Decisions:
// 12LDW / VW35 / LWMUR38
// =====================================================
async function loadContinueLearningStats(
    userId,
    level
) {

    try {

        // =================================================
        // Get user's word progress
        // =================================================

        const {
            data: progressRows,
            error: progressError
        } = await supabaseClient
            .from("word_progress")
            .select(
                "word_id, status, next_review"
            )
            .eq(
                "user_id",
                userId
            );


        if (progressError) {
            throw progressError;
        }


        const progress =
            progressRows || [];


        // =================================================
        // Count Unmastered
        // =================================================

        const totalUnmastered =
            progress.filter(
                row =>
                    row.status ===
                    "unmastered"
            ).length;


        // =================================================
        // Count Mastered
        // =================================================

        const totalMastered =
            progress.filter(
                row =>
                    row.status ===
                    "mastered"
            ).length;


        // =================================================
        // Count Due Reviews
        // =================================================

        const now =
            new Date();


        const totalDueReviews =
            progress.filter(row => {

                if (
                    row.status !==
                    "mastered"
                ) {
                    return false;
                }


                if (!row.next_review) {
                    return false;
                }


                return (
                    new Date(
                        row.next_review
                    ) <= now
                );

            }).length;


        // =================================================
        // Get New Words available in Word Library
        //
        // Rules:
        // - Same level as student
        // - published only
        // - not previously studied
        // - not currently Unmastered
        // - not in Review / Mastered
        // =================================================

        const progressWordIds =
            progress
                .map(row => row.word_id)
                .filter(Boolean);


        let newWordsQuery =
            supabaseClient
                .from("words")
                .select(
                    "id, created_at"
                )
                .eq(
                    "level",
                    level
                )
                .eq(
                    "status",
                    "published"
                );


        // -------------------------------------------------
        // If the student has progress records,
        // exclude all words already studied.
        // -------------------------------------------------

        if (
            progressWordIds.length > 0
        ) {

            newWordsQuery =
                newWordsQuery.not(
                    "id",
                    "in",
                    `(${progressWordIds.join(",")})`
                );
        }


        const {
            data: availableNewRows,
            error: newWordsError
        } = await newWordsQuery;


        if (newWordsError) {
            throw newWordsError;
        }


        const availableNewWords =
            availableNewRows || [];


        // =================================================
        // New Words calculation
        //
        // 20 − Total Unmastered
        //
        // Then limited by the number of
        // New Words actually available.
        // =================================================

        const newWordsLimit =
            Math.max(
                0,
                20 - totalUnmastered
            );


        const totalNewWords =
            Math.min(
                newWordsLimit,
                availableNewWords.length
            );


        // =================================================
        // Update Dashboard
        // =================================================

        const newWordsElement =
            document.getElementById(
                "newWords"
            );

        const unmasteredElement =
            document.getElementById(
                "unmasteredWords"
            );

        const dueReviewsElement =
            document.getElementById(
                "dueReviews"
            );

        const masteredElement =
            document.getElementById(
                "masteredWords"
            );


        if (newWordsElement) {

            newWordsElement.textContent =
                totalNewWords;
        }


        if (unmasteredElement) {

            unmasteredElement.textContent =
                totalUnmastered;
        }


        if (dueReviewsElement) {

            dueReviewsElement.textContent =
                totalDueReviews;
        }


        if (masteredElement) {

            masteredElement.textContent =
                totalMastered;
        }


        // =================================================
        // Debug
        // =================================================

        console.log(
            "Continue Learning:",
            {
                level,
                totalNewWords,
                availableNewWords:
                    availableNewWords.length,
                newWordsLimit,
                totalUnmastered,
                totalDueReviews,
                totalMastered
            }
        );


    } catch (error) {

        console.error(
            "Continue Learning error:",
            error
        );
    }
}


// =====================================================
// DOM Ready
// =====================================================
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // -------------------------------------------------
        // Dashboard elements
        // -------------------------------------------------
        const dashboardTitle =
            document.getElementById(
                "dashboard-title"
            );

        const dashboardLevel =
            document.getElementById(
                "dashboardLevel"
            );


        // =================================================
        // Get current user
        // =================================================
        try {

            const {
                data: { user },
                error: authError
            } = await supabaseClient.auth.getUser();


            if (authError) {
                throw authError;
            }


            // -------------------------------------------------
            // No logged-in user
            // -------------------------------------------------
            if (!user) {

                window.location.href =
                    "auth.html";

                return;
            }


            // =================================================
            // Get user profile
            // =================================================
            const {
                data: profile,
                error: profileError
            } = await supabaseClient
                .from("profiles")
                .select(
                    "display_name, level"
                )
                .eq(
                    "id",
                    user.id
                )
                .single();


            if (profileError) {
                throw profileError;
            }


            // =================================================
            // Display Name
            // =================================================
            const displayName =
                profile?.display_name ||
                user.user_metadata?.display_name ||
                "Learner";


            if (dashboardTitle) {

                dashboardTitle.textContent =
                    `Welcome back, ${displayName}!`;
            }


            // =================================================
            // English Level
            // =================================================
            const levelNames = {

                A1: "A1 — Beginner",
                A2: "A2 — Elementary",
                B1: "B1 — Intermediate",
                B2: "B2 — Upper Intermediate",
                C1: "C1 — Advanced"

            };


            const level =
                profile?.level || "";


            if (dashboardLevel) {

                dashboardLevel.textContent =
                    levelNames[level] ||
                    level ||
                    "—";
            }


            // =================================================
            // Load Your Progress
            // =================================================
            await loadProgressStats(
                user.id
            );


            // =================================================
            // Load Continue Learning
            // =================================================
            await loadContinueLearningStats(
                user.id,
                level
            );


            // -------------------------------------------------
            // Debug
            // -------------------------------------------------
            console.log(
                "Dashboard user:",
                user
            );

            console.log(
                "Dashboard profile:",
                profile
            );


        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );
        }

    }
);
