/* ========================================
   English Learning — Main JavaScript
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

  /*
   * Guest learning buttons
   * Temporary behaviour for Version 1.
   *
   * The real learning flow will be connected
   * later when learning.html is created.
   */

  const startLearningBtn =
    document.getElementById("startLearningBtn");

  const guestStartBtn =
    document.getElementById("guestStartBtn");


  function startGuestLearning(event) {
    event.preventDefault();

    /*
     * For now, send the student to the
     * level selection page.
     *
     * This page will be created in the
     * next development stage.
     */
    window.location.href = "level.html";
  }


  if (startLearningBtn) {
    startLearningBtn.addEventListener(
      "click",
      startGuestLearning
    );
  }


  if (guestStartBtn) {
    guestStartBtn.addEventListener(
      "click",
      startGuestLearning
    );
  }

});
