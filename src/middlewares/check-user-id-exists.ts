import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkUserIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.cookies.userId

  if (!userId) {
    return reply.status(401).send({
      error: 'Unauthorized.',
    })
  }
}
