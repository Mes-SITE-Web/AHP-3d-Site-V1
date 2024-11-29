



// ---------- ⥥ LOADER ⥥ ----------
document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.querySelector(".progress-fill");
  const percentageText = document.querySelector(".percentage");
  const loader = document.getElementById("loader");
  const mainContent = document.getElementById("main-content");

  let progress = 0;

  const interval = setInterval(() => {
    progress += 1;
    progressBar.style.width = `${progress}%`;
    percentageText.textContent = `${progress}%`;

    if (progress === 100) {
      clearInterval(interval);

      // Transition pour masquer le loader
      loader.style.opacity = "0";
      loader.style.transition = "opacity 0.8s ease";


      setTimeout(() => {
        loader.style.display = "none";
        // mainContent.style.display = "block";
      }, 500); // Attendre la fin de la transition
    }
  }, 12); // 40ms pour un total de 4 secondes
});
