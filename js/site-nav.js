document.addEventListener("DOMContentLoaded", () => {
  const toggles = document.querySelectorAll(".nav-toggle");

  toggles.forEach((toggle) => {
    const header = toggle.closest("header");
    const navId = toggle.getAttribute("aria-controls");
    const nav = navId ? document.getElementById(navId) : null;

    if (!header || !nav) {
      return;
    }

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "メニューを開く" : "メニューを閉じる");
      header.classList.toggle("nav-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "メニューを開く");
        header.classList.remove("nav-open");
      });
    });
  });
});
