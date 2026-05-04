import Fastify from 'fastify'
import { env } from './config/env.js'
import corsPlugin from './plugins/cors.plugin.js'
import authPlugin from './plugins/auth.plugin.js'
import authRoutes from './modules/auth/auth.routes.js'
import inventoryRoutes from './modules/inventory/inventory.routes.js'
import recipesRoutes from './modules/recipes/recipes.routes.js'
import { AppError } from './shared/errors/app-error.js'
import { ZodError } from 'zod'

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
  },
})

// Global error handler
fastify.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'Validation Error',
      details: error.errors,
    })
  }

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.message,
    })
  }

  fastify.log.error(error)
  return reply.status(500).send({
    error: 'Internal Server Error',
  })
})

// Health check (no auth required)
fastify.get('/api/v1/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Register plugins
await fastify.register(corsPlugin)

// Authenticated routes
await fastify.register(async (app) => {
  await app.register(authPlugin)
  await app.register(authRoutes, { prefix: '/api/v1/auth' })
  await app.register(inventoryRoutes, { prefix: '/api/v1/inventory' })
  await app.register(recipesRoutes, { prefix: '/api/v1/recipes' })
})

// Start server
const start = async (): Promise<void> => {
  try {
    const port = parseInt(env.PORT, 10)
    await fastify.listen({ port, host: '0.0.0.0' })
    fastify.log.info(`Server running on http://localhost:${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
