/* ==========================================================================
   FIREBASE INIT
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  getFirestore, doc, onSnapshot, collection, query,
  where, orderBy, limit, updateDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCv_NLOCXb3ApTMSjxsIDLbYrUr1Ymi-rA",
  authDomain: "smart-room-c163c.firebaseapp.com",
  databaseURL: "https://smart-room-c163c-default-rtdb.firebaseio.com",
  projectId: "smart-room-c163c",
  storageBucket: "smart-room-c163c.firebasestorage.app",
  messagingSenderId: "552350325154",
  appId: "1:552350325154:web:4cbe5619639f844d7dbafb",
  measurementId: "G-7DY5JE1SR4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SALLE_ID = "salle1";
const SALLE_COLLECTION = "salle";

/* ==========================================================================
   ICONS
   ========================================================================== */

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
   SEUILS
   ========================================================================== */

const TEMP_SAISON = {
  ete:   { good: [23, 26], warn: [21, 28] },
  hiver: { good: [20, 23], warn: [18, 25] },
};

function getSaison() {
  const mois = new Date().getMonth() + 1;
  return (mois >= 5 && mois <= 9) ? "ete" : "hiver";
}

function getCO2Seuils(capacite) {
  if (capacite <= 6)  return { good: [400, 800],  warn: [400, 1000] };
  if (capacite <= 15) return { good: [400, 900],  warn: [400, 1100] };
  return { good: [400, 1000], warn: [400, 1200] };
}

function buildParamDefs(capacite) {
  const saison = getSaison();
  const tempRange = TEMP_SAISON[saison];
  const co2Range = getCO2Seuils(capacite);
  return [
    { key: "temperature", label: "Température", unit: "°C", min: 10, max: 32, good: tempRange.good, warn: tempRange.warn },
    { key: "co2", label: "CO2", unit: "ppm", min: 400, max: 1600, good: co2Range.good, warn: co2Range.warn },
    { key: "humidite", label: "Humidité", unit: "%", min: 10, max: 90, good: [40, 60], warn: [30, 70] },
    { key: "luminosite", label: "Luminosité", unit: "lux", min: 0, max: 800, good: [300, 500], warn: [150, 700] },
  ];
}

const TONE_HEX = { good: "#35D48A", warn: "#F2A93B", danger: "#F0555B", idle: "#3A4652" };

/* ==========================================================================
   ETAT GLOBAL
   ========================================================================== */

let salleInfo = { nom_salle: "Salle", capacite: 10, statut: "DISPONIBLE" };
let PARAM_DEFS = buildParamDefs(salleInfo.capacite);
let values = { temperature: 0, co2: 0, humidite: 0, luminosite: 0 };
let actionneurs = [
  { key: "ventilation", label: "Ventilation", auto: true, on: false },
  { key: "clim", label: "Climatisation", auto: true, on: false },
  { key: "eclairage", label: "Éclairage", auto: true, on: false },
];
let log = [];
let alerts = [];
let reunion = null;
let listenersStarted = false;

/* ==========================================================================
   UTILITAIRES
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
   GAUGE SVG
   ========================================================================== */

function buildGaugeSVG(def, value) {
  const status = statusFor(def, value);
  const color = TONE_HEX[status.tone];
  const startAngle = -125, endAngle = 125;
  const ratio = clamp((value - def.min) / (def.max - def.min), 0, 1);
  const angle = startAngle + ratio * (endAngle - startAngle);
  const R = 62, CX = 80, CY = 80;
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
      <path d="${arcPath(startAngle, angle)}" stroke="${color}" stroke-width="10" fill="none" stroke-linecap="round" />
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
   RENDU DOM
   ========================================================================== */

function renderHeaderStatic() {
  const t = document.getElementById("salle-titre");
  if (t) t.textContent = salleInfo.nom_salle;
}

function renderOccupants() {
  const el = document.getElementById("occupants");
  const present = log.filter((l) => l.statut === "autorise").length;
  const count = clamp(present, 0, salleInfo.capacite + 2);
  if (el) el.innerHTML = `<span id="occ-value">${count}</span><span class="max">/${salleInfo.capacite}</span>`;
}

function renderClock() {
  const clockEl = document.getElementById("clock");
  if (clockEl) clockEl.textContent = formatClock(new Date());
}

function renderGauges() {
  const grid = document.getElementById("gauges-grid");
  if (grid) grid.innerHTML = PARAM_DEFS.map((def) => buildGaugeTile(def, values[def.key] || 0)).join("");
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
        <button class="btn-toggle off ${!a.on ? 'active' : ''}" data-key="${a.key}" data-state="off">OFF</button>
        <button class="btn-toggle on ${a.on ? 'active' : ''}" data-key="${a.key}" data-state="on">ON</button>
      </div>
    </div>
  `).join("");
}

function renderReunion() {
  const titreEl = document.getElementById("reunion-titre");
  const metaEl = document.getElementById("reunion-meta");
  const avatarsEl = document.getElementById("reunion-avatars");
  if (!reunion) {
    if (titreEl) titreEl.textContent = "Aucune réunion en cours";
    if (metaEl) metaEl.textContent = "";
    if (avatarsEl) avatarsEl.innerHTML = "";
    return;
  }
  if (titreEl) titreEl.textContent = "Réunion";
  if (metaEl) metaEl.textContent = `${reunion.date_debut} \u2192 ${reunion.date_fin}`;
  if (avatarsEl) avatarsEl.innerHTML = "";
}

function renderLog() {
  const list = document.getElementById("terminal-list");
  if (!list) return;
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
  if (!list) return;
  if (alerts.length === 0) {
    list.innerHTML = `<div class="alerts-empty">Aucune alerte &mdash; tout est nominal.</div>`;
    return;
  }
  list.innerHTML = alerts.map((a) => `
    <div class="alert-item row-in">
      <div>
        <div class="alert-msg">${a.message}</div>
        <div class="alert-time">${a.date_alerte}</div>
      </div>
      <button class="alert-dismiss" data-id="${a.id}">${icon("x", 13, "currentColor")}</button>
    </div>
  `).join("");
}

/* ==========================================================================
   FIRESTORE LISTENERS (démarrés seulement après connexion confirmée)
   ========================================================================== */

function startFirestoreListeners() {
  if (listenersStarted) return;
  listenersStarted = true;

  onSnapshot(doc(db, SALLE_COLLECTION, SALLE_ID), (snap) => {
    if (!snap.exists()) {
      console.warn("Document salle introuvable:", SALLE_COLLECTION, SALLE_ID);
      return;
    }
    const d = snap.data();
    salleInfo = {
      nom_salle: d.nom_salle || "Salle",
      capacite: d.capacite || 10,
      statut: d.statut || "DISPONIBLE",
    };
    PARAM_DEFS = buildParamDefs(salleInfo.capacite);

    actionneurs = actionneurs.map((a) => {
      if (a.key === "ventilation") return { ...a, on: d.ventilation_etat === "ON" };
      if (a.key === "clim") return { ...a, on: d.climatisation_etat === "ON" };
      if (a.key === "eclairage") return { ...a, on: d.eclairage_etat === "ON" };
      return a;
    });

    renderHeaderStatic();
    renderOccupants();
    renderGauges();
    renderActionneurs();
  }, (error) => console.error("Erreur salle:", error));

  const mesuresQuery = query(
    collection(db, "mesures"),
    where("id_salle", "==", SALLE_ID),
    orderBy("date_mesure", "desc"),
    limit(1)
  );
  onSnapshot(mesuresQuery, (snap) => {
    if (snap.empty) {
      console.warn("Aucune mesure trouvée");
      return;
    }
    const d = snap.docs[0].data();
    values = {
      temperature: d.temperature || 0,
      co2: d.qualite_air || 0,
      humidite: d.humidite || 0,
      luminosite: d.luminosite || 0,
    };
    renderGauges();
  }, (error) => console.error("Erreur mesures:", error));

  const alertesQuery = query(
    collection(db, "alertes"),
    where("id_salle", "==", SALLE_ID),
    where("statut", "==", "NON_LUE")
  );
  onSnapshot(alertesQuery, (snap) => {
    alerts = snap.docs.map((docu) => ({ id: docu.id, ...docu.data() }));
    renderAlerts();
  }, (error) => console.error("Erreur alertes:", error));

  const reservationsQuery = query(
    collection(db, "reservations"),
    where("id_salle", "==", SALLE_ID),
    where("statut", "==", "CONFIRMEE")
  );
  onSnapshot(reservationsQuery, (snap) => {
    reunion = snap.empty ? null : snap.docs[0].data();
    renderReunion();
  }, (error) => console.error("Erreur reservations:", error));

  const accesQuery = query(
    collection(db, "acces_logs"),
    where("id_salle", "==", SALLE_ID),
    orderBy("date_heure", "desc"),
    limit(9)
  );
  onSnapshot(accesQuery, (snap) => {
    log = snap.docs.map((docu) => {
      const d = docu.data();
      return {
        nom: d.rfid_tag,
        statut: d.statut_acces === "ACCEPTE" ? "autorise" : "refuse",
        heure: d.date_heure,
      };
    });
    renderLog();
    renderOccupants();
  }, (error) => console.error("Erreur acces_logs:", error));
}

/* ==========================================================================
   VERIFICATION AUTHENTIFICATION
   ========================================================================== */

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("Utilisateur non connecté, redirection vers login...");
    window.location.href = "../login/fdd.html";
  } else {
    console.log("Connecté en tant que :", user.email);
    startFirestoreListeners();
  }
});

/* ==========================================================================
   ACTIONS UTILISATEUR
   ========================================================================== */

const actionneursGrid = document.getElementById("actionneurs-grid");
if (actionneursGrid) {
  actionneursGrid.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-toggle");
    if (!btn) return;
    const key = btn.getAttribute("data-key");
    const targetState = btn.getAttribute("data-state") === "on";
    const fieldMap = {
      ventilation: "ventilation_etat",
      clim: "climatisation_etat",
      eclairage: "eclairage_etat",
    };
    const field = fieldMap[key];
    if (!field) return;
    try {
      await updateDoc(doc(db, SALLE_COLLECTION, SALLE_ID), {
        [field]: targetState ? "ON" : "OFF",
      });
    } catch (err) {
      alert("Erreur mise à jour actionneur : " + err.message);
    }
  });
}

const alertsListEl = document.getElementById("alerts-list");
if (alertsListEl) {
  alertsListEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".alert-dismiss");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    alerts = alerts.filter((a) => a.id !== id);
    renderAlerts();
  });
}

/* ==========================================================================
   INITIALISATION
   ========================================================================== */

function init() {
  renderHeaderStatic();
  renderClock();
  renderGauges();
  renderActionneurs();
  renderReunion();
  renderLog();
  renderAlerts();
  setInterval(renderClock, 1000);
}

document.addEventListener("DOMContentLoaded", init);