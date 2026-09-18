function initNestHeaders() {
    document.querySelectorAll("[data-nest-header]").forEach((header, index) => {
        if (header.dataset.initialized === "true") {
            return;
        }

        const toggle = header.querySelector(".cmp-nest-header__toggle");
        const panel = header.querySelector(".cmp-nest-header__panel");
        const closeButton = header.querySelector(".cmp-nest-header__close");
        const backdrop = header.querySelector(".cmp-nest-header__backdrop");
        const mobile = window.matchMedia("(max-width: 1200px)");

        if (!toggle || !panel || !closeButton || !backdrop) {
            return;
        }

        header.dataset.initialized = "true";

        panel.id = `nest-menu-${index}`;
        toggle.setAttribute("aria-controls", panel.id);

        header.querySelectorAll(".cmp-navigation__item").forEach((item) => {
            const hasChildren = Array.from(item.children).some((child) =>
                child.classList.contains("cmp-navigation__group")
            );

            if (hasChildren) {
                item.classList.add("nest-has-submenu");
            }
        });

        let opened = false;
        let previousOverflow = "";

        function closeMenu(restoreFocus = true) {
            if (opened) {
                document.body.style.overflow = previousOverflow;
            }

            opened = false;
            header.classList.remove("is-menu-open");
            toggle.setAttribute("aria-expanded", "false");
            backdrop.hidden = true;

            panel.removeAttribute("role");
            panel.removeAttribute("aria-modal");
            panel.removeAttribute("aria-label");

            if (restoreFocus && mobile.matches) {
                toggle.focus();
            }
        }

        function openMenu() {
            if (!mobile.matches || opened) {
                return;
            }

            previousOverflow = document.body.style.overflow;
            document.body.style.overflow = "hidden";

            opened = true;
            header.classList.add("is-menu-open");
            toggle.setAttribute("aria-expanded", "true");
            backdrop.hidden = false;

            panel.setAttribute("role", "dialog");
            panel.setAttribute("aria-modal", "true");
            panel.setAttribute("aria-label", "Site navigation");

            closeButton.focus();
        }

        toggle.addEventListener("click", () => {
            if (opened) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        closeButton.addEventListener("click", () => closeMenu());
        backdrop.addEventListener("click", () => closeMenu());

        panel.addEventListener("click", (event) => {
            if (event.target.closest("a[href]") && opened) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (!opened) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                closeMenu();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusable = Array.from(
                panel.querySelectorAll(
                    'a[href], button:not([disabled]), input:not([disabled]), ' +
                    'select:not([disabled]), textarea:not([disabled]), ' +
                    '[tabindex]:not([tabindex="-1"])'
                )
            ).filter((element) =>
                element.getClientRects().length > 0 &&
                window.getComputedStyle(element).visibility !== "hidden"
            );

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (!first) {
                event.preventDefault();
                return;
            }

            if (event.shiftKey && (active === first || !panel.contains(active))) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey &&
                       (active === last || !panel.contains(active))) {
                event.preventDefault();
                first.focus();
            }
        });

        mobile.addEventListener("change", () => {
            const focusWasInPanel = panel.contains(document.activeElement);
            closeMenu(false);

            if (mobile.matches && focusWasInPanel) {
                toggle.focus();
            } else if (!mobile.matches && document.activeElement === toggle) {
                header.querySelector(".cmp-nest-header__brand").focus();
            }
        });

        header.classList.add("is-enhanced");
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNestHeaders);
} else {
    initNestHeaders();
}
