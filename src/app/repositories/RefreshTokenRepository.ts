import { PrismaClient } from "@prisma/client"
import { RefreshTokenProps } from "../models/RefreshToken"

const prisma = new PrismaClient()

export class RefreshTokenRepository {
  static findById = async(id: string) => {
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

  static create = async({ accountId, expiresAt }: RefreshTokenProps) => {
    const refreshToken = await prisma.refreshToken.create({
      data: {
        accountId,
        expiresAt
      }
    })

    return refreshToken
  }

  static deleteById = async(id: string) => {
    const refreshToken = await prisma.refreshToken.delete({
      where: {
        id,
      }
    })

    return refreshToken
  }
}
