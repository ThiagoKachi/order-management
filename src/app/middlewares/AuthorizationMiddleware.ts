import { NextFunction, Request, Response } from "express";

export class AuthorizationMiddleware {
  handle(allowedRoles: string[]) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { role } = req;

      if (!role) {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Unauthorized' })
      }

      next();
    };
  }
}
