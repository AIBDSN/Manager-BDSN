export function getCurrentPath() {
  const hash = window.location.hash || "#/dashboard";
  return hash.replace(/^#/, "");
}

export function navigate(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const nextHash = `#${normalizedPath}`;

  if (window.location.hash === nextHash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }

  window.location.hash = nextHash;
}

function matchRoute(path) {
  if (path === "/" || path === "/dashboard") {
    return { name: "dashboard", params: {} };
  }

  if (path === "/collaborateurs") {
    return { name: "collaborateurs", params: {} };
  }

  const detailMatch = path.match(/^\/collaborateurs\/([^/]+)$/);
  if (detailMatch) {
    return {
      name: "collaborateur-detail",
      params: {
        maia: decodeURIComponent(detailMatch[1])
      }
    };
  }

  return { name: "dashboard", params: {} };
}

export function initRouter(onRouteChange) {
  const applyRoute = () => {
    const path = getCurrentPath();
    const route = matchRoute(path);
    onRouteChange({
      ...route,
      path
    });
  };

  window.addEventListener("hashchange", applyRoute);
  applyRoute();
}
