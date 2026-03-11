const STORAGE_KEY = "manager-pmri-vlg-v2-state";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.warn("[storage] Lecture impossible:", error);
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("[storage] Sauvegarde impossible:", error);
  }
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
