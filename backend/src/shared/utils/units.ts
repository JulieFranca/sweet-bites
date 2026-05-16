type BaseUnit = 'g' | 'kg' | 'ml' | 'L' | 'un'

interface ConversionEntry {
  measureName: string
  defaultValueG: number
  overrides: Record<string, number>
}

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
      throw new Error(`Conversao para ${String(itemBaseUnit)} nao suportada`)
  }
}
