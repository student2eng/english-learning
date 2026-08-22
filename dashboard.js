// =====================================================
// English Learning - Dashboard
// =====================================================

// Supabase configuration
// Use the SAME values from auth.js
const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
const SUPABASE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";

// Create Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

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
