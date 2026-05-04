import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { env } from './env.js'

const firebaseConfig: { projectId: string; credential?: ReturnType<typeof cert> } = {
  projectId: env.FIREBASE_PROJECT_ID,
}

if (env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
  const serviceAccount: ServiceAccount = {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  }
  firebaseConfig.credential = cert(serviceAccount)
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const adminAuth = getAuth(app)
export default app
