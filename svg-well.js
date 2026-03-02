// svg-well.js generato da Copilot_02.03.2026
// Modular SVG library for wellhead & xmas tree drawings
// All functions return SVG strings. The main renderer returns a full <svg>.

// ---------- Theme & Defaults ----------
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

// Gradient IDs (defined once in <defs>)
const GID = { metal: "g_metal", flange: "g_flange" };

// ---------- SVG helpers ----------
const svgEl = (tag, attrs = {}, children = "") =>
  `<${tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${String(v).replace(/"/g,'&quot;')}"`).join(" ")}>${children}</${tag}>`;

const svgSelf = (tag, attrs = {}) =>
  `<${tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${String(v).replace(/"/g,'&quot;')}"`).join(" ")} />`;

const group = (x, y, content) => svgEl("g", { transform: `translate(${x} ${y})` }, content);

const label = (text, x, y, opts = {}) => svgEl("text", {
  x, y,
  "font-family": "Inter, system-ui, Segoe UI, sans-serif",
  "font-size": opts.size ?? 11,
  "font-weight": opts.weight ?? "400",
  "text-anchor": opts.anchor ?? "start",
  "dominant-baseline": "middle",
  fill: opts.color ?? THEME.text
}, text);

// ---------- Primitives ----------
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

function wellheadBody({ height=100, width=70 } = {}) {
  const h = height, w = width;
  const fl = 10, fb = 9, bore = Math.round(w * 0.175);
  // Two stacked sections: wider casing head (bottom) + narrower tubing head spool (top)
  const s1h = h * 0.58, s2h = h * 0.42;
  const w1 = w, w2 = w * 0.78;
  const fill = `url(#${GID.metal})`, fillF = `url(#${GID.flange})`;
  const fbar = (y, bw) => svgSelf("rect", { x:-(bw/2+fl), y:y-fb/2, width:bw+fl*2, height:fb, fill:fillF, stroke:THEME.stroke, "stroke-width":1 });
  const bolts = (cy, bw, n) => {
    const span = bw + fl*2 - 12;
    return Array.from({length:n}, (_,i) =>
      svgSelf("circle", { cx:-(bw/2+fl-6)+i*(n>1?span/(n-1):0), cy, r:2.2, fill:"#111827", stroke:"#374151", "stroke-width":0.5 })
    ).join("");
  };
  return [
    // Casing head body (lower 58%)
    svgSelf("rect", { x:-w1/2, y:0, width:w1, height:s1h, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Tubing head spool body (upper 42%)
    svgSelf("rect", { x:-w2/2, y:s1h, width:w2, height:s2h, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Bottom flange
    fbar(fb/2, w1), bolts(fb/2, w1, 8),
    // Mid flange — junction
    fbar(s1h, w1), bolts(s1h, w1, 8),
    // Top flange — to xmas tree
    fbar(h - fb/2, w2), bolts(h - fb/2, w2, 6),
    // Through-bore (tubing)
    svgSelf("rect", { x:-bore/2, y:0, width:bore, height:h, fill:"#111827", rx:bore/2 }),
  ].join("");
}

function xmasTreeBody({ height=160, width=60 } = {}) {
  const h = height, w = width;
  const fl = 8, fb = 8, bore = Math.round(w * 0.16);
  const crossY = h * 0.60;           // UPDATED: align wings at 60%
  const crossW = w * 1.85, crossH = 20;
  const capH = Math.round(h * 0.08); // swab-cap stub at top
  const fill = `url(#${GID.metal})`, fillF = `url(#${GID.flange})`;
  const fbar = (y, bw, bh=fb) => svgSelf("rect", { x:-(bw/2+fl), y:y-bh/2, width:bw+fl*2, height:bh, fill:fillF, stroke:THEME.stroke, "stroke-width":1 });
  const bolts = (cy, bw, n) => {
    const span = bw + fl*2 - 12;
    return Array.from({length:n}, (_,i) =>
      svgSelf("circle", { cx:-(bw/2+fl-6)+i*(n>1?span/(n-1):0), cy, r:2, fill:"#111827", stroke:"#374151", "stroke-width":0.5 })
    ).join("");
  };
  return [
    // Main vertical body column
    svgSelf("rect", { x:-w/2, y:0, width:w, height:h, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Cross / tee bar for wing valve outlets
    svgSelf("rect", { x:-crossW/2, y:crossY-crossH/2, width:crossW, height:crossH, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Top cap stub (swab cap)
    svgSelf("rect", { x:-(w*0.55)/2, y:0, width:w*0.55, height:capH, fill:fillF, stroke:THEME.stroke, "stroke-width":1.5, rx:2 }),
    // Flanges + bolt rows
    fbar(capH, w), bolts(capH, w, 6),
    fbar(crossY, crossW), bolts(crossY, crossW, 10),
    fbar(h, w), bolts(h, w, 8),
    // Vertical through-bore
    svgSelf("rect", { x:-bore/2, y:0, width:bore, height:h, fill:"#111827", rx:bore/2 }),
    // Horizontal bore (wing outlets)
    svgSelf("rect", { x:-crossW/2, y:crossY-bore/2, width:crossW, height:bore, fill:"#111827", rx:bore/2 }),
  ].join("");
}

// ---------- Valves ----------
function gateValveManual({ width=60, height=26, color=THEME.manualValve } = {}) {
  const r  = height / 2;   // valve body circle radius
  const w2 = width / 2;    // half-width to flange connection points
  const d  = r * 0.707;    // 45° point on circle (r·sin 45°)

  // Handwheel: front-view circular wheel above bonnet
  const bonnetH  = 5;
  const stemLen  = 5;
  const hwR      = Math.round(r * 0.9);   // handwheel rim radius
  const bonnetTop = -(r + bonnetH);
  const hwCy      = bonnetTop - stemLen - hwR;

  const boreH = height * 0.4;   // height of bore stubs

  return [
    // Bore stubs connecting valve body circle to the flange bars
    svgSelf("rect", { x:-w2,  y:-boreH/2, width:w2-r+1, height:boreH, fill:color }),
    svgSelf("rect", { x:r-1,  y:-boreH/2, width:w2-r+1, height:boreH, fill:color }),

    // End flange bars
    svgSelf("line", { x1:-w2, y1:-(r+1), x2:-w2, y2:r+1, stroke:THEME.stroke, "stroke-width":3 }),
    svgSelf("line", { x1: w2, y1:-(r+1), x2: w2, y2:r+1, stroke:THEME.stroke, "stroke-width":3 }),

    // Valve body circle
    svgSelf("circle", { cx:0, cy:0, r, fill:color, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Gate valve X symbol (diagonals inscribed in the circle)
    svgSelf("line", { x1:-d, y1:-d, x2: d, y2: d, stroke:THEME.stroke, "stroke-width":1.5 }),
    svgSelf("line", { x1: d, y1:-d, x2:-d, y2: d, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Stem (from valve body top through bonnet to handwheel)
    svgSelf("line", { x1:0, y1:-r, x2:0, y2:hwCy, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Bonnet box
    svgSelf("rect", { x:-4, y:bonnetTop, width:8, height:bonnetH,
      fill:THEME.flange, stroke:THEME.stroke, "stroke-width":1, rx:1 }),

    // Handwheel rim
    svgSelf("circle", { cx:0, cy:hwCy, r:hwR, fill:"none", stroke:THEME.stroke, "stroke-width":2 }),
    // Hub
    svgSelf("circle", { cx:0, cy:hwCy, r:2.5, fill:THEME.stroke }),
    // Cross spokes
    svgSelf("line", { x1:-hwR, y1:hwCy, x2:hwR, y2:hwCy, stroke:THEME.stroke, "stroke-width":1.5 }),
    svgSelf("line", { x1:0, y1:hwCy-hwR, x2:0, y2:hwCy+hwR, stroke:THEME.stroke, "stroke-width":1.5 }),
  ].join("");
}

function gateValveHydraulic({ width=60, height=26, color=THEME.hydraulicValve } = {}) {
  const r  = height / 2;   // valve body circle radius
  const w2 = width / 2;
  const d  = r * 0.707;    // 45° point on circle

  const stemConn = 3;
  const actW = width * 0.52;
  const actH = height * 0.55;
  const actBot = -(r + stemConn);
  const actTop = actBot - actH;

  const boreH = height * 0.4;

  return [
    // Bore stubs
    svgSelf("rect", { x:-w2, y:-boreH/2, width:w2-r+1, height:boreH, fill:color }),
    svgSelf("rect", { x:r-1, y:-boreH/2, width:w2-r+1, height:boreH, fill:color }),

    // Flange bars
    svgSelf("line", { x1:-w2, y1:-(r+1), x2:-w2, y2:r+1, stroke:THEME.stroke, "stroke-width":3 }),
    svgSelf("line", { x1: w2, y1:-(r+1), x2: w2, y2:r+1, stroke:THEME.stroke, "stroke-width":3 }),

    // Valve body circle
    svgSelf("circle", { cx:0, cy:0, r, fill:color, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Gate valve X symbol
    svgSelf("line", { x1:-d, y1:-d, x2: d, y2: d, stroke:THEME.stroke, "stroke-width":1.5 }),
    svgSelf("line", { x1: d, y1:-d, x2:-d, y2: d, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Stem connector (from valve body top to actuator bottom)
    svgSelf("line", { x1:0, y1:-r, x2:0, y2:actBot, stroke:THEME.stroke, "stroke-width":2 }),

    // Actuator body
    svgSelf("rect", { x:-actW/2, y:actTop, width:actW, height:actH, fill:color, stroke:THEME.stroke, "stroke-width":1.3, rx:2 }),

    // Top band
    svgSelf("rect", { x:-actW/2+1, y:actTop+1, width:actW-2, height:actH*0.25, fill:"#065f46", rx:2 }),

    // Hydraulic port nub (right)
    svgSelf("rect", { x:actW/2, y:actTop+actH*0.38, width:5, height:actH*0.28, fill:"#065f46", stroke:THEME.stroke, "stroke-width":1, rx:1 }),

    // "H" label
    svgEl("text", { x:0, y:actTop+actH*0.6, "text-anchor":"middle", "dominant-baseline":"middle",
      "font-size": Math.max(Math.floor(actH*0.5),7), "font-weight":"bold",
      fill:"#ffffff", "font-family":"system-ui, sans-serif" }, "H"),
  ].join("");
}

// ---------- Semantic helpers ----------
const isHydraulic = (code) => code === "uppermaster" || code === "hydrowing";
const isKill = (code) => code === "kill";
const isAnnulus = (code) => code === "annulusa" || code === "annulusb";

function valveGlyph(typeCode, opts={}) {
  if (isHydraulic(typeCode)) return gateValveHydraulic(opts);
  if (isKill(typeCode)) return gateValveManual({ ...opts, color: THEME.killValve });
  if (isAnnulus(typeCode)) return gateValveManual({ ...opts, color: THEME.annulusValve });
  return gateValveManual(opts);
}

function valveLabel(valve) {
  const dim = valve?.valvedata?.dimension ? ` ${String(valve.valvedata.dimension).replace(/"/g,"″")}` : "";
  const wp  = valve?.valvedata?.working_pressure ? ` · ${valve.valvedata.working_pressure} psi` : "";
  return `${valve?.acronym ?? valve?.name ?? "VALVE"}${dim}${wp}`;
}

// ---------- Main renderer ----------
export function renderWellSurfaceSvg(data, opts = {}) {
  const O = { ...defaultOpts, ...opts }, T = O.theme;
  // Data
  const wh = data?.wellhead;
  const xt = data?.xmastree;
  const whValves = wh?.valves ?? [];
  const xtValves = xt?.valves ?? [];
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

  // ── X-mas tree (top) ──────────────────────────────────────────────────────
  // Short flowline stub above the xmas tree
  content += group(originX, baselineY, pipeVertical({ height: 40*scale, bore: pipeBore }));
  const xtY = baselineY + 40*scale;
  content += group(originX, xtY, xmasTreeBody({ height: xtH, width: 66*scale }));

  // Master / swab valves along the vertical bore (UPDATED PERCENTAGES)
  const swabY = xtY + xtH * 0.05;   // 5%
  const msvYH = xtY + xtH * 0.22;   // 22% upper master
  const msvYB = xtY + xtH * 0.43;   // 43% lower master

  if (msvB) {
    content += group(originX, msvYB, valveGlyph(msvB?.xmastreevalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(msvB), originX, msvYB - (valveH/2 + 12), { anchor:"middle", size: O.fontSize, weight: 600 });
  }
  if (msvH) {
    content += group(originX, msvYH, valveGlyph(msvH?.xmastreevalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(msvH), originX, msvYH - (valveH/2 + 12), { anchor:"middle", size: O.fontSize, weight: 600 });
  }
  if (swab) {
    content += group(originX, swabY, valveGlyph(swab?.xmastreevalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(swab), originX, swabY - (valveH/2 + 12), { anchor:"middle", size: O.fontSize, weight: 600 });
  }

  // Wing valves: kill (left), inner + hydro wing (right)
  const wingCenterY = xtY + xtH * 0.60; // UPDATED align with cross
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

  // ── Connecting spool (xmas tree → wellhead) ───────────────────────────────
  content += group(originX, xtY + xtH, pipeVertical({ height: 30*scale, bore: pipeBore }));

  // ── Wellhead (bottom) ─────────────────────────────────────────────────────
  const whY = xtY + xtH + 30*scale;
  content += group(originX, whY, wellheadBody({ height: whH, width: 80*scale }));

  // Annulus valves on the wellhead sides
  const annBaseY = whY + 40*scale;
  [annA, annB].filter(Boolean).forEach((v, idx) => {
    const side = v?.wellheadvalveside?.code ?? "right";
    const sign = side === "left" ? -1 : 1;
    const y = annBaseY + idx * (valveH + 14*scale);
    const x = originX + sign * (50*scale);
    content += group(originX, y, pipeHorizontal({ width: sign * (80*scale), bore: 10*scale }));
    content += group(x, y, valveGlyph(v?.wellheadvalvetype?.code, { width: valveW, height: valveH }));
    if (O.showLabels) content += label(valveLabel(v), x + (sign>0 ? valveW/2+8 : -(valveW/2+8)), y, { anchor: sign>0 ? "start":"end", size: O.fontSize, weight: 500 });
  });

  // Short casing stub below wellhead (into ground)
  content += group(originX, whY + whH, pipeVertical({ height: 40*scale, bore: pipeBore }));

  // Header
  const title = `${data?.name ?? "Well"} — ${xt?.type ?? "X-mas Tree"}`;
  const subtitle = `${xt?.manufacturer_model ?? ""}`.replace(/"/g, "″");
  const whInfo = `${wh?.wellheadtype?.name ?? "Wellhead"} · WP ${wh?.working_pressure ?? "—"} psi`;
  let header = "";
  header += label(title, 24*scale, 26*scale, { size: O.fontSize + 6, weight: 700, color: T.text });
  if (subtitle) header += label(subtitle, 24*scale, 26*scale + 18, { size: O.fontSize, color: "#4B5563" });
  header += label(whInfo, 24*scale, 26*scale + 36, { size: O.fontSize, color: "#4B5563" });

  const gradDefs = `<defs>
  <linearGradient id="${GID.metal}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0%"  stop-color="#374151"/>
    <stop offset="25%" stop-color="#9CA3AF"/>
    <stop offset="50%" stop-color="#E5E7EB"/>
    <stop offset="75%" stop-color="#9CA3AF"/>
    <stop offset="100%" stop-color="#374151"/>
  </linearGradient>
  <linearGradient id="${GID.flange}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0%"  stop-color="#1F2937"/>
    <stop offset="30%" stop-color="#6B7280"/>
    <stop offset="50%" stop-color="#D1D5DB"/>
    <stop offset="70%" stop-color="#6B7280"/>
    <stop offset="100%" stop-color="#1F2937"/>
  </linearGradient>
</defs>`;

  const defs = svgEl("style", {}, `.tick{stroke:${T.stroke};stroke-width:${O.strokeWidth};}`) + gradDefs;
  return svgEl("svg", { xmlns:"http://www.w3.org/2000/svg", viewBox:`0 0 ${900*scale} ${520*scale}`, width:900*scale, height:520*scale, style:`background:${T.bg}` }, defs + header + content);
}

// Export base elements as well
export const Elements = { pipeVertical, pipeHorizontal, flange, wellheadBody, xmasTreeBody, gateValveManual, gateValveHydraulic };
