import Elysia, { t } from 'elysia'

const getMessageResponseType = t.String()
const getMessageWithParamResponseType = t.String()
const postMessageResponseType = t.Object({
  name: t.String(),
})

export const messagesController = new Elysia({ prefix: '/message' })
  .get('/', (): string => 'Hello From Elysia 🦊', {
    response: getMessageResponseType,
  })
  .get('/:message', ({ params }): string => `Your Message: ${params.message} 🦊`, {
    params: t.Object({ message: t.String() }),
    response: getMessageWithParamResponseType,
  })
  .post('/', ({ body }): { name: string } => body, {
    body: t.Object({
      name: t.String(),
    }),
    response: postMessageResponseType,
  })
