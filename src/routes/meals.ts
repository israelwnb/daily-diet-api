import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkUserIdExists } from '../middlewares/check-user-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.delete(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { userId } = request.cookies

      await knex('meals')
        .where({
          user_id: userId,
          id,
        })
        .del()

      return reply.status(204).send()
    },
  )

  app.get('/', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies
    const meals = await knex('meals').where('user_id', userId).select()

    return { meals }
  })

  app.get('/:id', { preHandler: [checkUserIdExists] }, async (request) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const { userId } = request.cookies

    const meal = await knex('meals')
      .where({
        user_id: userId,
        id,
      })
      .first()

    return { meal }
  })

  app.get('/metrics', { preHandler: [checkUserIdExists] }, async (request) => {
    const { userId } = request.cookies

    const meals = await knex('meals')
      .where('user_id', userId)
      .orderBy('date_time')
      .select()

    let totalMeals = 0
    let onDietMeals = 0
    let offDietMeals = 0
    let bestSequence = 0
    let currentSequence = 0
    for (let i = 0; i < meals.length; i++) {
      totalMeals++
      if (meals[i].diet) {
        onDietMeals++
        currentSequence++
      } else {
        offDietMeals++

        if (currentSequence > bestSequence) {
          bestSequence = currentSequence
        }

        currentSequence = 0
      }
    }
    if (currentSequence > bestSequence) {
      bestSequence = currentSequence
    }

    return {
      total_meals: totalMeals,
      on_diet_meals: onDietMeals,
      off_diet_meals: offDietMeals,
      best_sequence: bestSequence,
    }
  })

  app.post('/', { preHandler: [checkUserIdExists] }, async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      dateTime: z.string(),
      diet: z.boolean(),
    })

    const { name, description, dateTime, diet } = createMealBodySchema.parse(
      request.body,
    )

    const { userId } = request.cookies

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      date_time: dateTime,
      diet,
      user_id: userId,
    })

    return reply.status(201).send()
  })

  app.put(
    '/:id',
    { preHandler: [checkUserIdExists] },
    async (request, reply) => {
      const updateMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = updateMealParamsSchema.parse(request.params)

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        dateTime: z.string().optional(),
        diet: z.boolean().optional(),
      })

      const { name, description, dateTime, diet } = updateMealBodySchema.parse(
        request.body,
      )

      const { userId } = request.cookies

      const updatedMeal = {
        ...(name && { name }),
        ...(description && { description }),
        ...(dateTime && { dateTime }),
        ...(diet && { diet }),
      }

      await knex('meals')
        .where({
          user_id: userId,
          id,
        })
        .update(updatedMeal)

      return reply.status(200).send()
    },
  )
}
