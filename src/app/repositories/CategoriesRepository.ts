import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export class CategoriesRepository {
  static findAll = async (orderBy = 'asc') => {
    const direction = orderBy === 'desc' ? 'desc' : 'asc'
    
    const categories = await prisma.category.findMany({
      orderBy: {
        created_at: direction
      },
      where: {
        deleted_at: null
      }
    })

    return categories
  }

  static findOne = async (id: string) => {
    const categorie = await prisma.category.findUnique({
      where: {
        id,
        deleted_at: null
      },
      include: {
        products: true,
      } 
    })

    return categorie
  }

  static findByName = async (name: string) => {
    const categorie = await prisma.category.findUnique({
      where: {
        name,
      }
    })

    return categorie
  }

  static create = async (name: string) => {
    const categorie = await prisma.category.create({
      data: {
        name
      }
    })

    return categorie
  }

  static update = async (id: string, name: string) => {
    const categorie = await prisma.category.update({
      where: { id },
      data: {
        name
      }
    })

    return categorie
  }

  static delete = async (id: string) => {
    const categorie = await prisma.category.update({
      where: {
        id
      },
      data: {
        deleted_at: new Date()
      }
    })

    return categorie
  }
}
