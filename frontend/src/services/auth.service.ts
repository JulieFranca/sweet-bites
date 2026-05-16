import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import api from './api'
import type { User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<FirebaseUser> {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    return credential.user
  },

  async register(
    email: string,
    password: string,
    displayName: string,
  ): Promise<FirebaseUser> {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName })
    await api.post('/auth/register', { displayName })
    return credential.user
  },

  async logout(): Promise<void> {
    await signOut(auth)
  },

  async getProfile(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async updateProfile(data: { displayName?: string }): Promise<User> {
    const response = await api.patch<User>('/auth/me', data)
    return response.data
  },

  onAuthChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback)
  },
}
