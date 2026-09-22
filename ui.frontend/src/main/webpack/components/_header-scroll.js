(function () {
    function initHeaderScroll() {
        const root = document.documentElement;

        if (!document.querySelector(".cmp-hero")) {
            return;
        }

        if (root.dataset.nestScrollInitialized === "true") {
            return;
        }

        root.dataset.nestScrollInitialized = "true";

        function updateHeader() {
            root.classList.toggle(
                "nest-page-scrolled",
                window.scrollY > 48
            );
        }

        window.addEventListener("scroll", updateHeader, {
            passive: true
        });

        window.addEventListener("pageshow", updateHeader);

        updateHeader();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initHeaderScroll
        );
    } else {
        initHeaderScroll();
    }
})();
