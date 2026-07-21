import { db } from "../../config/firebase-config.js";
import {
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export const ActionneurModel = {
  // Écoute en temps réel les actionneurs d'une salle
  listenActionneurs(salleId, callback) {
    const ref = doc(db, "actionneurs", salleId);
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        // Valeurs par défaut si le document n'existe pas encore
        callback({
          ventilation: { on: false, auto: true },
          climatisation: { on: false, auto: true },
          eclairage: { on: false, auto: true },
        });
      }
    });
  },

  // Met à jour l'état ON/OFF d'un actionneur précis
  async setEtat(salleId, key, on) {
    const ref = doc(db, "actionneurs", salleId);
    await setDoc(
      ref,
      { [key]: { on, auto: false } },
      { merge: true }
    );
  },
};