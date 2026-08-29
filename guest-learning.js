// =====================================================
// English Learning - Guest Learning
// =====================================================

// =====================================================
// Supabase Configuration
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
// =====================================================

const GUEST_SESSION_KEY =
    "english_learning_guest_session";

const GUEST_SESSION_SIZE =
    20;


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
// DOM Ready
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =================================================
        // DOM Elements
        // =================================================

        const progressText =
            document.getElementById(
                "progressText"
            );

        const progressBar =
            document.getElementById(
                "progressBar"
            );

        const wordText =
            document.getElementById(
                "wordText"
            );

        const wordImage =
            document.getElementById(
                "wordImage"
            );
        
const wordStatusBadge =
    document.getElementById(
        "wordStatusBadge"
    );

const wordStatusIcon =
    document.getElementById(
        "wordStatusIcon"
    );

const wordStatusText =
    document.getElementById(
        "wordStatusText"
    );
        
        const meaningText =
            document.getElementById(
                "meaningText"
            );

        const exampleText =
            document.getElementById(
                "exampleText"
            );

        const listenButton =
            document.getElementById(
                "listenButton"
            );

        const knowButton =
            document.getElementById(
                "knowButton"
            );

        const dontKnowButton =
            document.getElementById(
                "dontKnowButton"
            );

        const gotItButton =
            document.getElementById(
                "gotItButton"
            );

        const initialActions =
            document.getElementById(
                "initialActions"
            );

        const wordReveal =
            document.getElementById(
                "wordReveal"
            );

        const wordCard =
            document.getElementById(
                "wordCard"
            );

        const learningLevel =
            document.getElementById(
                "learningLevel"
            );


        // =================================================
        // State
        // =================================================

        let currentLevel =
            null;

        let words =
            [];

        let currentIndex =
            0;

        let isSaving =
            false;

        let guestSession =
            null;


        // =================================================
        // Guest Session Functions
        // =================================================

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


        // =================================================
        // URL Level
        // =================================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const levelFromURL =
            (
                params.get(
                    "level"
                ) ||
                ""
            ).toUpperCase();


        // =================================================
        // Get Guest Session
        // =================================================

        guestSession =
            getGuestSession();


        // =================================================
        // Validate / Determine Level
        // =================================================

        if (
            guestSession &&
            VALID_LEVELS.includes(
                guestSession.level
            )
        ) {

            currentLevel =
                guestSession.level;

        } else if (
            VALID_LEVELS.includes(
                levelFromURL
            )
        ) {

            currentLevel =
                levelFromURL;

            guestSession = {

                level:
                    currentLevel,

                words:
                    [],

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
                guestSession
            );

        } else {

            window.location.replace(
                "level.html"
            );

            return;

        }


        // =================================================
        // Display Level
        // =================================================

        if (
            learningLevel
        ) {

            learningLevel.textContent =
                LEVEL_NAMES[
                    currentLevel
                ] ||
                currentLevel;

        }


        // =================================================
        // Load Guest Learning Session
        // =================================================

        try {

            await loadGuestLearningSession();


            if (
                !words.length
            ) {

                showMessage(
                    "No words are currently available for this level.",
                    "Back to Dashboard",
                    `guest-dashboard.html?level=${encodeURIComponent(
                        currentLevel
                    )}`
                );

                return;

            }


            renderWord();


        } catch (error) {

            console.error(
                "Guest learning session error:",
                error
            );


            showMessage(
                "Unable to load the learning session.",
                "Back to Dashboard",
                `guest-dashboard.html?level=${encodeURIComponent(
                    currentLevel
                )}`
            );

        }


        // =================================================
        // Load Guest Learning Session
        // =================================================

        async function loadGuestLearningSession() {

            // =================================================
            // Get Published Words
            // =================================================

            const {
                data: libraryWords,
                error
            } =
                await supabaseClient
                    .from("words")
                    .select(
                        `
                        id,
                        created_at,
                        word,
                        level,
                        part_of_speech,
                        pronunciation,
                        meaning,
                        example,
                        image_url,
                        status
                        `
                    )
                    .eq(
                        "level",
                        currentLevel
                    )
                    .eq(
                        "status",
                        "published"
                    );


            if (error) {

                throw error;

            }


            const availableWords =
                libraryWords || [];


            // =================================================
            // Build Word Map
            // =================================================

            const wordMap =
                new Map();


            availableWords.forEach(
                word => {

                    wordMap.set(
                        word.id,
                        word
                    );

                }
            );


            // =================================================
            // Existing Guest Word Pool
            // =================================================

            const sessionWordIds =
    guestSession.words
        .map(
            item =>
                item.word_id
        )
        .filter(Boolean);


let sessionWords =
    guestSession.words
        .map(
            sessionItem => {

                const word =
                    wordMap.get(
                        sessionItem.word_id
                    );

                if (!word) {
                    return null;
                }

                return {

                    ...word,

                    progress: {

                        status:
                            sessionItem.status ||
                            "new"

                    }

                };

            }
        )
        .filter(Boolean);


            // =================================================
            // Create Word Pool if Needed
            // =================================================

            if (
                !sessionWords.length
            ) {

                sessionWords =
                    [...availableWords];


                // Oldest first
                sessionWords.sort(
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


                // Maximum 20 words
                sessionWords =
                    sessionWords.slice(
                        0,
                        GUEST_SESSION_SIZE
                    );


                guestSession.words =
                    sessionWords.map(
                        word => ({

                            word_id:
                                word.id,

                            status:
                                "new"

                        })
                    );


                guestSession.stats = {

                    mastered:
                        0,

                    unmastered:
                        0,

                    reviewed:
                        0,

                    learned:
                        0

                };


                saveGuestSession(
                    guestSession
                );

            }


            // =================================================
            // Keep Session Word Order
            // =================================================

            words =
                sessionWords;

        }


        // =================================================
        // Render Word
        // =================================================

        function renderWord() {

            const item =
                words[
                    currentIndex
                ];


            if (!item) {

                return;

            }

// =================================================
// Word Status Badge
// Guest:
// New
// Unmastered
// No Due Review
// =================================================

// =================================================
// Word Status Badge
// Guest:
// New
// Unmastered
// No Due Review
// Mastered → No Badge
// =================================================

let wordStatus = "";
let wordStatusIconValue = "";

const guestWordStatus =
    item.progress?.status ||
    "new";


if (
    guestWordStatus ===
    "unmastered"
) {

    wordStatus =
        "Unmastered";

    wordStatusIconValue =
        "⚠️";

} else if (
    guestWordStatus ===
    "new"
) {

    wordStatus =
        "New";

    wordStatusIconValue =
        "✨";

}


// =================================================
// Render Badge
// =================================================

if (
    wordStatusBadge &&
    wordStatusIcon &&
    wordStatusText
) {

    if (
        wordStatus
    ) {

        wordStatusBadge.hidden =
            false;

        wordStatusIcon.textContent =
            wordStatusIconValue;

        wordStatusText.textContent =
            wordStatus;

    } else {

        wordStatusBadge.hidden =
            true;

        wordStatusIcon.textContent =
            "";

        wordStatusText.textContent =
            "";

    }

}
            
            // -------------------------------------------------
            // Word
            // -------------------------------------------------

            wordText.textContent =
                item.word;


            // -------------------------------------------------
            // Meaning
            // -------------------------------------------------

            meaningText.textContent =
                item.meaning ||
                "";


            // -------------------------------------------------
            // Example
            // -------------------------------------------------

            exampleText.textContent =
                item.example ||
                "";


            // -------------------------------------------------
            // Image
            // -------------------------------------------------

            if (
                wordImage &&
                item.image_url
            ) {

                wordImage.style.backgroundImage =
                    `url("${item.image_url}")`;

                wordImage.style.backgroundSize =
                    "cover";

                wordImage.style.backgroundPosition =
                    "center";

                wordImage.textContent =
                    "";

            } else if (
                wordImage
            ) {

                wordImage.style.backgroundImage =
                    "none";

                wordImage.textContent =
                    "Image";

            }


            // -------------------------------------------------
            // Initial State
            // -------------------------------------------------

            initialActions.hidden =
                false;

            wordReveal.hidden =
                true;


            knowButton.disabled =
                false;

            dontKnowButton.disabled =
                false;

            gotItButton.disabled =
                false;


            // -------------------------------------------------
            // Progress
            // -------------------------------------------------

            const currentWord =
                currentIndex +
                1;


            const totalWords =
                words.length;


            progressText.textContent =
                `Word ${currentWord} of ${totalWords}`;


            progressBar.style.width =
                `${(
                    currentWord /
                    totalWords
                ) * 100}%`;


            progressBar.setAttribute(
                "aria-valuemax",
                totalWords
            );


            progressBar.setAttribute(
                "aria-valuenow",
                currentWord
            );

        }


        // =================================================
        // Save Guest Result
        // =================================================

        function saveGuestResult(
            status
        ) {

            const currentSession =
                getGuestSession();


            if (
                !currentSession
            ) {

                return;

            }


            const item =
                words[
                    currentIndex
                ];


            if (!item) {

                return;

            }


            // -------------------------------------------------
            // Find Current Word
            // -------------------------------------------------

            const sessionWord =
                currentSession.words.find(
                    word =>
                        word.word_id ===
                        item.id
                );


            if (
    sessionWord
) {

    sessionWord.status =
        status;

} else {

    currentSession.words.push({

        word_id:
            item.id,

        status:
            status

    });

}


// =================================================
// Keep Current Word Status Updated
// Used by the Word Status Badge
// =================================================

item.progress = {

    ...(item.progress || {}),

    status:
        status

};


// =================================================
// Update Guest Word Status Badge
// =================================================

if (
    wordStatusBadge &&
    wordStatusIcon &&
    wordStatusText
) {

    if (
        status ===
        "unmastered"
    ) {

        wordStatusBadge.hidden =
            false;

        wordStatusIcon.textContent =
            "⚠️";

        wordStatusText.textContent =
            "Unmastered";

    } else {

        wordStatusBadge.hidden =
            false;

        wordStatusIcon.textContent =
            "✨";

        wordStatusText.textContent =
            "New";

    }

}


            // =================================================
            // Recalculate Statistics
            // =================================================

            const mastered =
                currentSession.words.filter(
                    word =>
                        word.status ===
                        "mastered"
                ).length;


            const unmastered =
                currentSession.words.filter(
                    word =>
                        word.status ===
                        "unmastered"
                ).length;


            currentSession.stats = {

                mastered:

                    mastered,

                unmastered:

                    unmastered,

                reviewed:
                    0,

                learned:
                    mastered +
                    unmastered

            };


            // =================================================
            // Save
            // =================================================

            saveGuestSession(
                currentSession
            );


            guestSession =
                currentSession;

        }


        // =================================================
        // I Know
        // =================================================

        knowButton.addEventListener(
            "click",
            async () => {

                if (
                    isSaving
                ) {

                    return;

                }


                isSaving =
                    true;


                knowButton.disabled =
                    true;

                dontKnowButton.disabled =
                    true;


                try {

                    saveGuestResult(
                        "mastered"
                    );


                    nextWord();


                } catch (error) {

                    console.error(
                        "Unable to save Guest result:",
                        error
                    );


                    knowButton.disabled =
                        false;

                    dontKnowButton.disabled =
                        false;

                }


                isSaving =
                    false;

            }
        );


        // =================================================
        // I Don't Know
        // =================================================

        dontKnowButton.addEventListener(
            "click",
            async () => {

                if (
                    isSaving
                ) {

                    return;

                }


                isSaving =
                    true;


                knowButton.disabled =
                    true;

                dontKnowButton.disabled =
                    true;


                try {

                    saveGuestResult(
                        "unmastered"
                    );


                    initialActions.hidden =
                        true;

                    wordReveal.hidden =
                        false;


                } catch (error) {

                    console.error(
                        "Unable to save Guest result:",
                        error
                    );


                    knowButton.disabled =
                        false;

                    dontKnowButton.disabled =
                        false;

                }


                isSaving =
                    false;

            }
        );


        // =================================================
        // Got It
        // =================================================

        gotItButton.addEventListener(
            "click",
            () => {

                if (
                    isSaving
                ) {

                    return;

                }


                nextWord();

            }
        );


        // =================================================
        // Listen
        // =================================================

        listenButton.addEventListener(
            "click",
            () => {

                if (
                    !(
                        "speechSynthesis"
                        in window
                    )
                ) {

                    return;

                }


                const item =
                    words[
                        currentIndex
                    ];


                if (!item) {

                    return;

                }


                speechSynthesis.cancel();


                const utterance =
                    new SpeechSynthesisUtterance(
                        item.word
                    );


                // British English
                utterance.lang =
                    "en-GB";


                utterance.rate =
                    0.85;


                speechSynthesis.speak(
                    utterance
                );

            }
        );


        // =================================================
        // Next Word
        // =================================================

        function nextWord() {

            if (
                currentIndex <
                words.length -
                1
            ) {

                currentIndex++;

                renderWord();

            } else {

                showSessionComplete();

            }

        }


        // =================================================
        // Session Complete
        // =================================================

        function showSessionComplete() {

            wordCard.innerHTML = `

                <div class="session-complete">

                    <p class="eyebrow">
                        Session Complete
                    </p>

                    <h2>
                        Well done!
                    </h2>

                    <p>
                        You have finished this Guest learning session.
                    </p>

                    <div class="dashboard-actions">

                        <a
                            href="guest-learning.html?level=${encodeURIComponent(
                                currentLevel
                            )}"
                            class="btn btn-primary"
                        >
                            Continue Learning 🧠
                        </a>

                        <a
                            href="guest-dashboard.html?level=${encodeURIComponent(
                                currentLevel
                            )}"
                            class="btn btn-secondary"
                        >
                            Back to Dashboard
                        </a>

                    </div>

                </div>

            `;

        }


        // =================================================
        // Message Helper
        // =================================================

        function showMessage(
            message,
            buttonText,
            buttonHref
        ) {

            if (
                !wordCard
            ) {

                return;

            }


            wordCard.innerHTML = `

                <div class="session-complete">

                    <p class="eyebrow">
                        Guest Learning
                    </p>

                    <h2>
                        ${message}
                    </h2>

                    <a
                        href="${buttonHref}"
                        class="btn btn-primary"
                    >
                        ${buttonText}
                    </a>

                </div>

            `;

        }

    }
);
