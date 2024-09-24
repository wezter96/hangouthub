import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { messageController } from './controllers/message'

// Define response types
const rootResponseType = t.String()
const idResponseType = t.Number()
const mirrorResponseType = t.Object({
  id: t.Number(),
  name: t.String(),
})

export const elysiaApp = new Elysia({ prefix: '/api' })
  // .use(
  //   swagger({
  //     path: '/swagger',
  //     documentation: {
  //       info: {
  //         title: 'Universal App API',
  //         version: '1.0.0',
  //         description:
  //           'Universal app API endpoints',
  //       },
  //       tags: [
  //         {
  //           name: 'v1',
  //           description:
  //             "Stable endpoints in version 1 of API. Endpoints defined here won't be deleted, but might be marked as deprecated for following versions.",
  //         },
  //       ],
  //     },
  //   })
  // )
  .use(messageController)
  .get(
    '/id/:id',
    ({ params: { id } }): number => {
      const numericId = Number(id)
      if (isNaN(numericId)) {
        throw new Error('Invalid ID')
      }
      return numericId
    },
    {
      response: idResponseType,
    }
  )
  .post('/mirror', ({ body }): { id: number; name: string } => body, {
    body: mirrorResponseType,
    response: mirrorResponseType,
  })
  // .listen(8080)
  .onError(({ code, error }) => {
    console.log(code)
    return new Response(JSON.stringify({ error: error.toString() }), {
      status: 500,
    })
  })

// Start the server and log the port
// elysiaApp.listen(8080, ({ hostname, port }) => {
//   console.log(`🦊 Elysia is running at http://${hostname}:${port}`);
// });

export type TElysiaApp = typeof elysiaApp
