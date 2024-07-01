import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface ICreateDTO {
  email: string;
  password: string;
  name: string;
}

export class AccountsRepository {
  static create = async ({ email, name, password }: ICreateDTO) => {
    const account = await prisma.account.create({
      data: {
        name,
        email,
        password,
        role: 'CLIENT'
      }
    })

    return account
  }

  static findByEmail = async (email: string) => {
    const account = await prisma.account.findUnique({
      where: {
        email,
      }
    })

    return account
  }
}
