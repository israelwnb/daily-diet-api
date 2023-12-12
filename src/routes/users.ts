import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      username: z.string(),
    })

    const { username } = createUserBodySchema.parse(request.body)

    const userId = randomUUID()

    reply.cookie('userId', userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    await knex('users').insert({
      id: userId,
      username,
    })

    return reply.status(201).send()
  })
}
