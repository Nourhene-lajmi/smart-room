import AuthController from '../controllers/AuthController.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Basculement d'affichage (Panneau bleu glissant)
    const container = document.getElementById('container');
    const registerToggleBtn = document.getElementById('register');
    const loginToggleBtn = document.getElementById('login');

    if (registerToggleBtn && loginToggleBtn && container) {
        registerToggleBtn.addEventListener('click', () => {
            container.classList.add("active");
        });

        loginToggleBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    }

    // Fonction d'aide pour gérer et traduire les erreurs
    const handleAuthError = (error) => {
        if (!error.code) {
            alert(error.message || "Veuillez remplir correctement tous les champs.");
            return;
        }

        console.error("Code d'erreur Firebase :", error.code);

        switch (error.code) {
            case 'auth/email-already-in-use':
                alert("Cet e-mail est déjà utilisé. Essayez de vous connecter ou utilisez une autre adresse.");
                break;
            case 'auth/invalid-email':
                alert("L'adresse e-mail n'est pas valide. Vérifiez qu'il n'y a pas de faute d'orthographe ou d'espace en trop.");
                break;
            case 'auth/weak-password':
                alert("Le mot de passe doit contenir au moins 6 caractères.");
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                alert("E-mail ou mot de passe incorrect.");
                break;
            default:
                alert(error.message || "Une erreur est survenue lors de l'authentification.");
        }
    };

    // 2. Soumission Connexion (Sign In)
    const signinBtn = document.getElementById('signinBtn');
    if (signinBtn) {
        signinBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('signinEmail');
            const passwordInput = document.getElementById('signinPassword');

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                alert("Veuillez saisir votre e-mail et votre mot de passe.");
                return;
            }

            try {
                await AuthController.handleSignIn(email, password);
                alert("Connexion réussie !");
                window.location.href = 'project.html'; // 👈 Redirection vers la page du projet
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // 3. Soumission Inscription (Sign Up)
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('signupName');
            const emailInput = document.getElementById('signupEmail');
            const passwordInput = document.getElementById('signupPassword');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!name || !email || !password) {
                alert("Veuillez remplir tous les champs du formulaire d'inscription.");
                return;
            }

            try {
                await AuthController.handleSignUp(name, email, password);
                alert("Inscription réussie ! Votre compte a été créé.");
                window.location.href = 'project.html'; // 👈 Redirection vers la page du projet
            } catch (error) {
                handleAuthError(error);
            }
        });
    }
});