import { z } from 'zod'

export const BaseUnitSchema = z.enum(['g', 'kg', 'ml', 'L', 'un'])
export const ItemCategorySchema = z.enum(['ingredient', 'packaging', 'other'])

export const CreateInventoryItemSchema = z.object({
  name: z.string().min(1),
  category: ItemCategorySchema,
  baseUnit: BaseUnitSchema,
  currentQuantity: z.number().min(0),
  minimumQuantity: z.number().min(0),
  lastPurchasePrice: z.number().min(0),
  supplier: z.string().optional(),
  notes: z.string().optional(),
})
export type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>

export const UpdatePriceSchema = z.object({
  price: z.number().min(0),
  quantity: z.number().min(0),
  unit: z.string(),
})

export const CreateRecipeIngredientSchema = z.object({
  inventoryItemId: z.string(),
  inventoryItemName: z.string(),
  quantity: z.number().positive(),
  unit: z.string(),
  unitInGrams: z.number(),
  costAtSave: z.number(),
})

export const CreateRecipeSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  ingredients: z.array(CreateRecipeIngredientSchema).min(1),
  yieldType: z.enum(['units', 'weight']),
  yieldValue: z.number().positive(),
  yieldUnit: z.string().optional(),
  prepTimeMinutes: z.number().optional(),
  notes: z.string().optional(),
})
export type CreateRecipe = z.infer<typeof CreateRecipeSchema>

export const RegisterUserSchema = z.object({
  displayName: z.string().min(1),
})
