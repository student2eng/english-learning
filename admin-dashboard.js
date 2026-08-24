// =====================================================
// English Learning - Admin Dashboard
// =====================================================


// =====================================================
// Supabase Configuration
// =====================================================

const SUPABASE_URL = "https://azuzgodrxkxhlsekooyc.supabase.co";
const SUPABASE_KEY = "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";


// =====================================================
// Admin Dashboard Initialization
// =====================================================

document.addEventListener("DOMContentLoaded", async () => {

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

        window.location.replace("auth.html");

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


    // Temporary reference
    window.supabaseClient = supabase;


    // -------------------------------------------------
    // Check Admin Access
    // -------------------------------------------------

    const isAdmin =
        await checkAdminAccess(supabase);

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

    initAdminLogout(supabase);

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
                document.createElement("script");

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


            document.head.appendChild(script);

        }
    );
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


    // -------------------------------------------------
    // Close Menu When Clicking Outside
    // -------------------------------------------------

    document.addEventListener(
        "click",
        (event) => {

            if (
                !adminMenu.contains(event.target) &&
                !adminMenuButton.contains(event.target)
            ) {

                adminMenu.hidden = true;


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

function initAdminLogout(supabase) {

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

                // Disable button
                adminLogoutButton.disabled =
                    true;


                adminLogoutButton.textContent =
                    "Logging out...";


                // Sign out
                const {
                    error
                } =
                    await supabase.auth.signOut();


                if (error) {
                    throw error;
                }


                // Redirect to Auth
                window.location.replace(
                    "auth.html"
                );


            } catch (error) {

                console.error(
                    "Admin logout error:",
                    error
                );


                // Restore button
                adminLogoutButton.disabled =
                    false;


                adminLogoutButton.textContent =
                    "Log Out";

            }

        }
    );

}
