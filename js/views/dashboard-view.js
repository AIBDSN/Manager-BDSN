import { createKpiCard } from "../components/kpi-card.js";

function getDashboardMetrics(state) {
  const collaborateurs = state.collaborateurs;
  const rappels = collaborateurs.reduce((total, item) => total + item.rappelsManager.filter((r) => !r.done).length, 0);
  const formationsAprevoir = collaborateurs.reduce(
    (total, item) => total + item.formations.filter((f) => f.status === "a_prevoir").length,
    0
  );
  const materielManquant = collaborateurs.filter((item) => !item.telephone || !item.tablette).length;

  return {
    totalCollaborateurs: collaborateurs.length,
    rappels,
    formationsAprevoir,
    materielManquant
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
      description: "Effectif total charge dans l'application"
    }),
    createKpiCard({
      title: "Rappels en attente",
      value: metrics.rappels,
      description: "Actions manager non finalisees",
      tone: metrics.rappels > 0 ? "warning" : "default"
    }),
    createKpiCard({
      title: "Formations a prevoir",
      value: metrics.formationsAprevoir,
      description: "Demandes identifiees non programmees",
      tone: metrics.formationsAprevoir > 0 ? "warning" : "default"
    }),
    createKpiCard({
      title: "Materiel manquant",
      value: metrics.materielManquant,
      description: "Telephone ou tablette non renseignes",
      tone: metrics.materielManquant > 0 ? "danger" : "default"
    })
  ];

  cards.forEach((card) => grid.appendChild(card));

  const actions = document.createElement("section");
  actions.className = "section-card";
  actions.innerHTML = `
    <div class="section-title">Acces rapides</div>
    <div class="row-between">
      <p class="muted">Acceder au suivi collaborateur detaille.</p>
      <button type="button" class="button-link" id="goto-collaborateurs">Ouvrir les collaborateurs</button>
    </div>
  `;

  actions.querySelector("#goto-collaborateurs")?.addEventListener("click", () => onNavigate("/collaborateurs"));

  container.append(grid, actions);
}
