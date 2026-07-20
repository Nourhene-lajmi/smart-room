
import { UserModel } from '../models/UserModel.js';

const AuthController = {
  async handleSignUp(name, email, password) {
    if (!name || !email || !password) {
      throw new Error("Merci de remplir tous les champs");
    }
    return await UserModel.register(name, email, password);
  },

  async handleSignIn(email, password) {
    if (!email || !password) {
      throw new Error("Merci de remplir tous les champs");
    }
    return await UserModel.login(email, password);
  },
};

// 2. Export par défaut pour correspondre à ton import dans AuthView.js
export default AuthController;