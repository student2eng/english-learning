// =====================================================
// English Learning - Guest Dashboard
// =====================================================

// =====================================================
// Supabase configuration
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
// Session ends when the browser session ends.
// =====================================================

const GUEST_SESSION_KEY =
    "english_learning_guest_session";


// =====================================================
// Level Names
// =====================================================

const LEVEL_NAMES = {

    A1: "A1 — Beginner",
    A2: "A2 — Elementary",
    B1: "B1 — Intermediate",
    B2: "B2 — Upper Intermediate",
    C1: "C1 — Advanced"

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
            JSON.parse(raw);

        if (
            !session ||
            !session.level ||
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
        JSON.stringify(session)
    );
}


// =====================================================
// Initialise Guest Session
// =====================================================

async function initialiseGuestSession(
    level
) {

    const existingSession =
        getGuestSession();


    // -------------------------------------------------
    // Continue the existing session if the level
    // is the same.
    // -------------------------------------------------

    if (
        existingSession &&
        existingSession.level === level
    ) {

        return existingSession;
    }


    // -------------------------------------------------
    // New Guest session
    // -------------------------------------------------

    const session = {

        level,

        words: [],

        stats: {

            mastered: 0,

            unmastered: 0,

            reviewed: 0,

            learned: 0

        }

    };


    // =================================================
    // Get published words from Word Library
    // =================================================

    const {
        data,
        error
    } = await supabaseClient
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
    // Guest session starts with 20 new words.
    // -------------------------------------------------

    const initialWords =
        availableWords
            .slice(
                0,
                20
            )
            .map(
                word => ({

                    word_id:
                        word.id,

                    status:
                        "new"

                })
            );


    session.words =
        initialWords;


    saveGuestSession(
        session
    );


    return session;
}


// =====================================================
// Render Guest Dashboard
// =====================================================

function renderGuestDashboard(
    session
) {

    // -------------------------------------------------
    // Level
    // -------------------------------------------------

    const dashboardLevel =
        document.getElementById(
            "dashboardLevel"
        );


    if (dashboardLevel) {

        dashboardLevel.textContent =
            LEVEL_NAMES[
                session.level
            ] ||
            session.level;

    }


    // -------------------------------------------------
    // Guest Words
    // -------------------------------------------------

    const words =
        Array.isArray(
            session.words
        )
            ? session.words
            : [];


    // -------------------------------------------------
    // Mastered
    // -------------------------------------------------

    const mastered =
        words.filter(
            word =>
                word.status ===
                "mastered"
        ).length;


    // -------------------------------------------------
    // Unmastered
    // -------------------------------------------------

    const unmastered =
        words.filter(
            word =>
                word.status ===
                "unmastered"
        ).length;


    // -------------------------------------------------
    // New Words
    // -------------------------------------------------

    const newWords =
        words.filter(
            word =>
                word.status ===
                "new"
        ).length;


    // -------------------------------------------------
    // Words Learned
    // -------------------------------------------------

    const learned =
        mastered +
        unmastered;


    // -------------------------------------------------
    // Guest Reviews
    //
    // Guest does not have a Review system.
    // -------------------------------------------------

    const dueReviews = 0;

    const reviewWords = 0;


    // =================================================
    // Dashboard Values
    // =================================================

    const values = {

        newWords,

        unmasteredWords:
            unmastered,

        dueReviews,

        masteredWords:
            mastered,

        totalWords:
            learned,

        sessionWords:
            learned,

        todayWords:
            learned,

        reviewWords

    };


    // =================================================
    // Update Dashboard
    // =================================================

    Object.entries(
        values
    ).forEach(
        (
            [id, value]
        ) => {

            const element =
                document.getElementById(
                    id
                );


            if (element) {

                element.textContent =
                    value;

            }

        }
    );

}


// =====================================================
// Guest Dashboard Page
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            // =================================================
            // Get Level from URL
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
            // Valid Guest Levels
            // =================================================

            const validLevels = [

                "A1",
                "A2",
                "B1",
                "B2",
                "C1"

            ];


            // -------------------------------------------------
            // Invalid / missing level
            // -------------------------------------------------

            if (
                !validLevels.includes(
                    level
                )
            ) {

                window.location.replace(
                    "level.html"
                );

                return;
            }


            // =================================================
            // Initialise Session
            // =================================================

            const session =
                await initialiseGuestSession(
                    level
                );


            // =================================================
            // Render Dashboard
            // =================================================

            renderGuestDashboard(
                session
            );


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
                        level
                    )}`;

            }


            // =================================================
            // Debug
            // =================================================

            console.log(
                "Guest Dashboard:",
                {

                    level,

                    session

                }
            );


        } catch (error) {

            console.error(
                "Guest Dashboard error:",
                error
            );


            // -------------------------------------------------
            // Return to Level page if the Guest session
            // cannot be initialised.
            // -------------------------------------------------

            window.location.replace(
                "level.html"
            );

        }

    }
);
