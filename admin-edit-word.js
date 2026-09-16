// =====================================================
// English Learning - Admin Edit Word v2
// =====================================================


// =====================================================
// Supabase Configuration
// =====================================================

const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
const SUPABASE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";


// =====================================================
// Database / Storage Configuration
// =====================================================

const WORDS_TABLE = "words";

const IMAGE_URL_COLUMN = "image_url";

const STORAGE_BUCKET = "word-images";


// =====================================================
// Image Configuration
// =====================================================

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];


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

        const saveChangesButton =
            document.getElementById(
                "saveChangesButton"
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
        // Check Storage Configuration
        // -------------------------------------------------

        if (
            STORAGE_BUCKET ===
            "YOUR_WORD_IMAGES_BUCKET"
        ) {

            showMessage(
                formMessage,
                "Word image storage is not configured yet.",
                "error"
            );

            console.error(
                "Set STORAGE_BUCKET in admin-edit-word.js."
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


        // =================================================
        // Load Word
        // =================================================

        let originalWord = null;

        try {

            originalWord =
                await loadWord(
                    supabase,
                    wordId
                );


            if (!originalWord) {

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
                originalWord
            );


            // ---------------------------------------------
            // Display Current Image
            // ---------------------------------------------

            displayCurrentImage(
                originalWord[IMAGE_URL_COLUMN],
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

            return;
        }


        // =================================================
        // Image Selection
        // =================================================

        imageInput?.addEventListener(
            "change",
            () => {

                clearMessage(
                    formMessage
                );


                const file =
                    imageInput.files?.[0];


                if (!file) {
                    return;
                }


                const validation =
                    validateImage(
                        file
                    );


                if (!validation.valid) {

                    showMessage(
                        formMessage,
                        validation.message,
                        "error"
                    );

                    imageInput.value =
                        "";

                    return;
                }


                showMessage(
                    formMessage,
                    `New image selected: ${file.name}`,
                    "info"
                );

            }
        );


        // =================================================
        // Save Changes
        // =================================================

        editWordForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                clearMessage(
                    formMessage
                );


                setButtonLoading(
                    saveChangesButton,
                    true,
                    "Saving..."
                );


                let newImageUrl =
                    null;


                let newImageUploaded =
                    false;


                try {

                    // -------------------------------------
                    // Get Form Values
                    // -------------------------------------

                    const word =
                        getValue(
                            "word"
                        );


                    const level =
                        getValue(
                            "level"
                        );


                    const partOfSpeech =
                        getValue(
                            "part_of_speech"
                        );


                    const pronunciation =
                        getValue(
                            "pronunciation"
                        );


                    const meaning =
                        getValue(
                            "meaning"
                        );


                    const example =
                        getValue(
                            "example"
                        );


                    const status =
                        getValue(
                            "status"
                        );


                    const imageFile =
                        imageInput?.files?.[0] ||
                        null;


                    // -------------------------------------
                    // Validate Form
                    // -------------------------------------

                    const validation =
                        validateWord({
                            word,
                            level,
                            partOfSpeech,
                            pronunciation,
                            meaning,
                            example,
                            status,
                            imageFile
                        });


                    if (!validation.valid) {

                        throw new Error(
                            validation.message
                        );
                    }


                    // -------------------------------------
                    // Validate New Image
                    // -------------------------------------

                    if (imageFile) {

                        const imageValidation =
                            validateImage(
                                imageFile
                            );


                        if (
                            !imageValidation.valid
                        ) {

                            throw new Error(
                                imageValidation.message
                            );
                        }

                    }


                    // -------------------------------------
                    // Check Duplicate Word
                    // -------------------------------------

                    const {
                        data: duplicateWords,
                        error: duplicateError
                    } =
                        await supabase
                            .from(WORDS_TABLE)
                            .select("id")
                            .ilike(
                                "word",
                                word
                            )
                            .neq(
                                "id",
                                wordId
                            )
                            .limit(1);


                    if (duplicateError) {
                        throw duplicateError;
                    }


                    if (
                        duplicateWords &&
                        duplicateWords.length > 0
                    ) {

                        throw new Error(
                            "This word already exists in the Word Library."
                        );
                    }


                    // -------------------------------------
                    // Upload New Image
                    // -------------------------------------

                    if (imageFile) {

                        newImageUrl =
                            await uploadWordImage(
                                supabase,
                                imageFile,
                                word
                            );


                        newImageUploaded =
                            true;
                    }


                    // -------------------------------------
                    // Prepare Update
                    // -------------------------------------

                    const wordRecord = {

                        word:
                            word,

                        level:
                            level,

                        part_of_speech:
                            partOfSpeech,

                        pronunciation:
                            pronunciation ||
                            null,

                        meaning:
                            meaning ||
                            null,

                        example:
                            example ||
                            null,

                        status:
                            status,

                        updated_at:
                            new Date().toISOString()

                    };


                    // -------------------------------------
                    // Image Update
                    // -------------------------------------

                    if (imageFile) {

                        wordRecord[
                            IMAGE_URL_COLUMN
                        ] =
                            newImageUrl;

                    }


                    // -------------------------------------
                    // Update Word
                    // -------------------------------------

                    const {
                        error: updateError
                    } =
                        await supabase
                            .from(WORDS_TABLE)
                            .update(
                                wordRecord
                            )
                            .eq(
                                "id",
                                wordId
                            );


                    if (updateError) {

                        throw updateError;
                    }


                    // -------------------------------------
                    // Remove Old Image
                    // -------------------------------------

                    if (
                        imageFile &&
                        originalWord[
                            IMAGE_URL_COLUMN
                        ]
                    ) {

                        await removeUploadedImage(
                            supabase,
                            originalWord[
                                IMAGE_URL_COLUMN
                            ]
                        );

                    }


                    // -------------------------------------
                    // Success
                    // -------------------------------------

                    showMessage(
                        formMessage,
                        "Word updated successfully.",
                        "success"
                    );


                    // -------------------------------------
                    // Redirect
                    // -------------------------------------

                    setTimeout(
                        () => {

                            window.location.replace(
                                "admin-words.html"
                            );

                        },
                        700
                    );

                }


                catch (error) {

                    console.error(
                        "Save changes error:",
                        error
                    );


                    // -------------------------------------
                    // Remove New Image If Update Failed
                    // -------------------------------------

                    if (
                        newImageUploaded &&
                        newImageUrl
                    ) {

                        await removeUploadedImage(
                            supabase,
                            newImageUrl
                        );

                    }


                    showMessage(
                        formMessage,
                        getFriendlyErrorMessage(
                            error
                        ),
                        "error"
                    );

                }


                finally {

                    setButtonLoading(
                        saveChangesButton,
                        false,
                        "Save Changes"
                    );

                }

            }
        );

    }
);


// =====================================================
// Load Supabase Library
// =====================================================

function loadSupabaseLibrary() {

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


    return (
        wordId.trim() ||
        null
    );
}


// =====================================================
// Load Word
// =====================================================

async function loadWord(
    supabase,
    wordId
) {

    const {
        data,
        error
    } =
        await supabase
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
            word.status ||
            "draft";
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

    image.onload =
        () => {

            image.hidden =
                false;


            noImageMessage.hidden =
                true;


            container.hidden =
                false;

        };


    image.onerror =
        () => {

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
// Validate Word
// =====================================================

function validateWord({
    word,
    level,
    partOfSpeech,
    pronunciation,
    meaning,
    example,
    status,
    imageFile
}) {

    // -------------------------------------------------
    // Word
    // -------------------------------------------------

    if (!word) {

        return {

            valid: false,

            message:
                "Please enter a word."

        };
    }


    // -------------------------------------------------
    // Level
    // -------------------------------------------------

    const allowedLevels = [

        "A1",
        "A2",
        "B1",
        "B2",
        "C1"

    ];


    if (!allowedLevels.includes(level)) {

        return {

            valid: false,

            message:
                "Invalid English level."

        };
    }


    // -------------------------------------------------
    // Part of Speech
    // -------------------------------------------------

    if (!partOfSpeech) {

        return {

            valid: false,

            message:
                "Please select a part of speech."

        };
    }


    // -------------------------------------------------
    // Status
    // -------------------------------------------------

    const allowedStatuses = [

        "draft",
        "published"

    ];


    if (!allowedStatuses.includes(status)) {

        return {

            valid: false,

            message:
                "Invalid word status."

        };
    }


    // -------------------------------------------------
    // Image
    // -------------------------------------------------

    if (imageFile) {

        const imageValidation =
            validateImage(
                imageFile
            );


        if (
            !imageValidation.valid
        ) {

            return imageValidation;

        }

    }


    return {

        valid: true

    };

}


// =====================================================
// Validate Image
// =====================================================

function validateImage(
    file
) {

    if (!file) {

        return {

            valid: false,

            message:
                "Please select a valid image."

        };
    }


    if (
        !ALLOWED_IMAGE_TYPES.includes(
            file.type
        )
    ) {

        return {

            valid: false,

            message:
                "Please select a JPG, PNG, WEBP, or GIF image."

        };
    }


    if (
        file.size >
        MAX_IMAGE_SIZE
    ) {

        return {

            valid: false,

            message:
                "Image size must be 2 MB or less."

        };
    }


    return {

        valid: true

    };

}


// =====================================================
// Upload Word Image
// =====================================================

async function uploadWordImage(
    supabase,
    file,
    word
) {

    const extension =
        getFileExtension(
            file.name
        );


    const safeWord =
        createSafeFileName(
            word
        );


    const uniqueId =
        createUniqueId();


    const filePath =
        `words/${safeWord}-${uniqueId}.${extension}`;


    const {
        error: uploadError
    } =
        await supabase
            .storage
            .from(
                STORAGE_BUCKET
            )
            .upload(
                filePath,
                file,
                {

                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        file.type

                }
            );


    if (uploadError) {

        throw uploadError;
    }


    const {
        data
    } =
        supabase
            .storage
            .from(
                STORAGE_BUCKET
            )
            .getPublicUrl(
                filePath
            );


    if (
        !data?.publicUrl
    ) {

        throw new Error(
            "The image was uploaded, but no public image URL was returned."
        );
    }


    return data.publicUrl;

}


// =====================================================
// Remove Uploaded Image
// =====================================================

async function removeUploadedImage(
    supabase,
    imageUrl
) {

    try {

        if (
            !imageUrl ||
            !imageUrl.trim()
        ) {

            return;
        }


        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;


        const markerIndex =
            imageUrl.indexOf(
                marker
            );


        if (
            markerIndex === -1
        ) {

            console.warn(
                "Image URL does not belong to the configured Storage bucket."
            );

            return;
        }


        const filePath =
            decodeURIComponent(
                imageUrl.substring(
                    markerIndex +
                    marker.length
                )
            );


        if (!filePath) {

            return;
        }


        const {
            error
        } =
            await supabase
                .storage
                .from(
                    STORAGE_BUCKET
                )
                .remove([
                    filePath
                ]);


        if (error) {

            console.warn(
                "Could not remove image:",
                error
            );

        }

    }


    catch (error) {

        console.warn(
            "Could not remove image:",
            error
        );

    }

}


// =====================================================
// Get File Extension
// =====================================================

function getFileExtension(
    fileName
) {

    const parts =
        fileName.split(".");


    const extension =
        parts.length > 1
            ? parts.pop()
            : "jpg";


    return extension
        .toLowerCase()
        .replace(
            /[^a-z0-9]/g,
            ""
        ) || "jpg";

}


// =====================================================
// Create Safe File Name
// =====================================================

function createSafeFileName(
    value
) {

    return value
        .toLowerCase()
        .trim()
        .replace(
            /\s+/g,
            "-"
        )
        .replace(
            /[^a-z0-9-]/g,
            ""
        )
        .replace(
            /-+/g,
            "-"
        )
        .replace(
            /^-|-$/g,
            ""
        ) || "word";

}


// =====================================================
// Create Unique ID
// =====================================================

function createUniqueId() {

    if (
        window.crypto?.randomUUID
    ) {

        return window.crypto.randomUUID();

    }


    return (
        `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`
    );

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
// Button Loading State
// =====================================================

function setButtonLoading(
    button,
    loading,
    text
) {

    if (!button) {
        return;
    }


    if (loading) {

        button.disabled =
            true;


        button.dataset.originalText =
            button.textContent.trim();


        button.textContent =
            text;

    } else {

        button.disabled =
            false;


        button.textContent =
            button.dataset.originalText ||
            text;


        delete button.dataset.originalText;

    }

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


        const user =
            data?.user;


        if (!user) {

            window.location.replace(
                "auth.html"
            );


            return false;
        }


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


    const lowerMessage =
        message.toLowerCase();


    // -------------------------------------------------
    // RLS
    // -------------------------------------------------

    if (
        lowerMessage.includes(
            "row-level security"
        )
    ) {

        return (
            "You do not have permission to update this word."
        );

    }


    // -------------------------------------------------
    // Duplicate
    // -------------------------------------------------

    if (
        lowerMessage.includes(
            "duplicate"
        ) ||
        lowerMessage.includes(
            "already exists"
        )
    ) {

        return (
            "This word already exists in the Word Library."
        );

    }


    // -------------------------------------------------
    // Invalid UUID
    // -------------------------------------------------

    if (
        lowerMessage.includes(
            "invalid input syntax for type uuid"
        )
    ) {

        return (
            "The selected word ID is invalid."
        );

    }


    // -------------------------------------------------
    // Storage Bucket
    // -------------------------------------------------

    if (
        lowerMessage.includes(
            "bucket not found"
        )
    ) {

        return (
            "The word image Storage bucket was not found."
        );

    }


    // -------------------------------------------------
    // Storage Permission
    // -------------------------------------------------

    if (
        lowerMessage.includes(
            "new row violates row-level security policy"
        )
    ) {

        return (
            "You do not have permission to upload the word image."
        );

    }


    // -------------------------------------------------
    // Network
    // -------------------------------------------------

    if (
        lowerMessage.includes(
            "failed to fetch"
        )
    ) {

        return (
            "Could not connect to the database. Please try again."
        );

    }


    // -------------------------------------------------
    // Generic
    // -------------------------------------------------

    return message;

}
