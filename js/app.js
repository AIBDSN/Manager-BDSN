import { initRouter, navigate } from "./router.js";
import { getState, subscribe, updateSearchTerm, getCollaborateurByMaia } from "./state.js";
import { renderSidebar } from "./components/sidebar.js";
import { renderTopbar } from "./components/topbar.js";
import { renderDashboardView } from "./views/dashboard-view.js";
import { renderCollaborateursView } from "./views/collaborateurs-view.js";
import { renderCollaborateurDetailView } from "./views/collaborateur-detail-view.js";

const sidebarHost = document.querySelector("#sidebar");
const topbarHost = document.querySelector("#topbar");
const viewHost = document.querySelector("#view");

let currentRoute = {
  name: "dashboard",
  params: {},
  path: "/dashboard"
};

function getTopbarConfig(route) {
  if (route.name === "collaborateurs") {
    return {
      title: "Collaborateurs",
      subtitle: "Suivi annuel equipe PMRI"
    };
  }

  if (route.name === "collaborateur-detail") {
    const collaborateur = getCollaborateurByMaia(route.params.maia);
    return {
      title: collaborateur ? collaborateur.salarie : "Fiche collaborateur",
      subtitle: "Identite, materiel, formations, entretiens, rappels et notes"
    };
  }

  return {
    title: "Dashboard",
    subtitle: "Vue manager locale - pilotage global"
  };
}

function renderRoute(route) {
  currentRoute = route;

  const state = getState();

  renderSidebar(sidebarHost, {
    activeRoute: route.path,
    onNavigate: navigate,
    version: state.version
  });

  const topbarConfig = getTopbarConfig(route);
  renderTopbar(topbarHost, {
    ...topbarConfig,
    version: state.version
  });

  if (route.name === "collaborateurs") {
    renderCollaborateursView(viewHost, {
      state,
      onSearchChange: (value) => updateSearchTerm(value),
      onOpenDetail: (maia) => navigate(`/collaborateurs/${encodeURIComponent(maia)}`)
    });
    return;
  }

  if (route.name === "collaborateur-detail") {
    renderCollaborateurDetailView(viewHost, {
      collaborateur: getCollaborateurByMaia(route.params.maia),
      onBack: () => navigate("/collaborateurs")
    });
    return;
  }

  renderDashboardView(viewHost, {
    state,
    onNavigate: navigate
  });
}

subscribe(() => {
  renderRoute(currentRoute);
});

initRouter(renderRoute);
