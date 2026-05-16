import { db } from '../../config/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { NotFoundError } from '../../shared/errors/app-error.js'

export const authService = {
  async registerUser(uid: string, displayName: string) {
    const userRef = db.collection('users').doc(uid)
    const existing = await userRef.get()

    if (existing.exists) {
      return existing.data()
    }

    const userData = {
      uid,
      email: '',
      displayName,
      status: 'pending_approval',
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
      preferences: {
        currency: 'BRL',
        profitMarginDefault: 100,
        lowStockAlertThreshold: 1.2,
      },
    }

    await userRef.set(userData)
    return userData
  },

  async getProfile(uid: string) {
    const doc = await db.collection('users').doc(uid).get()
    if (!doc.exists) {
      throw new NotFoundError('Usuario')
    }
    return { uid: doc.id, ...doc.data() }
  },

  async updateProfile(uid: string, data: { displayName?: string }) {
    const ref = db.collection('users').doc(uid)
    const doc = await ref.get()
    if (!doc.exists) {
      throw new NotFoundError('Usuario')
    }

    const updateData: Record<string, unknown> = {}
    if (data.displayName) {
      updateData.displayName = data.displayName
    }

    await ref.update(updateData)
    const updated = await ref.get()
    return { uid: updated.id, ...updated.data() }
  },
}
