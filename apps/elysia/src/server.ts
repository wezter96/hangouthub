import { Elysia, t } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { PrismaClient } from '@prisma/client';
import { userController } from './domain';
import { messagesController } from './controllers';
import { cors } from '@elysiajs/cors';

// Define response types

const mirrorResponseType = t.Object({
  id: t.Number(),
  name: t.String(),
});

export const elysiaApp = new Elysia()
  .use(
    swagger({
      path: '/swagger',
      documentation: {
        info: {
          title: 'Universal App API',
          version: '0.0.1',
          description: 'Universal app API endpoints',
        },
      },
    }),
  )
  .use(cors())
  .use(messagesController)
  .use(userController)
  .post('/mirror', ({ body }): { id: number; name: string } => body, {
    body: mirrorResponseType,
    response: mirrorResponseType,
  })
  .listen(8080, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
  })
  .onError(({ code, error }) => {
    console.log(code);
    return new Response(JSON.stringify({ error: error.toString() }), {
      status: 500,
    });
  });

export type TElysiaApp = typeof elysiaApp;
