function renderIdentitySection(collaborateur) {
  return `
    <div class="section-card">
      <div class="section-title">Identite</div>
      <div class="detail-list">
        <div class="detail-item"><strong>Salarie</strong><span>${collaborateur.salarie}</span></div>
        <div class="detail-item"><strong>MAIA</strong><span>${collaborateur.maia}</span></div>
        <div class="detail-item"><strong>NNI simplifie</strong><span>${collaborateur.nniSimplifie}</span></div>
        <div class="detail-item"><strong>Poste</strong><span>${collaborateur.poste}</span></div>
        <div class="detail-item"><strong>Site</strong><span>${collaborateur.site}</span></div>
        <div class="detail-item"><strong>Pole</strong><span>${collaborateur.pole}</span></div>
        <div class="detail-item"><strong>Statut</strong><span>${collaborateur.statut}</span></div>
        <div class="detail-item"><strong>Telephone</strong><span>${collaborateur.telephone || "Non renseigne"}</span></div>
        <div class="detail-item"><strong>Tablette</strong><span>${collaborateur.tablette || "Non renseignee"}</span></div>
        <div class="detail-item"><strong>Mail</strong><span>${collaborateur.mail}</span></div>
        <div class="detail-item"><strong>Manager</strong><span>${collaborateur.manager}</span></div>
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

  const head = document.createElement("div");
  head.className = "row-between";
  head.innerHTML = `
    <div>
      <h2>${collaborateur.salarie}</h2>
      <p class="muted">Fiche collaborateur - cle principale MAIA, cle secondaire NNI simplifie</p>
    </div>
    <button class="button-link" type="button" id="back-list">Retour</button>
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
      ${renderPlaceholderSection("Materiel", ["Telephone", "Tablette", "Equipements additionnels"])}
      ${renderPlaceholderSection("Formations", ["Planification", "Statut", "Echeances"])}
      ${renderPlaceholderSection("Entretiens", ["Annuel", "Professionnel", "Points intermédiaires"])}
      ${renderPlaceholderSection("Rappels manager", ["Relances prioritaires", "Actions a date"])}
    </div>
  `;

  wrapper.append(head, grid);
  container.appendChild(wrapper);
}
