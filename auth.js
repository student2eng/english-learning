// =====================================================
// English Learning - Supabase Auth
// =====================================================

// Supabase configuration
const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
const SUPABASE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";

// Create Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Temporary connection test
console.log("Supabase client:", supabaseClient);


// =====================================================
// DOM Ready
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    // -------------------------------------------------
    // Forms
    // -------------------------------------------------

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    const loginSubmit = document.getElementById("login-submit");
    const signupSubmit = document.getElementById("signup-submit");


    // -------------------------------------------------
    // Messages
    // -------------------------------------------------

    const loginMessage = document.getElementById("login-message");
    const signupMessage = document.getElementById("signup-message");


    // -------------------------------------------------
    // Signup fields
    // -------------------------------------------------

    const selectedLevel = document.getElementById("selected-level");

    const levelOptions = document.querySelectorAll(
        "[data-level]"
    );


    // =================================================
    // Level Selection
    // =================================================

    levelOptions.forEach((option) => {

        option.addEventListener("click", () => {

            const level = option.dataset.level;

            if (selectedLevel) {
                selectedLevel.value = level;
            }

            // Remove selected state
            levelOptions.forEach((item) => {
                item.classList.remove("selected");
            });

            // Add selected state
            option.classList.add("selected");

        });

    });


    // =================================================
    // Login
    // =================================================

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            clearMessage(loginMessage);

            const emailInput =
                loginForm.querySelector('input[type="email"]');

            const passwordInput =
                loginForm.querySelector('input[type="password"]');


            const email = emailInput
                ? emailInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";


            if (!email || !password) {

                showMessage(
                    loginMessage,
                    "Please enter your email and password.",
                    "error"
                );

                return;
            }


            // Disable button
            if (loginSubmit) {
                loginSubmit.disabled = true;
                loginSubmit.textContent = "Signing in...";
            }


            try {

                const { data, error } =
                    await supabaseClient.auth.signInWithPassword({
                        email: email,
                        password: password
                    });


                if (error) {
                    throw error;
                }


                console.log("Login successful:", data);


                showMessage(
                    loginMessage,
                    "Login successful.",
                    "success"
                );


                // Temporary redirect
                // We will connect Dashboard properly later.
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 800);


            } catch (error) {

                console.error("Login error:", error);


                showMessage(
                    loginMessage,
                    getAuthErrorMessage(error),
                    "error"
                );

            } finally {

                if (loginSubmit) {
                    loginSubmit.disabled = false;
                    loginSubmit.textContent = "Sign In";
                }

            }

        });

    }


    // =================================================
    // Signup
    // =================================================

    if (signupForm) {

        signupForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            clearMessage(signupMessage);


            // Find fields
            const nameInput =
                signupForm.querySelector(
                    'input[name="display_name"], input[name="name"], input[type="text"]'
                );

            const emailInput =
                signupForm.querySelector(
                    'input[type="email"]'
                );

            const passwordInput =
                signupForm.querySelector(
                    'input[type="password"]'
                );


            const displayName = nameInput
                ? nameInput.value.trim()
                : "";

            const email = emailInput
                ? emailInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";

            const level =
                selectedLevel
                    ? selectedLevel.value
                    : "";


            // -------------------------------------------------
            // Validation
            // -------------------------------------------------

            if (!displayName) {

                showMessage(
                    signupMessage,
                    "Please enter your name.",
                    "error"
                );

                return;
            }


            if (!email) {

                showMessage(
                    signupMessage,
                    "Please enter your email address.",
                    "error"
                );

                return;
            }


            if (!password) {

                showMessage(
                    signupMessage,
                    "Please enter a password.",
                    "error"
                );

                return;
            }


            if (!level) {

                showMessage(
                    signupMessage,
                    "Please choose your English level.",
                    "error"
                );

                return;
            }


            // -------------------------------------------------
            // Disable button
            // -------------------------------------------------

            if (signupSubmit) {
                signupSubmit.disabled = true;
                signupSubmit.textContent = "Creating account...";
            }


            try {

                // -------------------------------------------------
                // Create Supabase Auth account
                // -------------------------------------------------

                const { data, error } =
                    await supabaseClient.auth.signUp({

                        email: email,

                        password: password,

                        options: {
                            data: {
                                display_name: displayName,
                                level: level
                            }
                        }

                    });


                if (error) {
                    throw error;
                }


                console.log(
                    "Signup successful:",
                    data
                );


                // -------------------------------------------------
                // Email confirmation
                // -------------------------------------------------

                if (
    data.user &&
    !data.session
) {
    showMessage(
        signupMessage,
        "Account created. Please check your email to confirm your account.",
        "success"
    );

    // Clear signup form
    signupForm.reset();

    // Clear selected level
    if (selectedLevel) {
        selectedLevel.value = "";
    }

    levelOptions.forEach((item) => {
        item.classList.remove("selected");
    });

    return;
                }


                // -------------------------------------------------
                // Account created and session available
                // -------------------------------------------------

                showMessage(
                    signupMessage,
                    "Account created successfully.",
                    "success"
                );


                // Temporary redirect
                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 800);


            } catch (error) {

                console.error(
                    "Signup error:",
                    error
                );


                showMessage(
                    signupMessage,
                    getAuthErrorMessage(error),
                    "error"
                );

            } finally {

                if (signupSubmit) {
                    signupSubmit.disabled = false;
                    signupSubmit.textContent = "Create Account";
                }

            }

        });

    }


    // =================================================
    // Helper Functions
    // =================================================

    function showMessage(element, message, type) {

        if (!element) return;

        element.textContent = message;

        element.classList.remove(
            "success",
            "error"
        );

        element.classList.add(type);

        element.hidden = false;
    }


    function clearMessage(element) {

        if (!element) return;

        element.textContent = "";

        element.classList.remove(
            "success",
            "error"
        );

        element.hidden = true;
    }


    function getAuthErrorMessage(error) {

        if (!error) {
            return "Something went wrong. Please try again.";
        }


        const message =
            error.message || "";


        // Common Supabase errors

        if (
            message.toLowerCase().includes(
                "invalid login credentials"
            )
        ) {
            return "Incorrect email or password.";
        }


        if (
            message.toLowerCase().includes(
                "user already registered"
            )
        ) {
            return "An account with this email already exists.";
        }


        if (
            message.toLowerCase().includes(
                "password should be at least"
            )
        ) {
            return "Your password is too short.";
        }


        if (
            message.toLowerCase().includes(
                "email not confirmed"
            )
        ) {
            return "Please confirm your email before signing in.";
        }


        return message ||
            "Something went wrong. Please try again.";

    }

});
