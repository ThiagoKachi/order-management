import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { EXP_TIME_IN_DAYS } from '../config/constants';
import { env } from '../config/env';
import { refreshTokenRepository as RefreshTokenRepository } from '../repositories/RefreshTokenRepository';

class RefreshTokenController {
  async handle(req: Request, res: Response) {
    const { refreshTokenId } = req.body

    const refreshToken = await RefreshTokenRepository.findById(refreshTokenId)

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found.' })
    }

    if (Date.now() > refreshToken.expiresAt.getTime()) {
      return res.status(401).json({ error: 'Refresh token expired.' })
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + EXP_TIME_IN_DAYS);

    const [accessToken, newRefreshToken] = await Promise.all([
      sign(
        {
          id: refreshToken.accountId,
          role: refreshToken.account.role
        },
        env.jwtSecret,
        { expiresIn: '1d' }
      ),
      RefreshTokenRepository.create({
        accountId: refreshToken.accountId,
        expiresAt,
      }),
      RefreshTokenRepository.deleteById(refreshToken.id),
    ]);

    res.json({ accessToken, refreshToken: newRefreshToken.id })
  }
}

export const refreshTokenController = new RefreshTokenController()