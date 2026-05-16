import type { FastifyPluginAsync } from 'fastify'
import { authService } from './auth.service.js'
import { RegisterUserSchema } from '../../shared/types/index.js'

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/register', async (request, reply) => {
    const body = RegisterUserSchema.parse(request.body)
    const uid = request.user.uid
    const user = await authService.registerUser(uid, body.displayName)
    return reply.status(201).send(user)
  })

  fastify.get('/me', async (request) => {
    return authService.getProfile(request.user.uid)
  })

  fastify.patch('/me', async (request) => {
    const body = request.body as { displayName?: string }
    return authService.updateProfile(request.user.uid, body)
  })
}

export default authRoutes
