import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { adminAuth, db } from '../config/firebase.js'

export interface AuthUser {
  uid: string
  isAdmin: boolean
}

declare module 'fastify' {
  interface FastifyRequest {
    user: AuthUser
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('user', null as unknown as AuthUser)

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const token = authHeader.split('Bearer ')[1]
    if (!token) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    try {
      const decoded = await adminAuth.verifyIdToken(token)
      const userDoc = await db.collection('users').doc(decoded.uid).get()

      if (!userDoc.exists) {
        return reply.status(403).send({ error: 'User not found' })
      }

      const userData = userDoc.data()
      if (userData?.status !== 'active') {
        return reply.status(403).send({ error: 'Account not active' })
      }

      request.user = {
        uid: decoded.uid,
        isAdmin: userData?.isAdmin === true,
      }
    } catch {
      return reply.status(401).send({ error: 'Invalid token' })
    }
  })
}

export default fp(authPlugin, { name: 'auth' })
