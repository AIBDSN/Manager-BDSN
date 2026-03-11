export function createKpiCard({ title, value, description, tone = "default" }) {
  const card = document.createElement("article");
  const toneClass = tone === "warning" ? "kpi-warning" : tone === "danger" ? "kpi-danger" : "";
  card.className = `kpi-card ${toneClass}`.trim();

  const titleNode = document.createElement("div");
  titleNode.className = "kpi-title";
  titleNode.textContent = title;

  const valueNode = document.createElement("div");
  valueNode.className = "kpi-value";
  valueNode.textContent = String(value);

  const descriptionNode = document.createElement("div");
  descriptionNode.className = "kpi-description";
  descriptionNode.textContent = description;

  card.append(titleNode, valueNode, descriptionNode);
  return card;
}
