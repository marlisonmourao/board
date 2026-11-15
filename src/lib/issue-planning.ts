import { z } from 'zod'

export const LabelsSchema = z.array(z.string().trim().min(1).max(40)).max(10).refine((labels) => new Set(labels.map((label) => label.toLocaleLowerCase('pt-BR'))).size === labels.length, 'Etiquetas devem ser únicas')
export const DueDateSchema = z.iso.date().nullable()

export function parseLabels(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.split(',').map((label) => label.trim()).filter(Boolean) : []
}
