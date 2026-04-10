const setActiveNav = () => {
    const page = document.body.dataset.page;
    if (!page) {
        return;
    }

    document.querySelectorAll("[data-nav]").forEach((link) => {
        const isActive = link.dataset.nav === page;

        if (isActive) {
            link.classList.add("text-slate-900", "bg-slate-100");
            link.classList.remove("hover:text-slate-900", "hover:bg-slate-100");
        }
    });
};

const initMobileMenu = () => {
    const menuToggle = document.getElementById("menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (!menuToggle || !mobileMenu) {
        return;
    }

    const closeMenu = () => {
        mobileMenu.classList.add("max-h-0", "opacity-0");
        mobileMenu.classList.remove("max-h-64", "opacity-100");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
        mobileMenu.classList.remove("max-h-0", "opacity-0");
        mobileMenu.classList.add("max-h-64", "opacity-100");
        menuToggle.setAttribute("aria-expanded", "true");
    };

    menuToggle.addEventListener("click", () => {
        const expanded = menuToggle.getAttribute("aria-expanded") === "true";
        if (expanded) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) {
            closeMenu();
        }
    });
};

const loadPartial = async (mountId, partialPath) => {
    const mount = document.getElementById(mountId);
    if (!mount) {
        return;
    }

    try {
        const response = await fetch(partialPath);
        if (!response.ok) {
            return;
        }

        const html = await response.text();
        mount.innerHTML = html;
    } catch {
        // Silently keep the page usable if the partial cannot be loaded.
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await Promise.all([
        loadPartial("site-header", "_header.html"),
        loadPartial("site-footer", "_footer.html")
    ]);

    setActiveNav();
    initMobileMenu();
});
