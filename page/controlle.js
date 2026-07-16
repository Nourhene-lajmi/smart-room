/* ==========================================================================
   DONNEES DE REFERENCE & CONFIGURATIONS
   ========================================================================== */

const RESERVATION = {
  titre: "Réunion d'équipe",
  organisateur: "Organisateur",
  salle: "Salle de réunion",
  debut: "09:00",
  fin: "10:30",
  capacite: 10,
  invites: [
    { nom: "Participant 1", role: "Responsable" },
    { nom: "Participant 2", role: "Employé" },
    { nom: "Participant 3", role: "Employé" },
    { nom: "Participant 4", role: "Employé" },
    { nom: "Participant 5", role: "Maintenance" },
  ],
};

const INCONNUS = ["Visiteur A", "Visiteur B", "Visiteur C", "Visiteur D"];

const ICONS = {
  temperature: '<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/>',
  co2: '<path d="M12.8 19.6A2 2 0 1 0 14 16H2"/><path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/><path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>',
  humidite: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>',
  luminosite: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  ventilation: '<path d="M10.827 16.379a6.082 6.082 0 0 1-8.618-7.002l5.412 1.45a6.082 6.082 0 0 1 7.002-8.618l-1.45 5.412a6.082 6.082 0 0 1 8.618 7.002l-5.412-1.45a6.082 6.082 0 0 1-7.002 8.618l1.45-5.412z"/><path d="M12 12v.01"/>',
  clim: '<line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>',
  eclairage: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  shieldCheck: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  shieldAlert: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
};

/* ==========================================================================
   SAISON & SEUILS DYNAMIQUES (température selon saison, CO2 selon capacité)
   ========================================================================== */

function getSaison() {
  const mois = new Date().getMonth() + 1; // 1-12
  // Tunisie : été ~ mai à septembre, hiver ~ octobre à avril
  return (mois >= 5 && mois <= 9) ? "ete" : "hiver";
}

// Seuils température selon la saison (ASHRAE 55 - confort adaptatif)
const TEMP_SAISON = {
  ete:   { good: [23, 26], warn: [21, 28] }, // vêtements légers, tolérance chaleur
  hiver: { good: [20, 23], warn: [18, 25] }, // vêtements chauds, tolérance froid
};

// Seuils CO2 selon la capacité de la salle (ASHRAE 62.1 - débit d'air par occupant)
function getCO2Seuils(capacite) {
  if (capacite <= 6)  return { good: [400, 800],  warn: [400, 1000] };  // petite salle
  if (capacite <= 15) return { good: [400, 900],  warn: [400, 1100] };  // salle moyenne
  return               { good: [400, 1000], warn: [400, 1200] };        // grande salle
}

function buildParamDefs() {
  const saison = getSaison();
  const tempRange = TEMP_SAISON[saison];
  const co2Range = getCO2Seuils(RESERVATION.capacite);

  return [
    { key: "temperature", label: "Température", unit: "°C", min: 10, max: 32, good: tempRange.good, warn: tempRange.warn },
    { key: "co2", label: "CO2", unit: "ppm", min: 400, max: 1600, good: co2Range.good, warn: co2Range.warn },
    { key: "humidite", label: "Humidité", unit: "%", min: 10, max: 90, good: [40, 60], warn: [30, 70] },
    { key: "luminosite", label: "Luminosité", unit: "lux", min: 0, max: 800, good: [300, 500], warn: [150, 700] },
  ];
}

let PARAM_DEFS = buildParamDefs();

const ACTIONNEURS_INIT = [
  { key: "ventilation", label: "Ventilation", auto: true, on: false },
  { key: "clim", label: "Climatisation", auto: true, on: false },
  { key: "eclairage", label: "Éclairage", auto: true, on: true },
];

const TONE_HEX = { good: "#35D48A", warn: "#F2A93B", danger: "#F0555B", idle: "#3A4652" };

/* ==========================================================================
   ETAT GLOBAL DE L'APPLICATION
   ========================================================================== */

let values = { temperature: 22.4, co2: 640, humidite: 48, luminosite: 410 };
let actionneurs = ACTIONNEURS_INIT.map((a) => ({ ...a }));
let log = [];
let alerts = [];
let logId = 0;
let alertId = 0;

/* ==========================================================================
   FONCTIONS UTILITAIRES
   ========================================================================== */

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

function statusFor(def, value) {
  const [gLo, gHi] = def.good;
  const [wLo, wHi] = def.warn;
  if (value >= gLo && value <= gHi) return { label: "Bon", tone: "good" };
  if (value >= wLo && value <= wHi) return { label: "Moyen", tone: "warn" };
  return { label: "Critique", tone: "danger" };
}

function formatClock(d) {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function icon(name, size, color) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

/* ==========================================================================
   ARC GAUGE (SVG GENERATION)
   ========================================================================== */

function buildGaugeSVG(def, value) {
  const status = statusFor(def, value);
  const color = TONE_HEX[status.tone];

  const startAngle = -125;
  const endAngle = 125;
  const ratio = clamp((value - def.min) / (def.max - def.min), 0, 1);
  const angle = startAngle + ratio * (endAngle - startAngle);

  const R = 62;
  const CX = 80, CY = 80;
  const toXY = (deg) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return [CX + R * Math.cos(rad), CY + R * Math.sin(rad)];
  };
  const arcPath = (a0, a1) => {
    const [x0, y0] = toXY(a0);
    const [x1, y1] = toXY(a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1}`;
  };

  const ticks = Array.from({ length: 9 }, (_, i) => startAngle + (i * (endAngle - startAngle)) / 8);
  const ticksMarkup = ticks.map((t) => {
    const [x1, y1] = toXY(t);
    const rad = (t - 90) * (Math.PI / 180);
    const x2 = CX + (R - 12) * Math.cos(rad);
    const y2 = CY + (R - 12) * Math.sin(rad);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3A4652" stroke-width="1.5" />`;
  }).join("");

  const decimals = def.key === "co2" ? 0 : 1;

  return `
    <svg width="160" height="150" viewBox="0 0 160 150">
      <path d="${arcPath(startAngle, endAngle)}" stroke="#232E39" stroke-width="10" fill="none" stroke-linecap="round" />
      <path d="${arcPath(startAngle, angle)}" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round" style="transition: stroke 600ms ease, d 600ms ease;" />
      ${ticksMarkup}
      <text x="${CX}" y="${CY - 6}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="26" font-weight="600" fill="#1A2B3C">${value.toFixed(decimals)}</text>
      <text x="${CX}" y="${CY + 16}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" fill="#4A5A6A">${def.unit}</text>
    </svg>
  `;
}

function buildGaugeTile(def, value) {
  const status = statusFor(def, value);
  const color = TONE_HEX[status.tone];
  return `
    <div class="gauge-tile">
      <div class="gauge-col">
        ${buildGaugeSVG(def, value)}
        <div class="gauge-label-row">
          ${icon(def.key, 14, "#8494A3")}
          <span>${def.label}</span>
        </div>
        <span class="gauge-badge" style="color:${color}; background-color:${color}1A; border:1px solid ${color}55;">
          ${status.label.toUpperCase()}
        </span>
      </div>
    </div>
  `;
}

/* ==========================================================================
   FONCTIONS DE RENDU DU DOM
   ========================================================================== */

function occupantsCount() {
  const present = log.filter((l) => l.statut === "autorise").length
    - log.filter((l) => l.statut === "sortie").length;
  return clamp(present, 0, RESERVATION.capacite + 2);
}

function renderHeaderStatic() {
  document.getElementById("salle-titre").textContent = RESERVATION.salle;
  document.getElementById("occ-value").parentElement.innerHTML =
    `<span id="occ-value">${occupantsCount()}</span><span class="max">/${RESERVATION.capacite}</span>`;
}

function renderOccupants() {
  const el = document.getElementById("occupants");
  if(el) {
    el.innerHTML = `<span id="occ-value">${occupantsCount()}</span><span class="max">/${RESERVATION.capacite}</span>`;
  }
}

function renderClock() {
  const clockEl = document.getElementById("clock");
  if(clockEl) clockEl.textContent = formatClock(new Date());
}

function renderGauges() {
  const grid = document.getElementById("gauges-grid");
  if(grid) grid.innerHTML = PARAM_DEFS.map((def) => buildGaugeTile(def, values[def.key])).join("");
}

function renderActionneurs() {
  const grid = document.getElementById("actionneurs-grid");
  if (!grid) return;

  grid.innerHTML = actionneurs.map((a) => `
    <div class="actionneur-card" style="border-color:${a.on ? "#35D48A55" : "#232E39"};">
      <div class="actionneur-left">
        <div class="actionneur-icon ${a.on ? "on" : ""}">
          ${icon(a.key, 17, a.on ? "#35D48A" : "#5A6875")}
        </div>
        <div>
          <div class="actionneur-title">${a.label}</div>
          <div class="actionneur-mode">${a.auto ? "Auto" : "Manuel"}</div>
        </div>
      </div>

      <div class="actionneur-controls">
        <button
          class="btn-toggle off ${!a.on ? 'active' : ''}"
          data-key="${a.key}"
          data-state="off"
          aria-label="Éteindre ${a.label}">
          OFF
        </button>
        <button
          class="btn-toggle on ${a.on ? 'active' : ''}"
          data-key="${a.key}"
          data-state="on"
          aria-label="Allumer ${a.label}">
          ON
        </button>
      </div>
    </div>
  `).join("");
}

const actionneursGrid = document.getElementById("actionneurs-grid");
if (actionneursGrid) {
  actionneursGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-toggle");
    if (!btn) return;

    const key = btn.getAttribute("data-key");
    const targetState = btn.getAttribute("data-state") === "on";

    // Mettre à jour l'état de l'actionneur ciblé
    actionneurs = actionneurs.map((a) => {
      if (a.key === key) {
        return { ...a, on: targetState, auto: false }; // Force le passage en Manuel
      }
      return a;
    });

    // Forcer le rendu immédiat des cartes mis à jour
    renderActionneurs();
  });
}

function renderReunion() {
  document.getElementById("reunion-titre").textContent = RESERVATION.titre;
  document.getElementById("reunion-meta").textContent =
    `Organisateur : ${RESERVATION.organisateur} \u00B7 ${RESERVATION.debut} - ${RESERVATION.fin}`;
  document.getElementById("reunion-avatars").innerHTML = RESERVATION.invites.map((p) => `
    <div class="avatar" title="${p.nom}">${p.nom.split(" ").map((s) => s[0]).join("")}</div>
  `).join("");
}

function renderLog() {
  const list = document.getElementById("terminal-list");
  if(!list) return;
  if (log.length === 0) {
    list.innerHTML = `<div class="terminal-empty">En attente de scan...</div>`;
    return;
  }
  list.innerHTML = log.map((entry) => `
    <div class="terminal-row row-in">
      <div class="terminal-left">
        ${entry.statut === "autorise" ? icon("shieldCheck", 14, "#35D48A") : icon("shieldAlert", 14, "#F0555B")}
        <span>${entry.nom}</span>
      </div>
      <div class="terminal-right">
        <span class="terminal-time">${entry.heure}</span>
        <span class="terminal-status" style="color:${entry.statut === "autorise" ? "#35D48A" : "#F0555B"};">
          ${entry.statut === "autorise" ? "OK" : "REFUS"}
        </span>
      </div>
    </div>
  `).join("");
}

function renderAlerts() {
  const list = document.getElementById("alerts-list");
  if(!list) return;
  if (alerts.length === 0) {
    list.innerHTML = `<div class="alerts-empty">Aucune alerte &mdash; tout est nominal.</div>`;
    return;
  }
  list.innerHTML = alerts.map((a) => `
    <div class="alert-item row-in ${a.type === "acces" ? "acces" : "seuil"}">
      <div>
        <div class="alert-msg">${a.msg}</div>
        <div class="alert-time">${a.heure}</div>
      </div>
      <button class="alert-dismiss" data-id="${a.id}" aria-label="Ignorer l'alerte">
        ${icon("x", 13, "currentColor")}
      </button>
    </div>
  `).join("");
}

/* ==========================================================================
   SIMULATION DE FLUX & CAPTEURS
   ========================================================================== */

function tickSensors() {
  const occ = occupantsCount();
  const occFactor = occ / RESERVATION.capacite;
  values = {
    temperature: clamp(values.temperature + (Math.random() - 0.45) * 0.3 + occFactor * 0.05, 16, 30),
    co2: clamp(values.co2 + (Math.random() - 0.3) * 25 + occFactor * 18, 400, 1500),
    humidite: clamp(values.humidite + (Math.random() - 0.5) * 1.2, 20, 80),
    luminosite: clamp(values.luminosite + (Math.random() - 0.5) * 14, 50, 750),
  };

  actionneurs = actionneurs.map((a) => {
    if (!a.auto) return a;
    if (a.key === "ventilation") return { ...a, on: values.co2 > 850 };
    if (a.key === "clim") return { ...a, on: values.temperature > 24.5 || values.temperature < 19.5 };
    if (a.key === "eclairage") return { ...a, on: values.luminosite < 320 || occ > 0 };
    return a;
  });

  const critiques = [];
  PARAM_DEFS.forEach((def) => {
    const s = statusFor(def, values[def.key]);
    if (s.tone === "danger") critiques.push(`${def.label} hors plage : ${values[def.key].toFixed(1)} ${def.unit}`);
  });
  const kept = alerts.filter((p) => p.type === "acces");
  const fresh = critiques.map((msg) => ({ id: `seuil-${msg}`, type: "seuil", msg, heure: formatClock(new Date()) }));
  alerts = [...fresh, ...kept].slice(0, 6);

  renderGauges();
  renderActionneurs();
  renderAlerts();
}

function pushScan() {
  const isInvite = Math.random() > 0.28;
  let nom, role, statut;
  if (isInvite) {
    const person = RESERVATION.invites[Math.floor(Math.random() * RESERVATION.invites.length)];
    nom = person.nom; role = person.role; statut = "autorise";
  } else {
    nom = INCONNUS[Math.floor(Math.random() * INCONNUS.length)];
    role = "Employé";
    statut = "refuse";
  }
  logId += 1;
  const entry = { id: logId, nom, role, statut, heure: formatClock(new Date()) };
  log = [entry, ...log].slice(0, 9);

  if (statut === "refuse") {
    alertId += 1;
    alerts = [
      { id: `acces-${alertId}`, type: "acces", msg: `Accès refusé : ${nom}`, heure: entry.heure },
      ...alerts,
    ].slice(0, 6);
  }

  renderLog();
  renderOccupants();
  renderAlerts();
}

/* ==========================================================================
   INITIALISATION ET ECOUTEURS
   ========================================================================== */

function init() {
  renderHeaderStatic();
  renderClock();
  renderGauges();
  renderActionneurs();
  renderReunion();
  renderLog();
  renderAlerts();

  // Écouteur délégué pour fermer les alertes
  const alertsList = document.getElementById("alerts-list");
  if(alertsList) {
    alertsList.addEventListener("click", (e) => {
      const btn = e.target.closest(".alert-dismiss");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      alerts = alerts.filter((a) => a.id !== id);
      renderAlerts();
    });
  }

  // Boucles de rafraîchissement
  setInterval(renderClock, 1000);
  setInterval(tickSensors, 2500);
  setInterval(pushScan, 4200);
}

// Lancement au chargement du DOM
document.addEventListener("DOMContentLoaded", init);