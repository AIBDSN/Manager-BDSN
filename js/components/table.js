export function renderTable(container, { columns, rows, rowKey, emptyMessage = "Aucune donnee", onRowClick }) {
  container.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.className = "table-wrap";

  const table = document.createElement("table");
  table.className = "table";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.label;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");

  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns.length;
    td.className = "muted";
    td.textContent = emptyMessage;
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.dataset.key = String(row[rowKey]);

      columns.forEach((column) => {
        const td = document.createElement("td");
        const value = typeof column.render === "function" ? column.render(row) : row[column.key];
        if (value instanceof Node) {
          td.appendChild(value);
        } else {
          td.textContent = value ?? "";
        }
        tr.appendChild(td);
      });

      if (typeof onRowClick === "function") {
        tr.addEventListener("click", () => onRowClick(row));
      }

      tbody.appendChild(tr);
    });
  }

  table.append(thead, tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);
}
