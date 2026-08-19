document.addEventListener("DOMContentLoaded", () => {

    // Temporary learning words
    // These will later be connected to the real Word Library.

    // ================================
    // Supabase Configuration
    // ================================

    const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";

    const supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    // Temporary learning words
    const words = [
        {
            word: "welcome",
            meaning: "To greet someone in a friendly way.",
            example: "Welcome to our English learning platform."
        },
        {
            word: "recommend",
            meaning: "To suggest something as a good choice.",
            example: "I recommend this book for English learners."
        },
        {
            word: "arrange",
            meaning: "To organise or plan something.",
            example: "Let's arrange a meeting for tomorrow."
        },
        {
            word: "useful",
            meaning: "Helpful or practical for a particular purpose.",
            example: "This vocabulary is useful for everyday conversations."
        },
        {
            word: "currently",
            meaning: "At the present time.",
            example: "I am currently working on my English."
        },
        {
            word: "supplier",
            meaning: "A person or company that provides something.",
            example: "We contacted a new supplier."
        },
        {
            word: "transparent",
            meaning: "Easy to understand, see, or know about.",
            example: "The process should be clear and transparent."
        },
        {
            word: "discussion",
            meaning: "A conversation about a particular subject.",
            example: "We had a useful discussion about the project."
        },
        {
            word: "colleagues",
            meaning: "People you work with.",
            example: "I discussed the idea with my colleagues."
        },
        {
            word: "production",
            meaning: "The process of making or producing something.",
            example: "Production will start next week."
        }
    ];


    let currentIndex = 0;


    // Elements
    const progressText =
        document.getElementById("progressText");

    const progressBar =
        document.getElementById("progressBar");

    const wordText =
        document.getElementById("wordText");

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


    // Display current word
    function renderWord() {

        const item = words[currentIndex];

        wordText.textContent = item.word;

        meaningText.textContent = item.meaning;

        exampleText.textContent = item.example;


        // Reset card state
        initialActions.hidden = false;

        wordReveal.hidden = true;


        // Update progress
        const currentWord = currentIndex + 1;
        const totalWords = words.length;

        progressText.textContent =
            `Word ${currentWord} of ${totalWords}`;


        const progress =
            (currentWord / totalWords) * 100;

        progressBar.style.width =
            `${progress}%`;
    }


    // Save learning result temporarily
    function saveWordResult(status) {

        const savedResults =
            JSON.parse(
                localStorage.getItem(
                    "englishLearningSession"
                ) || "[]"
            );


        savedResults.push({
            word: words[currentIndex].word,
            status: status,
            date: new Date().toISOString()
        });


        localStorage.setItem(
            "englishLearningSession",
            JSON.stringify(savedResults)
        );
    }


    // Move to next word
    function nextWord() {

        if (currentIndex < words.length - 1) {

            currentIndex++;

            renderWord();

        } else {

            showSessionComplete();
        }
    }


    // Session completed
    function showSessionComplete() {

        const wordCard =
            document.getElementById("wordCard");


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

                <a
                    href="dashboard.html"
                    class="button button-primary"
                >
                    Back to Dashboard
                </a>

            </div>
        `;
    }


    // Listen to the word
    listenButton.addEventListener("click", () => {

        if (!("speechSynthesis" in window)) {
            return;
        }


        speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                words[currentIndex].word
            );


        // British English
        utterance.lang = "en-GB";

        utterance.rate = 0.85;


        speechSynthesis.speak(utterance);
    });


    // I Know
    knowButton.addEventListener("click", () => {

        // Save as Mastered
        saveWordResult("mastered");


        // Go directly to next word
        nextWord();
    });


    // I Don't Know
    dontKnowButton.addEventListener("click", () => {

        // Save as Unmastered
        saveWordResult("unmastered");


        // Hide decision buttons
        initialActions.hidden = true;


        // Show Meaning + Example
        wordReveal.hidden = false;
    });


    // Got It
    gotItButton.addEventListener("click", () => {

        // Go to next word
        nextWord();
    });


    // Start with first word
    renderWord();

});
