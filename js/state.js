import { TEAM_SEED } from "./data/team-seed.js";
import { loadState, saveState } from "./storage.js";

const APP_VERSION = "V2.1.0";
const listeners = new Set();

function createId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function toText(value) {
  return (value || "").toString().trim();
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeFormation(item) {
  return {
    id: item?.id || createId("for"),
    libelle: toText(item?.libelle || item?.formation),
    statut: toText(item?.statut) || "a_prevoir",
    datePrevue: toText(item?.datePrevue),
    dateRealisee: toText(item?.dateRealisee),
    echeance: toText(item?.echeance),
    commentaire: toText(item?.commentaire)
  };
}

function normalizeEntretien(item) {
  return {
    id: item?.id || createId("ent"),
    type: toText(item?.type) || "annuel",
    datePrevue: toText(item?.datePrevue),
    dateRealisee: toText(item?.dateRealisee),
    statut: toText(item?.statut) || "a_prevoir",
    commentaire: toText(item?.commentaire)
  };
}

function normalizeRappel(item) {
  return {
    id: item?.id || createId("rap"),
    titre: toText(item?.titre || item?.title),
    description: toText(item?.description),
    dateCible: toText(item?.dateCible),
    priorite: toText(item?.priorite) || "normale",
    statut: toText(item?.statut || (item?.done ? "termine" : "a_faire")) || "a_faire"
  };
}

function normalizeNotes(value) {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  return "";
}

function normalizeCollaborateur(item) {
  const telephone = toText(item?.telephone || item?.materiel?.telephone);
  const tablette = toText(item?.tablette || item?.materiel?.tablette);

  return {
    salarie: toText(item?.salarie),
    nom: toText(item?.nom),
    prenom: toText(item?.prenom),
    maia: toText(item?.maia),
    nni: toText(item?.nni),
    nniSimplifie: toText(item?.nniSimplifie),
    poste: toText(item?.poste),
    site: toText(item?.site),
    pole: toText(item?.pole),
    statut: toText(item?.statut),
    telephone,
    tablette,
    mail: toText(item?.mail),
    manager: toText(item?.manager),
    materiel: {
      telephone,
      tablette,
      equipementsAdditionnels: toText(item?.materiel?.equipementsAdditionnels),
      commentaire: toText(item?.materiel?.commentaire)
    },
    formations: toArray(item?.formations).map(normalizeFormation),
    entretiens: toArray(item?.entretiens).map(normalizeEntretien),
    rappelsManager: toArray(item?.rappelsManager).map(normalizeRappel),
    notes: normalizeNotes(item?.notes),
    links: {
      outilFormation: toText(item?.links?.outilFormation)
    }
  };
}

function withDefaults(collaborateurs = TEAM_SEED) {
  return collaborateurs.map(normalizeCollaborateur).filter((item) => item.maia);
}

const defaultState = {
  version: APP_VERSION,
  collaborateurs: withDefaults(),
  ui: {
    searchTerm: ""
  },
  meta: {
    importReady: true,
    remoteStorageReady: false
  }
};

function hydrateState() {
  const stored = loadState();
  if (!stored || !Array.isArray(stored.collaborateurs)) {
    return defaultState;
  }

  return {
    version: APP_VERSION,
    collaborateurs: withDefaults(stored.collaborateurs),
    ui: {
      searchTerm: stored.ui?.searchTerm || ""
    },
    meta: {
      importReady: true,
      remoteStorageReady: false
    }
  };
}

let state = hydrateState();

function emitChange() {
  listeners.forEach((listener) => listener(state));
}

function persistAndEmit() {
  saveState(state);
  emitChange();
}

function ensureUnique(maia, nniSimplifie, ignoreMaia = "") {
  const maiaFound = state.collaborateurs.some((item) => item.maia === maia && item.maia !== ignoreMaia);
  if (maiaFound) {
    throw new Error("La cle MAIA existe deja.");
  }

  if (!nniSimplifie) {
    return;
  }
  const nniFound = state.collaborateurs.some(
    (item) => item.nniSimplifie === nniSimplifie && item.maia !== ignoreMaia
  );
  if (nniFound) {
    throw new Error("La cle NNI simplifie existe deja.");
  }
}

function updateCollection(maia, key, updater) {
  const current = getCollaborateurByMaia(maia);
  if (!current) {
    throw new Error("Collaborateur introuvable.");
  }
  const updated = updater(current[key]);
  updateCollaborateur(maia, { [key]: updated });
}

export function getState() {
  return state;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setState(updater) {
  state = typeof updater === "function" ? updater(state) : updater;
  persistAndEmit();
}

export function updateSearchTerm(searchTerm) {
  setState((prevState) => ({
    ...prevState,
    ui: {
      ...prevState.ui,
      searchTerm
    }
  }));
}

export function getCollaborateurByMaia(maia) {
  return state.collaborateurs.find((collaborateur) => collaborateur.maia === maia) || null;
}

export function addCollaborateur(payload) {
  const candidate = normalizeCollaborateur(payload);
  if (!candidate.maia || !candidate.salarie || !candidate.nom || !candidate.prenom || !candidate.nniSimplifie) {
    throw new Error("Les champs salarie, nom, prenom, MAIA et NNI simplifie sont obligatoires.");
  }
  ensureUnique(candidate.maia, candidate.nniSimplifie);

  state = {
    ...state,
    collaborateurs: [...state.collaborateurs, candidate]
  };
  persistAndEmit();
  return candidate.maia;
}

export function updateCollaborateur(maia, updates) {
  const current = getCollaborateurByMaia(maia);
  if (!current) {
    throw new Error("Collaborateur introuvable.");
  }

  const merged = normalizeCollaborateur({
    ...current,
    ...updates,
    materiel: {
      ...current.materiel,
      ...updates?.materiel
    }
  });

  if (!merged.maia || !merged.salarie || !merged.nom || !merged.prenom || !merged.nniSimplifie) {
    throw new Error("Les champs salarie, nom, prenom, MAIA et NNI simplifie sont obligatoires.");
  }

  ensureUnique(merged.maia, merged.nniSimplifie, maia);

  state = {
    ...state,
    collaborateurs: state.collaborateurs.map((item) => (item.maia === maia ? merged : item))
  };
  persistAndEmit();
  return merged.maia;
}

export function removeCollaborateur(maia) {
  const before = state.collaborateurs.length;
  state = {
    ...state,
    collaborateurs: state.collaborateurs.filter((item) => item.maia !== maia)
  };
  if (state.collaborateurs.length === before) {
    throw new Error("Collaborateur introuvable.");
  }
  persistAndEmit();
}

export function updateMateriel(maia, payload) {
  const current = getCollaborateurByMaia(maia);
  if (!current) {
    throw new Error("Collaborateur introuvable.");
  }
  const nextMateriel = {
    ...current.materiel,
    ...payload
  };
  updateCollaborateur(maia, {
    telephone: toText(nextMateriel.telephone),
    tablette: toText(nextMateriel.tablette),
    materiel: nextMateriel
  });
}

export function updateNotes(maia, notes) {
  updateCollaborateur(maia, { notes: toText(notes) });
}

export function addFormation(maia, payload) {
  const formation = normalizeFormation(payload);
  updateCollection(maia, "formations", (current) => [...toArray(current), formation]);
}

export function updateFormation(maia, formationId, payload) {
  updateCollection(maia, "formations", (current) =>
    toArray(current).map((item) => (item.id === formationId ? normalizeFormation({ ...item, ...payload, id: item.id }) : item))
  );
}

export function removeFormation(maia, formationId) {
  updateCollection(maia, "formations", (current) => toArray(current).filter((item) => item.id !== formationId));
}

export function addEntretien(maia, payload) {
  const entretien = normalizeEntretien(payload);
  updateCollection(maia, "entretiens", (current) => [...toArray(current), entretien]);
}

export function updateEntretien(maia, entretienId, payload) {
  updateCollection(maia, "entretiens", (current) =>
    toArray(current).map((item) => (item.id === entretienId ? normalizeEntretien({ ...item, ...payload, id: item.id }) : item))
  );
}

export function removeEntretien(maia, entretienId) {
  updateCollection(maia, "entretiens", (current) => toArray(current).filter((item) => item.id !== entretienId));
}

export function addRappel(maia, payload) {
  const rappel = normalizeRappel(payload);
  if (!rappel.titre) {
    throw new Error("Le titre du rappel est obligatoire.");
  }
  updateCollection(maia, "rappelsManager", (current) => [...toArray(current), rappel]);
}

export function updateRappel(maia, rappelId, payload) {
  updateCollection(maia, "rappelsManager", (current) =>
    toArray(current).map((item) => (item.id === rappelId ? normalizeRappel({ ...item, ...payload, id: item.id }) : item))
  );
}

export function removeRappel(maia, rappelId) {
  updateCollection(maia, "rappelsManager", (current) => toArray(current).filter((item) => item.id !== rappelId));
}
