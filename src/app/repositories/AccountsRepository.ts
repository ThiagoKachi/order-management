import { PrismaClient } from "@prisma/client"
import { AccountProps } from "../controllers/AccountController"

const prisma = new PrismaClient()

class AccountsRepository {
  async create({ email, name, password }: AccountProps) {    
    const account = await prisma.account.create({
      data: {
        name,
        email,
        password
      }
    })

    return account
  }

  async findByEmail(email: string) {    
    const account = await prisma.account.findUnique({
      where: {
        email,
      }
    })

    return account
  }
}

export const accountsRepository = new AccountsRepository()
