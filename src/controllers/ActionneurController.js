import { ActionneurModel } from "../models/ActionneurModel.js";

export const ActionneurController = {
  watch(salleId, onUpdate) {
    return ActionneurModel.listenActionneurs(salleId, (data) => {
      const actionneurs = [
        { key: "ventilation", label: "Ventilation", on: data.ventilation?.on || false, auto: data.ventilation?.auto ?? true },
        { key: "clim", label: "Climatisation", on: data.climatisation?.on || false, auto: data.climatisation?.auto ?? true },
        { key: "eclairage", label: "Éclairage", on: data.eclairage?.on || false, auto: data.eclairage?.auto ?? true },
      ];
      onUpdate(actionneurs);
    });
  },

  async toggle(salleId, key, on) {
    const dbKey = key === "clim" ? "climatisation" : key;
    await ActionneurModel.setEtat(salleId, dbKey, on);
  },
};