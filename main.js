// main.js
import { renderWellSurfaceSvg, mountValveBalloon } from "./svg-well.js";

const appEl = document.getElementById("app");
let wellData = null;

async function loadAndRender(file) {
  const resp = await fetch(`./${file}`);
  wellData = await resp.json();
  const svg = renderWellSurfaceSvg(wellData, {
    scale: 1.0,
    showLabels: true,
    fontSize: 11,
  });
  appEl.innerHTML = svg;
}

// Initial load; mount balloon once on the stable container (event delegation)
await loadAndRender("well_data.json");
mountValveBalloon(appEl);

// Well selector
document.getElementById("wellSelect").addEventListener("change", (e) => {
  loadAndRender(e.target.value);
});

// Download button
document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([appEl.innerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href: url,
    download: (wellData?.name || "well") + "_surface.svg",
  });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});
