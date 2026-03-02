// svg-well.js generato da Copilot_02.03.2026
// Modular SVG library for wellhead & xmas tree drawings
// All functions return SVG strings. The main renderer returns a full <svg>.

// ---------- Theme & Defaults ----------
const THEME = {
  pipe: "#111827",
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

function wellheadBody({ height=100, width=70, topFlangeOuter } = {}) {
  const h = height, w = width;
  const fl = 10, fb = 9, bore = Math.round(w * 0.175);
  // Three stacked sections from top (xmas tree connection) to bottom (ground):
  //   s1: tubing head spool — smallest  (annulus A side outlet)
  //   s2: annulus B spool   — slightly bigger
  //   s3: casing head       — full width
  const s1h = h / 3, s2h = h / 3, s3h = h / 3;
  const w1 = w * 0.65, w2 = w * 0.80, w3 = w;
  const y2 = s1h, y3 = s1h + s2h;
  const fill = `url(#${GID.metal})`, fillF = `url(#${GID.flange})`;
  const fbar = (y, bw) => svgSelf("rect", { x:-(bw/2+fl), y:y-fb/2, width:bw+fl*2, height:fb, fill:fillF, stroke:THEME.stroke, "stroke-width":1 });
  const bolts = (cy, bw, n) => {
    const span = bw + fl*2 - 12;
    return Array.from({length:n}, (_,i) =>
      svgSelf("circle", { cx:-(bw/2+fl-6)+i*(n>1?span/(n-1):0), cy, r:2.2, fill:"#111827", stroke:"#374151", "stroke-width":0.5 })
    ).join("");
  };
  return [
    // Tubing head spool (top, smallest — annulus A)
    svgSelf("rect", { x:-w1/2, y:0,  width:w1, height:s1h, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Annulus B spool (middle)
    svgSelf("rect", { x:-w2/2, y:y2, width:w2, height:s2h, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Casing head (bottom, full width)
    svgSelf("rect", { x:-w3/2, y:y3, width:w3, height:s3h, fill, stroke:THEME.stroke, "stroke-width":1 }),
    // Top flange — connection to xmas tree (width matches XT bottom flange when topFlangeOuter is set)
    ...(() => {
      const tfo = topFlangeOuter ?? (w1 + fl * 2);
      const span = tfo - 12, n = 6;
      return [
        svgSelf("rect", { x:-tfo/2, y:0, width:tfo, height:fb, fill:fillF, stroke:THEME.stroke, "stroke-width":1 }),
        ...Array.from({length:n}, (_,i) => svgSelf("circle", { cx:-tfo/2+6+i*(n>1?span/(n-1):0), cy:fb/2, r:2.2, fill:"#111827", stroke:"#374151", "stroke-width":0.5 })),
      ];
    })(),
    // Junction flange s1 → s2
    fbar(y2, w2), bolts(y2, w2, 7),
    // Junction flange s2 → s3
    fbar(y3, w3), bolts(y3, w3, 8),
    // Bottom flange — into ground
    fbar(h - fb/2, w3), bolts(h - fb/2, w3, 8),
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
    fbar(h - fb/2, w), bolts(h - fb/2, w, 8),
    // Vertical through-bore
    svgSelf("rect", { x:-bore/2, y:0, width:bore, height:h, fill:"#111827", rx:bore/2 }),
    // Horizontal bore (wing outlets)
    svgSelf("rect", { x:-crossW/2, y:crossY-bore/2, width:crossW, height:bore, fill:"#111827", rx:bore/2 }),
  ].join("");
}

// ---------- Valves ----------
function gateValveManual({ height=26, color=THEME.manualValve } = {}) {
  const r = height / 2;    // valve body circle radius
  const d = r * 0.707;     // 45° point on circle (r·sin 45°)

  return [
    // Valve body circle
    svgSelf("circle", { cx:0, cy:0, r, fill:color, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Gate valve X symbol (diagonals inscribed in the circle)
    svgSelf("line", { x1:-d, y1:-d, x2: d, y2: d, stroke:THEME.stroke, "stroke-width":1.5 }),
    svgSelf("line", { x1: d, y1:-d, x2:-d, y2: d, stroke:THEME.stroke, "stroke-width":1.5 }),
  ].join("");
}

function gateValveHydraulic({ height=26, color=THEME.hydraulicValve } = {}) {
  const r = height / 2;    // valve body circle radius

  return [
    // Valve body circle
    svgSelf("circle", { cx:0, cy:0, r, fill:color, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Center white dot with H label
    svgSelf("circle", { cx:0, cy:0, r:r*0.55, fill:"#ffffff", stroke:THEME.stroke, "stroke-width":1 }),
    svgEl("text", { x:0, y:0, "text-anchor":"middle", "dominant-baseline":"middle",
      "font-size": Math.max(Math.floor(r*0.75), 6), "font-weight":"bold",
      fill:color, "font-family":"system-ui, sans-serif" }, "H"),
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

// Build the data payload stored on each clickable valve group
function valveInfo(valve) {
  const vd  = valve?.valvedata ?? {};
  const typ = valve?.xmastreevalvetype ?? valve?.wellheadvalvetype ?? {};
  return {
    name:                valve?.name ?? typ.name ?? "Valve",
    acronym:             valve?.acronym ?? typ.acronym ?? "",
    type:                typ.name ?? "",
    description:         valve?.description ?? "",
    installation_year:   valve?.installation_year ?? null,
    dimension:           vd.dimension    ? String(vd.dimension).replace(/"/g, "″") : null,
    working_pressure:    vd.working_pressure   ?? null,
    allowable_leak_rate: vd.allowable_leak_rate ?? null,
    manufacturer:        vd.type_manufacturer  ?? null,
  };
}

// Wrap a glyph in a clickable <g> carrying valve data as a JSON attribute
function valveClickGroup(x, y, glyphSvg, info) {
  return svgEl("g", {
    class: "wv-valve",
    "data-valve": JSON.stringify(info),
    style: "cursor:pointer",
    transform: `translate(${x} ${y})`,
  }, glyphSvg);
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
  const W = 900 * scale, H = 580 * scale;
  const originX = 260 * scale;
  const baselineY = 40 * scale;
  const pipeBore = 11 * scale, whH = 174 * scale, xtH = 240 * scale;
  const valveW = 72 * scale, valveH = 28 * scale;
  let content = "";

  // ── X-mas tree (top) ──────────────────────────────────────────────────────
  // Short flowline stub above the xmas tree
  content += group(originX, baselineY, pipeVertical({ height: 40*scale, bore: pipeBore }));
  const xtY = baselineY + 40*scale;
  const xtBodyW = 66*scale;  // xmas tree body width (fl=8 inside, so bottom flange outer = xtBodyW + 16)
  content += group(originX, xtY, xmasTreeBody({ height: xtH, width: xtBodyW }));

  // Valve positions along the vertical bore
  const swabY = xtY + xtH * 0.18;   // 18% — clear of top cap flange
  const msvYH = xtY + xtH * 0.35;   // 35% upper master
  const msvYB = xtY + xtH * 0.75;   // 75% lower master — below wing valves

  if (msvB) content += valveClickGroup(originX, msvYB, valveGlyph(msvB?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(msvB));
  if (msvH) content += valveClickGroup(originX, msvYH, valveGlyph(msvH?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(msvH));
  if (swab) content += valveClickGroup(originX, swabY,  valveGlyph(swab?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(swab));

  // Wing valves: kill (left), inner + hydro wing (right)
  const wingCenterY = xtY + xtH * 0.60; // UPDATED align with cross
  const killX = originX - 72*scale;   // mirror of iwingX
  if (kill) {
    const y = wingCenterY;
    content += group(originX, y, pipeHorizontal({ width: -(72*scale + valveW/2), bore: pipeBore }));
    content += valveClickGroup(killX, y, valveGlyph(kill?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(kill));
  }

  // WGV(I) inner and WGV(H) hydraulic on the same right outlet, in series at wingCenterY
  const iwingX = originX + 72*scale;    // inner wing valve centre X (closer to tree)
  const hwingX = originX + 148*scale;   // hydraulic wing valve centre X (further out)
  const rightPipeEnd = (hwing ? hwingX : iwing ? iwingX : originX) + valveW/2;
  if (iwing || hwing) {
    content += group(originX, wingCenterY, pipeHorizontal({ width: rightPipeEnd - originX, bore: pipeBore }));
  }
  if (iwing) content += valveClickGroup(iwingX, wingCenterY, valveGlyph(iwing?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(iwing));
  if (hwing) content += valveClickGroup(hwingX, wingCenterY, valveGlyph(hwing?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(hwing));

  // ── Wellhead (bottom) ─────────────────────────────────────────────────────
  const whY = xtY + xtH;
  content += group(originX, whY, wellheadBody({ height: whH, width: 80*scale, topFlangeOuter: xtBodyW + 16 }));

  // Annulus valves on the wellhead sides
  const annBaseY = whY + 40*scale;
  [annA, annB].filter(Boolean).forEach((v, idx) => {
    const side = v?.wellheadvalveside?.code ?? "right";
    const sign = side === "left" ? -1 : 1;
    const y = annBaseY + idx * (valveH + 14*scale);
    const x = originX + sign * (50*scale);
    content += group(originX, y, pipeHorizontal({ width: sign * (80*scale), bore: pipeBore }));
    content += valveClickGroup(x, y, valveGlyph(v?.wellheadvalvetype?.code, { width: valveW, height: valveH }), valveInfo(v));
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
  return svgEl("svg", { xmlns:"http://www.w3.org/2000/svg", viewBox:`0 0 ${W} ${H}`, width:W, height:H, style:`background:${T.bg}` }, defs + header + content);
}

// Export base elements as well
export const Elements = { pipeVertical, pipeHorizontal, flange, wellheadBody, xmasTreeBody, gateValveManual, gateValveHydraulic };

// ---------- Valve balloon ----------
// Call once after the SVG is inserted into the DOM.
// container = the element that wraps the <svg> (or the <svg> itself).
export function mountValveBalloon(container) {
  let b = document.getElementById("wv-balloon");
  if (!b) {
    b = document.createElement("div");
    b.id = "wv-balloon";
    Object.assign(b.style, {
      position: "fixed", display: "none", zIndex: "9999",
      background: "#ffffff", border: "1px solid #D1D5DB",
      borderRadius: "10px", boxShadow: "0 6px 24px rgba(0,0,0,.18)",
      padding: "14px 16px", minWidth: "220px", maxWidth: "300px",
      fontFamily: "Inter, system-ui, sans-serif", fontSize: "13px",
      color: "#111827", lineHeight: "1.5",
    });
    document.body.appendChild(b);
  }

  const hide = () => { b.style.display = "none"; };

  container.addEventListener("click", (e) => {
    const g = e.target.closest("[data-valve]");
    if (!g) { hide(); return; }

    const info = JSON.parse(g.dataset.valve);
    const rows = [
      ["Type",                 info.type],
      ["Description",          info.description],
      ["Installed",            info.installation_year],
      ["Dimension",            info.dimension],
      ["Working Pressure",     info.working_pressure    ? `${info.working_pressure} psi`    : null],
      ["Allowable Leak Rate",  info.allowable_leak_rate ? `${info.allowable_leak_rate} cc/min` : null],
      ["Manufacturer",         info.manufacturer],
    ].filter(([, v]) => v != null && v !== "");

    b.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  margin-bottom:8px;border-bottom:1px solid #E5E7EB;padding-bottom:7px">
        <span style="font-weight:700;font-size:14px">${info.name}</span>
        <span style="font-size:11px;font-weight:600;color:#6B7280;background:#F3F4F6;
                     padding:2px 6px;border-radius:4px;margin-left:8px">${info.acronym}</span>
      </div>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k, v]) => `
        <tr>
          <td style="color:#6B7280;padding:2px 10px 2px 0;white-space:nowrap;
                     vertical-align:top;font-size:12px">${k}</td>
          <td style="padding:2px 0;font-weight:500">${v}</td>
        </tr>`).join("")}
      </table>`;

    // Position next to the valve, staying within the viewport
    const rect = g.getBoundingClientRect();
    const bw   = 300;
    let left   = rect.right + 12;
    let top    = rect.top   - 8;
    if (left + bw > window.innerWidth  - 8) left = rect.left - bw - 12;
    if (top  + 220 > window.innerHeight - 8) top = window.innerHeight - 228;
    if (top < 8) top = 8;
    b.style.left    = `${left}px`;
    b.style.top     = `${top}px`;
    b.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-valve]") && !e.target.closest("#wv-balloon")) hide();
  });
}
