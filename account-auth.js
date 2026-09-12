/*
 * account-auth.js
 * English Learning — Shared Authentication / Account Layer v1
 *
 * Responsibilities:
 * - Read the real Supabase Session
 * - Update the shared Header state
 * - Control the Account menu
 * - Handle Logout
 * - Provide shared authentication guards
 *
 * Intentionally NOT responsible for:
 * - Trial activation
 * - Payment Return Intent
 * - Subscription verification
 * - Payment creation / verification
 * - Dashboard or Learning business logic
 *
 * IMPORTANT:
 * This first version does NOT implement an auth.html redirect.
 * auth.html keeps its existing route logic in auth.js.
 */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     1. Supabase client
     --------------------------------------------------------- */

  function getSupabaseClient() {

  // Preferred: a shared client exposed on window.
  if (window.supabaseClient) {
    return window.supabaseClient;
  }

  // Support pages where supabaseClient exists
  // as a global lexical variable created by another
  // classic script, such as dashboard.js.
  if (typeof supabaseClient !== "undefined") {
    return supabaseClient;
  }

  // Optional shared configuration bridge.
  if (
    window.supabase &&
    window.APP_SUPABASE_CONFIG &&
    window.APP_SUPABASE_CONFIG.url &&
    window.APP_SUPABASE_CONFIG.anonKey
  ) {

    if (!window.accountAuthSupabaseClient) {

      window.accountAuthSupabaseClient =
        window.supabase.createClient(
          window.APP_SUPABASE_CONFIG.url,
          window.APP_SUPABASE_CONFIG.anonKey
        );
    }

    return window.accountAuthSupabaseClient;
  }

  console.error(
    "[account-auth] Supabase client/config is not available."
  );

  return null;
}

  const supabaseClient = getSupabaseClient();


  /* ---------------------------------------------------------
     2. Page helpers
     --------------------------------------------------------- */

  function getCurrentPage() {
    const path = window.location.pathname.toLowerCase();
    const fileName = path.split("/").pop();

    return fileName || "index.html";
  }

  function isAuthPage() {
    return getCurrentPage() === "auth.html";
  }

  function isAccountPage() {
    return getCurrentPage() === "account.html";
  }

  function isPublicPage() {
    return [
      "",
      "index.html",
      "auth.html",
      "guest-dashboard.html",
      "guest-learning.html",
      "level.html"
    ].includes(getCurrentPage());
  }


  /* ---------------------------------------------------------
     3. Header elements
     --------------------------------------------------------- */

  function getHeaderElements() {
    const loginLink = document.querySelector(
      ".header-login, [data-header-login]"
    );

    const accountContainer = document.querySelector(
      "#accountMenuContainer, .account-menu-container, [data-account-menu-container]"
    );

    const accountButton = document.querySelector(
      "#accountMenuButton, .account-menu-button, [data-account-menu-button]"
    );

    const accountMenu = document.querySelector(
      "#accountMenu, .account-menu, [data-account-menu]"
    );

    return {
      loginLink,
      accountContainer,
      accountButton,
      accountMenu
    };
  }


  /* ---------------------------------------------------------
     4. Account menu
     --------------------------------------------------------- */

  function closeAccountMenu() {
    const {
      accountButton,
      accountMenu
    } = getHeaderElements();

    if (accountMenu) {
      accountMenu.classList.remove("show");
      accountMenu.classList.remove("open");
      accountMenu.hidden = true;
    }

    if (accountButton) {
      accountButton.setAttribute(
        "aria-expanded",
        "false"
      );
    }
  }


  function openAccountMenu() {
    const {
      accountButton,
      accountMenu
    } = getHeaderElements();

    if (!accountMenu) {
      return;
    }

    accountMenu.hidden = false;

    accountMenu.classList.add("show");
    accountMenu.classList.add("open");

    if (accountButton) {
      accountButton.setAttribute(
        "aria-expanded",
        "true"
      );
    }
  }


  function toggleAccountMenu(event) {
    if (event) {
      event.stopPropagation();
    }

    const {
      accountMenu
    } = getHeaderElements();

    if (!accountMenu) {
      return;
    }

    const isOpen =
      accountMenu.classList.contains("show") ||
      accountMenu.classList.contains("open") ||
      accountMenu.hidden === false;

    if (isOpen) {
      closeAccountMenu();
    } else {
      openAccountMenu();
    }
  }


  function setupAccountMenu() {
    const {
      accountButton,
      accountMenu
    } = getHeaderElements();

    if (!accountButton || !accountMenu) {
      return;
    }

    accountButton.setAttribute(
      "aria-expanded",
      "false"
    );

    accountMenu.hidden = true;


    accountButton.addEventListener(
      "click",
      toggleAccountMenu
    );


    document.addEventListener(
      "click",
      function (event) {

        if (
          accountButton.contains(event.target) ||
          accountMenu.contains(event.target)
        ) {
          return;
        }

        closeAccountMenu();
      }
    );


    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key === "Escape") {
          closeAccountMenu();
        }

      }
    );
  }


  /* ---------------------------------------------------------
     5. Header authentication state
     --------------------------------------------------------- */

  function renderSignedOutHeader() {
    const {
      loginLink,
      accountContainer
    } = getHeaderElements();


    if (loginLink) {

      loginLink.hidden = false;

      loginLink.style.display = "";

      loginLink.textContent = "Sign In";

      loginLink.href = "auth.html";
    }


    if (accountContainer) {

      accountContainer.hidden = true;

      accountContainer.style.display = "none";
    }


    closeAccountMenu();
  }


  function renderSignedInHeader() {
    const {
      loginLink,
      accountContainer
    } = getHeaderElements();


    if (loginLink) {

      loginLink.hidden = true;

      loginLink.style.display = "none";
    }


    if (accountContainer) {

      accountContainer.hidden = false;

      accountContainer.style.display = "";
    }
  }


  /* ---------------------------------------------------------
     6. Session
     --------------------------------------------------------- */

  async function getSession() {

    if (!supabaseClient) {

      return {
        session: null,
        error: new Error(
          "Supabase client is unavailable."
        )
      };

    }


    const {
      data,
      error
    } = await supabaseClient.auth.getSession();


    return {
      session: data
        ? data.session
        : null,

      error
    };
  }


  async function updateHeaderFromSession() {

    const {
      session,
      error
    } = await getSession();


    if (error) {

      console.error(
        "[account-auth] Session check failed:",
        error
      );

      renderSignedOutHeader();

      return null;
    }


    if (session) {

      renderSignedInHeader();

      return session;
    }


    renderSignedOutHeader();

    return null;
  }


  /* ---------------------------------------------------------
     7. Logout
     --------------------------------------------------------- */

  async function handleLogout(event) {

    if (event) {

      event.preventDefault();

      event.stopPropagation();
    }


    if (!supabaseClient) {

      console.error(
        "[account-auth] Cannot logout: Supabase client unavailable."
      );

      return;
    }


    try {

      const {
        error
      } = await supabaseClient.auth.signOut();


      if (error) {

        console.error(
          "[account-auth] Logout failed:",
          error
        );

        return;
      }


      closeAccountMenu();


      // Authentication state has now ended.
      // Return to the public home page.

      window.location.href =
        "index.html";

    } catch (error) {

      console.error(
        "[account-auth] Logout exception:",
        error
      );

    }
  }


  function setupLogout() {

    const logoutButton =
      document.querySelector(
        "#accountLogoutButton, [data-account-logout]"
      );


    if (!logoutButton) {
      return;
    }


    logoutButton.addEventListener(
      "click",
      handleLogout
    );
  }


  /* ---------------------------------------------------------
     8. Shared authentication guard
     --------------------------------------------------------- */

  async function requireAuthenticatedUser(
    options
  ) {

    const settings =
      options || {};

    const redirectTo =
      settings.redirectTo ||
      "auth.html";


    const {
      session,
      error
    } = await getSession();


    if (
      error ||
      !session
    ) {

      if (!isAuthPage()) {

        window.location.href =
          redirectTo;
      }


      return {

        allowed: false,

        session: null,

        error:
          error ||
          new Error(
            "No active session."
          )

      };
    }


    return {

      allowed: true,

      session,

      error: null

    };
  }


  /* ---------------------------------------------------------
     9. Auth state listener
     --------------------------------------------------------- */

  function setupAuthStateListener() {

    if (!supabaseClient) {
      return;
    }


    supabaseClient.auth.onAuthStateChange(
      function (event, session) {

        // This updates only the shared Header state.
        //
        // It does NOT perform:
        // - auth.html routing
        // - payment routing
        // - trial routing

        if (session) {

          renderSignedInHeader();

        } else {

          renderSignedOutHeader();

        }

      }
    );
  }


  /* ---------------------------------------------------------
     10. Public API
     --------------------------------------------------------- */

  window.accountAuth = {

    getSession,

    updateHeaderFromSession,

    requireAuthenticatedUser,

    handleLogout,

    openAccountMenu,

    closeAccountMenu,

    toggleAccountMenu

  };


  /* ---------------------------------------------------------
     11. Initialization
     --------------------------------------------------------- */

  window.accountAuthReady =
    (async function () {

      await updateHeaderFromSession();

      setupAccountMenu();

      setupLogout();

      setupAuthStateListener();

      return true;

    })();


  /* ---------------------------------------------------------
     12. DOM initialization
     --------------------------------------------------------- */

  document.addEventListener(
    "DOMContentLoaded",
    async function () {

      try {

        await window.accountAuthReady;

      } catch (error) {

        console.error(
          "[account-auth] Initialization failed:",
          error
        );

      }

    }
  );

})();
