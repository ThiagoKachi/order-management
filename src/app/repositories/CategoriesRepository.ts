import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

class CategoriesRepository {
  async findAll(orderBy = 'asc') {
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

  async findOne(id: string) {    
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

  async findByName(name: string) {    
    const categorie = await prisma.category.findUnique({
      where: {
        name,
      }
    })

    return categorie
  }

  async create(name: string) {    
    const categorie = await prisma.category.create({
      data: {
        name
      }
    })

    return categorie
  }

  async update(id: string, name: string) {    
    const categorie = await prisma.category.update({
      where: { id },
      data: {
        name
      }
    })

    return categorie
  }

  async delete(id: string) {    
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

export const categoriesRepository = new CategoriesRepository()
