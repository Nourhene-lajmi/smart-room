import { auth } from "../../config/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { SalleModel } from "../models/SalleModel.js";
import { DashboardView, buildParamDefs } from "../views/DashboardView.js";

let salleInfo = { nom_salle: "Salle", capacite: 10, statut: "DISPONIBLE" };
let paramDefs = buildParamDefs(salleInfo.capacite);
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

function startFirestoreListeners() {
  if (listenersStarted) return;
  listenersStarted = true;

  SalleModel.watchSalle((d) => {
    salleInfo = {
      nom_salle: d.nom_salle || "Salle",
      capacite: d.capacite || 10,
      statut: d.statut || "DISPONIBLE",
    };
    paramDefs = buildParamDefs(salleInfo.capacite);

    actionneurs = actionneurs.map((a) => {
      if (a.key === "ventilation") return { ...a, on: d.ventilation_etat === "ON" };
      if (a.key === "clim") return { ...a, on: d.climatisation_etat === "ON" };
      if (a.key === "eclairage") return { ...a, on: d.eclairage_etat === "ON" };
      return a;
    });

    DashboardView.renderHeader(salleInfo.nom_salle);
    const present = log.filter((l) => l.statut === "autorise").length;
    DashboardView.renderOccupants(present, salleInfo.capacite);
    DashboardView.renderGauges(paramDefs, values);
    DashboardView.renderActionneurs(actionneurs);
  });

  SalleModel.watchMesures((d) => {
    values = {
      temperature: d.temperature || 0,
      co2: d.qualite_air || 0,
      humidite: d.humidite || 0,
      luminosite: d.luminosite || 0,
    };
    DashboardView.renderGauges(paramDefs, values);
  });

  SalleModel.watchAlertes((data) => {
    alerts = data;
    DashboardView.renderAlerts(alerts);
  });

  SalleModel.watchReservations((data) => {
    reunion = data;
    DashboardView.renderReunion(reunion);
  });

  SalleModel.watchAcces((data) => {
    log = data;
    DashboardView.renderLog(log);
    const present = log.filter((l) => l.statut === "autorise").length;
    DashboardView.renderOccupants(present, salleInfo.capacite);
  });
}

function bindUserActions() {
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
        await SalleModel.updateActionneur(field, targetState);
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
      DashboardView.renderAlerts(alerts);
    });
  }
}

function init() {
  DashboardView.renderHeader(salleInfo.nom_salle);
  DashboardView.renderClock();
  DashboardView.renderGauges(paramDefs, values);
  DashboardView.renderActionneurs(actionneurs);
  DashboardView.renderReunion(reunion);
  DashboardView.renderLog(log);
  DashboardView.renderAlerts(alerts);
  setInterval(() => DashboardView.renderClock(), 1000);
  bindUserActions();
}

onAuthStateChanged(auth, (user) => {
  if (!user) {
    console.warn("Utilisateur non connecté, redirection vers login...");
    window.location.href = "../../public/login.html";
  } else {
    console.log("Connecté en tant que :", user.email);
    startFirestoreListeners();
  }
});

document.addEventListener("DOMContentLoaded", init);