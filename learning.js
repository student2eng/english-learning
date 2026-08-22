// =====================================================
// English Learning - Learning Page
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
// DOM Ready
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    // =================================================
    // DOM Elements
    // =================================================

    const progressText =
        document.getElementById("progressText");

    const progressBar =
        document.getElementById("progressBar");

    const wordText =
        document.getElementById("wordText");

    const wordImage =
        document.getElementById("wordImage");

    const meaningText =
        document.getElementById("meaningText");

    const exampleText =
        document.getElementById("exampleText");

    const listenButton =
        document.getElementById("listenButton");

    const knowButton =
        document.getElementById("knowButton");

    const dontKnowButton =
        document.getElementById("dontKnowButton");

    const gotItButton =
        document.getElementById("gotItButton");

    const initialActions =
        document.getElementById("initialActions");

    const wordReveal =
        document.getElementById("wordReveal");

    const wordCard =
        document.getElementById("wordCard");

    const learningLevel =
        document.querySelector(
            ".learning-heading .eyebrow"
        );


    // =================================================
    // Learning State
    // =================================================

    let currentUser = null;

    let currentLevel = null;

    let currentMode = "learning";

    let words = [];

    let currentIndex = 0;

    let isSaving = false;


    // =================================================
    // Get URL Parameters
    // =================================================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const mode =
        params.get("mode");

    const levelFromURL =
        params.get("level");


    if (mode === "unmastered") {
        currentMode = "unmastered";
    }


    // =================================================
    // Get Current User
    // =================================================

    try {

        const {
            data: { user },
            error
        } = await supabaseClient.auth.getUser();

        if (error) {
            throw error;
        }

        currentUser = user || null;

    } catch (error) {

        console.error(
            "Authentication error:",
            error
        );

        currentUser = null;
    }


    // =================================================
    // Get Current Level
    // =================================================

    if (currentUser) {

        // -------------------------------------------------
        // Logged-in student
        // Level comes from the student's profile.
        // The student does not choose it every time.
        // -------------------------------------------------

        const {
            data: profile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select("level")
            .eq("id", currentUser.id)
            .single();

        if (profileError) {

            console.error(
                "Profile error:",
                profileError
            );

            showMessage(
                "Unable to load your learning level.",
                "Back to Dashboard",
                "dashboard.html"
            );

            return;
        }

        currentLevel =
            profile?.level || null;

    } else {

        // -------------------------------------------------
        // Guest
        // Level must come from the Level page.
        // -------------------------------------------------

        currentLevel =
            levelFromURL || null;
    }


    // =================================================
    // Validate Level
    // =================================================

    if (!currentLevel) {

        showMessage(
            "Please choose your English level before learning.",
            "Choose Level",
            "level.html"
        );

        return;
    }


    // =================================================
    // Display Current Level
    // =================================================

    const levelNames = {

        A1: "A1 — Beginner",
        A2: "A2 — Elementary",
        B1: "B1 — Intermediate",
        B2: "B2 — Upper Intermediate",
        C1: "C1 — Advanced"

    };


    if (learningLevel) {

        learningLevel.textContent =
            levelNames[currentLevel] ||
            currentLevel;
    }


    // =================================================
    // Load Session
    // =================================================

    try {

        await loadLearningSession();

        if (!words.length) {

            showMessage(
                "No words are currently available for this level.",
                "Back to Dashboard",
                "dashboard.html"
            );

            return;
        }

        renderWord();

    } catch (error) {

        console.error(
            "Learning session error:",
            error
        );

        showMessage(
            "Unable to load the learning session.",
            "Back to Dashboard",
            "dashboard.html"
        );

        return;
    }


    // =================================================
    // Load Learning Session
    // =================================================

    async function loadLearningSession() {

        // -------------------------------------------------
        // Get published words for the selected level
        // -------------------------------------------------

        const {
            data: libraryWords,
            error: wordsError
        } = await supabaseClient
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

        if (wordsError) {
            throw wordsError;
        }


        const availableWords =
            libraryWords || [];


        // -------------------------------------------------
        // Guest
        // -------------------------------------------------

        if (!currentUser) {

            words =
                buildGuestSession(
                    availableWords
                );

            return;
        }


        // -------------------------------------------------
        // Get student's word progress
        // -------------------------------------------------

        const {
            data: progressRows,
            error: progressError
        } = await supabaseClient
            .from("word_progress")
            .select(
                `
                id,
                user_id,
                word_id,
                status,
                last_review,
                next_review,
                review_stage,
                created_at,
                updated_at
                `
            )
            .eq(
                "user_id",
                currentUser.id
            );

        if (progressError) {
            throw progressError;
        }


        const progress =
            progressRows || [];


        // -------------------------------------------------
        // Build lookup by word_id
        // -------------------------------------------------

        const progressMap =
            new Map();

        progress.forEach(row => {

            progressMap.set(
                row.word_id,
                row
            );

        });


        // -------------------------------------------------
        // Current time
        // -------------------------------------------------

        const now =
            new Date();


        // -------------------------------------------------
        // Separate the three approved types
        // -------------------------------------------------

        const newWords = [];

        const unmasteredWords = [];

        const dueReviewWords = [];


        availableWords.forEach(word => {

            const wordProgress =
                progressMap.get(
                    word.id
                );


            // =================================================
            // New
            // =================================================

            if (!wordProgress) {

                newWords.push(word);

                return;
            }


            // =================================================
            // Unmastered
            // =================================================

            if (
                wordProgress.status ===
                "unmastered"
            ) {

                unmasteredWords.push({
                    ...word,
                    progress:
                        wordProgress
                });

                return;
            }


            // =================================================
            // Due Reviews
            // =================================================

            if (
                wordProgress.status ===
                    "mastered" &&
                wordProgress.next_review &&
                new Date(
                    wordProgress.next_review
                ) <= now
            ) {

                dueReviewWords.push({
                    ...word,
                    progress:
                        wordProgress
                });
            }

        });


        // =================================================
        // Review Unmastered
        // =================================================

        if (
            currentMode ===
            "unmastered"
        ) {

            // Oldest Unmastered first
            unmasteredWords.sort(
                sortOldestUnmastered
            );


            words =
                unmasteredWords.slice(
                    0,
                    10
                );

            return;
        }


        // =================================================
        // New Words
        //
        // New Words = 20 - Total Unmastered
        // =================================================

        const totalUnmastered =
            unmasteredWords.length;


        const newWordsQuota =
            Math.max(
                0,
                20 - totalUnmastered
            );


        // -------------------------------------------------
        // Oldest New Words first
        // -------------------------------------------------

        newWords.sort(
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
        // Oldest Unmastered first
        // -------------------------------------------------

        unmasteredWords.sort(
            sortOldestUnmastered
        );


        // -------------------------------------------------
        // Oldest Due Reviews first
        // -------------------------------------------------

        dueReviewWords.sort(
            (a, b) => {

                return (
                    new Date(
                        a.progress.next_review
                    ) -
                    new Date(
                        b.progress.next_review
                    )
                );

            }
        );


        // =================================================
        // Apply independent quotas
        // =================================================

        const selectedNewWords =
            newWords.slice(
                0,
                newWordsQuota
            );


        const selectedUnmasteredWords =
            unmasteredWords.slice(
                0,
                10
            );


        const selectedDueReviewWords =
            dueReviewWords.slice(
                0,
                10
            );


        // =================================================
        // Mixed Session
        //
        // New → Unmastered → Due
        //
        // If one type ends:
        // continue with remaining types.
        // =================================================

        words =
            buildMixedSession(
                selectedNewWords,
                selectedUnmasteredWords,
                selectedDueReviewWords
            );
    }


    // =================================================
    // Build Guest Session
    // =================================================

    function buildGuestSession(
        availableWords
    ) {

        // Guest has no permanent progress.
        // Guest receives available words for the
        // selected level only.

        const guestWords =
            [...availableWords];


        // Oldest words first
        guestWords.sort(
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


        // Guest learning uses the same New
        // session amount available to the user
        // when there is no Unmastered progress.

        return guestWords.slice(
            0,
            20
        );
    }


    // =================================================
    // Build Mixed Session
    // =================================================

    function buildMixedSession(
        newWords,
        unmasteredWords,
        dueReviewWords
    ) {

        const result = [];

        let newIndex = 0;

        let unmasteredIndex = 0;

        let dueIndex = 0;


        while (
            newIndex < newWords.length ||
            unmasteredIndex < unmasteredWords.length ||
            dueIndex < dueReviewWords.length
        ) {

            // -------------------------------------------------
            // New
            // -------------------------------------------------

            if (
                newIndex <
                newWords.length
            ) {

                result.push({
                    ...newWords[newIndex],
                    type: "new"
                });

                newIndex++;
            }


            // -------------------------------------------------
            // Unmastered
            // -------------------------------------------------

            if (
                unmasteredIndex <
                unmasteredWords.length
            ) {

                result.push({
                    ...unmasteredWords[
                        unmasteredIndex
                    ],
                    type: "unmastered"
                });

                unmasteredIndex++;
            }


            // -------------------------------------------------
            // Due
            // -------------------------------------------------

            if (
                dueIndex <
                dueReviewWords.length
            ) {

                result.push({
                    ...dueReviewWords[
                        dueIndex
                    ],
                    type: "due"
                });

                dueIndex++;
            }

        }


        return result;
    }


    // =================================================
    // Oldest Unmastered
    // =================================================

    function sortOldestUnmastered(
        a,
        b
    ) {

        const aDate =
            a.progress?.last_review
                ? new Date(
                    a.progress.last_review
                ).getTime()
                : Number.MAX_SAFE_INTEGER;


        const bDate =
            b.progress?.last_review
                ? new Date(
                    b.progress.last_review
                ).getTime()
                : Number.MAX_SAFE_INTEGER;


        return (
            aDate -
            bDate
        );
    }


    // =================================================
    // Render Current Word
    // =================================================

    function renderWord() {

        const item =
            words[currentIndex];


        if (!item) {
            return;
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
            item.meaning || "";


        // -------------------------------------------------
        // Example
        // -------------------------------------------------

        exampleText.textContent =
            item.example || "";


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

        } else if (wordImage) {

            wordImage.style.backgroundImage =
                "none";

            wordImage.textContent =
                "Image";
        }


        // -------------------------------------------------
        // Meaning hidden initially
        // -------------------------------------------------

        initialActions.hidden =
            false;

        wordReveal.hidden =
            true;


        // -------------------------------------------------
        // Buttons
        // -------------------------------------------------

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
            currentIndex + 1;

        const totalWords =
            words.length;


        progressText.textContent =
            `Word ${currentWord} of ${totalWords}`;


        progressBar.style.width =
            `${(
                currentWord /
                totalWords
            ) * 100}%`;


        // Keep accessibi
