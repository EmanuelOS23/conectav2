import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  tipoUsuario?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token não fornecido." });
    return;
  }
  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? "secret") as {
      userId: string; tipoUsuario: string;
    };
    req.userId       = payload.userId;
    req.tipoUsuario  = payload.tipoUsuario;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.tipoUsuario !== "administrador") {
    res.status(403).json({ error: "Acesso restrito ao administrador." });
    return;
  }
  next();
}
