import { PrismaClient } from '@prisma/client'
import { Elysia, t } from 'elysia'

// DTOs for creating and updating users
const createUserDTO = t.Object({
  email: t.String({ format: 'email' }),
  firstName: t.String(),
  lastName: t.String(),
})

const updateUserDTO = t.Object({
  email: t.Optional(t.String({ format: 'email' })),
  firstName: t.Optional(t.String()),
  lastName: t.Optional(t.String()),
})

const prisma = new PrismaClient()

// User Repository
const userRepository = {
  createUser: async (data: { email: string; firstName: string; lastName: string }) => {
    return prisma.user.create({ data })
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } })
  },
  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } })
  },
  getAllUsers: async () => {
    return prisma.user.findMany()
  },
}

// User Service
const userService = {
  createUser: async (userData: { email: string; firstName: string; lastName: string }) => {
    const existingUser = await userRepository.findByEmail(userData.email)
    if (existingUser) {
      throw new Error('User with this email already exists')
    }
    return userRepository.createUser(userData)
  },
  getAllUsers: async () => {
    return userRepository.getAllUsers()
  },
  getUserById: async (id: string) => {
    const user = await userRepository.findById(id)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  },
  getUserByEmail: async (email: string) => {
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new Error('User not found')
    }
    return user
  },
}

// User Controller
export const userController = new Elysia({ prefix: '/users' })
  .post(
    '/sign-up',
    async ({ body }) => {
      try {
        const user = await userService.createUser(body)
        return user
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
        })
      }
    },
    { body: createUserDTO }
  )
  .get('/:id', async ({ params }) => {
    try {
      const id = params.id
      const user = await userService.getUserById(id)
      return user
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
      })
    }
  })
  .get('/email/:email', async ({ params: { email } }) => {
    try {
      const user = await userService.getUserByEmail(email)
      return user
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
      })
    }
  })
  .get('/', async () => {
    try {
      const users = await userService.getAllUsers()
      return users
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
      })
    }
  })
