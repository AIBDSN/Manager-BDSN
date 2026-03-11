const uiStateByMaia = new Map();

const FORMATION_STATUTS = ["a_prevoir", "planifiee", "realisee", "en_retard"];
const ENTRETIEN_TYPES = ["annuel", "professionnel", "point_intermediaire"];
const ENTRETIEN_STATUTS = ["a_prevoir", "planifie", "realise", "en_retard"];
const RAPPEL_PRIORITES = ["basse", "normale", "haute"];
const RAPPEL_STATUTS = ["a_faire", "en_cours", "termine"];

function getUiState(maia) {
  if (!uiStateByMaia.has(maia)) {
    uiStateByMaia.set(maia, { editIdentity: false });
  }
  return uiStateByMaia.get(maia);
}

function labelize(value) {
  return (value || "").replaceAll("_", " ");
}

function createInfoRow(label, value) {
  return `
    <div class="detail-item">
      <strong>${label}</strong>
      <span>${value || "Non renseigne"}</span>
    </div>
  `;
}

function createSelect(name, options, selected) {
  const list = options
    .map((option) => `<option value="${option}"${option === selected ? " selected" : ""}>${labelize(option)}</option>`)
    .join("");
  return `<select class="input-search" name="${name}">${list}</select>`;
}

function renderHeaderSubtitle(collaborateur) {
  return `${collaborateur.poste || "-"} - ${collaborateur.pole || "-"} - ${collaborateur.site || "-"} - ${collaborateur.statut || "-"}`;
}

function createIdentityField(name, label, value) {
  return `
    <label class="field">
      <span class="field-label">${label}</span>
      <input class="input-search" type="text" name="${name}" value="${value || ""}" />
    </label>
  `;
}

function renderIdentityBlock(collaborateur, isEditing) {
  if (!isEditing) {
    return `
      <div class="section-card">
        <div class="section-title">Identite</div>
        <div class="detail-list">
          ${createInfoRow("Salarie", collaborateur.salarie)}
          ${createInfoRow("Nom", collaborateur.nom)}
          ${createInfoRow("Prenom", collaborateur.prenom)}
          ${createInfoRow("MAIA", collaborateur.maia)}
          ${createInfoRow("NNI simplifie", collaborateur.nniSimplifie)}
          ${createInfoRow("Poste", collaborateur.poste)}
          ${createInfoRow("Pole", collaborateur.pole)}
          ${createInfoRow("Site", collaborateur.site)}
          ${createInfoRow("Statut", collaborateur.statut)}
          ${createInfoRow("Mail", collaborateur.mail)}
          ${createInfoRow("Manager", collaborateur.manager)}
        </div>
      </div>
    `;
  }

  return `
    <form class="section-card stack" id="identity-form">
      <div class="section-title">Identite (edition)</div>
      <div class="form-grid">
        ${createIdentityField("salarie", "Salarie", collaborateur.salarie)}
        ${createIdentityField("nom", "Nom", collaborateur.nom)}
        ${createIdentityField("prenom", "Prenom", collaborateur.prenom)}
        ${createIdentityField("maia", "MAIA", collaborateur.maia)}
        ${createIdentityField("nniSimplifie", "NNI simplifie", collaborateur.nniSimplifie)}
        ${createIdentityField("poste", "Poste", collaborateur.poste)}
        ${createIdentityField("pole", "Pole", collaborateur.pole)}
        ${createIdentityField("site", "Site", collaborateur.site)}
        ${createIdentityField("statut", "Statut", collaborateur.statut)}
        ${createIdentityField("telephone", "Telephone", collaborateur.telephone)}
        ${createIdentityField("tablette", "Tablette", collaborateur.tablette)}
        ${createIdentityField("mail", "Mail", collaborateur.mail)}
        ${createIdentityField("manager", "Manager", collaborateur.manager)}
      </div>
      <div class="action-row">
        <button class="button-link" type="submit">Enregistrer</button>
        <button class="button-link" type="button" id="cancel-edit">Annuler</button>
      </div>
    </form>
  `;
}

function renderMaterielSection(collaborateur) {
  return `
    <form class="section-card stack" id="materiel-form">
      <div class="section-title">Materiel</div>
      <div class="form-grid">
        <label class="field">
          <span class="field-label">Telephone</span>
          <input class="input-search" type="text" name="telephone" value="${collaborateur.materiel?.telephone || ""}" />
        </label>
        <label class="field">
          <span class="field-label">Tablette</span>
          <input class="input-search" type="text" name="tablette" value="${collaborateur.materiel?.tablette || ""}" />
        </label>
        <label class="field field-full">
          <span class="field-label">Equipements additionnels</span>
          <input class="input-search" type="text" name="equipementsAdditionnels" value="${collaborateur.materiel?.equipementsAdditionnels || ""}" />
        </label>
        <label class="field field-full">
          <span class="field-label">Commentaire materiel</span>
          <input class="input-search" type="text" name="commentaire" value="${collaborateur.materiel?.commentaire || ""}" />
        </label>
      </div>
      <div class="action-row">
        <button class="button-link" type="submit">Enregistrer materiel</button>
      </div>
    </form>
  `;
}

function renderNotesSection(collaborateur) {
  return `
    <form class="section-card stack" id="notes-form">
      <div class="section-title">Notes</div>
      <textarea class="notes-input" name="notes" placeholder="Saisir les observations manager...">${collaborateur.notes || ""}</textarea>
      <div class="action-row">
        <button class="button-link" type="submit">Enregistrer notes</button>
      </div>
    </form>
  `;
}

function createItemList(items, renderLine, sectionKey) {
  if (!items.length) {
    return `<p class="muted">Aucune entree.</p>`;
  }
  return `
    <div class="item-list">
      ${items
        .map(
          (item) => `
            <article class="item-card">
              <div class="item-main">${renderLine(item)}</div>
              <div class="item-actions">
                <button type="button" class="button-link" data-action="edit-${sectionKey}" data-id="${item.id}">Modifier</button>
                <button type="button" class="button-link button-danger-soft" data-action="delete-${sectionKey}" data-id="${item.id}">Supprimer</button>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderFormationsSection(collaborateur) {
  return `
    <section class="section-card stack">
      <div class="section-title">Formations</div>
      ${createItemList(
        collaborateur.formations,
        (item) =>
          `<strong>${item.libelle || "Formation"}</strong><p class="muted">${labelize(item.statut)} - prevue: ${item.datePrevue || "-"} - realisee: ${item.dateRealisee || "-"} - echeance: ${item.echeance || "-"}</p><p class="muted">${item.commentaire || ""}</p>`,
        "formation"
      )}
      <form class="stack compact-form" id="add-formation-form">
        <div class="form-grid">
          <label class="field">
            <span class="field-label">Libelle</span>
            <input class="input-search" name="libelle" type="text" required />
          </label>
          <label class="field">
            <span class="field-label">Statut</span>
            ${createSelect("statut", FORMATION_STATUTS, "a_prevoir")}
          </label>
          <label class="field"><span class="field-label">Date prevue</span><input class="input-search" name="datePrevue" type="date" /></label>
          <label class="field"><span class="field-label">Date realisee</span><input class="input-search" name="dateRealisee" type="date" /></label>
          <label class="field"><span class="field-label">Echeance</span><input class="input-search" name="echeance" type="date" /></label>
          <label class="field field-full"><span class="field-label">Commentaire</span><input class="input-search" name="commentaire" type="text" /></label>
        </div>
        <div class="action-row"><button class="button-link" type="submit">Ajouter formation</button></div>
      </form>
    </section>
  `;
}

function renderEntretiensSection(collaborateur) {
  return `
    <section class="section-card stack">
      <div class="section-title">Entretiens</div>
      ${createItemList(
        collaborateur.entretiens,
        (item) =>
          `<strong>${labelize(item.type)}</strong><p class="muted">${labelize(item.statut)} - prevue: ${item.datePrevue || "-"} - realisee: ${item.dateRealisee || "-"}</p><p class="muted">${item.commentaire || ""}</p>`,
        "entretien"
      )}
      <form class="stack compact-form" id="add-entretien-form">
        <div class="form-grid">
          <label class="field"><span class="field-label">Type</span>${createSelect("type", ENTRETIEN_TYPES, "annuel")}</label>
          <label class="field"><span class="field-label">Date prevue</span><input class="input-search" name="datePrevue" type="date" /></label>
          <label class="field"><span class="field-label">Date realisee</span><input class="input-search" name="dateRealisee" type="date" /></label>
          <label class="field"><span class="field-label">Statut</span>${createSelect("statut", ENTRETIEN_STATUTS, "a_prevoir")}</label>
          <label class="field field-full"><span class="field-label">Commentaire</span><input class="input-search" name="commentaire" type="text" /></label>
        </div>
        <div class="action-row"><button class="button-link" type="submit">Ajouter entretien</button></div>
      </form>
    </section>
  `;
}

function renderRappelsSection(collaborateur) {
  return `
    <section class="section-card stack">
      <div class="section-title">Rappels manager</div>
      ${createItemList(
        collaborateur.rappelsManager,
        (item) =>
          `<strong>${item.titre || "Rappel"}</strong><p class="muted">${labelize(item.priorite)} - ${labelize(item.statut)} - cible: ${item.dateCible || "-"}</p><p class="muted">${item.description || ""}</p>`,
        "rappel"
      )}
      <form class="stack compact-form" id="add-rappel-form">
        <div class="form-grid">
          <label class="field"><span class="field-label">Titre</span><input class="input-search" name="titre" type="text" required /></label>
          <label class="field"><span class="field-label">Date cible</span><input class="input-search" name="dateCible" type="date" /></label>
          <label class="field"><span class="field-label">Priorite</span>${createSelect("priorite", RAPPEL_PRIORITES, "normale")}</label>
          <label class="field"><span class="field-label">Statut</span>${createSelect("statut", RAPPEL_STATUTS, "a_faire")}</label>
          <label class="field field-full"><span class="field-label">Description</span><input class="input-search" name="description" type="text" /></label>
        </div>
        <div class="action-row"><button class="button-link" type="submit">Ajouter rappel</button></div>
      </form>
    </section>
  `;
}

function openEditPrompt(item, fields, onApply) {
  const payload = {};
  for (const field of fields) {
    const nextValue = prompt(field.label, item[field.key] || "");
    if (nextValue === null) {
      return;
    }
    payload[field.key] = nextValue.trim();
  }
  try {
    onApply(payload);
  } catch (error) {
    alert(error.message || "Modification impossible.");
  }
}

function bindIdentityActions(container, collaborateur, uiState, handlers) {
  const editBtn = container.querySelector("#toggle-edit-identity");
  editBtn?.addEventListener("click", () => {
    uiState.editIdentity = true;
    handlers.rerender();
  });

  const cancelBtn = container.querySelector("#cancel-edit");
  cancelBtn?.addEventListener("click", () => {
    uiState.editIdentity = false;
    handlers.rerender();
  });

  const deleteBtn = container.querySelector("#delete-collaborateur");
  deleteBtn?.addEventListener("click", () => {
    const ok = confirm(`Supprimer ${collaborateur.salarie} (${collaborateur.maia}) ?`);
    if (!ok) {
      return;
    }
    try {
      handlers.onDeleteCollaborateur(collaborateur.maia);
    } catch (error) {
      alert(error.message || "Suppression impossible.");
    }
  });

  const identityForm = container.querySelector("#identity-form");
  identityForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(identityForm).entries());
    try {
      handlers.onUpdateCollaborateur(collaborateur.maia, payload);
      uiState.editIdentity = false;
    } catch (error) {
      alert(error.message || "Mise a jour impossible.");
    }
  });
}

function bindMaterielAndNotes(container, collaborateur, handlers) {
  const materielForm = container.querySelector("#materiel-form");
  materielForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(materielForm).entries());
    try {
      handlers.onUpdateMateriel(collaborateur.maia, payload);
    } catch (error) {
      alert(error.message || "Mise a jour materiel impossible.");
    }
  });

  const notesForm = container.querySelector("#notes-form");
  notesForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(notesForm).entries());
    try {
      handlers.onUpdateNotes(collaborateur.maia, payload.notes || "");
    } catch (error) {
      alert(error.message || "Mise a jour notes impossible.");
    }
  });
}

function bindCollectionActions(container, collaborateur, handlers) {
  const addFormationForm = container.querySelector("#add-formation-form");
  addFormationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(addFormationForm).entries());
    try {
      handlers.onAddFormation(collaborateur.maia, payload);
      addFormationForm.reset();
    } catch (error) {
      alert(error.message || "Ajout formation impossible.");
    }
  });

  const addEntretienForm = container.querySelector("#add-entretien-form");
  addEntretienForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(addEntretienForm).entries());
    try {
      handlers.onAddEntretien(collaborateur.maia, payload);
      addEntretienForm.reset();
    } catch (error) {
      alert(error.message || "Ajout entretien impossible.");
    }
  });

  const addRappelForm = container.querySelector("#add-rappel-form");
  addRappelForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(addRappelForm).entries());
    try {
      handlers.onAddRappel(collaborateur.maia, payload);
      addRappelForm.reset();
    } catch (error) {
      alert(error.message || "Ajout rappel impossible.");
    }
  });

  container.querySelectorAll('[data-action="edit-formation"]').forEach((button) => {
    button.addEventListener("click", () => {
      const item = collaborateur.formations.find((formation) => formation.id === button.dataset.id);
      if (!item) {
        return;
      }
      openEditPrompt(
        item,
        [
          { key: "libelle", label: "Libelle" },
          { key: "statut", label: "Statut (a_prevoir, planifiee, realisee, en_retard)" },
          { key: "datePrevue", label: "Date prevue (YYYY-MM-DD)" },
          { key: "dateRealisee", label: "Date realisee (YYYY-MM-DD)" },
          { key: "echeance", label: "Echeance (YYYY-MM-DD)" },
          { key: "commentaire", label: "Commentaire" }
        ],
        (payload) => handlers.onUpdateFormation(collaborateur.maia, item.id, payload)
      );
    });
  });

  container.querySelectorAll('[data-action="delete-formation"]').forEach((button) => {
    button.addEventListener("click", () => {
      if (!confirm("Supprimer cette formation ?")) {
        return;
      }
      try {
        handlers.onDeleteFormation(collaborateur.maia, button.dataset.id);
      } catch (error) {
        alert(error.message || "Suppression impossible.");
      }
    });
  });

  container.querySelectorAll('[data-action="edit-entretien"]').forEach((button) => {
    button.addEventListener("click", () => {
      const item = collaborateur.entretiens.find((entretien) => entretien.id === button.dataset.id);
      if (!item) {
        return;
      }
      openEditPrompt(
        item,
        [
          { key: "type", label: "Type (annuel, professionnel, point_intermediaire)" },
          { key: "datePrevue", label: "Date prevue (YYYY-MM-DD)" },
          { key: "dateRealisee", label: "Date realisee (YYYY-MM-DD)" },
          { key: "statut", label: "Statut (a_prevoir, planifie, realise, en_retard)" },
          { key: "commentaire", label: "Commentaire" }
        ],
        (payload) => handlers.onUpdateEntretien(collaborateur.maia, item.id, payload)
      );
    });
  });

  container.querySelectorAll('[data-action="delete-entretien"]').forEach((button) => {
    button.addEventListener("click", () => {
      if (!confirm("Supprimer cet entretien ?")) {
        return;
      }
      try {
        handlers.onDeleteEntretien(collaborateur.maia, button.dataset.id);
      } catch (error) {
        alert(error.message || "Suppression impossible.");
      }
    });
  });

  container.querySelectorAll('[data-action="edit-rappel"]').forEach((button) => {
    button.addEventListener("click", () => {
      const item = collaborateur.rappelsManager.find((rappel) => rappel.id === button.dataset.id);
      if (!item) {
        return;
      }
      openEditPrompt(
        item,
        [
          { key: "titre", label: "Titre" },
          { key: "description", label: "Description" },
          { key: "dateCible", label: "Date cible (YYYY-MM-DD)" },
          { key: "priorite", label: "Priorite (basse, normale, haute)" },
          { key: "statut", label: "Statut (a_faire, en_cours, termine)" }
        ],
        (payload) => handlers.onUpdateRappel(collaborateur.maia, item.id, payload)
      );
    });
  });

  container.querySelectorAll('[data-action="delete-rappel"]').forEach((button) => {
    button.addEventListener("click", () => {
      if (!confirm("Supprimer ce rappel ?")) {
        return;
      }
      try {
        handlers.onDeleteRappel(collaborateur.maia, button.dataset.id);
      } catch (error) {
        alert(error.message || "Suppression impossible.");
      }
    });
  });
}

export function renderCollaborateurDetailView(container, options) {
  const { collaborateur, onBack } = options;
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

  const uiState = getUiState(collaborateur.maia);
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
    <div class="action-row">
      <button class="button-link detail-back" type="button" id="back-list">Retour</button>
      ${uiState.editIdentity ? "" : '<button class="button-link" type="button" id="toggle-edit-identity">Modifier</button>'}
      <button class="button-link button-danger-soft" type="button" id="delete-collaborateur">Supprimer</button>
    </div>
  `;
  head.querySelector("#back-list")?.addEventListener("click", onBack);

  const grid = document.createElement("div");
  grid.className = "detail-grid";
  grid.innerHTML = `
    <div class="stack">
      ${renderIdentityBlock(collaborateur, uiState.editIdentity)}
      ${renderNotesSection(collaborateur)}
    </div>
    <div class="stack">
      ${renderMaterielSection(collaborateur)}
      ${renderFormationsSection(collaborateur)}
      ${renderEntretiensSection(collaborateur)}
      ${renderRappelsSection(collaborateur)}
    </div>
  `;

  wrapper.append(head, grid);
  container.appendChild(wrapper);

  bindIdentityActions(container, collaborateur, uiState, {
    onDeleteCollaborateur: options.onDeleteCollaborateur,
    onUpdateCollaborateur: options.onUpdateCollaborateur,
    rerender: () => renderCollaborateurDetailView(container, options)
  });
  bindMaterielAndNotes(container, collaborateur, {
    onUpdateMateriel: options.onUpdateMateriel,
    onUpdateNotes: options.onUpdateNotes
  });
  bindCollectionActions(container, collaborateur, {
    onAddFormation: options.onAddFormation,
    onUpdateFormation: options.onUpdateFormation,
    onDeleteFormation: options.onDeleteFormation,
    onAddEntretien: options.onAddEntretien,
    onUpdateEntretien: options.onUpdateEntretien,
    onDeleteEntretien: options.onDeleteEntretien,
    onAddRappel: options.onAddRappel,
    onUpdateRappel: options.onUpdateRappel,
    onDeleteRappel: options.onDeleteRappel
  });
}
