// =====================================================
// English Learning - Admin Dashboard
// =====================================================

// Supabase configuration
const SUPABASE_URL = "0000000000";
const SUPABASE_KEY = "0000000000000";


// =====================================================
// Create Supabase Client
// =====================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// Admin Dashboard Initialization
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const adminMenuButton =
            document.getElementById(
                "adminMenuButton"
            );

        const adminMenu =
            document.getElementById(
                "adminMenu"
            );

        const adminLogoutButton =
            document.getElementById(
                "adminLogoutButton"
            );


        // -------------------------------------------------
        // Check Admin Access
        // -------------------------------------------------

        const isAdmin =
            await checkAdminAccess();

        if (!isAdmin) {
            return;
        }


        // -------------------------------------------------
        // Admin Dropdown
        // -------------------------------------------------

        if (
            adminMenuButton &&
            adminMenu
        ) {

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


        // -------------------------------------------------
        // Admin Logout
        // -------------------------------------------------

        if (adminLogoutButton) {

            adminLogoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        adminLogoutButton.disabled =
                            true;

                        adminLogoutButton.textContent =
                            "Logging out...";


                        const { error } =
                            await supabaseClient
                                .auth
                                .signOut();


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

    }
);


// =====================================================
// Check Admin Access
// =====================================================

async function checkAdminAccess() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


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
                "dashboard.html"
            );

            return false;
        }


        // -------------------------------------------------
        // Admin Confirmed
        // -------------------------------------------------

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
