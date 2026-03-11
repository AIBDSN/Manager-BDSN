export function renderTopbar(container, { title, subtitle, version }) {
  container.innerHTML = `
    <div class="topbar-inner">
      <div>
        <div class="topbar-title">${title}</div>
        <div class="topbar-subtitle">${subtitle}</div>
      </div>
      <div class="version-badge">${version}</div>
    </div>
  `;
}
