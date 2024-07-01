import { compare, hash } from 'bcryptjs';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { env } from '../../app/config/env';

import z from 'zod';
import { EXP_TIME_IN_DAYS } from '../config/constants';
import { AccountsRepository } from '../repositories/AccountsRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';

const signUpSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(8),
  name: z.string().min(1),
});

const signInSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(8),
});

export class AccountController {
  // Cadastro
  static signUp = async (req: Request, res: Response) => {
    const result = signUpSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { email, name, password } = result.data

    const accountAlreadyExists = await AccountsRepository.findByEmail(email)

    if (accountAlreadyExists) {
      return res.status(400).json({ error: 'Account already in use!' })
    }

    const hashedPassword = await hash(password, 8)

    const account = await AccountsRepository.create({
      email,
      name,
      password: hashedPassword
    })

    res.status(201).json(account);
  }

  static signIn = async (req: Request, res: Response) => {
    const result = signInSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation error',
        issues: result.error.issues
      })
    }

    const { email, password } = result.data;

    const account = await AccountsRepository.findByEmail(email)

    if (!account) {
      return res.status(404).json({ error: 'Invalid credentials.' })
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

    res.status(200).json({ accessToken, refreshToken: id })
  }
}
