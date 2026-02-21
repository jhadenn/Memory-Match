// Bulma navbar burger toggle (mobile).
document.addEventListener("DOMContentLoaded", () => {
    const burgers = Array.from(document.querySelectorAll(".navbar-burger"));

    for (const burger of burgers) {
        const targetId = burger.dataset.target;
        if (!targetId) continue;

        const menu = document.getElementById(targetId);
        if (!menu) continue;

        burger.addEventListener("click", () => {
            burger.classList.toggle("is-active");
            menu.classList.toggle("is-active");
        });
    }
});

