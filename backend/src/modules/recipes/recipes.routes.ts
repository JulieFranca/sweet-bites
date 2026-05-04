import type { FastifyPluginAsync } from 'fastify'
import { recipesService } from './recipes.service.js'
import { CreateRecipeSchema } from '../../shared/types/index.js'

const recipesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const query = request.query as Record<string, string>
    return recipesService.list(request.user.uid, {
      search: query.search,
      category: query.category,
      page: query.page ? parseInt(query.page, 10) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : 20,
    })
  })

  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string }
    return recipesService.getById(request.user.uid, id)
  })

  fastify.post('/', async (request, reply) => {
    const body = CreateRecipeSchema.parse(request.body)
    const recipe = await recipesService.create(request.user.uid, body)
    return reply.status(201).send(recipe)
  })

  fastify.put('/:id', async (request) => {
    const { id } = request.params as { id: string }
    const body = CreateRecipeSchema.partial().parse(request.body)
    return recipesService.update(request.user.uid, id, body)
  })

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string }
    await recipesService.softDelete(request.user.uid, id)
    return { success: true }
  })

  fastify.get('/:id/cost', async (request) => {
    const { id } = request.params as { id: string }
    return recipesService.calculateCost(request.user.uid, id)
  })
}

export default recipesRoutes
