const MENU_ITEMS = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard" },
  { key: "collaborateurs", label: "Collaborateurs", path: "/collaborateurs" }
];

export function renderSidebar(container, { activeRoute, onNavigate, version }) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "sidebar-inner";

  const brand = document.createElement("div");
  brand.className = "sidebar-brand";
  brand.innerHTML = `
    <div class="sidebar-title">Manager PMRI - VLG</div>
    <div class="sidebar-subtitle">Pilotage equipe GRDF</div>
  `;

  const nav = document.createElement("nav");
  nav.className = "nav-list";

  MENU_ITEMS.forEach((item) => {
    const button = document.createElement("button");
    button.className = `nav-item${activeRoute.startsWith(item.path) ? " active" : ""}`;
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => onNavigate(item.path));
    nav.appendChild(button);
  });

  const footer = document.createElement("div");
  footer.className = "sidebar-footer";
  footer.textContent = `Version ${version}`;

  wrapper.append(brand, nav, footer);
  container.appendChild(wrapper);
}
