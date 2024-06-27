import { PrismaClient } from "@prisma/client"
import { RefreshTokenProps } from "../models/RefreshToken"

const prisma = new PrismaClient()

class RefreshTokenRepository {
  async findById(id: string) {    
    const refreshToken = await prisma.refreshToken.findUnique({
      where: {
        id,
      },
      include: {
        account: true
      }
    })

    return refreshToken
  }

  async create({ accountId, expiresAt }: RefreshTokenProps) {    
    const refreshToken = await prisma.refreshToken.create({
      data: {
        accountId,
        expiresAt
      }
    })

    return refreshToken
  }

  async deleteById(id: string) {    
    const refreshToken = await prisma.refreshToken.delete({
      where: {
        id,
      }
    })

    return refreshToken
  }
}

export const refreshTokenRepository = new RefreshTokenRepository()
