// =====================================================
// English Learning - Learning Page
// Registered Student Only
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

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // =================================================
        // Account Dropdown Menu
        // =================================================

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


        // -------------------------------------------------
        // Account Menu
        // -------------------------------------------------

        if (
            accountMenuButton &&
            accountMenu
        ) {

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


            // -------------------------------------------------
            // Close menu when clicking outside
            // -------------------------------------------------

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

        }


        // =================================================
        // Student Log Out
        // =================================================

        if (
            accountLogoutButton
        ) {

            accountLogoutButton.addEventListener(
                "click",
                async () => {

                    accountLogoutButton.disabled =
                        true;


                    accountLogoutButton.textContent =
                        "Logging out...";


                    try {

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
const wordMeta =
    document.getElementById(
        "wordMeta"
    );

const wordPronunciation =
    document.getElementById(
        "wordPronunciation"
    );

const wordPartOfSpeech =
    document.getElementById(
        "wordPartOfSpeech"
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
            document.querySelector(
                ".learning-heading .eyebrow"
            );


        const exitLearningLink =
            document.querySelector(
                ".exit-learning"
            );


        // =================================================
        // Learning State
        // =================================================

        let currentUser =
            null;


        let currentLevel =
            null;


        let currentMode =
            "learning";


        let words =
            [];


        let currentIndex =
            0;


        let isSaving =
            false;


        // =================================================
        // Get URL Parameters
        // =================================================

        const params =
            new URLSearchParams(
                window.location.search
            );


        const mode =
            params.get(
                "mode"
            );


        if (
            mode ===
            "unmastered"
        ) {

            currentMode =
                "unmastered";

        }


        // =================================================
        // Authentication Guard
        //
        // learning.html is for registered students only.
        // =================================================

        try {

            const {
                data: {
                    user
                },
                error
            } =
                await supabaseClient
                    .auth
                    .getUser();


            if (error) {
                throw error;
            }


            if (!user) {

                window.location.replace(
                    "auth.html"
                );

                return;

            }


            currentUser =
                user;


        } catch (error) {

            console.error(
                "Authentication error:",
                error
            );


            window.location.replace(
                "auth.html"
            );


            return;

        }


        // =================================================
        // Exit Learning
        // Registered Student → Dashboard
        // =================================================

        if (
            exitLearningLink
        ) {

            exitLearningLink.href =
                "dashboard.html";

        }


        // =================================================
        // Get Student Level
        // =================================================

        try {

            const {
                data: profile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "level"
                    )
                    .eq(
                        "id",
                        currentUser.id
                    )
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
                profile?.level ||
                null;


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );


            showMessage(
                "Unable to load your learning level.",
                "Back to Dashboard",
                "dashboard.html"
            );


            return;

        }


        // =================================================
        // Validate Level
        // =================================================

        if (
            !currentLevel
        ) {

            showMessage(
                "Your English level has not been set.",
                "Back to Dashboard",
                "dashboard.html"
            );


            return;

        }


        // =================================================
        // Display Current Level
        // =================================================

        const levelNames = {

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


        if (
            learningLevel
        ) {

            learningLevel.textContent =
                levelNames[
                    currentLevel
                ] ||
                currentLevel;

        }


        // =================================================
        // Load Learning Session
        // =================================================

        try {

            await loadLearningSession();


            if (
                !words.length
            ) {

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

            // =================================================
            // Get Published Words
            // =================================================

            const {
                data: libraryWords,
                error: wordsError
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


            if (wordsError) {
                throw wordsError;
            }


            const availableWords =
                libraryWords ||
                [];


            // =================================================
            // Get Student Progress
            // =================================================

            const {
                data: progressRows,
                error: progressError
            } =
                await supabaseClient
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
                progressRows ||
                [];


            // =================================================
            // Build Progress Lookup
            // =================================================

            const progressMap =
                new Map();


            progress.forEach(
                row => {

                    progressMap.set(
                        row.word_id,
                        row
                    );

                }
            );


            // =================================================
            // Current Time
            // =================================================

            const now =
                new Date();


            // =================================================
            // Separate Word Types
            // =================================================

            const newWords =
                [];


            const unmasteredWords =
                [];


            const dueReviewWords =
                [];


            availableWords.forEach(
                word => {

                    const wordProgress =
                        progressMap.get(
                            word.id
                        );


                    // -----------------------------------------
                    // New
                    // -----------------------------------------

                    if (
                        !wordProgress
                    ) {

                        newWords.push(
                            word
                        );


                        return;

                    }


                    // -----------------------------------------
                    // Unmastered
                    // -----------------------------------------

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


                    // -----------------------------------------
                    // Due Review
                    // -----------------------------------------

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

                }
            );


            // =================================================
            // Review Unmastered Mode
            // =================================================

            if (
                currentMode ===
                "unmastered"
            ) {

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
            // 20 − Total Unmastered
            // =================================================

            const totalUnmastered =
                unmasteredWords.length;


            const newWordsQuota =
                Math.max(
                    0,
                    20 -
                    totalUnmastered
                );


            // =================================================
            // Sort New Words
            // =================================================

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


            // =================================================
            // Sort Unmastered
            // =================================================

            unmasteredWords.sort(
                sortOldestUnmastered
            );


            // =================================================
            // Sort Due Reviews
            // =================================================

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
            // Apply Quotas
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
            // Build Mixed Session
            // =================================================

            words =
                buildMixedSession(
                    selectedNewWords,
                    selectedUnmasteredWords,
                    selectedDueReviewWords
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

            const result =
                [];


            let newIndex =
                0;


            let unmasteredIndex =
                0;


            let dueIndex =
                0;


            while (
                newIndex <
                    newWords.length ||
                unmasteredIndex <
                    unmasteredWords.length ||
                dueIndex <
                    dueReviewWords.length
            ) {

                // -----------------------------------------
                // New
                // -----------------------------------------

                if (
                    newIndex <
                    newWords.length
                ) {

                    result.push({

                        ...newWords[
                            newIndex
                        ],

                        type:
                            "new"

                    });


                    newIndex++;

                }


                // -----------------------------------------
                // Unmastered
                // -----------------------------------------

                if (
                    unmasteredIndex <
                    unmasteredWords.length
                ) {

                    result.push({

                        ...unmasteredWords[
                            unmasteredIndex
                        ],

                        type:
                            "unmastered"

                    });


                    unmasteredIndex++;

                }


                // -----------------------------------------
                // Due
                // -----------------------------------------

                if (
                    dueIndex <
                    dueReviewWords.length
                ) {

                    result.push({

                        ...dueReviewWords[
                            dueIndex
                        ],

                        type:
                            "due"

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
                words[
                    currentIndex
                ];


            if (!item) {
                return;
            }

// -------------------------------------------------
// Word Status Badge
// -------------------------------------------------

let wordStatus = "";
let statusIcon = "";

if (!item.progress) {

    // New
    wordStatus = "New";
    statusIcon = "⭐";

} else if (
    item.progress.status === "unmastered"
) {

    // Unmastered
    wordStatus = "Unmastered";
    statusIcon = "🔄";

} else if (
    item.progress.status === "mastered" &&
    item.progress.next_review &&
    new Date(item.progress.next_review) <= new Date()
) {

    // Due Reviews
    wordStatus = "Due Reviews";
    statusIcon = "📅";

}


// -------------------------------------------------
// Render Badge
// -------------------------------------------------

if (
    wordStatusBadge &&
    wordStatusIcon &&
    wordStatusText
) {

    if (wordStatus) {

        wordStatusBadge.hidden = false;

        wordStatusIcon.textContent =
            statusIcon;

        wordStatusText.textContent =
            wordStatus;

    } else {

        wordStatusBadge.hidden = true;

        wordStatusIcon.textContent = "";
        wordStatusText.textContent = "";

    }

}

            // -------------------------------------------------
            // Word
            // -------------------------------------------------

            wordText.textContent =
                item.word;
            
// -------------------------------------------------
// Pronunciation + Part of Speech
// -------------------------------------------------

const pronunciation =
    item.pronunciation ||
    "";

const partOfSpeech =
    item.part_of_speech ||
    "";

if (
    wordPronunciation &&
    wordPartOfSpeech &&
    wordMeta
) {

    wordPronunciation.textContent =
        pronunciation;

    wordPartOfSpeech.textContent =
        partOfSpeech;

    const separator =
        wordMeta.querySelector(
            ".word-meta-separator"
        );

    if (separator) {

        separator.hidden =
            !(
                pronunciation &&
                partOfSpeech
            );

    }

    wordMeta.hidden =
        !(
            pronunciation ||
            partOfSpeech
        );

}

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
        // Save Word Result
        // =================================================

        async function saveWordResult(
            status
        ) {

            const item =
                words[
                    currentIndex
                ];


            if (!item) {
                return;
            }


            // =================================================
            // Current Time
            // =================================================

            const now =
                new Date();


            // =================================================
            // Default Values
            // =================================================

            let reviewStage =
                0;


            let nextReview =
                null;


            // =================================================
            // I Know → Mastered
            // =================================================

            if (
                status ===
                "mastered"
            ) {

                // ---------------------------------------------
                // New / Unmastered → Start Review Cycle
                // ---------------------------------------------

                if (
                    !item.progress ||
                    item.progress.status ===
                    "unmastered"
                ) {

                    reviewStage =
                        0;


                    nextReview =
                        addDays(
                            now,
                            5
                        );

                }


                // ---------------------------------------------
                // Existing Mastered Word
                // ---------------------------------------------

                else {

                    const currentStage =
                        Number(
                            item.progress.review_stage ||
                            0
                        );


                    // -----------------------------------------
                    // 5-day review completed
                    // -----------------------------------------

                    if (
                        currentStage ===
                        0
                    ) {

                        reviewStage =
                            1;


                        nextReview =
                            addDays(
                                now,
                                10
                            );

                    }


                    // -----------------------------------------
                    // 10-day review completed
                    // -----------------------------------------

                    else if (
                        currentStage ===
                        1
                    ) {

                        reviewStage =
                            2;


                        nextReview =
                            addOneMonth(
                                now
                            );

                    }


                    // -----------------------------------------
                    // Monthly review completed
                    // -----------------------------------------

                    else {

                        reviewStage =
                            0;


                        nextReview =
                            addDays(
                                now,
                                5
                            );

                    }

                }

            }


            // =================================================
            // I Don't Know → Unmastered
            // =================================================

            if (
                status ===
                "unmastered"
            ) {

                reviewStage =
                    0;


                nextReview =
                    null;

            }


            // =================================================
            // Save to word_progress
            // =================================================

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "word_progress"
                    )
                    .upsert(
                        {

                            user_id:
                                currentUser.id,

                            word_id:
                                item.id,

                            status:
                                status,

                            last_review:
                                now.toISOString(),

                            next_review:
                                nextReview
                                    ? nextReview.toISOString()
                                    : null,

                            review_stage:
                                reviewStage

                        },
                        {

                            onConflict:
                                "user_id,word_id"

                        }
                    )
                    .select()
                    .single();


            if (error) {

                console.error(
                    "word_progress save error:",
                    error
                );


                throw error;

            }


            // -------------------------------------------------
            // Keep current word progress updated
            // -------------------------------------------------

            item.progress =
                data;

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

                    await saveWordResult(
                        "mastered"
                    );


                    nextWord();


                } catch (error) {

                    console.error(
                        "Unable to save I Know result:",
                        error
                    );


                    alert(
                        "Unable to save your progress. Please try again."
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

                    await saveWordResult(
                        "unmastered"
                    );


                    // -----------------------------------------
                    // Reveal Meaning + Example
                    // -----------------------------------------

                    initialActions.hidden =
                        true;


                    wordReveal.hidden =
                        false;


                } catch (error) {

                    console.error(
                        "Unable to save I Don't Know result:",
                        error
                    );


                    alert(
                        "Unable to save your progress. Please try again."
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
                        You have finished this learning session.
                    </p>

                    <div class="dashboard-actions">

                        <a
                            href="learning.html"
                            class="btn btn-primary"
                        >
                            Continue Learning 🧠
                        </a>

                        <a
                            href="dashboard.html"
                            class="btn btn-secondary"
                        >
                            Back to Dashboard
                        </a>

                    </div>

                </div>

            `;

        }


        // =================================================
        // Date Helpers
        // =================================================

        function addDays(
            date,
            days
        ) {

            const result =
                new Date(
                    date
                );


            result.setDate(
                result.getDate() +
                days
            );


            return result;

        }


        function addOneMonth(
            date
        ) {

            const result =
                new Date(
                    date
                );


            const originalDay =
                result.getDate();


            result.setDate(
                1
            );


            result.setMonth(
                result.getMonth() +
                1
            );


            const lastDayOfNextMonth =
                new Date(
                    result.getFullYear(),
                    result.getMonth() +
                    1,
                    0
                ).getDate();


            result.setDate(
                Math.min(
                    originalDay,
                    lastDayOfNextMonth
                )
            );


            return result;

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
                        Learning
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
