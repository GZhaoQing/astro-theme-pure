import type { MessageKey } from '@/i18n'
import { blogCategories, type BlogCategoryId } from '@/site-config'

export const UNCATEGORIZED = 'uncategorized' as const
export type CategoryId = BlogCategoryId | typeof UNCATEGORIZED

const known = new Set<string>(blogCategories)

export const categoryMessageKey = {
  notes: 'category.notes',
  skills: 'category.skills',
  reading: 'category.reading',
  life: 'category.life',
  uncategorized: 'category.uncategorized'
} as const satisfies Record<CategoryId, MessageKey>

export function isCategoryId(value: string): value is CategoryId {
  return known.has(value) || value === UNCATEGORIZED
}

/** First path segment if it is a writing folder; otherwise uncategorized (root demo posts). */
export function getPostCategory(id: string): CategoryId {
  const slash = id.indexOf('/')
  if (slash === -1) return UNCATEGORIZED
  const folder = id.slice(0, slash)
  return known.has(folder) ? (folder as BlogCategoryId) : UNCATEGORIZED
}

export function groupPostsByCategory<T extends { id: string }>(posts: T[]) {
  const map = new Map<CategoryId, T[]>()
  for (const id of blogCategories) map.set(id, [])
  map.set(UNCATEGORIZED, [])
  for (const post of posts) {
    map.get(getPostCategory(post.id))!.push(post)
  }
  return map
}
