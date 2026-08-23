// =====================================================
// Supabase Configuration
// =====================================================

const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";


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
// Admin Initialization
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

    const wordForm =
        document.getElementById("wordForm");

    const saveWordButton =
        document.getElementById("saveWordButton");

    const formMessage =
        document.getElementById("formMessage");

    const imageInput =
        document.getElementById("image");


    // -------------------------------------------------
    // Check Admin Form
    // -------------------------------------------------

    if (!wordForm) {

        console.error(
            "Admin form #wordForm was not found."
        );

        return;
    }


    // -------------------------------------------------
    // Load Supabase
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
        SUPABASE_PUBLISHABLE_KEY ===
            "YOUR_SUPABASE_PUBLISHABLE_KEY"
    ) {

        showMessage(
            formMessage,
            "Supabase configuration is not set yet.",
            "error"
        );

        console.error(
            "Add the Supabase URL and Publishable/anon key to admin.js."
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
            "Set STORAGE_BUCKET in admin.js to your Supabase Storage bucket name."
        );

        return;
    }


    // -------------------------------------------------
    // Create Supabase Client
    // -------------------------------------------------

    const supabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    // Temporary reference for testing
    window.supabaseClient = supabase;
    
// =================================================
// Admin Access Guard
// =================================================

const isAdmin =
    await checkAdminAccess(supabase);

if (!isAdmin) {
    return;
}

    // =================================================
    // Image Selection
    // =================================================

    imageInput?.addEventListener(
        "change",
        () => {

            clearMessage(formMessage);

            const file =
                imageInput.files?.[0];


            if (!file) {
                return;
            }


            const validation =
                validateImage(file);


            if (!validation.valid) {

                showMessage(
                    formMessage,
                    validation.message,
                    "error"
                );

                imageInput.value = "";

                return;
            }


            showMessage(
                formMessage,
                `Image selected: ${file.name}`,
                "success"
            );
        }
    );


    // =================================================
    // Save Word
    // =================================================

    wordForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            clearMessage(formMessage);


            setButtonLoading(
                saveWordButton,
                true,
                "Saving..."
            );


            let imageUrl = null;


            try {

                // ---------------------------------------
                // Get Form Values
                // ---------------------------------------

                const word =
                    getValue("word");

                const level =
    getValue("level");

const partOfSpeech =
    getValue("part_of_speech");

const pronunciation =
    getValue("pronunciation");

                const meaning =
                    getValue("meaning");

                const example =
                    getValue("example");

                const status =
                    getValue("status");

                const imageFile =
                    imageInput?.files?.[0] || null;


                // ---------------------------------------
                // Validate Word
                // ---------------------------------------

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


                // ---------------------------------------
                // Validate Image
                // ---------------------------------------

                const imageValidation =
                    validateImage(imageFile);


                if (!imageValidation.valid) {

                    throw new Error(
                        imageValidation.message
                    );
                }


                // ---------------------------------------
                // Upload Image
                // ---------------------------------------

                imageUrl =
                    await uploadWordImage(
                        supabase,
                        imageFile,
                        word
                    );


                // ---------------------------------------
                // Prepare Database Record
                // ---------------------------------------

                const wordRecord = {

    word,

    level,

    part_of_speech:
        partOfSpeech,

    pronunciation:
        pronunciation || null,

                    meaning:
                        meaning || null,

                    example:
                        example || null,

                    [IMAGE_URL_COLUMN]:
                        imageUrl,

                    status
                };


                // ---------------------------------------
                // Insert Word
                // ---------------------------------------

                const { error } =
                    await supabase
                        .from(WORDS_TABLE)
                        .insert(wordRecord);


                // ---------------------------------------
                // Handle Database Error
                // ---------------------------------------

                if (error) {

                    // Remove uploaded image
                    // if database insert failed.

                    if (imageUrl) {

                        await removeUploadedImage(
                            supabase,
                            imageUrl
                        );
                    }


                    throw error;
                }


                // ---------------------------------------
                // Success
                // ---------------------------------------

                showMessage(
                    formMessage,
                    "Word saved successfully.",
                    "success"
                );


                // Reset form

                wordForm.reset();

            }


            catch (error) {

                console.error(
                    "Save word error:",
                    error
                );


                showMessage(
                    formMessage,
                    getFriendlyErrorMessage(error),
                    "error"
                );

            }


            finally {

                setButtonLoading(
                    saveWordButton,
                    false,
                    "Save Word"
                );
            }
        }
    );
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
// Get Form Value
// =====================================================

function getValue(id) {

    return (
        document
            .getElementById(id)
            ?.value
            .trim() || ""
    );
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

    // Word

    if (!word) {

        return {

            valid: false,

            message:
                "Please enter a word."
        };
    }


    // Level

    if (!level) {

        return {

            valid: false,

            message:
                "Please select a level."
        };
    }
    
if (!partOfSpeech) {
    return {
        valid: false,
        message: "Please select a part of speech."
    };
}

    // Status

    if (!status) {

        return {

            valid: false,

            message:
                "Please select a status."
        };
    }


    // Image

    if (!imageFile) {

        return {

            valid: false,

            message:
                "Please select an image."
        };
    }


    // Approved English Levels

    const allowedLevels = [

        "A1",

        "A2",

        "B1",

        "B2",

        "C1"

    ];


    if (
        !allowedLevels.includes(level)
    ) {

        return {

            valid: false,

            message:
                "Invalid English level."
        };
    }


    // Approved Statuses

    const allowedStatuses = [

        "draft",

        "published"

    ];


    if (
        !allowedStatuses.includes(status)
    ) {

        return {

            valid: false,

            message:
                "Invalid word status."
        };
    }


    return {

        valid: true
    };
}


// =====================================================
// Validate Image
// =====================================================

function validateImage(file) {

    if (!file) {

        return {

            valid: false,

            message:
                "Please select an image."
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
        file.size > MAX_IMAGE_SIZE
    ) {

        return {

            valid: false,

            message:
                "Image size must be 5 MB or less."
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
    } = await supabase
        .storage
        .from(STORAGE_BUCKET)
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


    const { data } =
        supabase
            .storage
            .from(STORAGE_BUCKET)
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

        const marker =
            `/storage/v1/object/public/${STORAGE_BUCKET}/`;


        const markerIndex =
            imageUrl.indexOf(
                marker
            );


        if (
            markerIndex === -1
        ) {

            return;
        }


        const filePath =
            decodeURIComponent(
                imageUrl.substring(
                    markerIndex +
                    marker.length
                )
            );


        await supabase
            .storage
            .from(STORAGE_BUCKET)
            .remove([
                filePath
            ]);

    }


    catch (error) {

        console.warn(
            "Could not remove uploaded image:",
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

        return (
            window.crypto.randomUUID()
        );
    }


    return (
        `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`
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

        button.disabled = true;


        button.dataset.originalText =
            button.textContent.trim();


        button.textContent =
            text;

    }

    else {

        button.disabled = false;


        button.textContent =
            button.dataset.originalText ||
            text;


        delete button.dataset.originalText;
    }
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


    element.hidden = false;


    element.textContent =
        message;


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


    element.hidden = true;


    element.textContent =
        "";


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


    if (
        message.includes(
            "row-level security"
        )
    ) {

         return (
            "You do not have permission to add words."
        );
    }


    if (
        message.includes(
            "duplicate"
        )
    ) {

        return (
            "This word already exists."
        );
    }


    if (
        message.includes(
            "Bucket not found"
        )
    ) {

        return (
            "The word image Storage bucket was not found."
        );
    }


    return message;
}

// =====================================================
// Check Admin Access
// =====================================================

async function checkAdminAccess(supabase) {

    try {

        const {
            data,
            error
        } = await supabase.auth.getUser();


        // ---------------------------------------------
        // Authentication error
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


        const user =
            data?.user;


        // ---------------------------------------------
        // No logged-in user
        // ---------------------------------------------

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


        if (role !== "admin") {

            window.location.replace(
                "index.html"
            );

            return false;
        }


        // ---------------------------------------------
        // Admin confirmed
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
