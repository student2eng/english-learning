// =====================================================
// English Learning - Guest Dashboard
// =====================================================

// =====================================================
// Supabase Configuration
// Use the SAME values from auth.js / dashboard.js
// =====================================================

const SUPABASE_URL =
    "https://azuzgodrxkxhlsekooyc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// Guest Session
//
// Guest progress is temporary.
// No word_progress records are created.
// =====================================================

const GUEST_SESSION_KEY =
    "english_learning_guest_session";


// =====================================================
// Guest Settings
// =====================================================

const GUEST_SESSION_SIZE = 20;


// =====================================================
// Valid Levels
// =====================================================

const VALID_LEVELS = [
    "A1",
    "A2",
    "B1",
    "B2",
    "C1"
];


// =====================================================
// Level Names
// =====================================================

const LEVEL_NAMES = {

    A1:
        "A1 — Beginner",

    A2:
        "A2 — Elementary",

    B1:
        "B1 — Intermediate",

    B2:
        "B2 — Upper Intermediate",

    C1:
        "C1 — Advanced"

};


// =====================================================
// Get Guest Session
// =====================================================

function getGuestSession() {

    try {

        const raw =
            sessionStorage.getItem(
                GUEST_SESSION_KEY
            );


        if (!raw) {

            return null;

        }


        const session =
            JSON.parse(
                raw
            );


        if (
            !session ||
            !VALID_LEVELS.includes(
                session.level
            ) ||
            !Array.isArray(
                session.words
            )
        ) {

            return null;

        }


        return session;

    } catch (error) {

        console.error(
            "Guest session read error:",
            error
        );

        return null;

    }

}


// =====================================================
// Save Guest Session
// =====================================================

function saveGuestSession(
    session
) {

    sessionStorage.setItem(
        GUEST_SESSION_KEY,
        JSON.stringify(
            session
        )
    );

}


// =====================================================
// Create Guest Session
// =====================================================

async function createGuestSession(
    level
) {

    // -------------------------------------------------
    // Get published words for selected level
    // -------------------------------------------------

    const {
        data,
        error
    } =
        await supabaseClient
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


    if (error) {

        throw error;

    }


    const availableWords =
        data || [];


    // -------------------------------------------------
    // Oldest words first
    // -------------------------------------------------

    availableWords.sort(
        (a, b) => {

            return (
                new Date(
                    a.created_at
                ) -
                new Date(
                    b.created_at
                )
            );

        }
    );


    // -------------------------------------------------
    // Create temporary Guest word pool
    // -------------------------------------------------

    const selectedWords =
        availableWords.slice(
            0,
            GUEST_SESSION_SIZE
        );


    const session = {

        level,

        words:
            selectedWords.map(
                word => ({

                    word_id:
                        word.id,

                    status:
                        "new"

                })
            ),

        stats: {

            mastered:
                0,

            unmastered:
                0,

            reviewed:
                0,

            learned:
                0

        }

    };


    saveGuestSession(
        session
    );


    return session;

}


// =====================================================
// Get Or Create Guest Session
// =====================================================

async function getOrCreateGuestSession(
    level
) {

    const existingSession =
        getGuestSession();


    // -------------------------------------------------
    // Continue current session if same level
    // -------------------------------------------------

    if (
        existingSession &&
        existingSession.level === level
    ) {

        return existingSession;

    }


    // -------------------------------------------------
    // New level = new Guest session
    // -------------------------------------------------

    return await createGuestSession(
        level
    );

}


// =====================================================
// Calculate Guest Statistics
// =====================================================

function calculateGuestStats(
    session
) {

    const words =
        Array.isArray(
            session.words
        )
            ? session.words
            : [];


    const mastered =
        words.filter(
            word =>
                word.status ===
                "mastered"
        ).length;


    const unmastered =
        words.filter(
            word =>
                word.status ===
                "unmastered"
        ).length;


    const newWords =
        words.filter(
            word =>
                word.status ===
                "new"
        ).length;


    const learned =
        mastered +
        unmastered;


    return {

        newWords,

        mastered,

        unmastered,

        dueReviews:
            0,

        reviewWords:
            0,

        totalWords:
            learned,

        sessionWords:
            learned,

        todayWords:
            learned

    };

}


// =====================================================
// Render Guest Dashboard
// =====================================================

function renderGuestDashboard(
    session
) {

    // =================================================
    // Level
    // =================================================

    const dashboardLevel =
        document.getElementById(
            "dashboardLevel"
        );


    if (
        dashboardLevel
    ) {

        dashboardLevel.textContent =
            LEVEL_NAMES[
                session.level
            ] ||
            session.level;

    }


    // =================================================
    // Statistics
    // =================================================

    const stats =
        calculateGuestStats(
            session
        );


    // =================================================
    // Dashboard Elements
    // =================================================

    const elements = {

        newWords:
            document.getElementById(
                "newWords"
            ),

        unmasteredWords:
            document.getElementById(
                "unmasteredWords"
            ),

        dueReviews:
            document.getElementById(
                "dueReviews"
            ),

        masteredWords:
            document.getElementById(
                "masteredWords"
            ),

        totalWords:
            document.getElementById(
                "totalWords"
            ),

        sessionWords:
            document.getElementById(
                "sessionWords"
            ),

        todayWords:
            document.getElementById(
                "todayWords"
            ),

        reviewWords:
            document.getElementById(
                "reviewWords"
            )

    };


    // =================================================
    // Update Values
    // =================================================

    if (
        elements.newWords
    ) {

        elements.newWords.textContent =
            stats.newWords;

    }


    if (
        elements.unmasteredWords
    ) {

        elements.unmasteredWords.textContent =
            stats.unmastered;

    }


    if (
        elements.dueReviews
    ) {

        elements.dueReviews.textContent =
            stats.dueReviews;

    }


    if (
        elements.masteredWords
    ) {

        elements.masteredWords.textContent =
            stats.mastered;

    }


    if (
        elements.totalWords
    ) {

        elements.totalWords.textContent =
            stats.totalWords;

    }


    if (
        elements.sessionWords
    ) {

        elements.sessionWords.textContent =
            stats.sessionWords;

    }


    if (
        elements.todayWords
    ) {

        elements.todayWords.textContent =
            stats.todayWords;

    }


    if (
        elements.reviewWords
    ) {

        elements.reviewWords.textContent =
            stats.reviewWords;

    }


    // =================================================
    // Start Learning Button
    // =================================================

    const startLearningButton =
        document.getElementById(
            "startLearningButton"
        );


    if (
        startLearningButton
    ) {

        startLearningButton.href =
            `guest-learning.html?level=${encodeURIComponent(
                session.level
            )}`;

    }


    // =================================================
    // Debug
    // =================================================

    console.log(
        "Guest Dashboard:",
        {

            level:
                session.level,

            stats,

            session

        }
    );

}


// =====================================================
// Page Initialization
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            // =================================================
            // Get Level
            // =================================================

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const level =
                (
                    params.get(
                        "level"
                    ) ||
                    ""
                ).toUpperCase();


            // =================================================
            // Validate Level
            // =================================================

            if (
                !VALID_LEVELS.includes(
                    level
                )
            ) {

                window.location.replace(
                    "level.html"
                );

                return;

            }


            // =================================================
            // Get / Create Session
            // =================================================

            const session =
                await getOrCreateGuestSession(
                    level
                );


            // =================================================
            // Render
            // =================================================

            renderGuestDashboard(
                session
            );


        } catch (error) {

            console.error(
                "Guest Dashboard error:",
                error
            );


            window.location.replace(
                "level.html"
            );

        }

    }
);
