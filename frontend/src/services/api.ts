import axios from 'axios'
import { auth } from '@/config/firebase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(true)
        return api(error.config)
      } catch {
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  },
)

export default api
