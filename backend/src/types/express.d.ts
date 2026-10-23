// Augmentation du type Request d'Express : le middleware requireAuth
// y attache l'identifiant de l'utilisateur et le jeton de session.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      sessionToken?: string;
    }
  }
}

export {};
