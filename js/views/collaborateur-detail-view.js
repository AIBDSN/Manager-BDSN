function createInfoRow(label, value) {
  return `
    <div class="detail-item">
      <strong>${label}</strong>
      <span>${value}</span>
    </div>
  `;
}

function renderIdentitySection(collaborateur) {
  return `
    <div class="section-card">
      <div class="section-title">Identite</div>
      <div class="detail-list">
        ${createInfoRow("Salarie", collaborateur.salarie)}
        ${createInfoRow("Nom", collaborateur.nom)}
        ${createInfoRow("Prenom", collaborateur.prenom)}
        ${createInfoRow("MAIA", collaborateur.maia)}
        ${createInfoRow("NNI simplifie", collaborateur.nniSimplifie)}
        ${createInfoRow("Mail", collaborateur.mail)}
        ${createInfoRow("Manager", collaborateur.manager)}
      </div>
    </div>
  `;
}

function renderMaterielSection(collaborateur) {
  return `
    <div class="section-card">
      <div class="section-title">Materiel</div>
      <div class="detail-list">
        ${createInfoRow("Telephone", collaborateur.telephone || "Non renseigne")}
        ${createInfoRow("Tablette", collaborateur.tablette || "Non renseignee")}
      </div>
    </div>
  `;
}

function renderPlaceholderSection(title, items) {
  const listItems = items.map((item) => `<li>${item}</li>`).join("");
  return `
    <div class="section-card">
      <div class="section-title">${title}</div>
      <ul class="placeholder-list">${listItems}</ul>
    </div>
  `;
}

function renderHeaderSubtitle(collaborateur) {
  return `${collaborateur.poste} - ${collaborateur.pole} - ${collaborateur.site} - ${collaborateur.statut}`;
}

export function renderCollaborateurDetailView(container, { collaborateur, onBack }) {
  container.innerHTML = "";

  if (!collaborateur) {
    const notFound = document.createElement("section");
    notFound.className = "section-card";
    notFound.innerHTML = `
      <div class="section-title">Fiche introuvable</div>
      <p class="muted">Aucun collaborateur ne correspond a cette cle MAIA.</p>
      <button class="button-link" type="button" id="back-list">Retour a la liste</button>
    `;
    notFound.querySelector("#back-list")?.addEventListener("click", onBack);
    container.appendChild(notFound);
    return;
  }

  const wrapper = document.createElement("section");
  wrapper.className = "stack";

  const head = document.createElement("header");
  head.className = "section-card detail-header";
  head.innerHTML = `
    <div class="detail-header-main">
      <h2 class="detail-title">${collaborateur.salarie}</h2>
      <p class="detail-subtitle">${renderHeaderSubtitle(collaborateur)}</p>
      <div class="detail-meta">
        <span class="tag">MAIA ${collaborateur.maia}</span>
        <span class="tag">NNI ${collaborateur.nniSimplifie}</span>
      </div>
    </div>
    <button class="button-link detail-back" type="button" id="back-list">Retour</button>
  `;
  head.querySelector("#back-list")?.addEventListener("click", onBack);

  const grid = document.createElement("div");
  grid.className = "detail-grid";
  grid.innerHTML = `
    <div class="stack">
      ${renderIdentitySection(collaborateur)}
      ${renderPlaceholderSection("Notes", ["Section prete pour les notes manager et suivis ponctuels."])}
    </div>
    <div class="stack">
      ${renderMaterielSection(collaborateur)}
      ${renderPlaceholderSection("Formations", ["Planification", "Statut", "Echeances"])}
      ${renderPlaceholderSection("Entretiens", ["Annuel", "Professionnel", "Points intermediaires"])}
      ${renderPlaceholderSection("Rappels manager", ["Relances prioritaires", "Actions a date"])}
    </div>
  `;

  wrapper.append(head, grid);
  container.appendChild(wrapper);
}
