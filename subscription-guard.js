// =====================================================
// English Learning - Subscription Guard
// Shared Guard for Dashboard + Learning
// =====================================================

// =====================================================
// Supabase Configuration
// Use the SAME values from auth.js / dashboard.js
// =====================================================

const SUBSCRIPTION_GUARD_SUPABASE_URL =
    "https://azuzgodrxkxhlsekooyc.supabase.co";

const SUBSCRIPTION_GUARD_SUPABASE_KEY =
    "sb_publishable_urenPm0k3KqkSpb9aSkVOw_OVYch9mM";


// =====================================================
// Create dedicated Supabase client
// =====================================================

const subscriptionGuardClient =
    window.supabase.createClient(
        SUBSCRIPTION_GUARD_SUPABASE_URL,
        SUBSCRIPTION_GUARD_SUPABASE_KEY
    );


// =====================================================
// Shared Guard Promise
//
// Dashboard.js and Learning.js will wait for this
// before loading protected page data.
// =====================================================

window.subscriptionGuardReady =
    checkSubscriptionAccess();


// =====================================================
// Check Subscription Access
// =====================================================

async function checkSubscriptionAccess() {

    try {

        // =================================================
        // Verify authenticated user
        // =================================================

        const {
            data: {
                user
            },
            error: authError
        } =
            await subscriptionGuardClient.auth.getUser();


        // -------------------------------------------------
        // Authentication error
        // -------------------------------------------------

        if (authError) {

            console.error(
                "Subscription Guard authentication error:",
                authError
            );

            window.location.replace(
                "auth.html"
            );

            return {
                allowed: false,
                reason: "authentication_error"
            };

        }


        // -------------------------------------------------
        // No authenticated user
        // -------------------------------------------------

        if (!user) {

            console.log(
                "Subscription Guard: no active session."
            );

            window.location.replace(
                "auth.html"
            );

            return {
                allowed: false,
                reason: "no_session"
            };

        }


        // =================================================
        // Check Subscription through Backend
        // =================================================

        const {
            data,
            error: functionError
        } =
            await subscriptionGuardClient.functions.invoke(
                "check-subscription",
                {
                    method: "POST"
                }
            );


        // =================================================
        // Backend / Function Error
        // =================================================

        if (functionError) {

            console.error(
                "Subscription Guard function error:",
                functionError
            );


            return {
                allowed: false,
                reason: "verification_error"
            };

        }


        // =================================================
        // Invalid response
        // =================================================

        if (!data) {

            console.error(
                "Subscription Guard: empty response."
            );


            return {
                allowed: false,
                reason: "invalid_response"
            };

        }


        // =================================================
        // Access Allowed
        // =================================================

        if (
            data.allowed === true &&
            (
                data.status === "trial" ||
                data.status === "active"
            )
        ) {

            console.log(
                "Subscription Guard: access allowed.",
                data
            );


            // -------------------------------------------------
            // Make current subscription available to the page
            // for future Account / UI use.
            // -------------------------------------------------

            window.currentSubscription =
                data;


            return data;

        }


        // =================================================
        // Subscription Expired
        // =================================================

        if (
            data.status === "trial_expired" ||
            data.status === "expired"
        ) {

            console.log(
                "Subscription Guard: access expired.",
                data
            );


            // -------------------------------------------------
            // Store result before redirect.
            // -------------------------------------------------

            window.currentSubscription =
                data;


            // -------------------------------------------------
            // Redirect to Subscription Plans
            //
            // The plans page will use this parameter
            // to display the approved expiration message.
            // -------------------------------------------------

            window.location.replace(
                "subscription-plans.html?reason=expired"
            );


            return data;

        }


        // =================================================
        // No Subscription
        // =================================================

        if (
            data.reason ===
            "no_subscription"
        ) {

            console.error(
                "Subscription Guard: no subscription record."
            );


            window.currentSubscription =
                data;


            return data;

        }


        // =================================================
        // Any Other Denied State
        // =================================================

        console.error(
            "Subscription Guard: access denied.",
            data
        );


        window.currentSubscription =
            data;


        return data;


    } catch (error) {

        console.error(
            "Subscription Guard error:",
            error
        );


        return {
            allowed: false,
            reason: "verification_error"
        };

    }

}
