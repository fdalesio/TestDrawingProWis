// svg-well.js — versione aggiornata con supporto Double Completion + offset verticale realistico
// Generato da Copilot — Marzo 2026
// SVG modular library per wellheads & xmas trees
// Tutte le funzioni restituiscono stringhe SVG.
// La funzione principale renderizza l'intero <svg>.

///////////////////////////////////////////////////////////////
// THEME & DEFAULT OPTIONS
///////////////////////////////////////////////////////////////

const THEME = {
  pipe: "#111827",
  body: "#2D7A2D",
  flange: "#1B4D1B",
  manualValve: "#2563EB",
  hydraulicValve: "#059669",
  killValve: "#DC2626",
  annulusValve: "#7C3AED",
  dhsv: "#D97706",
  stroke: "#111827",
  text: "#111827",
  bg: "transparent",
};

const defaultOpts = {
  scale: 1.0,
  strokeWidth: 1.5,
  fontSize: 11,
  showLabels: true,
  theme: THEME
};

// Gradient IDs per <defs>
const GID = {
  metal: "g_metal",
  flange: "g_flange",
};

///////////////////////////////////////////////////////////////
// SVG HELPERS
///////////////////////////////////////////////////////////////

const svgEl = (tag, attrs = {}, children = "") =>
  `<${tag} ${Object.entries(attrs)
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, '"')}"`)
      .join(" ")}>${children}</${tag}>`;

const svgSelf = (tag, attrs = {}) =>
  `<${tag} ${Object.entries(attrs)
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, '"')}"`)
      .join(" ")} />`;

const group = (x, y, content) =>
  svgEl("g", { transform: `translate(${x} ${y})` }, content);

const label = (text, x, y, opts = {}) =>
  svgEl("text", {
      x, y,
      "font-family": "Inter, system-ui, Segoe UI, sans-serif",
      "font-size": opts.size ?? 11,
      "font-weight": opts.weight ?? "400",
      "text-anchor": opts.anchor ?? "start",
      "dominant-baseline": "middle",
      fill: opts.color ?? THEME.text
  }, text);
  
  ///////////////////////////////////////////////////////////////
// PRIMITIVES
///////////////////////////////////////////////////////////////

// Vertical pipe
function pipeVertical({ height = 80, bore = 12, color = THEME.pipe } = {}) {
  return svgSelf("rect", {
    x: -bore / 2,
    y: 0,
    width: bore,
    height,
    fill: color
  });
}


// Break symbol (schematic depth)
function pipeBreakSymbol({ bore = 12, gap = 26 } = {}) {
  const w = bore * 1.4;
  const hg = gap / 2;
  const amp = hg * 0.38;

  const d1 = `M ${-w},${-hg} C ${-w/3},${-hg-amp} ${w/3},${-hg+amp} ${w},${-hg}`;
  const d2 = `M ${-w},${hg}  C ${-w/3},${hg-amp}  ${w/3},${hg+amp}  ${w},${hg}`;

  return [
    svgEl("path", { d: d1, stroke: THEME.pipe, "stroke-width": 1.5, fill: "none" }),
    svgEl("path", { d: d2, stroke: THEME.pipe, "stroke-width": 1.5, fill: "none" })
  ].join("");
}


// Horizontal pipe (left or right)
function pipeHorizontal({ width = 120, bore = 12, color = THEME.pipe } = {}) {
  const w = Math.abs(width);
  const sign = Math.sign(width) || 1;

  return group(sign < 0 ? -w : 0, 0, svgSelf("rect", {
    x: 0,
    y: -bore / 2,
    width: w,
    height: bore,
    fill: color,
    rx: bore / 2,
    ry: bore / 2
  }));
}


// Flange primitive
function flange({ outer = 26, inner = 12, thickness = 10, body = THEME.flange }) {
  const r1 = outer / 2,
        r2 = inner / 2;

  return [
    svgSelf("circle", { cx: 0, cy: thickness/2, r: r1, fill: body }),
    svgSelf("circle", { cx: 0, cy: thickness/2, r: r2, fill: THEME.pipe })
  ].join("");
}


// WELLHEAD BODY (single-bore)
function wellheadBody({ height = 100, width = 70, topFlangeOuter, bore: borePx } = {}) {
  const h = height, w = width;
  const fl = 10, fb = 9;
  const bore = borePx ?? Math.round(w * 0.175);

  const s1h = h / 3, s2h = h / 3, s3h = h / 3;
  const w1 = w * 0.65, w2 = w * 0.80, w3 = w;
  const y2 = s1h, y3 = s1h + s2h;

  const fill  = `url(#${GID.metal})`;
  const fillF = `url(#${GID.flange})`;

  const fbar = (y, bw) => svgSelf("rect", {
    x: -(bw/2 + fl),
    y: y - fb/2,
    width: bw + fl*2,
    height: fb,
    fill: fillF,
    stroke: THEME.stroke,
    "stroke-width": 1
  });

  const bolts = (cy, bw, n) => {
    const span = bw + fl*2 - 12;
    return Array.from({ length:n }, (_,i) =>
      svgSelf("circle", {
        cx: -(bw/2+fl-6) + i*(n>1? span/(n-1):0),
        cy, r:2.2,
        fill:"#111827",
        stroke:"#374151",
        "stroke-width":0.5
      })
    ).join("");
  };

  return [
    // Spool A
    svgSelf("rect", { x:-w1/2, y:0,    width:w1, height:s1h, fill, stroke:THEME.stroke, "stroke-width":1 }),

    // Spool B
    svgSelf("rect", { x:-w2/2, y:y2,   width:w2, height:s2h, fill, stroke:THEME.stroke, "stroke-width":1 }),

    // Spool C (casing head)
    svgSelf("rect", { x:-w3/2, y:y3,   width:w3, height:s3h, fill, stroke:THEME.stroke, "stroke-width":1 }),

    // TOP FLANGE (XT connection)
    (() => {
      const tfo = topFlangeOuter ?? (w1 + fl*2);
      const span = tfo - 12, n = 6;

      return [
        svgSelf("rect", { x:-tfo/2, y:0, width:tfo, height:fb, fill:fillF, stroke:THEME.stroke, "stroke-width":1 }),
        ...Array.from({length:n}, (_,i) =>
          svgSelf("circle", {
            cx:-tfo/2+6 + i*(n>1?span/(n-1):0),
            cy:fb/2, r:2.2,
            fill:"#111827", stroke:"#374151", "stroke-width":0.5
          })
        )
      ];
    })().join(""),

    // Junction flanges
    fbar(y2, w2), bolts(y2, w2, 7),
    fbar(y3, w3), bolts(y3, w3, 8),

    // Bottom flange
    fbar(h - fb/2, w3), bolts(h - fb/2, w3, 8),

    // Through-bore
    svgSelf("rect", { x:-bore/2, y:0, width:bore, height:h, fill:"#111827" })
  ].join("");
}


// STANDARD SINGLE-BORE XMAS TREE BODY
function xmasTreeBody({ height = 160, width = 60 } = {}) {
  const h = height, w = width;
  const fl = 8, fb = 8;
  const bore = Math.round(w * 0.16);

  const crossY = h * 0.41;
  const crossW = w;

  const capH = Math.round(h * 0.08);

  const fill  = `url(#${GID.metal})`;
  const fillF = `url(#${GID.flange})`;

  const fbar = (y,bw,bh=fb) => svgSelf("rect", {
    x:-(bw/2+fl),
    y:y-bh/2,
    width:bw + fl*2,
    height:bh,
    fill:fillF,
    stroke:THEME.stroke,
    "stroke-width":1
  });

  const bolts = (cy,bw,n) => {
    const span = bw + fl*2 - 12;
    return Array.from({length:n}, (_,i)=>
      svgSelf("circle", {
        cx: -(bw/2+fl-6) + i*(n>1?span/(n-1):0),
        cy, r:2,
        fill:"#111827",
        stroke:"#374151",
        "stroke-width":0.5
      })
    ).join("");
  };

  return [
    // Main body
    svgSelf("rect", { x:-w/2, y:0, width:w, height:h, fill, stroke:THEME.stroke, "stroke-width":1 }),

    // Cap (swab)
    svgSelf("rect", { x:-(w*0.55)/2, y:0, width:w*0.55, height:capH, fill:fillF, stroke:THEME.stroke, "stroke-width":1.5 }),

    // Flanges
    fbar(capH, w) + bolts(capH, w, 6),
    fbar(crossY, w) + bolts(crossY, w, 6),
    fbar(h - fb/2, w) + bolts(h - fb/2, w, 8),

    // Bore
    svgSelf("rect", { x:-bore/2, y:0, width:bore, height:h, fill:"#111827" })
  ].join("");
}

///////////////////////////////////////////////////////////////
// VALVES — GLYPHS
///////////////////////////////////////////////////////////////

// Manual Gate Valve (blue)
function gateValveManual({ height = 26, color = THEME.manualValve } = {}) {
  const r = height / 2;
  const d = r * 0.707; // 45°

  return [
    svgSelf("circle", {
      cx:0, cy:0, r,
      fill: color,
      stroke: THEME.stroke,
      "stroke-width": 1.5
    }),
    svgSelf("line", { x1:-d, y1:-d, x2:d,  y2:d,  stroke:THEME.stroke, "stroke-width":1.5 }),
    svgSelf("line", { x1:d,  y1:-d, x2:-d, y2:d,  stroke:THEME.stroke, "stroke-width":1.5 })
  ].join("");
}


// Hydraulic Valve (green with "H")
function gateValveHydraulic({ height = 26, color = THEME.hydraulicValve } = {}) {
  const r = height / 2;

  return [
    svgSelf("circle", {
      cx:0, cy:0, r,
      fill: color,
      stroke: THEME.stroke,
      "stroke-width": 1.5
    }),

    svgSelf("circle", {
      cx:0, cy:0, r:r*0.55,
      fill:"#ffffff",
      stroke:THEME.stroke,
      "stroke-width":1
    }),

    svgEl("text", {
      x:0, y:0,
      "text-anchor":"middle",
      "dominant-baseline":"middle",
      "font-size": Math.max(Math.floor(r*0.75), 6),
      "font-weight":"bold",
      fill: color,
      "font-family":"system-ui, sans-serif"
    }, "H")
  ].join("");
}


// DHSV (diamond with X)
function gateValveScssv({ height = 26, color = THEME.dhsv } = {}) {
  const r = height / 2;
  const pts = `0,${-r} ${r},0 0,${r} ${-r},0`;
  const d = r * 0.5;

  return [
    svgSelf("polygon", {
      points: pts,
      fill: color,
      stroke: THEME.stroke,
      "stroke-width": 1.5
    }),
    svgSelf("line", { x1:-d, y1:-d, x2:d,  y2:d,  stroke:THEME.stroke, "stroke-width":1.5 }),
    svgSelf("line", { x1:d,  y1:-d, x2:-d, y2:d,  stroke:THEME.stroke, "stroke-width":1.5 })
  ].join("");
}

///////////////////////////////////////////////////////////////
// VALVE TYPE HELPERS
///////////////////////////////////////////////////////////////

const isHydraulic = code => (code === "uppermaster" || code === "hydrowing");
const isKill      = code => (code === "kill");
const isAnnulus   = code => (
  code === "annulusa" || code === "annulusb" || code === "annulusc"
);


// Map generic code → glyph
function valveGlyph(typeCode, opts = {}) {
  if (isHydraulic(typeCode)) return gateValveHydraulic(opts);
  if (isKill(typeCode))      return gateValveManual({ ...opts, color: THEME.killValve });
  if (isAnnulus(typeCode))   return gateValveManual({ ...opts, color: THEME.annulusValve });

  return gateValveManual(opts);
}


///////////////////////////////////////////////////////////////
// VALVE INFO (clickable data)
///////////////////////////////////////////////////////////////

function valveInfo(valve) {
  const vd  = valve?.valvedata ?? {};
  const typ = valve?.xmastreevalvetype ?? valve?.wellheadvalvetype ?? {};

  return {
    name: valve?.name ?? typ.name ?? "Valve",
    acronym: valve?.acronym ?? typ.acronym ?? "",
    type: typ.name ?? "",
    description: valve?.description ?? "",
    installation_year: valve?.installation_year ?? null,
    dimension: vd.dimension ? String(vd.dimension).replace(/"/g, "″") : null,
    working_pressure: vd.working_pressure ?? null,
    allowable_leak_rate: vd.allowable_leak_rate ?? null,
    manufacturer: vd.type_manufacturer ?? null
  };
}


function dhsvInfo(sv) {
  return {
    name: sv?.name ?? "DHSV",
    acronym: sv?.acronym ?? "DHSV",
    type: sv?.safetyvalvetype?.name ?? "",
    description: sv?.manufacturer_model ?? "",
    installation_year: sv?.installation_year ?? null,
    dimension: sv?.max_od ? `OD ${String(sv.max_od).replace(/"/g, "″")}` : null,
    working_pressure: sv?.working_pressure ?? null,
    allowable_leak_rate: sv?.allowable_leak_rate ?? null,
    manufacturer: null,
    depth: sv?.depth ? `${sv.depth} ft` : null
  };
}


///////////////////////////////////////////////////////////////
// CLICK GROUP WRAPPER
///////////////////////////////////////////////////////////////

function valveClickGroup(x, y, glyphSvg, info) {
  return svgEl("g", {
    class: "wv-valve",
    "data-valve": JSON.stringify(info),
    style: "cursor:pointer",
    transform: `translate(${x} ${y})`
  }, glyphSvg);
}

///////////////////////////////////////////////////////////////
// DOUBLE-COMPLETION XMAS TREE BODY (dual bore + vertical offset)
///////////////////////////////////////////////////////////////

function xmasTreeBodyDouble({
  height = 240,
  width = 66,
  boreSpacing = 32        // distanza orizzontale fra i due centri dei bores (scalabile)
} = {}) {

  const h = height;
  const w = width * 1.55;        // corpo più largo del singolo
  const fl = 8;                  // flange thickness
  const fb = 8;                  // flange bar height
  const half = w / 2;

  // Due bores (diametro simile al single completion)
  const bore = Math.round(w * 0.16);

  // CENTRI DEI DUE BORES
  const cxSS = -boreSpacing / 2;   // short string → sinistra
  const cxLS =  boreSpacing / 2;   // long string → destra

  // CAP superiore (larghezza per ogni stringa)
  const capW = w * 0.32;
  const capH = Math.round(h * 0.08);

  // Offset verticale realistico:
  // SS cross a 41%, LS cross a 41% + 18% = 59%
  const crossSS = h * 0.41;
  const crossLS = h * (0.41 + 0.18);

  const fill  = `url(#${GID.metal})`;
  const fillF = `url(#${GID.flange})`;

  ///////////////////////////////////////////////////////////////
  // Flange bar helper
  ///////////////////////////////////////////////////////////////
  const fbar = (y, bw, bh = fb) =>
    svgSelf("rect", {
      x: -(bw / 2 + fl),
      y: y - bh / 2,
      width: bw + fl * 2,
      height: bh,
      fill: fillF,
      stroke: THEME.stroke,
      "stroke-width": 1
    });

  ///////////////////////////////////////////////////////////////
  // Bolt rows
  ///////////////////////////////////////////////////////////////
  const bolts = (cy, bw, n) => {
    const span = bw + fl*2 - 12;
    return Array.from({ length:n }, (_,i) =>
      svgSelf("circle", {
        cx: -(bw/2+fl-6) + i*(n>1? span/(n-1) : 0),
        cy,
        r: 2,
        fill: "#111827",
        stroke: "#374151",
        "stroke-width": 0.5
      })
    ).join("");
  };

  ///////////////////////////////////////////////////////////////
  // RENDER
  ///////////////////////////////////////////////////////////////

  return [

    // MAIN BODY (rettangolo grande)
    svgSelf("rect", {
      x: -half,
      y: 0,
      width: w,
      height: h,
      fill,
      stroke: THEME.stroke,
      "stroke-width": 1
    }),

    /////////////////////////////////////////////////////////////
    // DUE CAP SUPERIORI (uno sopra SS, uno sopra LS)
    /////////////////////////////////////////////////////////////

    // Cap SS (left)
    svgSelf("rect", {
      x: cxSS - capW/2,
      y: 0,
      width: capW,
      height: capH,
      fill: fillF,
      stroke: THEME.stroke,
      "stroke-width": 1.5
    }),

    // Flange cap SS
    fbar(capH, capW),
    bolts(capH, capW, 6),

    // Cap LS (right)
    svgSelf("rect", {
      x: cxLS - capW/2,
      y: 0,
      width: capW,
      height: capH,
      fill: fillF,
      stroke: THEME.stroke,
      "stroke-width": 1.5
    }),

    // Flange cap LS
    fbar(capH, capW),
    bolts(capH, capW, 6),

    /////////////////////////////////////////////////////////////
    // FLANGE SS CROSS (superiore)
    /////////////////////////////////////////////////////////////

    fbar(crossSS, w),
    bolts(crossSS, w, 8),

    /////////////////////////////////////////////////////////////
    // FLANGE LS CROSS (inferiore)
    /////////////////////////////////////////////////////////////

    fbar(crossLS, w),
    bolts(crossLS, w, 8),

    /////////////////////////////////////////////////////////////
    // FLANGE INFERIORE (unica)
    /////////////////////////////////////////////////////////////

    fbar(h - fb/2, w),
    bolts(h - fb/2, w, 10),

    /////////////////////////////////////////////////////////////
    // DUE BORES VERTICALI
    /////////////////////////////////////////////////////////////

    // SS bore (left)
    svgSelf("rect", {
      x: cxSS - bore/2,
      y: 0,
      width: bore,
      height: h,
      fill: "#111827"
    }),

    // LS bore (right)
    svgSelf("rect", {
      x: cxLS - bore/2,
      y: 0,
      width: bore,
      height: h,
      fill: "#111827"
    })

  ].join("");
}

///////////////////////////////////////////////////////////////
// BLOCCO 5 — RENDER DOUBLE COMPLETION (offset verticale realistico)
///////////////////////////////////////////////////////////////

function isDoubleCompletion(data) {
  const t = data?.tubings ?? [];
  const hasShort = t.some(x => x?.stringtype?.code === "short");
  const hasLong  = t.some(x => x?.stringtype?.code === "long");
  return hasShort && hasLong;
}

function getTubingByCode(data, code) {
  return (data?.tubings ?? []).find(t => t?.stringtype?.code === code);
}

function splitXtValvesByTubingType(xtValves) {
  const isShort = v =>
    v?.tubing_type === 2 ||
    v?.tubingtype?.code === "short";

  const isLong = v =>
    v?.tubing_type === 1 ||
    v?.tubingtype?.code === "long";

  const short = xtValves.filter(isShort);
  const long  = xtValves.filter(isLong);
  return { short, long };
}

function vFind(arr, code) {
  return arr.find(v => v?.xmastreevalvetype?.code === code);
}

function collectWings(arr) {
  const i = vFind(arr, "innerwing");
  const o = vFind(arr, "outerwing");
  const h = vFind(arr, "hydrowing");
  return [i, o, h].filter(Boolean);
}

function renderDoubleCompletion(data, opts = {}) {
  const O = { ...defaultOpts, ...opts }, T = O.theme;

  // ---- Data
  const wh = data?.wellhead;
  const xt = data?.xmastree;
  const whValves = wh?.valves ?? [];
  const xtValves = xt?.valves ?? [];

  const { short: xtShort, long: xtLong } = splitXtValvesByTubingType(xtValves);

  // Per-string valves
  const ss = {
    swab:  vFind(xtShort, "swab"),
    msvH:  vFind(xtShort, "uppermaster"),
    msvB:  vFind(xtShort, "lowermaster"),
    wings: collectWings(xtShort) // left side
  };
  const ls = {
    swab:  vFind(xtLong, "swab"),
    msvH:  vFind(xtLong, "uppermaster"),
    msvB:  vFind(xtLong, "lowermaster"),
    wings: collectWings(xtLong) // right side
  };

  // Safety valves (DHSV)
  const dhsvSS = getTubingByCode(data, "short")?.safetyvalve ?? null;
  const dhsvLS = getTubingByCode(data, "long")?.safetyvalve  ?? null;

  // ---- Canvas & layout
  const scale = O.scale;
  const W = 900 * scale, H = 660 * scale;

  const pipeBore = 11 * scale;
  const whH      = 174 * scale;

  const xtH          = 240 * scale;
  const xtBodyBaseW  = 66 * scale;       // base width (pre-multiply)
  const xtBodyW_d    = xtBodyBaseW * 1.55;
  const boreSpacing  = 52 * scale;       // distanza tra i centri bores

  const valveW = 72 * scale;
  const valveH = Math.round(28 * 1.4) * scale; // ~39px @ 1x
  const vr     = valveH / 2;

  // Double XT cross levels (offset realistico)
  const xtCapH  = Math.round(xtH * 0.08);
  const crossSS = xtH * 0.41;
  const crossLS = xtH * (0.41 + 0.18);

  // Bore centerlines (relative a originX)
  const cxSS_rel = -boreSpacing / 2;
  const cxLS_rel =  boreSpacing / 2;

  // Wing spacing
  const rwStep = 2 * vr + 10 * scale;

  // Distanza dal centro bore alla prima valvola ala (oltre bordo corpo + flange + gap)
  // body half + flange (8) minus half spacing (per arrivare al lato) + vr + gap
  const boreToBodyEdge = (xtBodyW_d / 2) - (boreSpacing / 2); // distanza bore->lato
  const rwStartOff = boreToBodyEdge + 8 + vr + 6 * scale;

  // Estensioni laterali (per centrare correttamente)
  const nL = ss.wings.length || 0;
  const nR = ls.wings.length || 0;
  const leftWingExtent  = nL ? (rwStartOff + (nL - 1) * rwStep + vr) : vr;
  const rightWingExtent = nR ? (rwStartOff + (nR - 1) * rwStep + vr) : vr;

  // Centra rispetto alle estensioni asimmetriche
  const originX = W / 2 - (rightWingExtent - leftWingExtent) / 2;

  // Baseline: giunzione XT / WH
  const baselineY = H / 2 - xtH;
  const xtY       = baselineY;

  // Assi assoluti per i due bores
  const cxSS = originX + cxSS_rel;
  const cxLS = originX + cxLS_rel;

  // Y valvole per SS
  const swabY_SS = xtY + (xtCapH + crossSS) / 2;
  const msvStep_SS = (xtH - crossSS) / 3;
  const msvH_Y_SS = xtY + crossSS + msvStep_SS;
  const msvB_Y_SS = xtY + crossSS + 2 * msvStep_SS;
  const wingY_SS  = xtY + crossSS;

  // Y valvole per LS
  const swabY_LS = xtY + (xtCapH + crossLS) / 2;
  const msvStep_LS = (xtH - crossLS) / 3;
  const msvH_Y_LS = xtY + crossLS + msvStep_LS;
  const msvB_Y_LS = xtY + crossLS + 2 * msvStep_LS;
  const wingY_LS  = xtY + crossLS;

  // ---- Build content
  let content = "";

  // BODY: double XT con offset verticale
  content += group(originX, xtY, xmasTreeBodyDouble({
    height: xtH,
    width:  xtBodyBaseW,
    boreSpacing
  }));

  // --- Vertical valves SS (left column)
  if (ss.msvB) content += valveClickGroup(cxSS, msvB_Y_SS, valveGlyph(ss.msvB?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(ss.msvB));
  if (ss.msvH) content += valveClickGroup(cxSS, msvH_Y_SS, valveGlyph(ss.msvH?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(ss.msvH));
  if (ss.swab) content += valveClickGroup(cxSS, swabY_SS, valveGlyph(ss.swab?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(ss.swab));

  // --- Vertical valves LS (right column)
  if (ls.msvB) content += valveClickGroup(cxLS, msvB_Y_LS, valveGlyph(ls.msvB?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(ls.msvB));
  if (ls.msvH) content += valveClickGroup(cxLS, msvH_Y_LS, valveGlyph(ls.msvH?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(ls.msvH));
  if (ls.swab) content += valveClickGroup(cxLS, swabY_LS, valveGlyph(ls.swab?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(ls.swab));

  // --- Wing pipelines + valves
  // SS wings → a SINISTRA dal bore SS
  if (nL > 0) {
    const leftPipeEnd = cxSS - (rwStartOff + (nL - 1) * rwStep + vr);
    // pipe from bore outward (left)
    content += group(cxSS, wingY_SS, pipeHorizontal({ width: leftPipeEnd - cxSS, bore: pipeBore }));
    // order: innermost near body first
    ss.wings.forEach((v, i) => {
      const vx = cxSS - (rwStartOff + i * rwStep);
      content += valveClickGroup(vx, wingY_SS, valveGlyph(v.xmastreevalvetype.code, { width: valveW, height: valveH }), valveInfo(v));
    });
  }

  // LS wings → a DESTRA dal bore LS
  if (nR > 0) {
    const rightPipeEnd = cxLS + (rwStartOff + (nR - 1) * rwStep + vr);
    // pipe from bore outward (right)
    content += group(cxLS, wingY_LS, pipeHorizontal({ width: rightPipeEnd - cxLS, bore: pipeBore }));
    ls.wings.forEach((v, i) => {
      const vx = cxLS + (rwStartOff + i * rwStep);
      content += valveClickGroup(vx, wingY_LS, valveGlyph(v.xmastreevalvetype.code, { width: valveW, height: valveH }), valveInfo(v));
    });
  }

  // ---- WELLHEAD
  const whY = xtY + xtH;
  const whBodyW = 100 * scale; // leggermente più largo per proporzioni DC

  // Disegno il wellhead senza foro centrale (bore: 0) e applico topFlangeOuter su misura DC
  content += group(originX, whY, wellheadBody({
    height: whH,
    width:  whBodyW,
    topFlangeOuter: xtBodyW_d + 16, // corpo DC + flange 8px per lato
    bore: 0
  }));

  // Annulus valves (A/B/C) come nel single — una per lato (se presente)
  const bySide = (code) => {
    const seen = new Set();
    return whValves.filter(v => {
      if (v?.wellheadvalvetype?.code !== code) return false;
      const s = v?.wellheadvalveside?.code ?? "right";
      return seen.has(s) ? false : (seen.add(s), true);
    });
  };
  const annAValves = bySide("annulusa");
  const annBValves = bySide("annulusb");
  const annCValves = bySide("annulusc");

  const annYA = whY + whH / 6;
  const annYB = whY + whH / 2;
  const annYC = whY + whH * 5 / 6;

  const spoolW1 = whBodyW * 0.65; // s1 (A)
  const spoolW2 = whBodyW * 0.80; // s2 (B)
  const spoolW3 = whBodyW * 1.00; // s3 (C)

  [
    [annAValves, annYA, spoolW1 / 2],
    [annBValves, annYB, spoolW2 / 2],
    [annCValves, annYC, spoolW3 / 2],
  ].forEach(([valves, y, spoolHalf]) => {
    valves.forEach(v => {
      const side = v?.wellheadvalveside?.code ?? "right";
      const sign = side === "left" ? -1 : 1;
      const vOff = spoolHalf + 10 + vr + 6 * scale;
      const x    = originX + sign * vOff;

      content += group(originX, y, pipeHorizontal({ width: sign * (vOff + vr), bore: pipeBore }));
      content += valveClickGroup(x, y, valveGlyph(v?.wellheadvalvetype?.code, { width: valveW, height: valveH }), valveInfo(v));
    });
  });

  // ---- TWO DHSV stacks (uno per SS, uno per LS)
  const pipeAbove = 20 * scale;
  const breakGap  = 8  * scale;
  const pipeBelow = 90 * scale;

  // SS stack
  let breakBaseY = whY + whH + pipeAbove;
  let dhsvY      = breakBaseY + breakGap + pipeBelow / 2;

  content += group(cxSS, whY + whH, pipeVertical({ height: pipeAbove, bore: pipeBore }));
  content += group(cxSS, breakBaseY + breakGap / 2, pipeBreakSymbol({ bore: pipeBore, gap: breakGap }));
  content += group(cxSS, breakBaseY + breakGap, pipeVertical({ height: pipeBelow, bore: pipeBore }));
  if (dhsvSS) {
    content += valveClickGroup(cxSS, dhsvY, gateValveScssv({ height: valveH * 1.1 }), dhsvInfo(dhsvSS));
  }

  // LS stack
  breakBaseY = whY + whH + pipeAbove;
  dhsvY      = breakBaseY + breakGap + pipeBelow / 2;

  content += group(cxLS, whY + whH, pipeVertical({ height: pipeAbove, bore: pipeBore }));
  content += group(cxLS, breakBaseY + breakGap / 2, pipeBreakSymbol({ bore: pipeBore, gap: breakGap }));
  content += group(cxLS, breakBaseY + breakGap, pipeVertical({ height: pipeBelow, bore: pipeBore }));
  if (dhsvLS) {
    content += valveClickGroup(cxLS, dhsvY, gateValveScssv({ height: valveH * 1.1 }), dhsvInfo(dhsvLS));
  }

  // ---- Header
  const title    = `${data?.name ?? "Well"} — ${xt?.type ?? "X-mas Tree"}`;
  const subtitle = `${xt?.manufacturer_model ?? ""}`.replace(/"/g, "″");
  const whInfo   = `${wh?.wellheadtype?.name ?? "Wellhead"} · WP ${wh?.working_pressure ?? "—"} psi`;

  let header = "";
  header += label(title, 24*scale, 26*scale, { size: O.fontSize + 6, weight: 700, color: T.text });
  if (subtitle) header += label(subtitle, 24*scale, 26*scale + 18, { size: O.fontSize, color: "#4B5563" });
  header += label(whInfo, 24*scale, 26*scale + 36, { size: O.fontSize, color: "#4B5563" });

  // ---- Defs (gradient + style)
  const gradDefs = `<defs>
  <linearGradient id="${GID.metal}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0%"   stop-color="#1B4D1B"/>
    <stop offset="25%"  stop-color="#2D7A2D"/>
    <stop offset="50%"  stop-color="#7BC47B"/>
    <stop offset="75%"  stop-color="#2D7A2D"/>
    <stop offset="100%" stop-color="#1B4D1B"/>
  </linearGradient>
  <linearGradient id="${GID.flange}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0%"  stop-color="#163816"/>
    <stop offset="30%" stop-color="#245C24"/>
    <stop offset="50%" stop-color="#4A9A4A"/>
    <stop offset="70%" stop-color="#245C24"/>
    <stop offset="100%" stop-color="#163816"/>
  </linearGradient>
</defs>`;

  const defs = svgEl("style", {}, `.tick{stroke:${T.stroke};stroke-width:${O.strokeWidth};}`) + gradDefs;

  // ---- SVG WRAP
  return svgEl("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: `0 0 ${W} ${H}`,
    width: W,
    height: H,
    style: `background:${T.bg}`
  }, defs + header + content);
}

///////////////////////////////////////////////////////////////
// BLOCCO 6 — SINGLE COMPLETION + ROUTER + EXPORTS
///////////////////////////////////////////////////////////////

function renderSingleCompletion(data, opts = {}) {
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
  const owng = xtValves.find(v => v?.xmastreevalvetype?.code === "outerwing");
  const hwing= xtValves.find(v => v?.xmastreevalvetype?.code === "hydrowing");

  // Annulus: at most one valve per side (left/right) per spool level
  const bySide = (code) => {
    const seen = new Set();
    return whValves.filter(v => {
      if (v?.wellheadvalvetype?.code !== code) return false;
      const s = v?.wellheadvalveside?.code ?? "right";
      return seen.has(s) ? false : (seen.add(s), true);
    });
  };
  const annAValves = bySide("annulusa");
  const annBValves = bySide("annulusb");
  const annCValves = bySide("annulusc");

  const dhsv = data?.tubings?.[0]?.safetyvalve;

  // Canvas & layout
  const scale = O.scale;
  const W = 900 * scale, H = 660 * scale;
  const pipeBore = 11 * scale, whH = 174 * scale, xtH = 240 * scale;
  const valveW = 72 * scale, valveH = Math.round(28 * 1.4) * scale;
  const xtBodyW = 66 * scale;
  const vr = valveH / 2;

  // Dynamic originX: centre the drawing accounting for variable right-side wing valve count
  const rightWingValves = [iwing, owng, hwing].filter(Boolean);
  const rwStep = 2 * vr + 10 * scale;           // gap between adjacent wing valve centres
  const xtCrossHalfW = xtBodyW / 2 + 8;         // XT body half-width + flange extension (fl=8)
  const rwStartOff = xtCrossHalfW + vr + 6 * scale; // first wing valve centre; body edge clears flange
  const rightWingExtent = rightWingValves.length > 0
    ? rwStartOff + (rightWingValves.length - 1) * rwStep + vr
    : vr;
  const leftWingExtent = kill ? rwStartOff + vr : vr;
  const originX = W / 2 - (rightWingExtent - leftWingExtent) / 2;

  const baselineY = H / 2 - xtH;
  let content = "";

  // ── X-mas tree (top)
  const xtY = baselineY;
  content += group(originX, xtY, xmasTreeBody({ height: xtH, width: xtBodyW }));

  // Valve positions along the vertical bore
  const xtCapH   = Math.round(xtH * 0.08); // mirrors xmasTreeBody capH
  const xtCrossY = xtH * 0.41;             // mirrors xmasTreeBody crossY
  const swabY    = xtY + (xtCapH + xtCrossY) / 2;
  const msvStep  = (xtH - xtCrossY) / 3;
  const msvYH    = xtY + xtCrossY + msvStep;
  const msvYB    = xtY + xtCrossY + 2 * msvStep;

  if (msvB) content += valveClickGroup(originX, msvYB, valveGlyph(msvB?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(msvB));
  if (msvH) content += valveClickGroup(originX, msvYH, valveGlyph(msvH?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(msvH));
  if (swab) content += valveClickGroup(originX, swabY, valveGlyph(swab?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(swab));

  // Wing valves
  const wingCenterY = xtY + xtCrossY;
  const killX = originX - rwStartOff;
  if (kill) {
    content += group(originX, wingCenterY, pipeHorizontal({ width: -(rwStartOff + vr), bore: pipeBore }));
    content += valveClickGroup(killX, wingCenterY, valveGlyph(kill?.xmastreevalvetype?.code, { width: valveW, height: valveH }), valveInfo(kill));
  }
  if (rightWingValves.length > 0) {
    const rightPipeEnd = originX + rwStartOff + (rightWingValves.length - 1) * rwStep + vr;
    content += group(originX, wingCenterY, pipeHorizontal({ width: rightPipeEnd - originX, bore: pipeBore }));
    rightWingValves.forEach((v, i) => {
      const vx = originX + rwStartOff + i * rwStep;
      content += valveClickGroup(vx, wingCenterY, valveGlyph(v.xmastreevalvetype.code, { width: valveW, height: valveH }), valveInfo(v));
    });
  }

  // ── Wellhead (bottom)
  const whY = xtY + xtH;
  content += group(originX, whY, wellheadBody({ height: whH, width: 80*scale, topFlangeOuter: xtBodyW + 16, bore: pipeBore }));

  // Annulus valves — outlet centred at the mid-point of its spool
  const annYA = whY + whH / 6;
  const annYB = whY + whH / 2;
  const annYC = whY + whH * 5 / 6;
  const whBodyW = 80 * scale;
  const spoolW1 = whBodyW * 0.65; // s1 (A) width — mirrors wellheadBody
  const spoolW2 = whBodyW * 0.80; // s2 (B)
  const spoolW3 = whBodyW * 1.00; // s3 (C)

  [
    [annAValves, annYA, spoolW1 / 2],
    [annBValves, annYB, spoolW2 / 2],
    [annCValves, annYC, spoolW3 / 2],
  ].forEach(([valves, y, spoolHalf]) => {
    valves.forEach(v => {
      const side = v?.wellheadvalveside?.code ?? "right";
      const sign = side === "left" ? -1 : 1;
      const vOff = spoolHalf + 10 + vr + 6 * scale; // valve centre; clears spool junction flange (fl=10)
      const x = originX + sign * vOff;

      content += group(originX, y, pipeHorizontal({ width: sign * (vOff + vr), bore: pipeBore }));
      content += valveClickGroup(x, y, valveGlyph(v?.wellheadvalvetype?.code, { width: valveW, height: valveH }), valveInfo(v));
    });
  });

  // ── DHSV (single stack)
  const pipeAbove = 20 * scale; // pipe from WH bottom to break
  const breakGap  = 8  * scale; // visual gap
  const pipeBelow = 90 * scale; // pipe from break down to DHSV
  const breakBaseY = whY + whH + pipeAbove;
  const dhsvY = breakBaseY + breakGap + pipeBelow / 2;

  content += group(originX, whY + whH, pipeVertical({ height: pipeAbove, bore: pipeBore }));
  content += group(originX, breakBaseY + breakGap / 2, pipeBreakSymbol({ bore: pipeBore, gap: breakGap }));
  content += group(originX, breakBaseY + breakGap, pipeVertical({ height: pipeBelow, bore: pipeBore }));
  if (dhsv) {
    content += valveClickGroup(originX, dhsvY, gateValveScssv({ height: valveH * 1.1 }), dhsvInfo(dhsv));
  }

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
    <stop offset="0%"   stop-color="#1B4D1B"/>
    <stop offset="25%"  stop-color="#2D7A2D"/>
    <stop offset="50%"  stop-color="#7BC47B"/>
    <stop offset="75%"  stop-color="#2D7A2D"/>
    <stop offset="100%" stop-color="#1B4D1B"/>
  </linearGradient>
  <linearGradient id="${GID.flange}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0%"  stop-color="#163816"/>
    <stop offset="30%" stop-color="#245C24"/>
    <stop offset="50%" stop-color="#4A9A4A"/>
    <stop offset="70%" stop-color="#245C24"/>
    <stop offset="100%" stop-color="#163816"/>
  </linearGradient>
</defs>`;

  const defs = svgEl("style", {}, `.tick{stroke:${T.stroke};stroke-width:${O.strokeWidth};}`) + gradDefs;

  return svgEl("svg", {
    xmlns:"http://www.w3.org/2000/svg",
    viewBox:`0 0 ${W} ${H}`,
    width:W, height:H,
    style:`background:${T.bg}`
  }, defs + header + content);
}


// ---------------------------------------------------------------------
// ROUTER: sceglie single vs double completion
// ---------------------------------------------------------------------
export function renderWellSurfaceSvg(data, opts = {}) {
  return isDoubleCompletion(data)
    ? renderDoubleCompletion(data, opts)
    : renderSingleCompletion(data, opts);
}


// ---------------------------------------------------------------------
// EXPORT base elements (utile per testing/riuso)
// ---------------------------------------------------------------------
export const Elements = {
  pipeVertical,
  pipeHorizontal,
  flange,
  wellheadBody,
  xmasTreeBody,
  xmasTreeBodyDouble,
  gateValveManual,
  gateValveHydraulic,
  gateValveScssv
};


// ---------------------------------------------------------------------
// VALVE BALLOON (identico al tuo, con UI minima)
// ---------------------------------------------------------------------
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

    const info = JSON.parse(g.dataset.valve || "{}");
    const rows = [
      ["Type", info.type],
      ["Description", info.description],
      ["Installed", info.installation_year],
      ["Dimension", info.dimension],
      ["Working Pressure", info.working_pressure ? `${info.working_pressure} psi` : null],
      ["Allowable Leak Rate", info.allowable_leak_rate ? `${info.allowable_leak_rate} cc/min` : null],
      ["Manufacturer", info.manufacturer],
      ["Depth", info.depth],
    ].filter(([, v]) => v != null && v !== "");

    b.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;
                  margin-bottom:8px;border-bottom:1px solid #E5E7EB;padding-bottom:7px">
        <span style="font-weight:700;font-size:14px">${info.name ?? "Component"}</span>
        <span style="font-size:11px;font-weight:600;color:#6B7280;background:#F3F4F6;
                     padding:2px 6px;border-radius:4px;margin-left:8px">${info.acronym ?? ""}</span>
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
    const bw = 300;
    let left = rect.right + 12;
    let top  = rect.top - 8;
    if (left + bw > window.innerWidth - 8) left = rect.left - bw - 12;
    if (top + 220 > window.innerHeight - 8) top = window.innerHeight - 228;
    if (top < 8) top = 8;

    b.style.left = `${left}px`;
    b.style.top  = `${top}px`;
    b.style.display = "block";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-valve]") && !e.target.closest("#wv-balloon")) hide();
  });
}