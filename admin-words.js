// =====================================================
// English Learning - Admin Word Library
// =====================================================


// =====================================================
// Supabase Configuration
// =====================================================

const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
const SUPABASE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";


// =====================================================
// Database Configuration
// =====================================================

const WORDS_TABLE = "words";


// =====================================================
// Pagination Configuration
// =====================================================

const WORDS_PER_PAGE = 50;


// =====================================================
// Search Configuration
// =====================================================

const SEARCH_DELAY = 300;


// =====================================================
// Admin Word Library Initialization
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    // -------------------------------------------------
    // Get Elements
    // -------------------------------------------------

    const wordSearch =
        document.getElementById("wordSearch");

    const levelFilter =
        document.getElementById("levelFilter");

    const wordCount =
        document.getElementById("wordCount");

    const wordTableBody =
        document.getElementById("wordTableBody");

    const wordMobileList =
        document.getElementById("wordMobileList");

    const wordEmptyState =
        document.getElementById("wordEmptyState");

    const wordLoadingState =
        document.getElementById("wordLoadingState");

    const wordErrorState =
        document.getElementById("wordErrorState");

    const wordErrorMessage =
        document.getElementById("wordErrorMessage");

    const wordPagination =
        document.getElementById("wordPagination");

    const paginationInfo =
        document.getElementById("paginationInfo");

    const paginationControls =
        document.getElementById("paginationControls");

    const clearFiltersButton =
        document.getElementById("clearFiltersButton");


    // -------------------------------------------------
    // Check Required Elements
    // -------------------------------------------------

    if (
        !wordSearch ||
        !levelFilter ||
        !wordCount ||
        !wordTableBody ||
        !wordMobileList ||
        !wordEmptyState ||
        !wordLoadingState ||
        !wordErrorState ||
        !wordErrorMessage ||
        !wordPagination ||
        !paginationInfo ||
        !paginationControls ||
        !clearFiltersButton
    ) {

        console.error(
            "Required Word Library elements were not found."
        );

        return;
    }


    // =================================================
    // State
    // =================================================

    let currentPage = 1;

    let totalWords = 0;

    let currentSearch = "";

    let currentLevel = "";

    let searchTimer = null;


    // =================================================
    // Load Supabase Library
    // =================================================

    try {

        await loadSupabaseLibrary();

    } catch (error) {

        console.error(
            "Supabase library loading error:",
            error
        );

        showError(
            "Supabase could not be loaded. Please try again later."
        );

        return;
    }


    // =================================================
    // Check Supabase Configuration
    // =================================================

    if (
        SUPABASE_URL === "YOUR_SUPABASE_URL" ||
        SUPABASE_KEY ===
            "YOUR_SUPABASE_PUBLISHABLE_KEY"
    ) {

        showError(
            "Supabase configuration is not set yet."
        );

        console.error(
            "Add the Supabase URL and Publishable/anon key to admin-words.js."
        );

        return;
    }


    // =================================================
    // Create Supabase Client
    // =================================================

    const supabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    // Temporary reference for testing
    window.supabaseClient = supabase;


    // =================================================
    // Check Admin Access
    // =================================================

    const isAdmin =
        await checkAdminAccess(supabase);

    if (!isAdmin) {
        return;
    }


    // =================================================
    // Initialize Admin Menu
    // =================================================

    initAdminMenu();


    // =================================================
    // Initialize Admin Logout
    // =================================================

    initAdminLogout(supabase);


    // =================================================
    // Initial State
    // =================================================

    levelFilter.value = "";

    await loadWords();


    // =================================================
    // Search
    // =================================================

    wordSearch.addEventListener(
        "input",
        () => {

            clearTimeout(searchTimer);


            searchTimer =
                setTimeout(
                    async () => {

                        currentSearch =
                            wordSearch.value.trim();

                        currentPage = 1;

                        await loadWords();

                    },
                    SEARCH_DELAY
                );
        }
    );


    // =================================================
    // Level Filter
    // =================================================

    levelFilter.addEventListener(
        "change",
        async () => {

            currentLevel =
                levelFilter.value;

            currentPage = 1;

            await loadWords();

        }
    );


    // =================================================
    // Clear Filters
    // =================================================

    clearFiltersButton.addEventListener(
        "click",
        async () => {

            wordSearch.value = "";

            levelFilter.value = "";

            currentSearch = "";

            currentLevel = "";

            currentPage = 1;

            await loadWords();

        }
    );


    // =================================================
    // Load Words
    // =================================================

    async function loadWords() {

        showLoading();


        try {

            const from =
                (currentPage - 1) *
                WORDS_PER_PAGE;


            const to =
                from +
                WORDS_PER_PAGE -
                1;


            // -----------------------------------------
            // Build Query
            // -----------------------------------------

            let query =
                supabase
                    .from(WORDS_TABLE)
                    .select(
                        "id, word, level, part_of_speech, status",
                        {
                            count: "exact"
                        }
                    );


            // -----------------------------------------
            // Search
            // -----------------------------------------

            if (currentSearch) {

                query =
                    query.ilike(
                        "word",
                        `%${escapeLikeValue(currentSearch)}%`
                    );

            }


            // -----------------------------------------
            // Level Filter
            // -----------------------------------------

            if (currentLevel) {

                query =
                    query.eq(
                        "level",
                        currentLevel
                    );

            }


            // -----------------------------------------
            // Ordering
            // -----------------------------------------

            query =
                query.order(
                    "word",
                    {
                        ascending: true
                    }
                );


            // -----------------------------------------
            // Pagination
            // -----------------------------------------

            query =
                query.range(
                    from,
                    to
                );


            // -----------------------------------------
            // Execute Query
            // -----------------------------------------

            const {
                data,
                error,
                count
            } = await query;


            if (error) {
                throw error;
            }


            totalWords =
                count || 0;


            // -----------------------------------------
            // Render Results
            // -----------------------------------------

            renderWordCount();

            renderWords(data || []);

            renderPagination();


        } catch (error) {

            console.error(
                "Load words error:",
                error
            );


            showError(
                getFriendlyErrorMessage(error)
            );

        }

    }


    // =================================================
    // Render Word Count
    // =================================================

    function renderWordCount() {

        wordCount.textContent =
            `${totalWords.toLocaleString()} ${
                totalWords === 1
                    ? "word"
                    : "words"
            }`;

    }


    // =================================================
    // Render Words
    // =================================================

    function renderWords(words) {

        wordTableBody.innerHTML = "";

        wordMobileList.innerHTML = "";


        if (!words.length) {

            showEmpty();

            return;
        }


        hideEmpty();


        words.forEach(
            (word) => {

                renderDesktopWord(
                    word
                );


                renderMobileWord(
                    word
                );

            }
        );

    }


    // =================================================
    // Render Desktop Word
    // =================================================

    function renderDesktopWord(word) {

        const row =
            document.createElement("tr");


        // Word

        const wordCell =
            document.createElement("td");

        wordCell.className =
            "word-table-word";

        wordCell.textContent =
            word.word || "—";


        // Level

        const levelCell =
            document.createElement("td");

        levelCell.className =
            "word-table-level";

        levelCell.textContent =
            word.level || "—";


        // Part of Speech

        const posCell =
            document.createElement("td");

        posCell.className =
            "word-table-pos";

        posCell.textContent =
            word.part_of_speech || "—";


        // Status

        const statusCell =
            document.createElement("td");


        const status =
            document.createElement("span");

        status.className =
            `word-status ${
                word.status || ""
            }`;

        status.textContent =
            formatStatus(
                word.status
            );


        statusCell.appendChild(
            status
        );


        // Action

        const actionCell =
            document.createElement("td");


        const editButton =
            createEditButton(
                word
            );


        actionCell.appendChild(
            editButton
        );


        // Add Cells

        row.appendChild(
            wordCell
        );

        row.appendChild(
            levelCell
        );

        row.appendChild(
            posCell
        );

        row.appendChild(
            statusCell
        );

        row.appendChild(
            actionCell
        );


        wordTableBody.appendChild(
            row
        );

    }


    // =================================================
    // Render Mobile Word
    // =================================================

    function renderMobileWord(word) {

        const card =
            document.createElement("div");

        card.className =
            "word-mobile-card";


        // Card Header

        const header =
            document.createElement("div");

        header.className =
            "word-mobile-card-header";


        const wordElement =
            document.createElement("div");

        wordElement.className =
            "word-mobile-word";

        wordElement.textContent =
            word.word || "—";


        const editButton =
            createEditButton(
                word
            );


        header.appendChild(
            wordElement
        );

        header.appendChild(
            editButton
        );


        // Details

        const details =
            document.createElement("div");

        details.className =
            "word-mobile-details";


        const level =
            document.createElement("span");

        level.textContent =
            word.level || "—";


        const separator1 =
            document.createElement("span");

        separator1.className =
            "word-mobile-separator";

        separator1.textContent =
            "·";


        const partOfSpeech =
            document.createElement("span");

        partOfSpeech.textContent =
            word.part_of_speech || "—";


        const separator2 =
            document.createElement("span");

        separator2.className =
            "word-mobile-separator";

        separator2.textContent =
            "·";


        const status =
            document.createElement("span");

        status.className =
            `word-status ${
                word.status || ""
            }`;

        status.textContent =
            formatStatus(
                word.status
            );


        details.appendChild(
            level
        );

        details.appendChild(
            separator1
        );

        details.appendChild(
            partOfSpeech
        );

        details.appendChild(
            separator2
        );

        details.appendChild(
            status
        );


        // Add to Card

        card.appendChild(
            header
        );

        card.appendChild(
            details
        );


        wordMobileList.appendChild(
            card
        );

    }


    // =================================================
// Create Edit Button
// =================================================

function createEditButton(word) {

    const button =
        document.createElement("button");

    button.type =
        "button";

    button.className =
        "word-edit-button";

    button.textContent =
        "Edit";


    // -------------------------------------------------
    // Open Edit Word Page
    // -------------------------------------------------

    button.addEventListener(
        "click",
        () => {

            if (!word?.id) {

                console.error(
                    "Cannot edit word: word ID is missing.",
                    word
                );

                return;
            }


            const wordId =
                encodeURIComponent(
                    word.id
                );


            window.location.href =
                `admin-edit-word.html?id=${wordId}`;

        }
    );


    return button;

}


    // =================================================
    // Format Status
    // =================================================

    function formatStatus(status) {

        if (
            status === "published"
        ) {

            return "Published";
        }


        if (
            status === "draft"
        ) {

            return "Draft";
        }


        return status || "Unknown";

    }


    // =================================================
    // Render Pagination
    // =================================================

    function renderPagination() {

        paginationControls.innerHTML = "";


        const totalPages =
            Math.ceil(
                totalWords /
                WORDS_PER_PAGE
            );


        if (
            totalPages <= 1
        ) {

            wordPagination.hidden =
                true;

            return;
        }


        wordPagination.hidden =
            false;


        // -----------------------------------------
        // Pagination Information
        // -----------------------------------------

        const start =
            (
                (currentPage - 1) *
                WORDS_PER_PAGE
            ) + 1;


        const end =
            Math.min(
                currentPage *
                WORDS_PER_PAGE,
                totalWords
            );


        paginationInfo.textContent =
            `Showing ${
                start.toLocaleString()
            }–${
                end.toLocaleString()
            } of ${
                totalWords.toLocaleString()
            } words`;


        // -----------------------------------------
        // Previous
        // -----------------------------------------

        const previousButton =
            createPaginationButton(
                "Previous",
                currentPage === 1,
                () => {

                    currentPage--;

                    loadWords();

                }
            );


        paginationControls.appendChild(
            previousButton
        );


        // -----------------------------------------
        // Page Numbers
        // -----------------------------------------

        const pages =
            getVisiblePages(
                currentPage,
                totalPages
            );


        pages.forEach(
            (page) => {

                if (
                    page === "..."
                ) {

                    const ellipsis =
                        document.createElement(
                            "span"
                        );

                    ellipsis.textContent =
                        "…";

                    ellipsis.style.padding =
                        "0 4px";

                    ellipsis.style.color =
                        "#667085";

                    paginationControls.appendChild(
                        ellipsis
                    );

                    return;
                }


                const pageButton =
                    createPaginationButton(
                        String(page),
                        false,
                        () => {

                            if (
                                currentPage ===
                                page
                            ) {
                                return;
                            }


                            currentPage =
                                page;

                            loadWords();

                        }
                    );


                if (
                    currentPage === page
                ) {

                    pageButton.classList.add(
                        "active"
                    );

                    pageButton.setAttribute(
                        "aria-current",
                        "page"
                    );

                }


                paginationControls.appendChild(
                    pageButton
                );

            }
        );


        // -----------------------------------------
        // Next
        // -----------------------------------------

        const nextButton =
            createPaginationButton(
                "Next",
                currentPage === totalPages,
                () => {

                    currentPage++;

                    loadWords();

                }
            );


        paginationControls.appendChild(
            nextButton
        );

    }


    // =================================================
    // Create Pagination Button
    // =================================================

    function createPaginationButton(
        text,
        disabled,
        onClick
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";

        button.className =
            "word-pagination-button";

        button.textContent =
            text;

        button.disabled =
            disabled;


        button.addEventListener(
            "click",
            onClick
        );


        return button;

    }


    // =================================================
    // Visible Pagination Pages
    // =================================================

    function getVisiblePages(
        current,
        total
    ) {

        // Show all pages when there
        // are only a few.

        if (total <= 7) {

            return Array.from(
                {
                    length: total
                },
                (_, index) =>
                    index + 1
            );

        }


        // First pages

        if (current <= 4) {

            return [
                1,
                2,
                3,
                4,
                5,
                "...",
                total
            ];

        }


        // Last pages

        if (
            current >=
            total - 3
        ) {

            return [
                1,
                "...",
                total - 4,
                total - 3,
                total - 2,
                total - 1,
                total
            ];

        }


        // Middle pages

        return [
            1,
            "...",
            current - 1,
            current,
            current + 1,
            "...",
            total
        ];

    }


    // =================================================
    // Loading State
    // =================================================

    function showLoading() {

        wordLoadingState.hidden =
            false;

        wordEmptyState.hidden =
            true;

        wordErrorState.hidden =
            true;

        wordTableBody.innerHTML =
            "";

        wordMobileList.innerHTML =
            "";

        wordPagination.hidden =
            true;

    }


    // =================================================
    // Empty State
    // =================================================

    function showEmpty() {

        wordLoadingState.hidden =
            true;

        wordEmptyState.hidden =
            false;

        wordErrorState.hidden =
            true;

        wordPagination.hidden =
            true;

    }


    function hideEmpty() {

        wordEmptyState.hidden =
            true;

        wordLoadingState.hidden =
            true;

        wordErrorState.hidden =
            true;

    }


    // =================================================
    // Error State
    // =================================================

    function showError(message) {

        wordLoadingState.hidden =
            true;

        wordEmptyState.hidden =
            true;

        wordErrorState.hidden =
            false;

        wordPagination.hidden =
            true;

        wordErrorMessage.textContent =
            message;

    }


    // =================================================
    // Escape LIKE Value
    // =================================================

    function escapeLikeValue(value) {

        return value
            .replace(/\\/g, "\\\\")
            .replace(/%/g, "\\%")
            .replace(/_/g, "\\_");

    }


});


// =====================================================
// Load Supabase Library
// =====================================================

function loadSupabaseLibrary() {

    // Already loaded

    if (window.supabase) {

        return Promise.resolve();

    }


    return new Promise(
        (resolve, reject) => {

            const existingScript =
                document.querySelector(
                    'script[src*="@supabase/supabase-js"]'
                );


            if (existingScript) {

                existingScript.addEventListener(
                    "load",
                    resolve,
                    {
                        once: true
                    }
                );

                existingScript.addEventListener(
                    "error",
                    reject,
                    {
                        once: true
                    }
                );

                return;
            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

            script.async =
                true;


            script.onload =
                () => {

                    if (
                        window.supabase
                    ) {

                        resolve();

                    } else {

                        reject(
                            new Error(
                                "Supabase library loaded without a global client."
                            )
                        );

                    }

                };


            script.onerror =
                () => {

                    reject(
                        new Error(
                            "Could not load Supabase library."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


// =====================================================
// Check Admin Access
// =====================================================

async function checkAdminAccess(
    supabase
) {

    try {

        const {
            data,
            error
        } =
            await supabase.auth.getUser();


        // ---------------------------------------------
        // Authentication Error
        // ---------------------------------------------

        if (error) {

            console.error(
                "Could not verify user:",
                error
            );

            window.location.replace(
                "auth.html"
            );

            return false;

        }


        // ---------------------------------------------
        // No Logged-in User
        // ---------------------------------------------

        const user =
            data?.user;


        if (!user) {

            window.location.replace(
                "auth.html"
            );

            return false;

        }


        // ---------------------------------------------
        // Check Admin Role
        // ---------------------------------------------

        const role =
            user.app_metadata?.role;


        if (
            role !== "admin"
        ) {

            window.location.replace(
                "index.html"
            );

            return false;

        }


        // ---------------------------------------------
        // Admin Confirmed
        // ---------------------------------------------

        return true;

    }


    catch (error) {

        console.error(
            "Admin access check failed:",
            error
        );


        window.location.replace(
            "auth.html"
        );


        return false;

    }

}


// =====================================================
// Admin Dropdown Menu
// =====================================================

function initAdminMenu() {

    const adminMenuButton =
        document.getElementById(
            "adminMenuButton"
        );


    const adminMenu =
        document.getElementById(
            "adminMenu"
        );


    if (
        !adminMenuButton ||
        !adminMenu
    ) {

        return;

    }


    adminMenuButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            const isOpen =
                !adminMenu.hidden;


            adminMenu.hidden =
                isOpen;


            adminMenuButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        }
    );


    document.addEventListener(
        "click",
        (event) => {

            if (
                !adminMenu.contains(
                    event.target
                ) &&
                !adminMenuButton.contains(
                    event.target
                )
            ) {

                adminMenu.hidden =
                    true;


                adminMenuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

}


// =====================================================
// Admin Logout
// =====================================================

function initAdminLogout(
    supabase
) {

    const adminLogoutButton =
        document.getElementById(
            "adminLogoutButton"
        );


    if (
        !adminLogoutButton
    ) {

        return;

    }


    adminLogoutButton.addEventListener(
        "click",
        async () => {

            try {

                adminLogoutButton.disabled =
                    true;


                adminLogoutButton.textContent =
                    "Logging out...";


                const {
                    error
                } =
                    await supabase.auth.signOut();


                if (error) {
                    throw error;
                }


                window.location.replace(
                    "auth.html"
                );

            }


            catch (error) {

                console.error(
                    "Admin logout error:",
                    error
                );


                adminLogoutButton.disabled =
                    false;


                adminLogoutButton.textContent =
                    "Log Out";

            }

        }
    );

}


// =====================================================
// Friendly Error Message
// =====================================================

function getFriendlyErrorMessage(
    error
) {

    if (!error) {

        return (
            "Something went wrong. Please try again."
        );

    }


    const message =
        error.message ||
        String(error);


    if (
        message.includes(
            "row-level security"
        )
    ) {

        return (
            "You do not have permission to view the Word Library."
        );

    }


    if (
        message.includes(
            "Failed to fetch"
        )
    ) {

        return (
            "Could not connect to the database. Please try again."
        );

    }


    return message;

}
