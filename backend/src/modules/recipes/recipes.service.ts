import { db } from '../../config/firebase.js'
import { FieldValue } from 'firebase-admin/firestore'
import { NotFoundError, ForbiddenError } from '../../shared/errors/app-error.js'
import type { CreateRecipe } from '../../shared/types/index.js'

interface ListParams {
  search?: string
  category?: string
  page: number
  pageSize: number
}

export const recipesService = {
  async list(userId: string, params: ListParams) {
    let query = db
      .collection('recipes')
      .where('userId', '==', userId)
      .where('isActive', '==', true) as FirebaseFirestore.Query

    if (params.category) {
      query = query.where('category', '==', params.category)
    }

    query = query.orderBy('name', 'asc')

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
    const doc = await db.collection('recipes').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Receita')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }
    return { id: doc.id, ...doc.data() }
  },

  async create(userId: string, data: CreateRecipe) {
    const totalCost = data.ingredients.reduce(
      (sum, ing) => sum + ing.costAtSave * ing.quantity,
      0,
    )
    const costPerUnit = data.yieldValue > 0 ? totalCost / data.yieldValue : 0

    const recipeData = {
      ...data,
      userId,
      version: 1,
      isActive: true,
      calculatedCostTotal: totalCost,
      calculatedCostPerUnit: costPerUnit,
      lastCostCalculatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    const ref = await db.collection('recipes').add(recipeData)
    return { id: ref.id, ...recipeData }
  },

  async update(userId: string, id: string, data: Partial<CreateRecipe>) {
    const doc = await db.collection('recipes').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Receita')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    const currentData = doc.data()
    const currentVersion = (currentData?.version as number) ?? 0

    const ingredients = data.ingredients ?? (currentData?.ingredients as CreateRecipe['ingredients'])
    const yieldValue = data.yieldValue ?? (currentData?.yieldValue as number)

    const totalCost = ingredients.reduce(
      (sum, ing) => sum + ing.costAtSave * ing.quantity,
      0,
    )
    const costPerUnit = yieldValue > 0 ? totalCost / yieldValue : 0

    const updateData = {
      ...data,
      version: currentVersion + 1,
      calculatedCostTotal: totalCost,
      calculatedCostPerUnit: costPerUnit,
      lastCostCalculatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await db.collection('recipes').doc(id).update(updateData)
    const updated = await db.collection('recipes').doc(id).get()
    return { id: updated.id, ...updated.data() }
  },

  async softDelete(userId: string, id: string) {
    const doc = await db.collection('recipes').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Receita')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    await db.collection('recipes').doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    })
  },

  async calculateCost(userId: string, id: string) {
    const doc = await db.collection('recipes').doc(id).get()
    if (!doc.exists) {
      throw new NotFoundError('Receita')
    }
    if (doc.data()?.userId !== userId) {
      throw new ForbiddenError()
    }

    const data = doc.data()
    const ingredients = data?.ingredients as Array<{
      inventoryItemId: string
      quantity: number
      costAtSave: number
    }>

    let totalCost = 0
    for (const ing of ingredients) {
      const itemDoc = await db.collection('inventory').doc(ing.inventoryItemId).get()
      const currentPrice = itemDoc.exists
        ? (itemDoc.data()?.lastPurchasePrice as number) ?? ing.costAtSave
        : ing.costAtSave
      totalCost += currentPrice * ing.quantity
    }

    const yieldValue = data?.yieldValue as number
    const costPerUnit = yieldValue > 0 ? totalCost / yieldValue : 0

    return { totalCost, costPerUnit }
  },
}
