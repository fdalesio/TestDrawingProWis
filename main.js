// main.js
import { renderWellSurfaceSvg } from "./svg-well.js";

// Carica il tuo JSON (stesso schema del file che hai caricato) 
const resp = await fetch("./well_data.json");
const wellData = await resp.json();

// Render
const svg = renderWellSurfaceSvg(wellData, {
  scale: 1.0,
  showLabels: true,
  fontSize: 11,
});

// Inserisce lo SVG in pagina
document.getElementById("app").innerHTML = svg;

// Pulsante per scaricare lo SVG
document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([document.getElementById("app").innerHTML], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: (wellData?.name || "well") + "_surface.svg" });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
});