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

const TONE_HEX = { good: "#35D48A", warn: "#F2A93B", danger: "#F0555B", idle: "#3A4652" };

const TEMP_SAISON = {
  ete: { good: [23, 26], warn: [21, 28] },
  hiver: { good: [20, 23], warn: [18, 25] },
};

function getSaison() {
  const mois = new Date().getMonth() + 1;
  return mois >= 5 && mois <= 9 ? "ete" : "hiver";
}

function getCO2Seuils(capacite) {
  if (capacite <= 6) return { good: [400, 800], warn: [400, 1000] };
  if (capacite <= 15) return { good: [400, 900], warn: [400, 1100] };
  return { good: [400, 1000], warn: [400, 1200] };
}

export function buildParamDefs(capacite) {
  const tempRange = TEMP_SAISON[getSaison()];
  const co2Range = getCO2Seuils(capacite);
  return [
    { key: "temperature", label: "Température", unit: "°C", min: 10, max: 32, good: tempRange.good, warn: tempRange.warn },
    { key: "co2", label: "CO2", unit: "ppm", min: 400, max: 1600, good: co2Range.good, warn: co2Range.warn },
    { key: "humidite", label: "Humidité", unit: "%", min: 10, max: 90, good: [40, 60], warn: [30, 70] },
    { key: "luminosite", label: "Luminosité", unit: "lux", min: 0, max: 800, good: [300, 500], warn: [150, 700] },
  ];
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function statusFor(def, value) {
  const [gLo, gHi] = def.good;
  const [wLo, wHi] = def.warn;
  if (value >= gLo && value <= gHi) return { label: "Bon", tone: "good" };
  if (value >= wLo && value <= wHi) return { label: "Moyen", tone: "warn" };
  return { label: "Critique", tone: "danger" };
}

function icon(name, size, color) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;
}

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
  const ticksMarkup = ticks
    .map((t) => {
      const [x1, y1] = toXY(t);
      const rad = (t - 90) * (Math.PI / 180);
      const x2 = CX + (R - 12) * Math.cos(rad);
      const y2 = CY + (R - 12) * Math.sin(rad);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#3A4652" stroke-width="1.5" />`;
    })
    .join("");
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

function formatClock(d) {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export const DashboardView = {
  renderHeader(nomSalle) {
    const t = document.getElementById("salle-titre");
    if (t) t.textContent = nomSalle;
  },

  renderOccupants(presentCount, capacite) {
    const el = document.getElementById("occupants");
    const count = clamp(presentCount, 0, capacite + 2);
    if (el) el.innerHTML = `<span id="occ-value">${count}</span><span class="max">/${capacite}</span>`;
  },

  renderClock() {
    const clockEl = document.getElementById("clock");
    if (clockEl) clockEl.textContent = formatClock(new Date());
  },

  renderGauges(paramDefs, values) {
    const grid = document.getElementById("gauges-grid");
    if (grid) grid.innerHTML = paramDefs.map((def) => buildGaugeTile(def, values[def.key] || 0)).join("");
  },

  renderActionneurs(actionneurs) {
    const grid = document.getElementById("actionneurs-grid");
    if (!grid) return;
    grid.innerHTML = actionneurs
      .map(
        (a) => `
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
          <button class="btn-toggle off ${!a.on ? "active" : ""}" data-key="${a.key}" data-state="off">OFF</button>
          <button class="btn-toggle on ${a.on ? "active" : ""}" data-key="${a.key}" data-state="on">ON</button>
        </div>
      </div>
    `
      )
      .join("");
  },

  renderReunion(reunion) {
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
  },

  renderLog(log) {
    const list = document.getElementById("terminal-list");
    if (!list) return;
    if (log.length === 0) {
      list.innerHTML = `<div class="terminal-empty">En attente de scan...</div>`;
      return;
    }
    list.innerHTML = log
      .map(
        (entry) => `
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
    `
      )
      .join("");
  },

  renderAlerts(alerts) {
    const list = document.getElementById("alerts-list");
    if (!list) return;
    if (alerts.length === 0) {
      list.innerHTML = `<div class="alerts-empty">Aucune alerte &mdash; tout est nominal.</div>`;
      return;
    }
    list.innerHTML = alerts
      .map(
        (a) => `
      <div class="alert-item row-in">
        <div>
          <div class="alert-msg">${a.message}</div>
          <div class="alert-time">${a.date_alerte}</div>
        </div>
        <button class="alert-dismiss" data-id="${a.id}">${icon("x", 13, "currentColor")}</button>
      </div>
    `
      )
      .join("");
  },
};