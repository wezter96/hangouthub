import { PrismaClient } from '@prisma/client';
import { Elysia, error, t } from 'elysia';

const createUserDTO = t.Object({
  email: t.String({ format: 'email' }),
  firstName: t.String(),
  lastName: t.String(),
});

function handleError(error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return { error: errorMessage };
}

const userResponseDTO = t.Object({
  id: t.String(),
  email: t.String(),
  firstName: t.String(),
  createdAt: t.Date(),
  lastName: t.String(),
});

const userListResponseDTO = t.Array(userResponseDTO);

const errorResponseDTO = t.Object({
  error: t.String(),
});

const prisma = new PrismaClient();

// User Repository
const userRepository = {
  createUser: async (data: { email: string; firstName: string; lastName: string }) => {
    return prisma.user.create({ data });
  },
  findByEmail: async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
  },
  findById: async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
  },
  getAllUsers: async () => {
    return prisma.user.findMany();
  },
};

// User Service
const userService = {
  createUser: async (userData: { email: string; firstName: string; lastName: string }) => {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    return userRepository.createUser(userData);
  },
  getAllUsers: async () => {
    return userRepository.getAllUsers();
  },
  getUserById: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
  getUserByEmail: async (email: string) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },
};

// User Controller
export const userController = new Elysia({ prefix: '/users' })
  .post(
    '/sign-up',
    async ({ body }) => {
      try {
        const user = await userService.createUser(body);
        return user;
      } catch (err) {
        return error(400, handleError(err));
      }
    },
    {
      body: createUserDTO,
      response: {
        200: userResponseDTO,
        400: errorResponseDTO,
      },
    },
  )
  .get(
    '/:id',
    async ({ params }) => {
      try {
        const id = params.id;
        const user = await userService.getUserById(id);
        return user;
      } catch (err) {
        return error(404, handleError(err));
      }
    },
    {
      response: {
        200: userResponseDTO,
        404: errorResponseDTO,
      },
    },
  )
  .get(
    '/email/:email',
    async ({ params: { email } }) => {
      try {
        const user = await userService.getUserByEmail(email);
        return user;
      } catch (err) {
        return error(404, handleError(err));
      }
    },
    {
      response: {
        200: userResponseDTO,
        404: errorResponseDTO,
      },
    },
  )
  .get(
    '/',
    async () => {
      try {
        const users = await userService.getAllUsers();
        return users;
      } catch (err) {
        return error(404, handleError(err));
      }
    },
    {
      response: {
        200: userListResponseDTO,
        404: errorResponseDTO,
      },
    },
  );
