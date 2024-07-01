import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import z from 'zod';
import { EXP_TIME_IN_DAYS } from '../config/constants';
import { env } from '../config/env';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';

const refreshTokenSchema = z.object({
  refreshTokenId: z.string().uuid(),
});

export class RefreshTokenController {
  static handle = async (req: Request, res: Response) => {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        issues: result.error.issues
      })
    }

    const { refreshTokenId } = result.data;

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

    res.status(200).json({ accessToken, refreshToken: newRefreshToken.id })
  }
}
