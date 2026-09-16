// =====================================================
// English Learning - Admin Edit Word v1
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

const IMAGE_URL_COLUMN = "image_url";


// =====================================================
// Page Initialization
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // -------------------------------------------------
        // Get Elements
        // -------------------------------------------------

        const editWordForm =
            document.getElementById(
                "editWordForm"
            );

        const formMessage =
            document.getElementById(
                "formMessage"
            );

        const imageInput =
            document.getElementById(
                "image"
            );

        const currentImage =
            document.getElementById(
                "currentImage"
            );

        const currentImageContainer =
            document.getElementById(
                "currentImageContainer"
            );

        const noCurrentImage =
            document.getElementById(
                "noCurrentImage"
            );


        // -------------------------------------------------
        // Check Form
        // -------------------------------------------------

        if (!editWordForm) {

            console.error(
                "Edit word form #editWordForm was not found."
            );

            return;
        }


        // -------------------------------------------------
        // Disable Form While Loading
        // -------------------------------------------------

        setFormDisabled(
            editWordForm,
            true
        );


        showMessage(
            formMessage,
            "Loading word...",
            "info"
        );


        // -------------------------------------------------
        // Load Supabase Library
        // -------------------------------------------------

        try {

            await loadSupabaseLibrary();

        } catch (error) {

            console.error(
                "Supabase library loading error:",
                error
            );

            showMessage(
                formMessage,
                "Supabase could not be loaded. Please try again later.",
                "error"
            );

            return;
        }


        // -------------------------------------------------
        // Check Supabase Configuration
        // -------------------------------------------------

        if (
            SUPABASE_URL === "YOUR_SUPABASE_URL" ||
            SUPABASE_KEY ===
                "YOUR_SUPABASE_PUBLISHABLE_KEY"
        ) {

            showMessage(
                formMessage,
                "Supabase configuration is not set yet.",
                "error"
            );

            console.error(
                "Add the Supabase URL and Publishable/anon key to admin-edit-word.js."
            );

            return;
        }


        // -------------------------------------------------
        // Create Supabase Client
        // -------------------------------------------------

        const supabase =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        // Temporary shared reference
        window.supabaseClient =
            supabase;


        // -------------------------------------------------
        // Check Admin Access
        // -------------------------------------------------

        const isAdmin =
            await checkAdminAccess(
                supabase
            );


        if (!isAdmin) {
            return;
        }


        // -------------------------------------------------
        // Initialize Admin Menu
        // -------------------------------------------------

        initAdminMenu();


        // -------------------------------------------------
        // Initialize Admin Logout
        // -------------------------------------------------

        initAdminLogout(
            supabase
        );


        // -------------------------------------------------
        // Get Word ID From URL
        // -------------------------------------------------

        const wordId =
            getWordIdFromUrl();


        if (!wordId) {

            showMessage(
                formMessage,
                "No word was selected.",
                "error"
            );

            setFormDisabled(
                editWordForm,
                true
            );

            return;
        }


        // -------------------------------------------------
        // Load Word
        // -------------------------------------------------

        try {

            const word =
                await loadWord(
                    supabase,
                    wordId
                );


            if (!word) {

                showMessage(
                    formMessage,
                    "The selected word could not be found.",
                    "error"
                );

                setFormDisabled(
                    editWordForm,
                    true
                );

                return;
            }


            // ---------------------------------------------
            // Fill Form
            // ---------------------------------------------

            fillWordForm(
                word
            );


            // ---------------------------------------------
            // Display Current Image
            // ---------------------------------------------

            displayCurrentImage(
                word[IMAGE_URL_COLUMN],
                currentImageContainer,
                currentImage,
                noCurrentImage
            );


            // ---------------------------------------------
            // Enable Form
            // ---------------------------------------------

            setFormDisabled(
                editWordForm,
                false
            );


            // ---------------------------------------------
            // Clear Loading Message
            // ---------------------------------------------

            clearMessage(
                formMessage
            );


        } catch (error) {

            console.error(
                "Load word error:",
                error
            );


            showMessage(
                formMessage,
                getFriendlyErrorMessage(
                    error
                ),
                "error"
            );


            setFormDisabled(
                editWordForm,
                true
            );
        }


        // -------------------------------------------------
        // Image Selection
        // -------------------------------------------------

        imageInput?.addEventListener(
            "change",
            () => {

                const file =
                    imageInput.files?.[0];


                if (!file) {
                    return;
                }


                showMessage(
                    formMessage,
                    `New image selected: ${file.name}`,
                    "info"
                );

            }
        );


        // -------------------------------------------------
        // Prevent Save In v1
        // -------------------------------------------------

        editWordForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();


                showMessage(
                    formMessage,
                    "Save Changes will be enabled in the next version.",
                    "info"
                );

            }
        );

    }
);


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
                    () => {

                        if (window.supabase) {

                            resolve();

                        } else {

                            reject(
                                new Error(
                                    "Supabase library loaded without a global client."
                                )
                            );

                        }

                    },
                    { once: true }
                );


                existingScript.addEventListener(
                    "error",
                    reject,
                    { once: true }
                );


                return;
            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

            script.async = true;


            script.onload = () => {

                if (window.supabase) {

                    resolve();

                } else {

                    reject(
                        new Error(
                            "Supabase library loaded without a global client."
                        )
                    );

                }

            };


            script.onerror = () => {

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
// Get Word ID From URL
// =====================================================

function getWordIdFromUrl() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const wordId =
        params.get("id");


    if (!wordId) {

        return null;
    }


    return wordId.trim() || null;
}


// =====================================================
// Load Word From Supabase
// =====================================================

async function loadWord(
    supabase,
    wordId
) {

    const {
        data,
        error
    } = await supabase
        .from(WORDS_TABLE)
        .select(
            `
            id,
            word,
            level,
            part_of_speech,
            pronunciation,
            meaning,
            example,
            ${IMAGE_URL_COLUMN},
            status
            `
        )
        .eq(
            "id",
            wordId
        )
        .maybeSingle();


    if (error) {

        throw error;
    }


    return data;
}


// =====================================================
// Fill Edit Word Form
// =====================================================

function fillWordForm(
    word
) {

    const wordInput =
        document.getElementById(
            "word"
        );

    const levelInput =
        document.getElementById(
            "level"
        );

    const partOfSpeechInput =
        document.getElementById(
            "part_of_speech"
        );

    const pronunciationInput =
        document.getElementById(
            "pronunciation"
        );

    const meaningInput =
        document.getElementById(
            "meaning"
        );

    const exampleInput =
        document.getElementById(
            "example"
        );

    const statusInput =
        document.getElementById(
            "status"
        );


    // -------------------------------------------------
    // Word
    // -------------------------------------------------

    if (wordInput) {

        wordInput.value =
            word.word || "";
    }


    // -------------------------------------------------
    // Level
    // -------------------------------------------------

    if (levelInput) {

        levelInput.value =
            word.level || "";
    }


    // -------------------------------------------------
    // Part of Speech
    // -------------------------------------------------

    if (partOfSpeechInput) {

        setSelectValue(
            partOfSpeechInput,
            word.part_of_speech
        );
    }


    // -------------------------------------------------
    // Pronunciation
    // -------------------------------------------------

    if (pronunciationInput) {

        pronunciationInput.value =
            word.pronunciation || "";
    }


    // -------------------------------------------------
    // Meaning
    // -------------------------------------------------

    if (meaningInput) {

        meaningInput.value =
            word.meaning || "";
    }


    // -------------------------------------------------
    // Example
    // -------------------------------------------------

    if (exampleInput) {

        exampleInput.value =
            word.example || "";
    }


    // -------------------------------------------------
    // Status
    // -------------------------------------------------

    if (statusInput) {

        statusInput.value =
            word.status || "draft";
    }
}


// =====================================================
// Set Select Value
// =====================================================

function setSelectValue(
    select,
    value
) {

    if (!select) {
        return;
    }


    const normalizedValue =
        value || "";


    // -------------------------------------------------
    // Existing Option
    // -------------------------------------------------

    const optionExists =
        Array.from(
            select.options
        ).some(
            option =>
                option.value ===
                normalizedValue
        );


    if (
        normalizedValue &&
        !optionExists
    ) {

        // ---------------------------------------------
        // Preserve Existing Database Value
        // ---------------------------------------------

        const option =
            document.createElement(
                "option"
            );


        option.value =
            normalizedValue;


        option.textContent =
            normalizedValue;


        select.appendChild(
            option
        );
    }


    select.value =
        normalizedValue;
}


// =====================================================
// Display Current Image
// =====================================================

function displayCurrentImage(
    imageUrl,
    container,
    image,
    noImageMessage
) {

    if (
        !container ||
        !image ||
        !noImageMessage
    ) {

        return;
    }


    // -------------------------------------------------
    // Reset
    // -------------------------------------------------

    container.hidden =
        true;

    image.hidden =
        true;

    noImageMessage.hidden =
        true;

    image.removeAttribute(
        "src"
    );


    // -------------------------------------------------
    // No Image
    // -------------------------------------------------

    if (
        !imageUrl ||
        !imageUrl.trim()
    ) {

        container.hidden =
            false;

        noImageMessage.hidden =
            false;

        return;
    }


    // -------------------------------------------------
    // Image Exists
    // -------------------------------------------------

    image.onload = () => {

        image.hidden =
            false;

        noImageMessage.hidden =
            true;

        container.hidden =
            false;
    };


    image.onerror = () => {

        image.hidden =
            true;

        noImageMessage.hidden =
            false;

        container.hidden =
            false;
    };


    image.src =
        imageUrl.trim();
}


// =====================================================
// Set Form Disabled State
// =====================================================

function setFormDisabled(
    form,
    disabled
) {

    if (!form) {
        return;
    }


    const controls =
        form.querySelectorAll(
            "input, select, textarea, button"
        );


    controls.forEach(
        control => {

            control.disabled =
                disabled;

        }
    );
}


// =====================================================
// Admin Access Guard
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


        // -------------------------------------------------
        // Authentication Error
        // -------------------------------------------------

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


        // -------------------------------------------------
        // No Logged-in User
        // -------------------------------------------------

        const user =
            data?.user;


        if (!user) {

            window.location.replace(
                "auth.html"
            );


            return false;
        }


        // -------------------------------------------------
        // Check Admin Role
        // -------------------------------------------------

        const role =
            user.app_metadata?.role;


        if (role !== "admin") {

            window.location.replace(
                "index.html"
            );


            return false;
        }


        // -------------------------------------------------
        // Admin Confirmed
        // -------------------------------------------------

        return true;


    } catch (error) {

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


    // -------------------------------------------------
    // Open / Close Menu
    // -------------------------------------------------

    adminMenuButton.addEventListener(
        "click",
        event => {

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


    // -------------------------------------------------
    // Close Menu Outside
    // -------------------------------------------------

    document.addEventListener(
        "click",
        event => {

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


    if (!adminLogoutButton) {

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


            } catch (error) {

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
// Show Message
// =====================================================

function showMessage(
    element,
    message,
    type
) {

    if (!element) {
        return;
    }


    element.hidden =
        false;


    element.textContent =
        message;


    element.classList.remove(
        "success",
        "error",
        "info"
    );


    if (
        type === "success" ||
        type === "error" ||
        type === "info"
    ) {

        element.classList.add(
            type
        );
    }


    element.dataset.type =
        type;


    element.setAttribute(
        "role",
        "status"
    );
}


// =====================================================
// Clear Message
// =====================================================

function clearMessage(
    element
) {

    if (!element) {
        return;
    }


    element.hidden =
        true;


    element.textContent =
        "";


    element.classList.remove(
        "success",
        "error",
        "info"
    );


    element.removeAttribute(
        "role"
    );


    delete element.dataset.type;
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


    // -------------------------------------------------
    // RLS
    // -------------------------------------------------

    if (
        message.toLowerCase()
            .includes(
                "row-level security"
            )
    ) {

        return (
            "You do not have permission to access this word."
        );
    }


    // -------------------------------------------------
    // Invalid UUID
    // -------------------------------------------------

    if (
        message.toLowerCase()
            .includes(
                "invalid input syntax for type uuid"
            )
    ) {

        return (
            "The selected word ID is invalid."
        );
    }


    // -------------------------------------------------
    // Generic
    // -------------------------------------------------

    return message;
}
