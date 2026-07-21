import { auth, db } from "../../config/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

export const UserModel = {
  async register(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "utilisateurs", user.uid), {
      nom: name,
      email: email,
      role: "Employé",
      actif: true,
    });

    return user;
  },

  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },
};