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
        // From 00:00:00 of the current day
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
        const dayOfWeek = now.getDay(); // Sunday = 0

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
        // First day → last day of current month
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
        // Count reviews
        // -------------------------------------------------
        let todayWords = 0;
        let weekWords = 0;
        let monthWords = 0;

        rows.forEach(row => {
            if (!row.last_review) {
                return;
            }

            const lastReview = new Date(row.last_review);

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
            totalWordsElement.textContent = totalWords;
        }

        if (todayWordsElement) {
            todayWordsElement.textContent = todayWords;
        }

        if (weekWordsElement) {
            weekWordsElement.textContent = weekWords;
        }

        if (monthWordsElement) {
            monthWordsElement.textContent = monthWords;
        }

        // -------------------------------------------------
        // Debug
        // -------------------------------------------------
        console.log("Learning progress:", {
            totalWords,
            todayWords,
            weekWords,
            monthWords
        });

    } catch (error) {
        console.error(
            "Learning progress error:",
            error
        );
    }
}


// =====================================================
// DOM Ready
// =====================================================
document.addEventListener("DOMContentLoaded", async () => {

    // -------------------------------------------------
    // Dashboard elements
    // -------------------------------------------------
    const dashboardTitle =
        document.getElementById("dashboard-title");

    const dashboardLevel =
        document.getElementById("dashboardLevel");


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
            window.location.href = "auth.html";
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
            .select("display_name, level")
            .eq("id", user.id)
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
                levelNames[level] || level || "—";
        }


        // =================================================
        // Load Learning Progress Statistics
        // =================================================
        await loadProgressStats(user.id);


        // -------------------------------------------------
        // Debug
        // -------------------------------------------------
        console.log("Dashboard user:", user);
        console.log("Dashboard profile:", profile);

    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );
    }
});
