import type { FastifyPluginAsync } from 'fastify'
import { inventoryService } from './inventory.service.js'
import { CreateInventoryItemSchema, UpdatePriceSchema } from '../../shared/types/index.js'

const inventoryRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const query = request.query as Record<string, string>
    return inventoryService.list(request.user.uid, {
      search: query.search,
      category: query.category,
      status: query.status,
      page: query.page ? parseInt(query.page, 10) : 1,
      pageSize: query.pageSize ? parseInt(query.pageSize, 10) : 20,
      sortBy: query.sortBy ?? 'name',
      sortOrder: (query.sortOrder as 'asc' | 'desc') ?? 'asc',
    })
  })

  fastify.get('/:id', async (request) => {
    const { id } = request.params as { id: string }
    return inventoryService.getById(request.user.uid, id)
  })

  fastify.post('/', async (request, reply) => {
    const body = CreateInventoryItemSchema.parse(request.body)
    const item = await inventoryService.create(request.user.uid, body)
    return reply.status(201).send(item)
  })

  fastify.put('/:id', async (request) => {
    const { id } = request.params as { id: string }
    const body = CreateInventoryItemSchema.partial().parse(request.body)
    return inventoryService.update(request.user.uid, id, body)
  })

  fastify.patch('/:id/price', async (request) => {
    const { id } = request.params as { id: string }
    const body = UpdatePriceSchema.parse(request.body)
    return inventoryService.updatePrice(request.user.uid, id, body)
  })

  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string }
    await inventoryService.softDelete(request.user.uid, id)
    return { success: true }
  })

  fastify.get('/:id/price-history', async (request) => {
    const { id } = request.params as { id: string }
    return inventoryService.getPriceHistory(request.user.uid, id)
  })
}

export default inventoryRoutes
