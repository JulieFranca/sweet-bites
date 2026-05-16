import { db } from '../../config/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js'
import type { CreateInventoryItem } from '../../shared/types/index.js'

interface ListParams {
  search?: string
  category?: string
  status?: string
  page: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export const inventoryService = {
  async list(userId: string, params: ListParams) {
    let query = db
      .collection('inventory')
      .where('userId', '==', userId) as FirebaseFirestore.Query

    if (params.status === 'active') {
      query = query.where('isActive', '==', true)
    } else if (params.status === 'inactive') {
      query = query.where('isActive', '==', false)
    }

    if (params.category) {
      query = query.where('category', '==', params.category)
    }

    query = query.orderBy(params.sortBy, params.sortOrder)

    const snapshot = await query.get()
    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    if (params.search) {
      const searchLower = params.search.toLowerCase()
      items = items.filter((item) => {
        const name = (item as Record<string, unknown>).name
        return typeof name === 'string' && name.toLowerCase().includes(searchLower)
      })
    }

    const total = items.length
    const start = (params.page - 1) * params.pageSize
    const paginatedItems = items.slice(start, start + params.pageSize)

    return {
      data: paginatedItems,
      total,
      page: params.page,
      pageSize: params.pageSize,
      hasMore: start + params.pageSize < total,
    }
  },

  async getById(userId: string, id: string) {
    const doc = await db.collection('inventory').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Item')
    }

    const data = doc.data()
    if (data?.userId !== userId) {
      throw new ForbiddenError()
    }

    return { id: doc.id, ...data }
  },

  async create(userId: string, data: CreateInventoryItem) {
    const itemData = {
      ...data,
      userId,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await db.collection('inventory').add(itemData)
    return { id: ref.id, ...itemData }
  },

  async update(userId: string, id: string, data: Partial<CreateInventoryItem>) {
    const doc = await db.collection('inventory').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Item')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    }

    await db.collection('inventory').doc(id).update(updateData)
    const updated = await db.collection('inventory').doc(id).get()
    return { id: updated.id, ...updated.data() }
  },

  async updatePrice(
    userId: string,
    id: string,
    data: { price: number; quantity: number; unit: string },
  ) {
    const doc = await db.collection('inventory').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Item')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    await db
      .collection('inventory')
      .doc(id)
      .collection('priceHistory')
      .add({
        price: data.price,
        unit: data.unit,
        quantity: data.quantity,
        totalCost: data.price * data.quantity,
        registeredAt: FieldValue.serverTimestamp(),
        registeredBy: userId,
      })

    await db.collection('inventory').doc(id).update({
      lastPurchasePrice: data.price,
      updatedAt: FieldValue.serverTimestamp(),
    })

    const updated = await db.collection('inventory').doc(id).get()
    return { id: updated.id, ...updated.data() }
  },

  async softDelete(userId: string, id: string) {
    const doc = await db.collection('inventory').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Item')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    await db.collection('inventory').doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    })
  },

  async getPriceHistory(userId: string, id: string) {
    const doc = await db.collection('inventory').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Item')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    const snapshot = await db
      .collection('inventory')
      .doc(id)
      .collection('priceHistory')
      .orderBy('registeredAt', 'desc')
      .limit(50)
      .get()

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  },
}
