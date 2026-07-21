import { AuthController } from "../controllers/AuthController.js";

function initAuthView() {
  const signupBtn = document.getElementById("signupBtn");
  const signinBtn = document.getElementById("signinBtn");

  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const name = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const password = document.getElementById("signupPassword").value;

      try {
        await AuthController.handleSignUp(name, email, password);
        alert("Compte créé avec succès !");
        window.location.href = "../../project.html";
      } catch (error) {
        alert("Erreur : " + error.message);
      }
    });
  }

  if (signinBtn) {
    signinBtn.addEventListener("click", async () => {
      const email = document.getElementById("signinEmail").value;
      const password = document.getElementById("signinPassword").value;

      try {
        await AuthController.handleSignIn(email, password);
        alert("Connexion réussie !");
        window.location.href = "../../project.html";
      } catch (error) {
        alert("Erreur : " + error.message);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", initAuthView);