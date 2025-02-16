import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';

if (admin.apps.length === 0) {
  admin.initializeApp();
}

interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:4200',
    credentials: true,
  })
);

/**
 * Middleware de autenticación para verificar el token en el encabezado `Authorization`
 */
const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log('Headers recibidos:', req.headers);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    console.log('Token recibido:', token);

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res
      .status(401)
      .json({ error: 'Token inválido', details: (error as Error).message });
  }
};

/**
 * Obtener sesión del usuario desde el token de autorización
 */
app.get(
  '/getUserSession',
  authenticate,
  (req: AuthenticatedRequest, res: Response): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    res.json({ uid: req.user.uid, email: req.user.email });
  }
);

/**
 * Cerrar sesión en el cliente (no se almacena token en el servidor)
 */
app.post('/logout', (req: Request, res: Response): void => {
  res.json({ message: 'Sesión cerrada correctamente' });
});

/**
 * Exportar función HTTP para Firebase
 */
export const auth = functions.https.onRequest(app);
