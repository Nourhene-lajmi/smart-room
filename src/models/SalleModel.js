import { db } from "../../config/firebase-config.js";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const SALLE_ID = "salle1";
const SALLE_COLLECTION = "salle";

export const SalleModel = {
  SALLE_ID,

  watchSalle(callback) {
    return onSnapshot(
      doc(db, SALLE_COLLECTION, SALLE_ID),
      (snap) => {
        if (!snap.exists()) {
          console.warn("Document salle introuvable:", SALLE_COLLECTION, SALLE_ID);
          return;
        }
        callback(snap.data());
      },
      (error) => console.error("Erreur salle:", error)
    );
  },

  watchMesures(callback) {
    console.log("DEBUG - SALLE_ID utilisé :", JSON.stringify(SALLE_ID));

    const q = query(
      collection(db, "mesures"),
      where("id_salle", "==", SALLE_ID),
      orderBy("date_mesure", "desc"),
      limit(1)
    );
    return onSnapshot(
      q,
      (snap) => {
        console.log("DEBUG - snap.empty :", snap.empty, "| taille :", snap.size);
        if (snap.empty) {
          console.warn("Aucune mesure trouvée");
          return;
        }
        console.log("DEBUG - données reçues :", snap.docs[0].data());
        callback(snap.docs[0].data());
      },
      (error) => console.error("Erreur mesures:", error)
    );
  },

  watchAlertes(callback) {
    const q = query(
      collection(db, "alertes"),
      where("id_salle", "==", SALLE_ID),
      where("statut", "==", "NON_LUE")
    );
    return onSnapshot(
      q,
      (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (error) => console.error("Erreur alertes:", error)
    );
  },

  watchReservations(callback) {
    const q = query(
      collection(db, "reservations"),
      where("id_salle", "==", SALLE_ID),
      where("statut", "==", "CONFIRMEE")
    );
    return onSnapshot(
      q,
      (snap) => callback(snap.empty ? null : snap.docs[0].data()),
      (error) => console.error("Erreur reservations:", error)
    );
  },

  watchAcces(callback) {
    const q = query(
      collection(db, "acces_logs"),
      where("id_salle", "==", SALLE_ID),
      orderBy("date_heure", "desc"),
      limit(9)
    );
    return onSnapshot(
      q,
      (snap) => {
        const log = snap.docs.map((docu) => {
          const d = docu.data();
          return {
            nom: d.rfid_tag,
            statut: d.statut_acces === "ACCEPTE" ? "autorise" : "refuse",
            heure: d.date_heure,
          };
        });
        callback(log);
      },
      (error) => console.error("Erreur acces_logs:", error)
    );
  },

  async updateActionneur(field, isOn) {
    await updateDoc(doc(db, SALLE_COLLECTION, SALLE_ID), {
      [field]: isOn ? "ON" : "OFF",
    });
  },
};