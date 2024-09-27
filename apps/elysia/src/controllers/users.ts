import { Elysia, t } from 'elysia'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const idResponseType = t.Number()
const userResponseType = t.Object({
  id: t.Number(),
  firstName: t.String(),
  lastName: t.String(),
})

export const usersController = new Elysia({ prefix: '/users' })
  // Fetch all users
  .get('/', async () => {
    const users = await db.user.findMany()
    return users
  })
  // Get a user by ID
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const numericId = Number(id)
      if (isNaN(numericId)) {
        throw new Error('Invalid ID')
      }
      const user = await db.user.findUnique({ where: { id: numericId } })
      if (!user) throw new Error('User not found')
      return user
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: userResponseType,
    }
  )
  // Create a new user (sign-up)
  .post(
    '/sign-up',
    async ({ body }) => {
      return await db.user.create({ data: body })
    },
    {
      body: t.Object({
        firstName: t.String(),
        lastName: t.String(),
      }),
      response: userResponseType,
      error({ code }) {
        if (code === 'UNKNOWN') {
          return {
            error: 'Unknown error occurred',
          }
        }
      },
    }
  )
