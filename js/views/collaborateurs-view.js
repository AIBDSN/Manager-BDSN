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

export function renderCollaborateursView(container, { state, onSearchChange, onOpenDetail }) {
  container.innerHTML = "";

  const wrapper = document.createElement("section");
  wrapper.className = "stack";

  const top = document.createElement("div");
  top.className = "section-card stack";

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
  counter.className = "tag";
  counter.textContent = `${filteredRows.length} resultat(s)`;

  row.append(search, counter);

  const help = document.createElement("p");
  help.className = "muted";
  help.textContent = "Cliquez sur une ligne pour ouvrir la fiche collaborateur.";

  top.append(row, help);

  const tableHost = document.createElement("div");
  renderTable(tableHost, {
    columns: [
      { key: "salarie", label: "Salarie" },
      { key: "maia", label: "MAIA" },
      { key: "nniSimplifie", label: "NNI simplifie" },
      { key: "poste", label: "Poste" },
      { key: "pole", label: "Pole" },
      { key: "statut", label: "Statut" }
    ],
    rows: filteredRows,
    rowKey: "maia",
    emptyMessage: "Aucun collaborateur trouve.",
    onRowClick: (row) => onOpenDetail(row.maia)
  });

  wrapper.append(top, tableHost);
  container.appendChild(wrapper);
}
