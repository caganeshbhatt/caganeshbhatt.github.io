(() => {
  const sectionOrder = ["about", "impact", "case-studies", "career", "contact"];
  const sectionLabels = {
    about: "About",
    impact: "Selected impact",
    "case-studies": "Case studies",
    career: "Career journey",
    contact: "Contact",
  };

  let activeSection = null;
  let returnFocus = null;

  const trackEvent = (name, parameters = {}) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, parameters);
    }
  };

  const panelTemplate = (section) =>
    document.getElementById(`panel-${section}`);

  const closeDrawer = ({ updateHash = true } = {}) => {
    const layer = document.querySelector(".drawer-layer");
    if (!layer) return;

    layer.remove();
    document.body.style.overflow = "";
    activeSection = null;

    if (updateHash && window.location.hash.startsWith("#panel-")) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (returnFocus && document.contains(returnFocus)) {
      returnFocus.focus();
    }
  };

  const openDrawer = (section, source = "direct_link", trigger = null) => {
    const template = panelTemplate(section);
    if (!template) return;

    if (trigger && !activeSection) returnFocus = trigger;
    closeDrawer({ updateHash: false });
    activeSection = section;

    const currentIndex = sectionOrder.indexOf(section);
    const nextSection = sectionOrder[(currentIndex + 1) % sectionOrder.length];
    const layer = document.createElement("div");
    layer.className = "drawer-layer";
    layer.setAttribute("role", "presentation");
    layer.innerHTML = `
      <aside class="detail-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div class="drawer-toolbar">
          <span>${String(currentIndex + 1).padStart(2, "0")} / ${String(sectionOrder.length).padStart(2, "0")}</span>
          <button type="button" data-close-drawer>Close <b aria-hidden="true">×</b></button>
        </div>
        <div class="drawer-scroll">
          <header class="drawer-heading">
            <p>${template.dataset.kicker}</p>
            <h2 id="drawer-title">${template.dataset.title} <em>${template.dataset.emphasis}</em></h2>
          </header>
          <section class="drawer-content"></section>
          <footer class="drawer-footer">
            <button type="button" data-close-drawer>← Back to dashboard</button>
            <button type="button" data-next-panel="${nextSection}">Next: ${sectionLabels[nextSection]} →</button>
          </footer>
        </div>
      </aside>
    `;

    layer.querySelector(".drawer-content").append(template.content.cloneNode(true));
    document.body.append(layer);
    document.body.style.overflow = "hidden";
    history.replaceState(null, "", `#panel-${section}`);
    trackEvent("panel_open", { panel_name: section, open_source: source });

    layer.addEventListener("mousedown", (event) => {
      if (event.target === layer) closeDrawer();
    });
    layer.querySelectorAll("[data-close-drawer]").forEach((button) => {
      button.addEventListener("click", () => closeDrawer());
    });
    layer.querySelector("[data-next-panel]").addEventListener("click", (event) => {
      openDrawer(event.currentTarget.dataset.nextPanel, "drawer_next", event.currentTarget);
    });
    layer.querySelector("[data-close-drawer]").focus();
  };

  document.addEventListener("click", (event) => {
    const panelButton = event.target.closest("[data-panel]");
    if (panelButton) {
      openDrawer(
        panelButton.dataset.panel,
        panelButton.dataset.source || "unknown",
        panelButton,
      );
      return;
    }

    const trackedLink = event.target.closest("[data-track]");
    if (trackedLink) {
      trackEvent(trackedLink.dataset.track, {
        link_location: trackedLink.dataset.location || "unknown",
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && activeSection) closeDrawer();
  });

  const initialSection = window.location.hash.replace("#panel-", "");
  if (sectionOrder.includes(initialSection)) {
    openDrawer(initialSection, "direct_link");
  }
})();
