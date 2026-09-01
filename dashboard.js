// =====================================================
// English Learning - Dashboard
// =====================================================

// =====================================================
// Supabase configuration
// Use the SAME values from auth.js
// =====================================================
const SUPABASE_URL = "0000000";
const SUPABASE_KEY = "0000000";

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
        const now = new Date();

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

        const totalWords = rows.length;

        let todayWords = 0;
        let weekWords = 0;
        let monthWords = 0;

        rows.forEach(row => {

            if (!row.last_review) {
                return;
            }

            const lastReview =
                new Date(row.last_review);

            if (
                lastReview >= startOfToday &&
                lastReview < startOfTomorrow
            ) {
                todayWords++;
            }

            if (
                lastReview >= startOfWeek &&
                lastReview < startOfNextWeek
            ) {
                weekWords++;
            }

            if (
                lastReview >= startOfMonth &&
                lastReview < startOfNextMonth
            ) {
                monthWords++;
            }

        });

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

        const totalUnmastered =
            progress.filter(
                row =>
                    row.status ===
                    "unmastered"
            ).length;

        const totalMastered =
            progress.filter(
                row =>
                    row.status ===
                    "mastered"
            ).length;

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
// Dashboard Page Guard + Data Loading
// =====================================================
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =================================================
        // Subscription Guard
        // =================================================

        const subscriptionResult =
            await window.subscriptionGuardReady;

        if (
            !subscriptionResult ||
            subscriptionResult.allowed !== true
        ) {

            console.error(
                "Dashboard access denied by Subscription Guard:",
                subscriptionResult
            );

            return;
        }

        // =================================================
        // Authenticated User
        // =================================================

        const user =
            subscriptionResult.user;

        if (!user) {

            console.error(
                "Dashboard: authenticated user is missing from Subscription Guard result."
            );

            return;
        }

        // =================================================
        // Dashboard elements
        // =================================================

        const dashboardTitle =
            document.getElementById(
                "dashboard-title"
            );

        const dashboardLevel =
            document.getElementById(
                "dashboardLevel"
            );

        // =================================================
        // Get user profile
        // =================================================

        try {

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

            const displayName =
                profile?.display_name ||
                user.user_metadata?.display_name ||
                "Learner";

            if (dashboardTitle) {
                dashboardTitle.textContent =
                    `Welcome back, ${displayName}!`;
            }

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

            await loadProgressStats(
                user.id
            );

            await loadContinueLearningStats(
                user.id,
                level
            );

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

            window.location.replace(
                "auth.html"
            );

        }

    }
);


// =====================================================
// Account Dropdown Menu
// =====================================================
document.addEventListener(
    "DOMContentLoaded",
    () => {

        const accountMenuButton =
            document.getElementById(
                "accountMenuButton"
            );

        const accountMenu =
            document.getElementById(
                "accountMenu"
            );

        const accountLogoutButton =
            document.getElementById(
                "accountLogoutButton"
            );

        if (
            !accountMenuButton ||
            !accountMenu
        ) {
            return;
        }

        accountMenuButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const isOpen =
                    !accountMenu.hidden;

                accountMenu.hidden =
                    isOpen;

                accountMenuButton.setAttribute(
                    "aria-expanded",
                    String(!isOpen)
                );

            }
        );

        document.addEventListener(
            "click",
            (event) => {

                if (
                    !accountMenu.contains(
                        event.target
                    ) &&
                    !accountMenuButton.contains(
                        event.target
                    )
                ) {

                    accountMenu.hidden =
                        true;

                    accountMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }

            }
        );

        if (accountLogoutButton) {

            accountLogoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        accountLogoutButton.disabled =
                            true;

                        accountLogoutButton.textContent =
                            "Logging out...";

                        const {
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signOut();

                        if (error) {
                            throw error;
                        }

                        window.location.replace(
                            "auth.html"
                        );

                    } catch (error) {

                        console.error(
                            "Account logout error:",
                            error
                        );

                        accountLogoutButton.disabled =
                            false;

                        accountLogoutButton.textContent =
                            "Log Out";

                    }

                }
            );

        }

    }
);
