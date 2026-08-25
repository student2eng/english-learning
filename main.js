/* ========================================
   English Learning — Main JavaScript
   ======================================== */

document.addEventListener("DOMContentLoaded", () => {

  /*
   * Guest learning button
   * Sends the student to level selection.
   */

  const startLearningBtn =
    document.getElementById("startLearningBtn");

  function startGuestLearning(event) {
    event.preventDefault();

    /*
     * Guest flow:
     * Home → Level → Learning
     */
    window.location.href = "level.html";
  }

  if (startLearningBtn) {
    startLearningBtn.addEventListener(
      "click",
      startGuestLearning
    );
  }

});
