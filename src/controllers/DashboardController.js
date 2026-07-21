import { SalleModel } from "../models/SalleModel.js";
import { DashboardView, buildParamDefs } from "../views/DashboardView.js";

// Correspondance entre la clé utilisée par la vue (icônes) et le nom du champ dans Firestore
const FIELD_MAP = {
  ventilation: "ventilation",
  clim: "climatisation",
  eclairage: "eclairage",
};

let capaciteActuelle = 10; // valeur par defaut tant que "salle" n'a pas encore repondu

function renderActionneursDepuisSalle(salle) {
  const actionneurs = Object.keys(FIELD_MAP).map((key) => {
    const champ = FIELD_MAP[key];
    const valeur = salle[champ];
    return {
      key,
      label: key === "clim" ? "Climatisation" : key === "eclairage" ? "Eclairage" : "Ventilation",
      on: valeur === "ON",
      auto: valeur === undefined,
    };
  });
  DashboardView.renderActionneurs(actionneurs);
}

document.addEventListener("DOMContentLoaded", () => {

  // Horloge
  DashboardView.renderClock();
  setInterval(() => DashboardView.renderClock(), 1000);

  // Salle (titre, capacite, occupants, actionneurs)
  SalleModel.watchSalle((salle) => {
    DashboardView.renderHeader(salle.nom || "Salle de reunion");
    capaciteActuelle = salle.capacite || 10;
    DashboardView.renderOccupants(salle.occupants_actuels || 0, capaciteActuelle);
    renderActionneursDepuisSalle(salle);
  });

  // Mesures (jauges)
  SalleModel.watchMesures((mesure) => {
    const paramDefs = buildParamDefs(capaciteActuelle);
    const values = {
      temperature: mesure.temperature,
      co2: mesure.qualite_air,
      humidite: mesure.humidite,
      luminosite: mesure.luminosite,
    };
    DashboardView.renderGauges(paramDefs, values);
  });

  // Alertes
  SalleModel.watchAlertes((alertes) => {
    DashboardView.renderAlerts(alertes);
  });

  // Reunion en cours
  SalleModel.watchReservations((reunion) => {
    DashboardView.renderReunion(reunion);
  });

  // Terminal d'acces badge
  SalleModel.watchAcces((log) => {
    DashboardView.renderLog(log);
  });

  // Clic sur les boutons ON/OFF des actionneurs
  const grid = document.getElementById("actionneurs-grid");
  if (grid) {
    grid.addEventListener("click", async (e) => {
      const btn = e.target.closest(".btn-toggle");
      if (!btn) return;

      const key = btn.dataset.key;
      const champ = FIELD_MAP[key];
      const isOn = btn.dataset.state === "on";

      try {
        await SalleModel.updateActionneur(champ, isOn);
      } catch (err) {
        console.error("Erreur mise a jour actionneur :", err);
      }
    });
  }

});