import { compare, hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { env } from '../../app/config/env';

import { EXP_TIME_IN_DAYS } from '../config/constants';
import { accountsRepository as AccountsRepository } from '../repositories/AccountsRepository';
import { refreshTokenRepository as RefreshTokenRepository } from '../repositories/RefreshTokenRepository';

export interface AccountProps {
  email: string
  name: string
  password: string
}

class AccountController {
  // Cadastro
  async signUp(req: Request, res: Response) {
    const { email, name, password } = req.body

    const accountAlreadyExists = await AccountsRepository.findByEmail(email)

    if (accountAlreadyExists) {
      return res.status(400).json({ error: 'Account already in use!' })
    }

    const hashedPassword = await hash(password, 8)

    const accountData = {
      email,
      name,
      password: hashedPassword,
    } as AccountProps;

    const account = await AccountsRepository.create(accountData)

    res.json(account)
  }

  async signIn(req: Request, res: Response) {
    const { email, password } = req.body

    const account = await AccountsRepository.findByEmail(email)

    if (!account) {
      return res.status(404).json({ error: 'Account not found' })
    }

    const isPasswordValid = await compare(password, account.password)

    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid credentials.' })
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + EXP_TIME_IN_DAYS);

    const accessToken = sign(
      {
        id: account.id,
        role: account.role
      },
      env.jwtSecret,
      { expiresIn: '1d' }
    )

    const { id } = await RefreshTokenRepository.create({
      accountId: account.id,
      expiresAt,
    })

    res.json({ accessToken, refreshToken: id })
  }
}

export const accountController = new AccountController()
