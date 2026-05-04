import { z } from 'zod'

// ─── User ──────────────────────────────────────────────
export const UserStatusSchema = z.enum(['pending_approval', 'active', 'rejected', 'suspended'])
export type UserStatus = z.infer<typeof UserStatusSchema>

export const UserPreferencesSchema = z.object({
  currency: z.literal('BRL'),
  profitMarginDefault: z.number().min(0),
  lowStockAlertThreshold: z.number().min(0),
})

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  status: UserStatusSchema,
  isAdmin: z.boolean(),
  createdAt: z.unknown(),
  approvedAt: z.unknown().optional(),
  approvedBy: z.string().optional(),
  preferences: UserPreferencesSchema,
})
export type User = z.infer<typeof UserSchema>

// ─── Inventory ─────────────────────────────────────────
export const BaseUnitSchema = z.enum(['g', 'kg', 'ml', 'L', 'un'])
export type BaseUnit = z.infer<typeof BaseUnitSchema>

export const ItemCategorySchema = z.enum(['ingredient', 'packaging', 'other'])
export type ItemCategory = z.infer<typeof ItemCategorySchema>

export const InventoryItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  category: ItemCategorySchema,
  baseUnit: BaseUnitSchema,
  currentQuantity: z.number().min(0),
  minimumQuantity: z.number().min(0),
  lastPurchasePrice: z.number().min(0),
  supplier: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
})
export type InventoryItem = z.infer<typeof InventoryItemSchema>

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  category: ItemCategorySchema,
  baseUnit: BaseUnitSchema,
  currentQuantity: z.number().min(0, 'Quantidade deve ser positiva'),
  minimumQuantity: z.number().min(0, 'Quantidade minima deve ser positiva'),
  lastPurchasePrice: z.number().min(0, 'Preco deve ser positivo'),
  supplier: z.string().optional(),
  notes: z.string().optional(),
})
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>

export const PriceHistorySchema = z.object({
  id: z.string().optional(),
  price: z.number(),
  unit: z.string(),
  quantity: z.number(),
  totalCost: z.number(),
  registeredAt: z.unknown(),
  registeredBy: z.string(),
})
export type PriceHistory = z.infer<typeof PriceHistorySchema>

// ─── Conversion Table ──────────────────────────────────
export const ConversionEntrySchema = z.object({
  id: z.string(),
  measureName: z.string(),
  measureType: z.enum(['volume', 'mass', 'count']),
  defaultValueG: z.number(),
  overrides: z.record(z.string(), z.number()),
  isSystemDefault: z.boolean(),
  createdAt: z.unknown(),
})
export type ConversionEntry = z.infer<typeof ConversionEntrySchema>

// ─── Recipe ────────────────────────────────────────────
export const RecipeIngredientSchema = z.object({
  inventoryItemId: z.string(),
  inventoryItemName: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitInGrams: z.number(),
  costAtSave: z.number(),
})
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>

export const RecipeSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  category: z.string(),
  ingredients: z.array(RecipeIngredientSchema),
  yieldType: z.enum(['units', 'weight']),
  yieldValue: z.number().positive(),
  yieldUnit: z.string().optional(),
  prepTimeMinutes: z.number().optional(),
  notes: z.string().optional(),
  version: z.number(),
  isActive: z.boolean(),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
  calculatedCostTotal: z.number(),
  calculatedCostPerUnit: z.number(),
  lastCostCalculatedAt: z.unknown().optional(),
})
export type Recipe = z.infer<typeof RecipeSchema>

export const CreateRecipeSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria e obrigatoria'),
  ingredients: z.array(z.object({
    inventoryItemId: z.string(),
    inventoryItemName: z.string(),
    quantity: z.number().positive('Quantidade deve ser positiva'),
    unit: z.string(),
    unitInGrams: z.number(),
    costAtSave: z.number(),
  })).min(1, 'Adicione pelo menos um ingrediente'),
  yieldType: z.enum(['units', 'weight']),
  yieldValue: z.number().positive('Rendimento deve ser positivo'),
  yieldUnit: z.string().optional(),
  prepTimeMinutes: z.number().optional(),
  notes: z.string().optional(),
})
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>

// ─── Product ───────────────────────────────────────────
export const ProductSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1),
  recipeId: z.string(),
  recipeName: z.string(),
  packagingItemId: z.string().optional(),
  packagingCost: z.number(),
  profitMarginPercent: z.number(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean(),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
  totalCostPerUnit: z.number(),
  salePricePerUnit: z.number(),
  lastCalculatedAt: z.unknown(),
})
export type Product = z.infer<typeof ProductSchema>

// ─── Production ────────────────────────────────────────
export const ProductionIngredientUsedSchema = z.object({
  inventoryItemId: z.string(),
  inventoryItemName: z.string(),
  quantityUsed: z.number(),
  unitCostAtProduction: z.number(),
})

export const ProductionRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  productName: z.string(),
  recipeId: z.string(),
  multiplier: z.number().positive(),
  unitsProduced: z.number(),
  ingredientsUsed: z.array(ProductionIngredientUsedSchema),
  totalCost: z.number(),
  notes: z.string().optional(),
  producedAt: z.unknown(),
  createdBy: z.string(),
})
export type ProductionRecord = z.infer<typeof ProductionRecordSchema>

// ─── Shopping List ─────────────────────────────────────
export const ShoppingItemStatusSchema = z.enum(['pending', 'in_cart', 'purchased'])

export const ShoppingItemSchema = z.object({
  id: z.string(),
  inventoryItemId: z.string().optional(),
  name: z.string(),
  quantity: z.number(),
  unit: z.string(),
  estimatedCost: z.number().optional(),
  status: ShoppingItemStatusSchema,
  source: z.enum(['manual', 'production_deficit', 'minimum_stock']),
  addedAt: z.unknown(),
  updatedAt: z.unknown(),
})
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>

// ─── API Response ──────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ─── Notification ──────────────────────────────────────
export interface AppNotification {
  id: string
  type: 'low_stock' | 'price_updated' | 'production_completed' | 'user_pending' | 'sync_conflict'
  message: string
  priority: 'high' | 'medium' | 'low'
  isRead: boolean
  createdAt: unknown
  data?: Record<string, unknown>
}
