import { initRouter, navigate } from "./router.js";
import {
  addCollaborateur,
  addEntretien,
  addFormation,
  addRappel,
  getState,
  subscribe,
  updateSearchTerm,
  getCollaborateurByMaia,
  removeCollaborateur,
  removeEntretien,
  removeFormation,
  removeRappel,
  updateCollaborateur,
  updateEntretien,
  updateFormation,
  updateMateriel,
  updateNotes,
  updateRappel
} from "./state.js";
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
      subtitle: "Suivi annuel equipe BDSN"
    };
  }

  if (route.name === "collaborateur-detail") {
    const collaborateur = getCollaborateurByMaia(route.params.maia);
    return {
      title: "Fiche collaborateur",
      subtitle: collaborateur ? `MAIA ${collaborateur.maia} - NNI ${collaborateur.nniSimplifie}` : "Acces detail collaborateur"
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
      onOpenDetail: (maia) => navigate(`/collaborateurs/${encodeURIComponent(maia)}`),
      onAddCollaborateur: (payload) => {
        const newMaia = addCollaborateur(payload);
        navigate(`/collaborateurs/${encodeURIComponent(newMaia)}`);
      }
    });
    return;
  }

  if (route.name === "collaborateur-detail") {
    renderCollaborateurDetailView(viewHost, {
      collaborateur: getCollaborateurByMaia(route.params.maia),
      onBack: () => navigate("/collaborateurs"),
      onDeleteCollaborateur: (maia) => {
        removeCollaborateur(maia);
        navigate("/collaborateurs");
      },
      onUpdateCollaborateur: (maia, payload) => {
        const updatedMaia = updateCollaborateur(maia, payload);
        navigate(`/collaborateurs/${encodeURIComponent(updatedMaia)}`);
      },
      onUpdateMateriel: (maia, payload) => updateMateriel(maia, payload),
      onUpdateNotes: (maia, notes) => updateNotes(maia, notes),
      onAddFormation: (maia, payload) => addFormation(maia, payload),
      onUpdateFormation: (maia, id, payload) => updateFormation(maia, id, payload),
      onDeleteFormation: (maia, id) => removeFormation(maia, id),
      onAddEntretien: (maia, payload) => addEntretien(maia, payload),
      onUpdateEntretien: (maia, id, payload) => updateEntretien(maia, id, payload),
      onDeleteEntretien: (maia, id) => removeEntretien(maia, id),
      onAddRappel: (maia, payload) => addRappel(maia, payload),
      onUpdateRappel: (maia, id, payload) => updateRappel(maia, id, payload),
      onDeleteRappel: (maia, id) => removeRappel(maia, id)
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
