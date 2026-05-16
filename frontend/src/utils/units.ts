import type { ConversionEntry, BaseUnit } from '@/types'

const SI_CONVERSIONS: Record<string, number> = {
  'g_kg': 0.001,
  'kg_g': 1000,
  'ml_L': 0.001,
  'L_ml': 1000,
}

export function resolveToBaseUnit(
  quantity: number,
  unit: string,
  inventoryItemId: string,
  conversionTable: ConversionEntry[],
  itemBaseUnit: BaseUnit,
): number {
  if (unit === itemBaseUnit) return quantity

  const siKey = `${unit}_${itemBaseUnit}`
  const siFactor = SI_CONVERSIONS[siKey]
  if (siFactor !== undefined) return quantity * siFactor

  const entry = conversionTable.find((e) => e.measureName === unit)
  if (!entry) {
    throw new Error(`Conversao nao encontrada: ${unit}`)
  }

  const gramsValue = entry.overrides[inventoryItemId] ?? entry.defaultValueG

  switch (itemBaseUnit) {
    case 'kg':
      return (quantity * gramsValue) / 1000
    case 'g':
      return quantity * gramsValue
    case 'L':
      return (quantity * gramsValue) / 1000
    case 'ml':
      return quantity * gramsValue
    case 'un':
      return quantity
    default:
      throw new Error(`Conversao para ${itemBaseUnit} nao suportada`)
  }
}

export function calculateIngredientCost(
  quantity: number,
  unit: string,
  inventoryItemId: string,
  lastPurchasePrice: number,
  itemBaseUnit: BaseUnit,
  conversionTable: ConversionEntry[],
): number {
  const quantityInBaseUnit = resolveToBaseUnit(
    quantity,
    unit,
    inventoryItemId,
    conversionTable,
    itemBaseUnit,
  )
  return quantityInBaseUnit * lastPurchasePrice
}

export const UNIT_OPTIONS = [
  { value: 'g', label: 'Gramas (g)' },
  { value: 'kg', label: 'Quilogramas (kg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'un', label: 'Unidades (un)' },
] as const

export const MEASURE_OPTIONS = [
  'g',
  'kg',
  'ml',
  'L',
  'un',
  'colher de sopa',
  'colher de cha',
  'xicara',
  'lata',
  'caixinha',
] as const

export function getUnitLabel(unit: string): string {
  const option = UNIT_OPTIONS.find((o) => o.value === unit)
  return option ? option.label : unit
}
