// svg-well.js
// Libreria SVG modulare per wellhead & xmas tree
// Tutte le funzioni ritornano stringhe SVG. Il renderer principale ritorna l'<svg> completo.

// ---------- Utility ----------
const THEME = {
  pipe: "#374151",
  body: "#9CA3AF",
  flange: "#6B7280",
  manualValve: "#2563EB",
  hydraulicValve: "#059669",
  killValve: "#DC2626",
  annulusValve: "#7C3AED",
  stroke: "#111827",
  text: "#111827",
  bg: "transparent",
};
const defaultOpts = { scale: 1.0, strokeWidth: 1.5, fontSize: 11, showLabels: true, theme: THEME };

const svgEl = (tag, attrs = {}, children = "") =>
  `<${tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${String(v).replace(/"/g,"&quot;")}"`).join(" ")}>${children}</${tag}>`;
const svgSelf = (tag, attrs = {}) =>
  `<${tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${String(v).replace(/"/g,"&quot;")}"`).join(" ")} />`;
const group = (x,y,content) => svgEl("g", { transform:`translate(${x} ${y})` }, content);
const label = (text,x,y,opts={}) => svgEl("text", {
  x, y,
  "font-family":"Inter, system-ui, Segoe UI, sans-serif",
  "font-size": opts.size ?? 11,
  "font-weight": opts.weight ?? "400",
  "text-anchor": opts.anchor ?? "start",
  "dominant-baseline": "middle",
  fill: opts.color ?? THEME.text
}, text);

// ---------- Primitive ----------
function pipeVertical({ height=80, bore=12, color=THEME.pipe } = {}) {
  return svgSelf("rect", { x: -bore/2, y: 0, width: bore, height, fill: color, rx: bore/2, ry: bore/2 });
}
function pipeHorizontal({ width=120, bore=12, color=THEME.pipe } = {}) {
  const w = Math.abs(width), sign = Math.sign(width) || 1;
  return group(sign < 0 ? -w : 0, 0, svgSelf("rect", { x: 0, y: -bore/2, width: w, height: bore, fill: color, rx: bore/2, ry: bore/2 }));
}
function flange({ outer=26, inner=12, thickness=10, body=THEME.flange }) {
  const r1 = outer/2, r2 = inner/2;
  return [
    svgSelf("circle", { cx: 0, cy: thickness/2, r: r1, fill: body }),
    svgSelf("circle", { cx: 0, cy: thickness/2, r: r2, fill: THEME.pipe })
  ].join("");
}
function wellheadBody({ height=100, width=70, color=THEME.body }) {
  return [
    svgSelf("rect", { x:-width/2, y:0, width, height, fill: color, rx:8, ry:8, stroke: THEME.stroke, "stroke-width": 1 }),
    flange({ outer: width+20, inner: 14, thickness: 12 }),
  ].join("");
}
function xmasTreeBody({ height=160, width=60, color=THEME.body }) {
  const cross = 28;
  return [
    svgSelf("rect", { x:-width/2, y:0, width, height, fill: color, rx:8, ry:8, stroke: THEME.stroke, "stroke-width": 1 }),
    svgSelf("rect", { x:-width,   y:height*0.50 - cross/2, width: width*2, height: cross, fill: color, rx:8, ry:8, stroke: THEME.stroke, "stroke-width": 1 }),
  ].join("");
}
function gateValveManual({ width=60, height=26, color=THEME.manualValve }) {
  return [
    svgSelf("rect", { x:-width/2, y:-height/2, width, height, fill: color, rx:6, ry:6, stroke: THEME.stroke, "stroke-width": 1 }),
    svgSelf("rect", { x:-2, y:-height/2 - (height*0.55), width:4, height: height*0.55, fill: THEME.stroke }),
    svgSelf("circle", { cx:0, cy:-height*0.7, r:10, fill:"none", stroke: THEME.stroke, "stroke-width": 2 }),
    svgSelf("line", { x1:-6, y1:-height*0.7, x2:6, y2:-height*0.7, stroke: THEME.stroke, "stroke-width": 2 }),
    svgSelf("line", { x1:0, y1:-height*0.7-6, x2:0, y2:-height*0.7+6, stroke: THEME.stroke, "stroke-width": 2 }),
  ].join("");
}
function gateValveHydraulic({ width=60, height=26, color=THEME.hydraulicValve }) {
  return [
    svgSelf("rect", { x:-width/2, y:-height/2, width, height, fill: color, rx:6, ry:6, stroke: THEME.stroke, "stroke-width": 1 }),
    svgSelf("rect", { x:-width*0.25, y:-height/2 - 14, width: width*0.5, height: 14, fill: "#10B981", stroke: THEME.stroke, "stroke-width": 1, rx:3, ry:3 }),
  ].join("");
}

// ---------- Helpers semantici ----------
const isHydraulic = (code) => code === "uppermaster" || code === "hydrowing";
const isKill      = (code) => code === "kill";
const isAnnulus   = (code) => code === "annulusa" || code === "annulusb";
function valveGlyph(typeCode, opts={}) {
  if (isHydraulic(typeCode)) return gateValveHydraulic(opts);
  if (isKill(typeCode))      return gateValveManual({ ...opts, color: THEME.killValve });
  if (isAnnulus(typeCode))   return gateValveManual({ ...opts, color: THEME.annulusValve });
  return gateValveManual(opts);
}
function valveLabel(valve) {
  const dim = valve?.valvedata?.dimension ? ` ${String(valve.valvedata.dimension).replace(/"/g,"″")}` : "";
  const wp  = valve?.valvedata?.working_pressure ? ` · ${valve.valvedata.working_pressure} psi` : "";
  return `${valve?.acronym || valve?.name || "VALVE"}${dim}${wp}`;
}

// ---------- Renderer principale ----------
export function renderWellSurfaceSvg(data, opts = {}) {
  const O = { ...defaultOpts, ...opts }, T = O.theme;

  // Dati dal JSON (match con il tuo schema) 
  const wh = data?.wellhead;
  const xt = data?.xmastree;
  const whValves = wh?.valves || [];
  const xtValves = xt?.valves || [];

  const msvB = xtValves.find(v => v?.xmastreevalvetype?.code === "lowermaster");
  const msvH = xtValves.find(v => v?.xmastreevalvetype?.code === "uppermaster");
  const swab = xtValves.find(v => v?.xmastreevalvetype?.code === "swab");
  const kill = xtValves.find(v => v?.xmastreevalvetype?.code === "kill");
  const iwing= xtValves.find(v => v?.xmastreevalvetype?.code === "innerwing");
  const hwing= xtValves.find(v => v?.xmastreevalvetype?.code === "hydrowing");

  const annA = whValves.find(v => v?.wellheadvalvetype?.code === "annulusa");
  const annB = whValves.find(v => v?.wellheadvalvetype?.code === "annulusb");

  // Canvas & layout
  const scale = O.scale;
  const W = 900 * scale, H = 520 * scale;
  const originX = 260 * scale;
  const baselineY = 40 * scale;

  const pipeBore = 14 * scale, whH = 120 * scale, xtH = 180 * scale, vGap = 16 * scale;
  const valveW = 72 * scale, valveH = 28 * scale, wingLen = 160 * scale, annulusOffsetY = 40 * scale;

  let content = "";
  // Colonna iniziale + WELLHEAD
  content += group(originX, baselineY, pipeVertical({ height: 40*scale, bore: pipeBore }));
  content += group(originX, baselineY + 40*scale, wellheadBody({ height: whH, width: 80*scale }));

  // Annulus sul Wellhead (impilati; il lato è letto dal JSON) 
  const annBaseY = baselineY + 40*scale + annulusOffsetY;
  [annA, annB].filter(Boolean).forEach((v, idx) => {
    const side = v?.wellheadvalveside?.code || "right";
    const sign = side === "left" ? -1 : 1;
    const y = annBaseY + idx * (valveH + 14*scale);
    const x = originX + sign * (50*scale);
    content += group(originX, y, pipeHorizontal({ width: sign * (80*scale), bore: 10*scale }));
    content += group(x, y, valveGlyph(v?.wellheadvalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(v), x + (sign>0 ? valveW/2+8 : -(valveW/2+8)), y, { anchor: sign>0 ? "start":"end", size: O.fontSize, weight: 500 });
  });

  // Colonna verso X‑mas tree
  content += group(originX, baselineY + 40*scale + whH, pipeVertical({ height: 30*scale, bore: pipeBore }));
  const xtY = baselineY + 40*scale + whH + 30*scale;
  content += group(originX, xtY, xmasTreeBody({ height: xtH, width: 66*scale }));

  // Master/Swab lungo la colonna
  const msvYB = xtY + xtH*0.15, msvYH = xtY + xtH*0.38, swabY = xtY + xtH*0.05;
  if (msvB) { content += group(originX, msvYB, valveGlyph(msvB?.xmastreevalvetype?.code, { width: valveW, height: valveH })); if (O.showLabels) content += label(valveLabel(msvB), originX, msvYB - (valveH/2 + 12), { anchor:"middle", size: O.fontSize, weight: 600 }); }
  if (msvH) { content += group(originX, msvYH, valveGlyph(msvH?.xmastreevalvetype?.code, { width: valveW, height: valveH })); if (O.showLabels) content += label(valveLabel(msvH), originX, msvYH - (valveH/2 + 12), { anchor:"middle", size: O.fontSize, weight: 600 }); }
  if (swab) { content += group(originX, swabY,  valveGlyph(swab?.xmastreevalvetype?.code, { width: valveW, height: valveH })); if (O.showLabels) content += label(valveLabel(swab), originX, swabY -  (valveH/2 + 12), { anchor:"middle", size: O.fontSize, weight: 600 }); }

  // Ali: sinistra Kill, destra Inner + Hydro
  const wingCenterY = xtY + xtH*0.50;
  if (kill) {
    const y = wingCenterY;
    content += group(originX, y, pipeHorizontal({ width: -(wingLen - 40*scale), bore: pipeBore }));
    content += group(originX - 40*scale, y, valveGlyph(kill?.xmastreevalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(kill), originX - 40*scale - (valveW/2 + 10), y, { anchor: "end", size: O.fontSize });
  }
  [iwing, hwing].filter(Boolean).forEach((v, i, arr) => {
    const y = wingCenterY + (i * (valveH + vGap)) - (arr.length>1 ? valveH/2 : 0);
    content += group(originX, y, pipeHorizontal({ width: (wingLen - 40*scale), bore: pipeBore }));
    content += group(originX + (wingLen - 40*scale), y, valveGlyph(v?.xmastreevalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(v), originX + (wingLen - 40*scale) + (valveW/2 + 10), y, { anchor: "start", size: O.fontSize, weight: 500 });
  });

  // Tappo superiore
  content += group(originX, xtY - 30*scale, pipeVertical({ height: 30*scale, bore: pipeBore }));

  // Header
  const title = `${data?.name || "Well"} — ${xt?.type || "X-mas Tree"}`;
  const subtitle = `${xt?.manufacturer_model || ""}`.replace(/"/g, "″"); // 
  const whInfo = `${wh?.wellheadtype?.name || "Wellhead"} · WP ${wh?.working_pressure ?? "—"} psi`; // 

  let header = "";
  header += label(title, 24*scale, 26*scale, { size: O.fontSize + 6, weight: 700, color: T.text });
  if (subtitle) header += label(subtitle, 24*scale, 26*scale + 18, { size: O.fontSize, color: "#4B5563" });
  header += label(whInfo, 24*scale, 26*scale + 36, { size: O.fontSize, color: "#4B5563" });

  const defs = svgEl("style", {}, `.tick{stroke:${T.stroke};stroke-width:${O.strokeWidth};}`);
  return svgEl("svg", { xmlns:"http://www.w3.org/2000/svg", viewBox:`0 0 ${900*scale} ${520*scale}`, width:900*scale, height:520*scale, style:`background:${T.bg}` }, defs + header + content);
}

// Esportiamo anche elementi base (se un domani ti servono)
export const Elements = { pipeVertical, pipeHorizontal, flange, wellheadBody, xmasTreeBody, gateValveManual, gateValveHydraulic };