import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

import { env } from '../config/env';

export class AuthenticationMiddleware {
  async handle(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers

    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const [bearer, token] = authorization.split(' ')

      if (bearer !== 'Bearer') {
        throw new Error()
      }

      const payload = verify(token, env.jwtSecret) as JwtPayload

      req.userId = payload.id as string

      next()
    } catch {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }
}