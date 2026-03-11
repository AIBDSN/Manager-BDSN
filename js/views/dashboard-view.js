import { createKpiCard } from "../components/kpi-card.js";

function getDashboardMetrics(state) {
  const today = new Date().toISOString().slice(0, 10);
  const collaborateurs = state.collaborateurs;

  const rappelsAFaire = collaborateurs.reduce(
    (total, item) =>
      total + item.rappelsManager.filter((rappel) => rappel.statut === "a_faire" || rappel.statut === "en_cours").length,
    0
  );

  const formationsAprevoir = collaborateurs.reduce(
    (total, item) => total + item.formations.filter((formation) => formation.statut === "a_prevoir").length,
    0
  );

  const materielIncomplet = collaborateurs.filter(
    (item) => !item.materiel?.telephone || !item.materiel?.tablette
  ).length;

  const entretiensAVenir = collaborateurs.reduce(
    (total, item) =>
      total +
      item.entretiens.filter(
        (entretien) =>
          entretien.statut !== "realise" &&
          entretien.datePrevue &&
          entretien.datePrevue >= today
      ).length,
    0
  );

  return {
    totalCollaborateurs: collaborateurs.length,
    rappelsAFaire,
    formationsAprevoir,
    materielIncomplet,
    entretiensAVenir
  };
}

export function renderDashboardView(container, { state, onNavigate }) {
  container.innerHTML = "";

  const metrics = getDashboardMetrics(state);

  const grid = document.createElement("section");
  grid.className = "grid-cards";

  const cards = [
    createKpiCard({
      title: "Nombre de collaborateurs",
      value: metrics.totalCollaborateurs,
      description: "Effectif total suivi dans l'application"
    }),
    createKpiCard({
      title: "Rappels a faire",
      value: metrics.rappelsAFaire,
      description: "Rappels en cours ou a traiter",
      tone: metrics.rappelsAFaire > 0 ? "warning" : "default"
    }),
    createKpiCard({
      title: "Formations a prevoir",
      value: metrics.formationsAprevoir,
      description: "Formations non planifiees",
      tone: metrics.formationsAprevoir > 0 ? "warning" : "default"
    }),
    createKpiCard({
      title: "Materiel incomplet",
      value: metrics.materielIncomplet,
      description: "Telephone ou tablette manquants",
      tone: metrics.materielIncomplet > 0 ? "danger" : "default"
    }),
    createKpiCard({
      title: "Entretiens a venir",
      value: metrics.entretiensAVenir,
      description: "Entretiens prevus non realises"
    })
  ];

  cards.forEach((card) => grid.appendChild(card));

  const actions = document.createElement("section");
  actions.className = "section-card";
  actions.innerHTML = `
    <div class="section-title">Acces rapides</div>
    <div class="row-between">
      <p class="muted">Ouvrir la gestion des collaborateurs et leurs suivis.</p>
      <button type="button" class="button-link" id="goto-collaborateurs">Ouvrir les collaborateurs</button>
    </div>
  `;

  actions.querySelector("#goto-collaborateurs")?.addEventListener("click", () => onNavigate("/collaborateurs"));

  container.append(grid, actions);
}
