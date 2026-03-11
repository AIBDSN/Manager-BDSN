import { TEAM_SEED } from "./data/team-seed.js";
import { loadState, saveState } from "./storage.js";

const listeners = new Set();

const defaultState = {
  version: "V2.0.0",
  collaborateurs: TEAM_SEED.map(extendCollaborateur),
  ui: {
    searchTerm: ""
  }
};

let state = hydrateState();

function extendCollaborateur(item) {
  return {
    ...item,
    materiel: {
      telephone: item.telephone || "",
      tablette: item.tablette || ""
    },
    formations: item.formations || [],
    entretiens: item.entretiens || [],
    rappelsManager: item.rappelsManager || [],
    notes: item.notes || []
  };
}

function hydrateState() {
  const stored = loadState();
  if (!stored || !Array.isArray(stored.collaborateurs)) {
    return defaultState;
  }

  return {
    version: "V2.0.0",
    collaborateurs: stored.collaborateurs.map(extendCollaborateur),
    ui: {
      searchTerm: stored.ui?.searchTerm || ""
    }
  };
}

function emitChange() {
  listeners.forEach((listener) => listener(state));
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
  saveState(state);
  emitChange();
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
