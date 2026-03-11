import { renderTable } from "../components/table.js";

const SEARCH_FIELDS = ["salarie", "nom", "prenom", "maia", "nniSimplifie"];

function normalize(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterRows(collaborateurs, term) {
  if (!term) {
    return collaborateurs;
  }

  const query = normalize(term.trim());
  return collaborateurs.filter((collaborateur) =>
    SEARCH_FIELDS.some((field) => normalize(collaborateur[field]).includes(query))
  );
}

function renderSalarieCell(row) {
  const cell = document.createElement("div");
  cell.className = "salarie-cell";

  const primary = document.createElement("div");
  primary.className = "salarie-primary";
  primary.textContent = row.salarie;

  const secondary = document.createElement("div");
  secondary.className = "salarie-secondary";
  secondary.textContent = `${row.poste || "Poste non renseigne"} - ${row.site || "Site non renseigne"}`;

  cell.append(primary, secondary);
  return cell;
}

function createInput(name, label, required = false) {
  const wrap = document.createElement("label");
  wrap.className = "field";
  wrap.innerHTML = `<span class="field-label">${label}</span>`;

  const input = document.createElement("input");
  input.className = "input-search";
  input.type = "text";
  input.name = name;
  input.required = required;

  wrap.appendChild(input);
  return wrap;
}

function createAddForm(onSubmit) {
  const form = document.createElement("form");
  form.className = "section-card stack add-form";
  form.innerHTML = `
    <div class="section-title">Ajouter un collaborateur</div>
    <div class="form-grid"></div>
    <div class="row-between">
      <p class="muted">Champs obligatoires: salarie, nom, prenom, MAIA et NNI simplifie.</p>
      <button type="submit" class="button-link">Creer</button>
    </div>
  `;

  const grid = form.querySelector(".form-grid");
  const fields = [
    createInput("salarie", "Salarie", true),
    createInput("nom", "Nom", true),
    createInput("prenom", "Prenom", true),
    createInput("maia", "MAIA", true),
    createInput("nniSimplifie", "NNI simplifie", true),
    createInput("poste", "Poste"),
    createInput("pole", "Pole"),
    createInput("site", "Site"),
    createInput("statut", "Statut"),
    createInput("telephone", "Telephone"),
    createInput("tablette", "Tablette"),
    createInput("mail", "Mail"),
    createInput("manager", "Manager")
  ];
  fields.forEach((field) => grid.appendChild(field));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    try {
      onSubmit(payload);
      form.reset();
    } catch (error) {
      alert(error.message || "Creation impossible.");
    }
  });

  return form;
}

export function renderCollaborateursView(container, { state, onSearchChange, onOpenDetail, onAddCollaborateur }) {
  container.innerHTML = "";

  const wrapper = document.createElement("section");
  wrapper.className = "stack";

  const top = document.createElement("div");
  top.className = "section-card stack search-panel";

  const row = document.createElement("div");
  row.className = "row-between";

  const search = document.createElement("input");
  search.className = "input-search";
  search.type = "search";
  search.placeholder = "Recherche: salarie, nom, prenom, MAIA, NNI simplifie";
  search.value = state.ui.searchTerm;
  search.addEventListener("input", (event) => onSearchChange(event.target.value));

  const filteredRows = filterRows(state.collaborateurs, state.ui.searchTerm);

  const counter = document.createElement("span");
  counter.className = "tag tag-soft";
  counter.textContent = `${filteredRows.length} resultat(s)`;

  row.append(search, counter);

  const help = document.createElement("p");
  help.className = "muted";
  help.textContent = "Cliquez sur une ligne pour ouvrir la fiche collaborateur.";

  const addButtonRow = document.createElement("div");
  addButtonRow.className = "row-between";
  addButtonRow.innerHTML = `
    <p class="muted">Creation rapide d'un collaborateur.</p>
    <button type="button" class="button-link" id="toggle-add-form">Ajouter un collaborateur</button>
  `;

  top.append(row, help, addButtonRow);

  const addForm = createAddForm(onAddCollaborateur);
  addForm.hidden = true;
  top.querySelector("#toggle-add-form")?.addEventListener("click", () => {
    addForm.hidden = !addForm.hidden;
  });

  const tableHost = document.createElement("div");
  renderTable(tableHost, {
    columns: [
      { key: "salarie", label: "Collaborateur", render: renderSalarieCell },
      { key: "maia", label: "MAIA" },
      { key: "nniSimplifie", label: "NNI simplifie" },
      { key: "poste", label: "Poste" },
      { key: "pole", label: "Pole" },
      { key: "statut", label: "Statut" }
    ],
    rows: filteredRows,
    rowKey: "maia",
    emptyMessage: "Aucun collaborateur trouve.",
    onRowClick: (rowData) => onOpenDetail(rowData.maia)
  });

  wrapper.append(top, addForm, tableHost);
  container.appendChild(wrapper);
}
